<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Cv;
use App\Repository\CvRepository;
use App\Exception\AnalyseIaException;
use App\Exception\ExtractionImpossibleException;
use App\Service\CvUploadService;
use App\Service\AnalyseurCvIa;
use Symfony\Bridge\Doctrine\Attribute\MapEntity;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapUploadedFile;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Validator\Constraints as Assert;


final class CvController extends AbstractController
{
    #[Route('/api/cv', name: 'api_cv_liste', methods: ['GET'])]
    public function lister(
        #[CurrentUser] User $user,
        CvRepository $cvRepository,
    ): JsonResponse {
        $cvs = $cvRepository->findBy(
            ['proprietaire' => $user],
            ['creeLe' => 'DESC']
        );

        $liste = array_map(function(Cv $cv) {
            $analyses = $cv->getAnalyses();

            // Filtrer les analyses terminées avec une note
            $terminees = $analyses->filter(
                fn(\App\Entity\Analyse $a) => $a->getStatut() === \App\Entity\Analyse::STATUT_TERMINE && $a->getNote() !== null
            );
            $derniereTerminee = $terminees->last() ?: null;
            $derniereAnalyse = $analyses->last() ?: null;

            return [
                'id' => $cv->getId(),
                'nomOriginal' => $cv->getNomOriginal(),
                'typeMime' => $cv->getTypeMime(),
                'taille' => $cv->getTaille(),
                'creeLe' => $cv->getCreeLe()->format(\DateTimeInterface::ATOM),
                'nombreCaracteres' => mb_strlen($cv->getTexteExtrait() ?? ''),
                'nombreAnalyses' => $analyses->count(),
                'derniereNote' => $derniereTerminee?->getNote(),
                'dernierStatut' => $derniereAnalyse?->getStatut() ?? 'NON_ANALYSE',
                'derniereAnalyseId' => $derniereAnalyse?->getId(),
                'competences' => $derniereTerminee?->getCompetences() ?? [],
                'pointsForts' => $derniereTerminee?->getPointsForts() ?? [],
                'pointsFaibles' => $derniereTerminee?->getPointsFaibles() ?? [],
                'recommandations' => $derniereTerminee?->getRecommandations() ?? [],
            ];
        }, $cvs);

        return $this->json($liste);
    }

    #[Route('/api/dashboard/stats', name: 'api_dashboard_stats', methods: ['GET'])]
    public function stats(
        #[CurrentUser] User $user,
        CvRepository $cvRepository,
    ): JsonResponse {
        $isAdmin = in_array('ROLE_ADMIN', $user->getRoles(), true) || $user->getRole() === 'ROLE_ADMIN';
        $cvs = $isAdmin
            ? $cvRepository->findBy([], ['creeLe' => 'DESC'])
            : $cvRepository->findBy(['proprietaire' => $user], ['creeLe' => 'DESC']);
        $totalCvs = count($cvs);

        $toutesAnalyses = [];
        $analysesTerminees = [];
        $toutesCompetences = [];

        foreach ($cvs as $cv) {
            foreach ($cv->getAnalyses() as $a) {
                $toutesAnalyses[] = $a;
                if ($a->getStatut() === \App\Entity\Analyse::STATUT_TERMINE && $a->getNote() !== null) {
                    $analysesTerminees[] = $a;
                    if (is_array($a->getCompetences())) {
                        foreach ($a->getCompetences() as $comp) {
                            $toutesCompetences[mb_strtolower(trim($comp))] = true;
                        }
                    }
                }
            }
        }

        $totalAnalyses = count($toutesAnalyses);
        $totalTerminees = count($analysesTerminees);

        $scoreMoyen = null;
        $repartition = ['excellent' => 0, 'bon' => 0, 'aAmeliorer' => 0];

        if ($totalTerminees > 0) {
            $sommeNotes = 0;
            foreach ($analysesTerminees as $a) {
                $note = $a->getNote();
                $sommeNotes += $note;
                if ($note >= 80) {
                    $repartition['excellent']++;
                } elseif ($note >= 60) {
                    $repartition['bon']++;
                } else {
                    $repartition['aAmeliorer']++;
                }
            }
            $scoreMoyen = (int) round($sommeNotes / $totalTerminees);
        }

        // Tri chronologique des analyses pour l'évolution
        usort($analysesTerminees, fn(\App\Entity\Analyse $a, \App\Entity\Analyse $b) => $a->getCreeLe() <=> $b->getCreeLe());
        $historique = array_map(fn(\App\Entity\Analyse $a) => [
            'id' => $a->getId(),
            'cvId' => $a->getCv()->getId(),
            'nomCv' => $a->getCv()->getNomOriginal(),
            'score' => $a->getNote(),
            'creeLe' => $a->getCreeLe()->format(\DateTimeInterface::ATOM),
        ], $analysesTerminees);

        // Dernières recommandations réelles
        $derniere = !empty($analysesTerminees) ? end($analysesTerminees) : null;
        $derniersConseils = $derniere?->getRecommandations() ?? [];

        return $this->json([
            'totalCvs' => $totalCvs,
            'totalAnalyses' => $totalAnalyses,
            'analysesTerminees' => $totalTerminees,
            'scoreMoyen' => $scoreMoyen,
            'totalCompetences' => count($toutesCompetences),
            'repartition' => $repartition,
            'historique' => $historique,
            'derniersConseils' => $derniersConseils,
            'isAdmin' => $isAdmin,
        ]);
    }

