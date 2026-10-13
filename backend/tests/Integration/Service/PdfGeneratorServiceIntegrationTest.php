<?php

namespace App\Tests\Integration\Service;

use App\Entity\Analyse;
use App\Entity\Cv;
use App\Entity\User;
use App\Service\PdfGeneratorService;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

final class PdfGeneratorServiceIntegrationTest extends KernelTestCase
{
    public function testRenduCompletAvecVraiTemplateTwigEtDompdf(): void
    {
        self::bootKernel();
        $container = static::getContainer();

        /** @var PdfGeneratorService $pdfGenerator */
        $pdfGenerator = $container->get(PdfGeneratorService::class);

        $user = new User();
        $user->setEmail('recrutement@entreprise.fr');

        $cv = new Cv('cv_dev_fullstack.pdf', 'chemin_fictif.pdf', 'application/pdf', 2048, $user);

        $analyse = new Analyse($cv, 'Nous recherchons un développeur Symfony / React...');
        $analyse->setStatut(Analyse::STATUT_TERMINE);
        $analyse->setNote(92);
        $analyse->setPointsForts([
            'Architecture logicielle modulaire et découplée',
            'Excellente connaissance de l\'écosystème Symfony 7',
            'Expérience en tests unitaires et intégration',
        ]);
        $analyse->setPointsFaibles([
            'Section compétences DevOps un peu succincte',
        ]);
        $analyse->setCompetences([
            'PHP 8.3', 'Symfony 7.4', 'React 19', 'MySQL', 'Doctrine ORM', 'Docker', 'PHPUnit'
        ]);
        $analyse->setRecommandations([
            'Détailler le pipeline CI/CD GitHub Actions utilisé sur les projets',
            'Ajouter un lien vers votre profil GitHub ou portfolio',
            'Quantifier les performances obtenues (ex: -40% temps de réponse API)',
            'Mentionner la couverture de code par les tests',
            'Valoriser la veille technologique sur PHP 8.4',
        ]);

        $pdfContenu = $pdfGenerator->genererRapportAnalyse($analyse);

        $this->assertNotEmpty($pdfContenu);
        $this->assertStringStartsWith('%PDF-', $pdfContenu);
        // Le document doit être suffisamment volumineux pour contenir tout le contenu
        $this->assertGreaterThan(5000, strlen($pdfContenu), 'Le PDF généré avec Twig et Dompdf doit contenir le rapport complet stylisé.');
    }
}
