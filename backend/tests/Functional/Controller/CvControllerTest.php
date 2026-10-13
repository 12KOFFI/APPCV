<?php

namespace App\Tests\Functional\Controller;

use App\Entity\Analyse;
use App\Entity\Cv;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Dompdf\Dompdf;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;

final class CvControllerTest extends WebTestCase
{
    private function creerUtilisateurEtObtenirToken(KernelBrowser $client, string $email): string
    {
        $motDePasse = 'PasswordSecret123!';

        // Inscription
        $client->request(
            'POST',
            '/api/inscription',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => $email, 'motDePasse' => $motDePasse])
        );

        // Connexion pour récupérer le JWT
        $client->request(
            'POST',
            '/api/connexion',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => $email, 'motDePasse' => $motDePasse])
        );

        $data = json_decode($client->getResponse()->getContent(), true);

        return $data['token'];
    }

    private function creerFichierPdfValide(string $chemin): void
    {
        $dompdf = new Dompdf();
        $dompdf->loadHtml('<html><body><p>Développeur PHP Symfony expérimenté, maîtrisant React, Docker, MySQL et l architecture d API REST sécurisées.</p></body></html>');
        $dompdf->render();
        file_put_contents($chemin, $dompdf->output());
    }

    public function testListerCvExigeAuthentification(): void
    {
        $client = static::createClient();

        // Sans token -> 401
        $client->request('GET', '/api/cv');
        $this->assertResponseStatusCodeSame(401);

        // Avec token -> 200
        $emailListe = sprintf('user_cv_liste_%s@example.com', bin2hex(random_bytes(6)));
        $token = $this->creerUtilisateurEtObtenirToken($client, $emailListe);
        $client->request('GET', '/api/cv', [], [], ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]);
        $this->assertResponseIsSuccessful();
        $this->assertIsArray(json_decode($client->getResponse()->getContent(), true));
    }

    public function testUploadCvValidePuisRefusFichierInterdit(): void
    {
        $client = static::createClient();
        $emailUpload = sprintf('user_cv_upload_%s@example.com', bin2hex(random_bytes(6)));
        $token = $this->creerUtilisateurEtObtenirToken($client, $emailUpload);

        $tempPdf = tempnam(sys_get_temp_dir(), 'test_cv_') . '.pdf';
        $this->creerFichierPdfValide($tempPdf);

        try {
            $uploadedFile = new UploadedFile($tempPdf, 'cv_candidat.pdf', 'application/pdf', null, true);

            // Upload PDF avec JWT
            $client->request(
                'POST',
                '/api/cv',
                [],
                ['cv' => $uploadedFile],
                ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]
            );

            $this->assertResponseStatusCodeSame(201);
            $data = json_decode($client->getResponse()->getContent(), true);
            $this->assertSame('cv_candidat.pdf', $data['nomOriginal']);
            $this->assertTrue($data['rattacheAuCompte']);
            $this->assertGreaterThan(50, $data['nombreCaracteres']);
        } finally {
            if (file_exists($tempPdf)) {
                @unlink($tempPdf);
            }
        }

        // Upload d'un fichier interdit (.txt)
        $tempTxt = tempnam(sys_get_temp_dir(), 'test_txt_') . '.txt';
        file_put_contents($tempTxt, 'Fichier texte non autorisé');
        try {
            $invalidFile = new UploadedFile($tempTxt, 'interdit.txt', 'text/plain', null, true);
            $client->request(
                'POST',
                '/api/cv',
                [],
                ['cv' => $invalidFile],
                ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]
            );
            $this->assertResponseStatusCodeSame(422);
        } finally {
            if (file_exists($tempTxt)) {
                @unlink($tempTxt);
            }
        }
    }

    public function testSecuriteIdorEtTelechargementPdf(): void
    {
        $client = static::createClient();
        $container = static::getContainer();
        /** @var EntityManagerInterface $em */
        $em = $container->get(EntityManagerInterface::class);

        // 1. Création de User A et User B avec emails uniques
        $emailA = sprintf('user_a_%s@example.com', bin2hex(random_bytes(6)));
        $emailB = sprintf('user_b_%s@example.com', bin2hex(random_bytes(6)));
        $tokenA = $this->creerUtilisateurEtObtenirToken($client, $emailA);
        $tokenB = $this->creerUtilisateurEtObtenirToken($client, $emailB);

        $userA = $em->getRepository(User::class)->findOneBy(['email' => $emailA]);

        // 2. Création d'un CV et d'une Analyse pour User A
        $hashUnique = sprintf('hash_%s.pdf', bin2hex(random_bytes(8)));
        $cvA = new Cv('cv_user_a.pdf', $hashUnique, 'application/pdf', 2048, $userA);
        $cvA->setTexteExtrait('Texte extrait du CV de User A...');
        $em->persist($cvA);

        $analyseA = new Analyse($cvA);
        $analyseA->setStatut(Analyse::STATUT_EN_ATTENTE);
        $em->persist($analyseA);
        $em->flush();

        $cvAId = $cvA->getId();
        $analyseAId = $analyseA->getId();

        // 3. User B tente d'accéder aux analyses du CV de User A -> 403 FORBIDDEN (Faille IDOR évitée)
        $client->request(
            'GET',
            sprintf('/api/cv/%d/analyses', $cvAId),
            [],
            [],
            ['HTTP_AUTHORIZATION' => 'Bearer ' . $tokenB]
        );
        $this->assertResponseStatusCodeSame(403, 'User B ne doit pas pouvoir lister les analyses du CV de User A.');

        // 4. User B tente de télécharger le PDF de User A -> 403 FORBIDDEN (Faille IDOR évitée)
        $client->request(
            'GET',
            sprintf('/api/analyse/%d/pdf', $analyseAId),
            [],
            [],
            ['HTTP_AUTHORIZATION' => 'Bearer ' . $tokenB]
        );
        $this->assertResponseStatusCodeSame(403, 'User B ne doit pas pouvoir télécharger le PDF de l\'analyse de User A.');

        // 5. User A tente de télécharger son PDF alors que l'analyse est EN_ATTENTE -> 400 Bad Request
        $client->request(
            'GET',
            sprintf('/api/analyse/%d/pdf', $analyseAId),
            [],
            [],
            ['HTTP_AUTHORIZATION' => 'Bearer ' . $tokenA]
        );
        $this->assertResponseStatusCodeSame(400, 'On ne peut pas générer de PDF tant que l\'analyse n\'est pas terminée.');

        // 6. On passe l'analyse de User A au statut TERMINE avec des données
        $analyseA->setStatut(Analyse::STATUT_TERMINE);
        $analyseA->setNote(80);
        $analyseA->setPointsForts(['Excellente rigueur']);
        $analyseA->setPointsFaibles(['Améliorer la concision']);
        $analyseA->setCompetences(['Symfony', 'MySQL']);
        $analyseA->setRecommandations(['R1', 'R2', 'R3', 'R4', 'R5']);
        $em->flush();

        // 7. User A télécharge son PDF avec succès -> 200 OK
        $client->request(
            'GET',
            sprintf('/api/analyse/%d/pdf', $analyseAId),
            [],
            [],
            ['HTTP_AUTHORIZATION' => 'Bearer ' . $tokenA]
        );

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/pdf');
        $this->assertResponseHeaderSame('content-disposition', sprintf('attachment; filename="rapport-analyse-%d.pdf"', $analyseAId));

        $pdfBinary = $client->getResponse()->getContent();
        $this->assertStringStartsWith('%PDF-', $pdfBinary, 'Le fichier téléchargé doit être un binaire PDF valide.');
    }
}
