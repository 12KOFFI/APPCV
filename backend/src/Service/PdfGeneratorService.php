<?php

namespace App\Service;

use App\Entity\Analyse;
use Dompdf\Dompdf;
use Dompdf\Options;
use Twig\Environment;

final class PdfGeneratorService
{
    public function __construct(
        private readonly Environment $twig,
    ) {
    }

    /**
     * Génère le flux binaire d'un rapport PDF pour une analyse donnée.
     */
    public function genererRapportAnalyse(Analyse $analyse): string
    {
        $html = $this->twig->render('pdf/rapport_analyse.html.twig', [
            'analyse' => $analyse,
        ]);

        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        // Pas de ressources distantes : le template n'en utilise aucune. Évite tout SSRF via du contenu injecté.
        $options->set('isRemoteEnabled', false);
        $options->set('defaultFont', 'Helvetica');

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return (string) $dompdf->output();
    }
}
