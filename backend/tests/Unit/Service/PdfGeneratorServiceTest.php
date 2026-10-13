<?php

namespace App\Tests\Unit\Service;

use App\Entity\Analyse;
use App\Entity\Cv;
use App\Entity\User;
use App\Service\PdfGeneratorService;
use PHPUnit\Framework\TestCase;
use Twig\Environment;

final class PdfGeneratorServiceTest extends TestCase
{
    public function testGenererRapportAnalyseAppelleTwigEtProduitUnPdf(): void
    {
        // 1. Arrange : création des entités
        $user = new User();
        $user->setEmail('candidat@example.com');

        $cv = new Cv('cv_john_doe.pdf', 'chemin/fictif.pdf', 'application/pdf', 1024, $user);

        $analyse = new Analyse($cv);
        $analyse->setStatut(Analyse::STATUT_TERMINE);
        $analyse->setNote(85);
        $analyse->setPointsForts(['Excellente maîtrise de Symfony', 'Expérience solide en API REST']);
        $analyse->setPointsFaibles(['Manque de détails sur les tests unitaires']);
        $analyse->setCompetences(['PHP 8.3', 'Symfony 7', 'MySQL', 'Docker']);
        $analyse->setRecommandations([
            'Ajouter des métriques chiffrées sur les projets',
            'Mentionner les bonnes pratiques TDD',
            'Mettre en avant les projets open source',
            'Préciser le niveau de maîtrise en CI/CD',
            'Structurer les expériences par ordre antéchronologique',
        ]);

        // Mock de Twig pour le test unitaire
        $htmlRendu = '<!DOCTYPE html><html><head><title>Test PDF</title></head><body><h1>Rapport Audit #1</h1><p>Score: 85/100</p></body></html>';
        $twigMock = $this->createMock(Environment::class);
        $twigMock->expects($this->once())
            ->method('render')
            ->with('pdf/rapport_analyse.html.twig', ['analyse' => $analyse])
            ->willReturn($htmlRendu);

        $pdfGenerator = new PdfGeneratorService($twigMock);

        // 2. Act : génération du PDF
        $pdfContenu = $pdfGenerator->genererRapportAnalyse($analyse);

        // 3. Assert : vérifications
        $this->assertNotEmpty($pdfContenu);
        $this->assertStringStartsWith('%PDF-', $pdfContenu, 'Le résultat doit être un document PDF binaire valide.');
    }
}