    #[Route('/api/cv', name: 'api_cv_upload', methods: ['POST'])]
    public function upload(
        #[MapUploadedFile([
            new Assert\NotNull(message: 'Aucun fichier reçu (le champ doit s\'appeler "cv").'),
            new Assert\File(
                maxSize: '5M',
                mimeTypes: [
                    'application/pdf',
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                ],
                maxSizeMessage: 'Le fichier ne doit pas dépasser 5 Mo.',
                mimeTypesMessage: 'Seuls les fichiers PDF et Word (.docx) sont acceptés.',
            ),
        ])]
        UploadedFile $cv,
        #[CurrentUser] ?User $user,
        CvUploadService $cvUploadService,
    ): JsonResponse {
        // ⬇️ DÉBUT DU CORPS DE LA MÉTHODE (la partie qui a changé)
        try {
            $entite = $cvUploadService->enregistrer($cv, $user);
        } catch (ExtractionImpossibleException $e) {
            return $this->json(['erreur' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $reponse = [
            'id' => $entite->getId(),
            'nomOriginal' => $entite->getNomOriginal(),
            'rattacheAuCompte' => $user !== null,
            'nombreCaracteres' => mb_strlen($entite->getTexteExtrait()),
            'apercu' => mb_substr($entite->getTexteExtrait(), 0, 200),
        ];

        if ($user === null) {
            $reponse['jetonAcces'] = $entite->getJetonAcces();
        }

        return $this->json($reponse, Response::HTTP_CREATED);
       
    }

    #[Route('/api/cv/{id}/analyse', name: 'api_cv_analyse', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function analyser(
        #[MapEntity(id: 'id')] Cv $cv,
        #[CurrentUser] User $user,
        #[MapRequestPayload] ?\App\Dto\DemandeAnalyseDto $dto,
        EntityManagerInterface $em,
        \Symfony\Component\Messenger\MessageBusInterface $bus,
    ): JsonResponse {
        if ($cv->getProprietaire()?->getId() !== $user->getId()) {
            return $this->json(['erreur' => 'Accès refusé à ce CV.'], Response::HTTP_FORBIDDEN);
        }

        // 1. Création de l'entité Analyse en attente
        $analyse = new \App\Entity\Analyse($cv, $dto?->texteOffre);
        $analyse->setStatut(\App\Entity\Analyse::STATUT_EN_ATTENTE);
        $em->persist($analyse);
        $em->flush();

        // 2. Envoi du message dans la file Messenger
        $bus->dispatch(new \App\Message\AnalyserCvMessage($analyse->getId()));

        return $this->json([
            'analyseId' => $analyse->getId(),
            'statut' => $analyse->getStatut(),
            'message' => 'Analyse mise en file d\'attente.',
        ], Response::HTTP_ACCEPTED);
    }

    #[Route('/api/analyse/{id}', name: 'api_analyse_statut', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function statutAnalyse(
        #[MapEntity(id: 'id')] \App\Entity\Analyse $analyse,
        #[CurrentUser] User $user,
    ): JsonResponse {
        if ($analyse->getCv()->getProprietaire()?->getId() !== $user->getId()) {
            return $this->json(['erreur' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        return $this->json([
            'id' => $analyse->getId(),
            'statut' => $analyse->getStatut(),
            'note' => $analyse->getNote(),
            'pointsForts' => $analyse->getPointsForts(),
            'pointsFaibles' => $analyse->getPointsFaibles(),
            'competences' => $analyse->getCompetences(),
            'recommandations' => $analyse->getRecommandations(),
            'erreur' => $analyse->getErreur(),
            'creeLe' => $analyse->getCreeLe()->format(\DateTimeInterface::ATOM),
        ]);
    }

    #[Route('/api/cv/{id}/analyses', name: 'api_cv_analyses_liste', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function listerAnalyses(
        #[MapEntity(id: 'id')] Cv $cv,
        #[CurrentUser] User $user,
    ): JsonResponse {
        if ($cv->getProprietaire()?->getId() !== $user->getId()) {
            return $this->json(['erreur' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        $analyses = $cv->getAnalyses()->map(fn(\App\Entity\Analyse $a) => [
            'id' => $a->getId(),
            'statut' => $a->getStatut(),
            'note' => $a->getNote(),
            'creeLe' => $a->getCreeLe()->format(\DateTimeInterface::ATOM),
            'aOffre' => $a->getTexteOffre() !== null,
        ])->toArray();

        usort($analyses, fn($a, $b) => $b['creeLe'] <=> $a['creeLe']);

        return $this->json(array_values($analyses));
    }

    #[Route('/api/analyse/{id}/pdf', name: 'api_analyse_telecharger_pdf', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function telechargerPdf(
        #[MapEntity(id: 'id')] \App\Entity\Analyse $analyse,
        #[CurrentUser] User $user,
        \App\Service\PdfGeneratorService $pdfGenerator,
    ): Response {
        if ($analyse->getCv()->getProprietaire()?->getId() !== $user->getId()) {
            return $this->json(['erreur' => 'Accès refusé.'], Response::HTTP_FORBIDDEN);
        }

        if ($analyse->getStatut() !== \App\Entity\Analyse::STATUT_TERMINE) {
            return $this->json(['erreur' => 'Le rapport PDF n\'est disponible que pour les analyses terminées.'], Response::HTTP_BAD_REQUEST);
        }

        $pdfContenu = $pdfGenerator->genererRapportAnalyse($analyse);

        $nomFichier = sprintf('rapport-analyse-%d.pdf', $analyse->getId());

        return new Response($pdfContenu, Response::HTTP_OK, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => sprintf('attachment; filename="%s"', $nomFichier),
        ]);
    }
}

