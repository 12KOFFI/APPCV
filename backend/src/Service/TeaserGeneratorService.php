<?php

namespace App\Service;

final class TeaserGeneratorService
{
    /**
     * Génère un teaser déterministe d'audit ATS instantané sans aucun coût IA.
     *
     * @return array{score: int, constats: list<string>, nombreProblemes: int}
     */
    public function genererTeaser(string $texteExtrait, ?string $texteOffre = null): array
    {
        $texteLower = mb_strtolower($texteExtrait);
        $constats = [];
        $nbProblemes = 0;
        $score = 50;

        // 1. Détection des 4 grandes rubriques ATS
        $aExperience = (bool) preg_match('/(exp[ée]rience|parcours|missions|postes)/u', $texteLower);
        $aFormation = (bool) preg_match('/(formation|dipl[ôo]me|[ée]tudes|cursus|acad[ée]mique)/u', $texteLower);
        $aCompetences = (bool) preg_match('/(comp[ée]tences?|skills|technologies|outils|savoir-faire)/u', $texteLower);
        $aContact = (bool) preg_match('/([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|t[ée]l[ée]phone|\+33|0[1-9][0-9]{8})/u', $texteLower);

        $sectionsTrouvees = (int)$aExperience + (int)$aFormation + (int)$aCompetences + (int)$aContact;

        if ($sectionsTrouvees >= 3) {
            $score += 15;
            $constats[] = sprintf('Structure standard respectée (%d rubriques clés identifiées sur 4).', $sectionsTrouvees);
        } else {
            $score -= 10;
            $nbProblemes++;
            $constats[] = sprintf('Structure incomplète (%d seule rubrique standard identifiée sur 4).', $sectionsTrouvees);
        }

        if (!$aCompetences) {
            $nbProblemes++;
        }
        if (!$aExperience) {
            $nbProblemes++;
        }

        // 2. Détection des métriques chiffrées et de l'impact (% / chiffres / devises)
        $aChiffres = (bool) preg_match('/(\d+[\s]*(%|€|\$|k€|keuros|millions?|clients?|projets?|utilisateurs?))/u', $texteLower);
        $nbChiffresTotal = preg_match_all('/\b\d+(\.\d+)?\b/u', $texteLower);

        if ($aChiffres || $nbChiffresTotal >= 5) {
            $score += 12;
            $constats[] = 'Mise en valeur de réalisations quantifiées avec données chiffrées.';
        } else {
            $score -= 8;
            $nbProblemes++;
            $constats[] = 'Faible présence d\'impact mesurable (chiffres, pourcentages et résultats concrets).';
        }

        // 3. Détection des verbes d'action
        $aVerbesAction = (bool) preg_match('/(d[ée]velopp[ée]|con[çc]u|pilot[ée]|g[ée]r[ée]|optimis[ée]|impl[ée]ment[ée]|analys[ée]|dirig[ée]|coordonn[ée]|d[ée]ploy[ée])/u', $texteLower);
        if ($aVerbesAction) {
            $score += 8;
        } else {
            $score -= 5;
            $nbProblemes++;
        }

        // 4. Analyse comparative avec l'offre d'emploi si fournie
        if ($texteOffre !== null && trim($texteOffre) !== '') {
            $motsOffre = $this->extraireMotsCles($texteOffre);
            $motsCv = $this->extraireMotsCles($texteExtrait);

            $communs = array_intersect($motsOffre, $motsCv);
            $nbTotalOffre = max(count($motsOffre), 1);
            $tauxMatching = (int) round((count($communs) / $nbTotalOffre) * 100);

            if ($tauxMatching >= 60) {
                $score += 10;
                $constats[] = sprintf('Bonne adéquation avec l\'offre cible (~%d%% de mots-clés stratégiques partagés).', $tauxMatching);
            } else {
                $score -= 10;
                $nbProblemes++;
                $constats[] = sprintf('Écart détecté avec l\'offre ciblée (seulement ~%d%% de correspondance lexicale).', $tauxMatching);
            }
        } elseif (count($constats) < 3) {
            if ($aVerbesAction) {
                $constats[] = 'Vocabulaire professionnel actif adapté aux logiciels ATS.';
            } else {
                $constats[] = 'Verbes d\'action insuffisants pour capter l\'attention des algorithmes de tri.';
            }
        }

        // Borner le score entre 28 et 89 pour un teaser réaliste et incitatif
        $scoreFinal = max(28, min(89, $score));
        $nbProblemes = max(1, $nbProblemes);

        // Limiter strictement à 3 constats
        $constatsFinaux = array_values(array_slice($constats, 0, 3));

        return [
            'score' => $scoreFinal,
            'constats' => $constatsFinaux,
            'nombreProblemes' => $nbProblemes,
        ];
    }

    /**
     * @return list<string>
     */
    private function extraireMotsCles(string $texte): array
    {
        $mots = preg_split('/[\s,\.\;\:\(\)\[\]\{\}\"\']+/u', mb_strtolower($texte), -1, PREG_SPLIT_NO_EMPTY);
        if ($mots === false) {
            return [];
        }

        $stopwords = [
            'dans', 'pour', 'avec', 'sans', 'sous', 'vers', 'chez', 'afin', 'plus', 'très', 'tout',
            'tous', 'cette', 'notre', 'votre', 'leur', 'leurs', 'vous', 'nous', 'ils', 'elles',
            'être', 'avoir', 'faire', 'sont', 'ont', 'fait', 'sera', 'aura', 'comme', 'aussi',
            'bien', 'mais', 'donc', 'entre', 'ainsi', 'alors', 'apres', 'avant', 'depuis',
        ];

        $filtres = [];
        foreach ($mots as $m) {
            if (mb_strlen($m) >= 4 && !in_array($m, $stopwords, true)) {
                $filtres[$m] = true;
            }
        }

        return array_keys($filtres);
    }
}
