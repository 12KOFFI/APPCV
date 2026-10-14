<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Cv;
use App\Entity\Analyse;
use App\Repository\CvRepository;
use App\Exception\AnalyseIaException;
use App\Exception\ExtractionImpossibleException;
use App\Service\CvUploadService;
use App\Service\AnalyseurCvIa;
use App\Service\TurnstileVerifierService;
use App\Message\AnalyserCvMessage;
use Symfony\Bridge\Doctrine\Attribute\MapEntity;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Cookie;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapUploadedFile;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Validator\Constraints as Assert;

final class CvController extends AbstractController
{
    public function __construct(
        private readonly TurnstileVerifierService $turnstileVerifier,
    ) {}
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
        Request $request,
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
        EntityManagerInterface $em,
        MessageBusInterface $bus,
    ): JsonResponse {
        // 1. Si utilisateur anonyme : Validation Turnstile anti-bot
        if ($user === null) {
            $clientIp = $request->getClientIp() ?? '127.0.0.1';
            $turnstileToken = $request->headers->get('cf-turnstile-response')
                ?? $request->request->get('cf-turnstile-response')
                ?? $request->request->get('turnstileToken');

            if (!$this->turnstileVerifier->verifier($turnstileToken, $clientIp)) {
                return $this->json([
                    'erreur' => 'Validation de sécurité Turnstile échouée. Veuillez recharger la page et réessayer.',
                ], Response::HTTP_BAD_REQUEST);
            }
        }

        // 3. Récupération du texte d'offre ciblée facultative
        $texteOffre = $request->request->get('texteOffre');
        if (is_string($texteOffre)) {
            $texteOffre = trim($texteOffre);
            if ($texteOffre === '') {
                $texteOffre = null;
            }
        } else {
            $texteOffre = null;
        }

        // 4. Enregistrement physique + extraction texte
        try {
            $entite = $cvUploadService->enregistrer($cv, $user, $texteOffre);
        } catch (ExtractionImpossibleException $e) {
            return $this->json(['erreur' => $e->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        // 5. Cas utilisateur déjà connecté : enregistre le CV directement rattaché
        if ($user !== null) {
            return $this->json([
                'id' => $entite->getId(),
                'nomOriginal' => $entite->getNomOriginal(),
                'rattacheAuCompte' => true,
                'nombreCaracteres' => mb_strlen($entite->getTexteExtrait() ?? ''),
                'message' => 'CV enregistré avec succès.',
            ], Response::HTTP_CREATED);
        }

        // 6. Cas visiteur anonyme : persistance temporaire sécurisée (0 simulation, 0 coût IA)
        $rawClaimToken = bin2hex(random_bytes(32));
        $hashToken = hash('sha256', $rawClaimToken);
        $expiration = (new \DateTimeImmutable())->modify('+48 hours');

        $entite->setJetonAccesHash($hashToken);
        $entite->setJetonExpireLe($expiration);
        $em->flush();

        // Pose du Cookie HttpOnly (cv_claim_token = rawToken, Secure si HTTPS, SameSite=Lax, Path=/api)
        $cookie = Cookie::create(
            'cv_claim_token',
            $rawClaimToken,
            $expiration,
            '/api',
            null,
            $request->isSecure(),
            true,
            false,
            Cookie::SAMESITE_LAX
        );

        $reponse = $this->json([
            'id' => $entite->getId(),
            'nomOriginal' => $entite->getNomOriginal(),
            'taille' => $entite->getTaille(),
            'claimToken' => $rawClaimToken,
            'rattacheAuCompte' => false,
            'enAttenteAuthentification' => true,
            'message' => 'CV enregistré temporairement. Authentifiez-vous pour lancer l\'analyse par IA.',
            'messageRgpd' => 'Fichier conservé 48h max sans compte',
        ], Response::HTTP_CREATED);

        $reponse->headers->setCookie($cookie);

        return $reponse;
    }

    #[Route('/api/cv/rattacher', name: 'api_cv_rattacher', methods: ['POST'])]
    public function rattacher(
        Request $request,
        #[CurrentUser] User $user,
        CvRepository $cvRepository,
        EntityManagerInterface $em,
    ): JsonResponse {
        $body = json_decode($request->getContent(), true);
        $rawToken = $request->cookies->get('cv_claim_token')
            ?? $request->headers->get('X-Claim-Token')
            ?? ($body['claimToken'] ?? null)
            ?? $request->request->get('claimToken');

        if (empty($rawToken) || !is_string($rawToken)) {
            return $this->json([
                'erreur' => 'Aucun jeton de rattachement trouvé dans la session.',
            ], Response::HTTP_BAD_REQUEST);
        }

        $hashToken = hash('sha256', $rawToken);
        $now = new \DateTimeImmutable();

        // Recherche du CV anonyme éligible (non encore assigné, hash correspondant, non expiré)
        $cv = $cvRepository->createQueryBuilder('c')
            ->where('c.proprietaire IS NULL')
            ->andWhere('c.jetonAccesHash = :hash')
            ->andWhere('c.jetonExpireLe > :now')
            ->setParameter('hash', $hashToken)
            ->setParameter('now', $now)
            ->getQuery()
            ->getOneOrNullResult();

        if (!$cv) {
            $response = $this->json([
                'erreur' => 'Ce CV a déjà été rattaché ou le délai de 48h est expiré.',
            ], Response::HTTP_NOT_FOUND);
            $response->headers->clearCookie('cv_claim_token', '/api');
            return $response;
        }

        $cvId = $cv->getId();

        // UPDATE atomique WHERE proprietaire IS NULL AND jeton_acces_hash = :hash AND jeton_expire_le > NOW()
        $qb = $em->createQueryBuilder();
        $rowsAffected = $qb->update(Cv::class, 'c')
            ->set('c.proprietaire', ':user')
            ->set('c.jetonAccesHash', ':nullToken')
            ->set('c.jetonExpireLe', ':nullExpire')
            ->where('c.id = :cvId')
            ->andWhere('c.proprietaire IS NULL')
            ->andWhere('c.jetonAccesHash = :hash')
            ->andWhere('c.jetonExpireLe > :now')
            ->setParameter('user', $user)
            ->setParameter('nullToken', null)
            ->setParameter('nullExpire', null)
            ->setParameter('cvId', $cvId)
            ->setParameter('hash', $hashToken)
            ->setParameter('now', $now)
            ->getQuery()
            ->execute();

        if ($rowsAffected === 0) {
            $response = $this->json([
                'erreur' => 'Conflit de rattachement : ce CV est déjà associé à un compte.',
            ], Response::HTTP_CONFLICT);
            $response->headers->clearCookie('cv_claim_token', '/api');
            return $response;
        }

        // Rafraîchir l'entité CV
        $em->refresh($cv);

        $response = $this->json([
            'succes' => true,
            'message' => 'CV rattaché avec succès à votre compte.',
            'cvId' => $cv->getId(),
            'nomOriginal' => $cv->getNomOriginal(),
            'taille' => $cv->getTaille(),
            'texteOffre' => $cv->getTexteOffre(),
            'nombreCaracteres' => mb_strlen($cv->getTexteExtrait() ?? ''),
        ], Response::HTTP_OK);

        // Invalidation immédiate en session : suppression du cookie HttpOnly
        $response->headers->clearCookie('cv_claim_token', '/api');

        return $response;
    }

    #[Route('/api/cv/brouillon', name: 'api_cv_brouillon', methods: ['GET'])]
    public function recupererBrouillon(
        Request $request,
        #[CurrentUser] User $user,
        CvRepository $cvRepository,
    ): JsonResponse {
        $cvId = $request->query->getInt('id', 0);
        $cv = null;

        if ($cvId > 0) {
            $cv = $cvRepository->findOneBy(['id' => $cvId, 'proprietaire' => $user]);
        } else {
            // Rechercher le dernier CV du propriétaire qui n'a pas encore d'analyse
            $qb = $cvRepository->createQueryBuilder('c')
                ->leftJoin('c.analyses', 'a')
                ->where('c.proprietaire = :user')
                ->andWhere('a.id IS NULL')
                ->setParameter('user', $user)
                ->orderBy('c.creeLe', 'DESC')
                ->setMaxResults(1);

            $cv = $qb->getQuery()->getOneOrNullResult();
        }

        if (!$cv) {
            return $this->json(['brouillon' => null], Response::HTTP_OK);
        }

        return $this->json([
            'brouillon' => [
                'id' => $cv->getId(),
                'nomOriginal' => $cv->getNomOriginal(),
                'taille' => $cv->getTaille(),
                'typeMime' => $cv->getTypeMime(),
                'texteOffre' => $cv->getTexteOffre(),
                'nombreCaracteres' => mb_strlen($cv->getTexteExtrait() ?? ''),
                'creeLe' => $cv->getCreeLe()->format(\DateTimeInterface::ATOM),
                'apercuExtrait' => mb_substr($cv->getTexteExtrait() ?? '', 0, 300),
            ]
        ], Response::HTTP_OK);
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

        // Si une offre est fournie dans la requête, on la prend et met à jour le CV ; sinon on prend celle déjà attachée au CV
        $texteOffre = ($dto && $dto->texteOffre !== null && trim($dto->texteOffre) !== '')
            ? trim($dto->texteOffre)
            : $cv->getTexteOffre();

        if ($dto && $dto->texteOffre !== null && $texteOffre !== $cv->getTexteOffre()) {
            $cv->setTexteOffre($texteOffre);
        }

        // 1. Création de l'entité Analyse en attente
        $analyse = new \App\Entity\Analyse($cv, $texteOffre);
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

