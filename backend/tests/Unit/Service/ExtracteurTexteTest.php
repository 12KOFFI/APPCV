<?php

namespace App\Tests\Unit\Service;

use App\Exception\ExtractionImpossibleException;
use App\Service\ExtracteurTexte;
use PHPUnit\Framework\TestCase;

final class ExtracteurTexteTest extends TestCase
{
    private ExtracteurTexte $extracteur;
    private string $fichierTemporaire;

    protected function setUp(): void
    {
        $this->extracteur = new ExtracteurTexte();
        $this->fichierTemporaire = tempnam(sys_get_temp_dir(), 'test_cv_');
    }

    protected function tearDown(): void
    {
        if (file_exists($this->fichierTemporaire)) {
            @unlink($this->fichierTemporaire);
        }
    }

    public function testTypeMimeNonPrisEnChargeDeclencheException(): void
    {
        $this->expectException(ExtractionImpossibleException::class);
        $this->expectExceptionMessage('Type de fichier non pris en charge.');

        $this->extracteur->extraire('/chemin/inconnu.txt', 'text/plain');
    }

    public function testExtractionDocxValide(): void
    {
        // Création d'un vrai fichier .docx (archive ZIP contenant word/document.xml)
        $zip = new \ZipArchive();
        $zip->open($this->fichierTemporaire, \ZipArchive::CREATE | \ZipArchive::OVERWRITE);

        $xmlContenu = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            . '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
            . '<w:body>'
            . '<w:p><w:r><w:t>Développeur PHP Symfony expérimenté avec plus de 5 années de pratique sur des architectures microservices et API REST sécurisées.</w:t></w:r></w:p>'
            . '<w:p><w:r><w:t>Compétences : Docker, MySQL, Redis, React, PHPUnit, GitLab CI/CD.</w:t></w:r></w:p>'
            . '</w:body>'
            . '</w:document>';

        $zip->addFromString('word/document.xml', $xmlContenu);
        $zip->close();

        $texteExtrait = $this->extracteur->extraire(
            $this->fichierTemporaire,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );

        $this->assertNotEmpty($texteExtrait);
        $this->assertStringContainsString('Développeur PHP Symfony', $texteExtrait);
        $this->assertStringContainsString('Compétences : Docker', $texteExtrait);
        $this->assertStringNotContainsString('<w:t>', $texteExtrait, 'Les balises XML doivent être nettoyées.');
    }

    public function testDocxAvecTexteTropCourtDeclencheException(): void
    {
        $zip = new \ZipArchive();
        $zip->open($this->fichierTemporaire, \ZipArchive::CREATE | \ZipArchive::OVERWRITE);

        // Moins de 50 caractères
        $xmlContenu = '<?xml version="1.0" encoding="UTF-8"?><w:document><w:body><w:p><w:t>Court</w:t></w:p></w:body></w:document>';
        $zip->addFromString('word/document.xml', $xmlContenu);
        $zip->close();

        $this->expectException(ExtractionImpossibleException::class);
        $this->expectExceptionMessage('Aucun texte lisible trouvé. Votre PDF est peut-être une image scannée.');

        $this->extracteur->extraire(
            $this->fichierTemporaire,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );
    }

    public function testDocxCorrompuDeclencheException(): void
    {
        // On écrit du contenu corrompu qui n'est pas un ZIP
        file_put_contents($this->fichierTemporaire, 'Fichier non zip corrompu');

        $this->expectException(ExtractionImpossibleException::class);
        $this->expectExceptionMessage('Fichier Word illisible.');

        $this->extracteur->extraire(
            $this->fichierTemporaire,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );
    }
}
