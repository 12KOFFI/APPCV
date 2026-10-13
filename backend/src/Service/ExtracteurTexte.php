<?php

namespace App\Service;

use App\Exception\ExtractionImpossibleException;
use Smalot\PdfParser\Parser;

final class ExtracteurTexte
{
    private const TYPE_PDF = 'application/pdf';
    private const TYPE_DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    private const TAILLE_MAX_XML = 20 * 1024 * 1024; // 20 Mo décompressés maximum (anti bombe ZIP)
    private const LONGUEUR_MIN = 50;                  // moins de 50 caractères : PDF scanné ?
    private const LONGUEUR_MAX = 30000;               // on limite ce qui sera envoyé à l'IA (coût)

    public function extraire(string $chemin, string $typeMime): string
    {
        $texte = match ($typeMime) {
            self::TYPE_PDF => $this->extrairePdf($chemin),
            self::TYPE_DOCX => $this->extraireDocx($chemin),
            default => throw new ExtractionImpossibleException('Type de fichier non pris en charge.'),
        };

        $texte = $this->nettoyer($texte);

        if (mb_strlen($texte) < self::LONGUEUR_MIN) {
            throw new ExtractionImpossibleException(
                'Aucun texte lisible trouvé. Votre PDF est peut-être une image scannée.'
            );
        }

        return mb_substr($texte, 0, self::LONGUEUR_MAX);
    }

    private function extrairePdf(string $chemin): string
    {
        try {
            return (new Parser())->parseFile($chemin)->getText();
        } catch (\Throwable $e) {
            throw new ExtractionImpossibleException('PDF illisible ou protégé par un mot de passe.', 0, $e);
        }
    }

    private function extraireDocx(string $chemin): string
    {
        $zip = new \ZipArchive();
        if ($zip->open($chemin) !== true) {
            throw new ExtractionImpossibleException('Fichier Word illisible.');
        }

        try {
            $infos = $zip->statName('word/document.xml');
            if ($infos === false || $infos['size'] > self::TAILLE_MAX_XML) {
                throw new ExtractionImpossibleException('Fichier Word invalide ou trop volumineux.');
            }
            $xml = $zip->getFromName('word/document.xml', self::TAILLE_MAX_XML);
        } finally {
            $zip->close();
        }

        if ($xml === false) {
            throw new ExtractionImpossibleException('Fichier Word illisible.');
        }

        // On transforme les fins de paragraphe et les tabulations avant d'enlever les balises
        $xml = str_replace(['</w:p>', '<w:br/>', '<w:tab/>'], ["\n", "\n", "\t"], $xml);

        return html_entity_decode(strip_tags($xml), ENT_QUOTES | ENT_XML1, 'UTF-8');
    }

    private function nettoyer(string $texte): string
    {
        $texte = mb_convert_encoding($texte, 'UTF-8', 'UTF-8'); // supprime les caractères invalides
        $texte = str_replace(["\r\n", "\r"], "\n", $texte);      // fins de ligne Windows/Mac -> \n
        $texte = preg_replace('/[ \t]+/u', ' ', $texte);         // plusieurs espaces -> un seul
        $texte = preg_replace('/\n{3,}/u', "\n\n", $texte);      // 3 lignes vides ou plus -> 2

        return trim($texte);
    }
}
