<?php

namespace App\Tests\Integration\Controller;

use App\Entity\Analyse;
use App\Entity\Cv;
use App\Entity\User;
use Doctrine\DBAL\Connection;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Vérifie /api/admin/stats (agrégats SQL) sur une base SQLite jetable.
 *
 * Ce test ne s'exécute que si DATABASE_URL pointe vers SQLite, afin de ne jamais
 * recréer le schéma de la base MySQL de test :
 *   DATABASE_URL="sqlite:///:memory:" php bin/phpunit tests/Integration/Controller/AdminStatsTest.php
 */
final class AdminStatsTest extends WebTestCase
{
    protected function setUp(): void
    {
        $url = getenv('DATABASE_URL') ?: '';
        if (!str_starts_with($url, 'sqlite')) {
            self::markTestSkipped('Nécessite DATABASE_URL=sqlite:///:memory: (base jetable).');
        }
    }

    public function testStatistiquesAdminAgregeesSansChargerLesEntitesAnalyse(): void
    {
        $client = static::createClient();
        // Même noyau et même connexion SQLite pendant toute la requête
        $client->disableReboot();

        $container = static::getContainer();
        /** @var EntityManagerInterface $em */
        $em = $container->get(EntityManagerInterface::class);
        /** @var Connection $connexion */
        $connexion = $em->getConnection();

        (new SchemaTool($em))->createSchema($em->getMetadataFactory()->getAllMetadata());

        // ── Jeu de données connu ──
        $admin = $this->creerUtilisateur($em, 'admin@test.local', 'ROLE_ADMIN');
        $u1 = $this->creerUtilisateur($em, 'u1@test.local', 'ROLE_USER');
        $u2 = $this->creerUtilisateur($em, 'u2@test.local', 'ROLE_USER');

        $cvA = new Cv('cvA.pdf', 'cvA.pdf', 'application/pdf', 1000, $u1);
        $cvB = new Cv('cvB.pdf', 'cvB.pdf', 'application/pdf', 2000, $u2);
        $cvC = new Cv('cvC.pdf', 'cvC.pdf', 'application/pdf', 500, null);
        $cvC->setJetonExpireLe(new \DateTimeImmutable('-1 day'));
        $em->persist($cvA);
        $em->persist($cvB);
        $em->persist($cvC);

        $a1 = $this->creerAnalyse($em, $cvA, Analyse::STATUT_TERMINE, 85, ['PHP', 'symfony']);
        $a2 = $this->creerAnalyse($em, $cvA, Analyse::STATUT_TERMINE, 65, ['php ', 'Docker']);
        $a3 = $this->creerAnalyse($em, $cvB, Analyse::STATUT_TERMINE, 40, ['Docker']);
        $a4 = $this->creerAnalyse($em, $cvB, Analyse::STATUT_TERMINE, null, ['Excel']);
        $a5 = $this->creerAnalyse($em, $cvB, Analyse::STATUT_ERREUR, null, null);
        $a6 = $this->creerAnalyse($em, $cvA, Analyse::STATUT_EN_ATTENTE, null, null);
        $em->flush();

        // Dates de création contrôlées (pour l'activité sur 7 jours)
        $maintenant = new \DateTimeImmutable();
        $jourMoins = fn (int $j) => $maintenant->modify("-{$j} days")->format('Y-m-d H:i:s');
        $this->fixerDate($connexion, 'cv', $cvA->getId(), $jourMoins(2));
        $this->fixerDate($connexion, 'cv', $cvC->getId(), $jourMoins(10));
        $this->fixerDate($connexion, 'analyse', $a1->getId(), $jourMoins(1));

        $token = $container->get(JWTTokenManagerInterface::class)->create($admin);

        // On repart d'un identity map vide : toute entité Analyse hydratée pendant la requête serait détectée
        $em->clear();

        $client->request('GET', '/api/admin/stats', [], [], ['HTTP_AUTHORIZATION' => 'Bearer '.$token]);
        $this->assertResponseIsSuccessful();
        $donnees = json_decode($client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);

        // ── Utilisateurs / CVs ──
        self::assertSame(['total' => 3, 'nouveaux7Jours' => 3, 'nouveaux30Jours' => 3], $donnees['utilisateurs']);
        self::assertSame(3, $donnees['cvs']['total']);
        self::assertSame(2, $donnees['cvs']['assignes']);
        self::assertSame(1, $donnees['cvs']['anonymes']);
        self::assertSame(1, $donnees['cvs']['orphelinsExpires']);
        self::assertSame(3500, $donnees['cvs']['stockageOctets']);

        // ── Analyses ──
        self::assertSame(6, $donnees['analyses']['total']);
        self::assertSame(4, $donnees['analyses']['terminees']);
        self::assertSame(1, $donnees['analyses']['enCours']);
        self::assertSame(1, $donnees['analyses']['erreurs']);
        // (85 + 65 + 40) / 3 = 63.33 -> 63 ; la note null est exclue de la moyenne
        self::assertSame(63, $donnees['analyses']['scoreMoyen']);
        self::assertSame(
            ['excellent' => 1, 'bon' => 1, 'aAmeliorer' => 1],
            $donnees['analyses']['repartition']
        );

        // ── Compétences (normalisées, comptées sur toutes les analyses terminées) ──
        $frequences = [];
        foreach ($donnees['topCompetences'] as $c) {
            $frequences[$c['nom']] = $c['frequence'];
        }
        // Ordre des ex-aequo non garanti : comparaison indépendante de l'ordre
        ksort($frequences);
        self::assertSame(['Docker' => 2, 'Excel' => 1, 'Php' => 2, 'Symfony' => 1], $frequences);

        // ── Activité 7 jours : index 0 = il y a 6 jours, index 6 = aujourd'hui ──
        $activite = $donnees['activite7Jours'];
        self::assertCount(7, $activite);
        self::assertSame(1, $activite[4]['cvs'], 'CV de cvA créé il y a 2 jours');
        self::assertSame(1, $activite[5]['analyses'], 'analyse a1 créée hier');
        self::assertSame(1, $activite[6]['cvs'], 'CV de cvB créé aujourd\'hui');
        self::assertSame(5, $activite[6]['analyses'], 'a2 à a6 créées aujourd\'hui');
        self::assertSame(2, array_sum(array_column($activite, 'cvs')), 'cvC (10 jours) est hors fenêtre');

        // ── Aucune entité Analyse ni Cv n'a été hydratée pour produire ces statistiques ──
        $identityMap = $em->getUnitOfWork()->getIdentityMap();
        self::assertSame(0, count($identityMap[Analyse::class] ?? []), 'Des entités Analyse ont été chargées en mémoire');
        self::assertSame(0, count($identityMap[Cv::class] ?? []), 'Des entités Cv ont été chargées en mémoire');
    }

    private function creerUtilisateur(EntityManagerInterface $em, string $email, string $role): User
    {
        $user = new User();
        $user->setEmail($email);
        $user->setPassword('non-utilise');
        $user->setRole($role);
        $em->persist($user);

        return $user;
    }

    /** @param list<string>|null $competences */
    private function creerAnalyse(EntityManagerInterface $em, Cv $cv, string $statut, ?int $note, ?array $competences): Analyse
    {
        $analyse = new Analyse($cv);
        $analyse->setStatut($statut);
        $analyse->setNote($note);
        $analyse->setCompetences($competences);
        $em->persist($analyse);

        // L'identifiant est nécessaire pour fixer la date : on flush à chaque insertion
        $em->flush();

        return $analyse;
    }

    private function fixerDate(Connection $connexion, string $table, ?int $id, string $date): void
    {
        $connexion->executeStatement("UPDATE {$table} SET cree_le = ? WHERE id = ?", [$date, $id]);
    }
}
