<?php

namespace App\Controller;

use App\Entity\Analyse;
use App\Entity\Cv;
use App\Entity\User;
use App\Message\AnalyserCvMessage;
use App\Repository\AnalyseRepository;
use App\Repository\CvRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/admin')]
#[IsGranted('ROLE_ADMIN')]
final class AdminController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserRepository $userRepository,
        private readonly CvRepository $cvRepository,
        private readonly AnalyseRepository $analyseRepository,
        #[Autowire('%kernel.project_dir%/var/uploads/cv')]
        private readonly string $dossierCv,
    ) {}

    // ─────────────────────────────────────────────────────────────
    // 1. DASHBOARD STATS & INDICATEURS GLOBAUX
    // ─────────────────────────────────────────────────────────────
    #[Route('/stats', name: 'api_admin_stats', methods: ['GET'])]
    public function stats(): JsonResponse
    {
        $now = new \DateTimeImmutable();
        $date7Jours = $now->modify('-7 days');
        $date30Jours = $now->modify('-30 days');

        // Utilisateurs
        $totalUsers = $this->userRepository->count([]);
        
        $qbNew7 = $this->userRepository->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->where('u.creeLe >= :d7')
            ->setParameter('d7', $date7Jours);
        $newUsers7J = (int) $qbNew7->getQuery()->getSingleScalarResult();

        $qbNew30 = $this->userRepository->createQueryBuilder('u')
            ->select('COUNT(u.id)')
            ->where('u.creeLe >= :d30')
            ->setParameter('d30', $date30Jours);
        $newUsers30J = (int) $qbNew30->getQuery()->getSingleScalarResult();

        // CVs
        $totalCvs = $this->cvRepository->count([]);
        $cvsClaimed = $this->cvRepository->count(['proprietaire' => null]);
        $cvsAssignes = $totalCvs - $cvsClaimed;

        $qbOrphelinsExpires = $this->cvRepository->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->where('c.proprietaire IS NULL')
            ->andWhere('c.jetonExpireLe < :now')
            ->setParameter('now', $now);
        $totalOrphelinsExpires = (int) $qbOrphelinsExpires->getQuery()->getSingleScalarResult();

        // Espace disque consommé par les CV
        $qbStorage = $this->cvRepository->createQueryBuilder('c')
            ->select('COALESCE(SUM(c.taille), 0)');
        $totalStorageBytes = (int) $qbStorage->getQuery()->getSingleScalarResult();

        // Analyses
        $totalAnalyses = $this->analyseRepository->count([]);
        $analysesTerminees = $this->analyseRepository->findBy(['statut' => Analyse::STATUT_TERMINE]);
        $analysesErreur = $this->analyseRepository->count(['statut' => Analyse::STATUT_ERREUR]);
        $analysesEnCours = $this->analyseRepository->count(['statut' => Analyse::STATUT_EN_COURS]);
        $analysesEnAttente = $this->analyseRepository->count(['statut' => Analyse::STATUT_EN_ATTENTE]);

        $scoreMoyen = 0;
        $repartition = ['excellent' => 0, 'bon' => 0, 'aAmeliorer' => 0];
        $competencesFreq = [];

        $nbNotes = 0;
        $sommeNotes = 0;

        foreach ($analysesTerminees as $a) {
            $note = $a->getNote();
            if ($note !== null) {
                $nbNotes++;
                $sommeNotes += $note;
                if ($note >= 80) {
                    $repartition['excellent']++;
                } elseif ($note >= 60) {
                    $repartition['bon']++;
                } else {
                    $repartition['aAmeliorer']++;
                }
            }

            if (is_array($a->getCompetences())) {
                foreach ($a->getCompetences() as $comp) {
                    $cTrim = trim($comp);
                    if ($cTrim !== '') {
                        $cLower = mb_convert_case($cTrim, MB_CASE_TITLE, 'UTF-8');
                        $competencesFreq[$cLower] = ($competencesFreq[$cLower] ?? 0) + 1;
                    }
                }
            }
        }

        if ($nbNotes > 0) {
            $scoreMoyen = (int) round($sommeNotes / $nbNotes);
        }

        // Top 10 compétences
        arsort($competencesFreq);
        $topCompetences = [];
        $i = 0;
        foreach ($competencesFreq as $nom => $freq) {
            $topCompetences[] = ['nom' => $nom, 'frequence' => $freq];
            $i++;
            if ($i >= 10) break;
        }

        // Activité sur les 7 derniers jours (pour mini-graphique)
        $activiteJours = [];
        for ($j = 6; $j >= 0; $j--) {
            $debutJour = (new \DateTimeImmutable("-{$j} days"))->setTime(0, 0, 0);
            $finJour = $debutJour->setTime(23, 59, 59);
            $label = $debutJour->format('d/m');

            $nbCvsJour = (int) $this->cvRepository->createQueryBuilder('c')
                ->select('COUNT(c.id)')
                ->where('c.creeLe >= :deb AND c.creeLe <= :fin')
                ->setParameter('deb', $debutJour)
                ->setParameter('fin', $finJour)
                ->getQuery()
                ->getSingleScalarResult();

            $nbAnalysesJour = (int) $this->analyseRepository->createQueryBuilder('a')
                ->select('COUNT(a.id)')
                ->where('a.creeLe >= :deb AND a.creeLe <= :fin')
                ->setParameter('deb', $debutJour)
                ->setParameter('fin', $finJour)
                ->getQuery()
                ->getSingleScalarResult();

            $activiteJours[] = [
                'date' => $label,
                'cvs' => $nbCvsJour,
                'analyses' => $nbAnalysesJour,
            ];
        }

        return $this->json([
            'utilisateurs' => [
                'total' => $totalUsers,
                'nouveaux7Jours' => $newUsers7J,
                'nouveaux30Jours' => $newUsers30J,
            ],
            'cvs' => [
                'total' => $totalCvs,
                'assignes' => $cvsAssignes,
                'anonymes' => $cvsClaimed,
                'orphelinsExpires' => $totalOrphelinsExpires,
                'stockageOctets' => $totalStorageBytes,
            ],
            'analyses' => [
                'total' => $totalAnalyses,
                'terminees' => count($analysesTerminees),
                'enCours' => $analysesEnCours + $analysesEnAttente,
                'erreurs' => $analysesErreur,
                'scoreMoyen' => $scoreMoyen,
                'repartition' => $repartition,
            ],
            'topCompetences' => $topCompetences,
            'activite7Jours' => $activiteJours,
        ]);
    }

    // ─────────────────────────────────────────────────────────────
    // 2. CRUD UTILISATEURS
    // ─────────────────────────────────────────────────────────────
    #[Route('/users', name: 'api_admin_users_list', methods: ['GET'])]
    public function listeUsers(Request $request): JsonResponse
    {
        $recherche = trim((string) $request->query->get('recherche', ''));
        $roleFiltre = trim((string) $request->query->get('role', ''));
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = max(1, min(100, (int) $request->query->get('limit', 15)));
        $offset = ($page - 1) * $limit;

        $qb = $this->userRepository->createQueryBuilder('u');

        if ($recherche !== '') {
            $qb->andWhere('u.email LIKE :search OR u.id = :searchExact')
               ->setParameter('search', '%' . $recherche . '%')
               ->setParameter('searchExact', is_numeric($recherche) ? (int)$recherche : -1);
        }

        if ($roleFiltre !== '' && in_array($roleFiltre, ['ROLE_USER', 'ROLE_ADMIN'], true)) {
            $qb->andWhere('u.role = :rf OR u.roles LIKE :rfLike')
               ->setParameter('rf', $roleFiltre)
               ->setParameter('rfLike', '%' . $roleFiltre . '%');
        }

        $qbTotal = clone $qb;
        $total = (int) $qbTotal->select('COUNT(u.id)')->getQuery()->getSingleScalarResult();

        $qb->orderBy('u.id', 'DESC')
           ->setFirstResult($offset)
           ->setMaxResults($limit);

        /** @var User[] $users */
        $users = $qb->getQuery()->getResult();

        $result = [];
        foreach ($users as $u) {
            $nbCvs = $this->cvRepository->count(['proprietaire' => $u]);
            
            // Calcul note moyenne
            $qbNote = $this->analyseRepository->createQueryBuilder('a')
                ->select('AVG(a.note)')
                ->join('a.cv', 'c')
                ->where('c.proprietaire = :u')
                ->andWhere('a.statut = :st AND a.note IS NOT NULL')
                ->setParameter('u', $u)
                ->setParameter('st', Analyse::STATUT_TERMINE);
            $noteMoyenne = $qbNote->getQuery()->getSingleScalarResult();

            $result[] = [
                'id' => $u->getId(),
                'email' => $u->getEmail(),
                'role' => $u->getRole(),
                'roles' => $u->getRoles(),
                'actif' => $u->isActif(),
                'creeLe' => $u->getCreeLe()?->format('c'),
                'nombreCvs' => $nbCvs,
                'scoreMoyen' => $noteMoyenne !== null ? (int) round((float) $noteMoyenne) : null,
            ];
        }

        return $this->json([
            'donnees' => $result,
            'total' => $total,
            'page' => $page,
            'totalPages' => (int) ceil($total / $limit),
        ]);
    }

    #[Route('/users', name: 'api_admin_users_create', methods: ['POST'])]
    public function creerUser(
        Request $request,
        UserPasswordHasherInterface $hasher,
    ): JsonResponse {
        $data = json_decode($request->getContent(), true) ?? [];
        $email = mb_strtolower(trim((string) ($data['email'] ?? '')));
        $motDePasse = (string) ($data['motDePasse'] ?? '');
        $role = trim((string) ($data['role'] ?? 'ROLE_USER'));

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json(['erreur' => 'Adresse email invalide.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (mb_strlen($motDePasse) < 8) {
            return $this->json(['erreur' => 'Le mot de passe doit comporter au moins 8 caractères.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($this->userRepository->findOneBy(['email' => $email]) !== null) {
            return $this->json(['erreur' => 'Un compte existe déjà avec cette adresse email.'], Response::HTTP_CONFLICT);
        }

        $user = new User();
        $user->setEmail($email);
        $user->setPassword($hasher->hashPassword($user, $motDePasse));
        $user->setRole($role === 'ROLE_ADMIN' ? 'ROLE_ADMIN' : 'ROLE_USER');
        $user->setActif(isset($data['actif']) ? (bool) $data['actif'] : true);

        $this->em->persist($user);
        $this->em->flush();

        return $this->json([
            'message' => 'Utilisateur créé avec succès.',
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'role' => $user->getRole(),
        ], Response::HTTP_CREATED);
    }

    #[Route('/users/{id}', name: 'api_admin_users_show', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function detailUser(int $id): JsonResponse
    {
        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['erreur' => 'Utilisateur introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $cvs = $this->cvRepository->findBy(['proprietaire' => $user], ['creeLe' => 'DESC']);
        $cvsData = [];
        foreach ($cvs as $cv) {
            $derniereAnalyse = $cv->getAnalyses()->last() ?: null;
            $cvsData[] = [
                'id' => $cv->getId(),
                'nomOriginal' => $cv->getNomOriginal(),
                'taille' => $cv->getTaille(),
                'typeMime' => $cv->getTypeMime(),
                'texteOffre' => $cv->getTexteOffre(),
                'creeLe' => $cv->getCreeLe()->format('c'),
                'note' => $derniereAnalyse?->getNote(),
                'statut' => $derniereAnalyse?->getStatut() ?? 'NON_ANALYSE',
                'derniereAnalyseId' => $derniereAnalyse?->getId(),
            ];
        }

        $qbNote = $this->analyseRepository->createQueryBuilder('a')
            ->select('AVG(a.note)')
            ->join('a.cv', 'c')
            ->where('c.proprietaire = :u')
            ->andWhere('a.statut = :st AND a.note IS NOT NULL')
            ->setParameter('u', $user)
            ->setParameter('st', Analyse::STATUT_TERMINE);
        $noteMoyenne = $qbNote->getQuery()->getSingleScalarResult();

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'role' => $user->getRole(),
            'roles' => $user->getRoles(),
            'actif' => $user->isActif(),
            'creeLe' => $user->getCreeLe()?->format('c'),
            'scoreMoyen' => $noteMoyenne !== null ? (int) round((float) $noteMoyenne) : null,
            'nombreCvs' => count($cvs),
            'cvs' => $cvsData,
        ]);
    }

    #[Route('/users/{id}', name: 'api_admin_users_update', methods: ['PUT'], requirements: ['id' => '\d+'])]
    public function modifierUser(
        int $id,
        Request $request,
        UserPasswordHasherInterface $hasher,
        #[CurrentUser] User $currentUser,
    ): JsonResponse {
        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['erreur' => 'Utilisateur introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        // Modification email
        if (isset($data['email'])) {
            $email = mb_strtolower(trim((string) $data['email']));
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                return $this->json(['erreur' => 'Adresse email invalide.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            if ($email !== $user->getEmail()) {
                $existant = $this->userRepository->findOneBy(['email' => $email]);
                if ($existant !== null) {
                    return $this->json(['erreur' => 'Cette adresse email est déjà prise.'], Response::HTTP_CONFLICT);
                }
                $user->setEmail($email);
            }
        }

        // Modification statut actif / inactif (Soft Ban - P4)
        if (isset($data['actif'])) {
            // Un admin ne peut pas se désactiver lui-même
            if ($currentUser->getId() === $user->getId() && !$data['actif']) {
                return $this->json(['erreur' => 'Vous ne pouvez pas désactiver votre propre compte administrateur.'], Response::HTTP_BAD_REQUEST);
            }
            $user->setActif((bool) $data['actif']);
        }

        // Modification rôle
        if (isset($data['role'])) {
            $nouveauRole = trim((string) $data['role']) === 'ROLE_ADMIN' ? 'ROLE_ADMIN' : 'ROLE_USER';
            if ($currentUser->getId() === $user->getId() && $nouveauRole !== 'ROLE_ADMIN') {
                return $this->json(['erreur' => 'Vous ne pouvez pas retirer votre propre rôle administrateur.'], Response::HTTP_BAD_REQUEST);
            }
            $user->setRole($nouveauRole);
        }

        // Réinitialisation mot de passe optionnelle
        if (!empty($data['motDePasse'])) {
            $mdp = (string) $data['motDePasse'];
            if (mb_strlen($mdp) < 8) {
                return $this->json(['erreur' => 'Le mot de passe doit comporter au moins 8 caractères.'], Response::HTTP_UNPROCESSABLE_ENTITY);
            }
            $user->setPassword($hasher->hashPassword($user, $mdp));
        }

        $this->em->flush();

        return $this->json([
            'message' => 'Utilisateur mis à jour avec succès.',
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'role' => $user->getRole(),
            'actif' => $user->isActif(),
        ]);
    }

    #[Route('/users/{id}', name: 'api_admin_users_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function supprimerUser(
        int $id,
        #[CurrentUser] User $currentUser,
    ): JsonResponse {
        $user = $this->userRepository->find($id);
        if (!$user) {
            return $this->json(['erreur' => 'Utilisateur introuvable.'], Response::HTTP_NOT_FOUND);
        }

        if ($currentUser->getId() === $user->getId()) {
            return $this->json(['erreur' => 'Vous ne pouvez pas supprimer votre propre compte administrateur.'], Response::HTTP_BAD_REQUEST);
        }

        // Suppression des fichiers physiques liés à ses CV
        $cvs = $this->cvRepository->findBy(['proprietaire' => $user]);
        foreach ($cvs as $cv) {
            $fichierPath = $this->dossierCv . '/' . $cv->getNomFichier();
            if (file_exists($fichierPath)) {
                @unlink($fichierPath);
            }
            $this->em->remove($cv);
        }

        $this->em->remove($user);
        $this->em->flush();

        return $this->json(['message' => 'Utilisateur et documents associés supprimés avec succès.']);
    }

    // ─────────────────────────────────────────────────────────────
    // 3. GESTION DES CVS & ANALYSES IA
    // ─────────────────────────────────────────────────────────────
    #[Route('/cvs', name: 'api_admin_cvs_list', methods: ['GET'])]
    public function listeCvs(Request $request): JsonResponse
    {
        $recherche = trim((string) $request->query->get('recherche', ''));
        $page = max(1, (int) $request->query->get('page', 1));
        $limit = max(1, min(100, (int) $request->query->get('limit', 20)));
        $offset = ($page - 1) * $limit;

        $qb = $this->cvRepository->createQueryBuilder('c')
            ->leftJoin('c.proprietaire', 'u');

        if ($recherche !== '') {
            $qb->andWhere('c.nomOriginal LIKE :sc OR u.email LIKE :sc OR c.id = :exactId')
               ->setParameter('sc', '%' . $recherche . '%')
               ->setParameter('exactId', is_numeric($recherche) ? (int)$recherche : -1);
        }

        $qbTotal = clone $qb;
        $total = (int) $qbTotal->select('COUNT(c.id)')->getQuery()->getSingleScalarResult();

        $qb->orderBy('c.id', 'DESC')
           ->setFirstResult($offset)
           ->setMaxResults($limit);

        /** @var Cv[] $cvs */
        $cvs = $qb->getQuery()->getResult();

        $result = [];
        foreach ($cvs as $cv) {
            $derniereAnalyse = $cv->getAnalyses()->last() ?: null;
            $result[] = [
                'id' => $cv->getId(),
                'nomOriginal' => $cv->getNomOriginal(),
                'taille' => $cv->getTaille(),
                'typeMime' => $cv->getTypeMime(),
                'creeLe' => $cv->getCreeLe()->format('c'),
                'proprietaire' => $cv->getProprietaire() ? [
                    'id' => $cv->getProprietaire()->getId(),
                    'email' => $cv->getProprietaire()->getEmail(),
                ] : null,
                'estOrphelin' => $cv->getProprietaire() === null,
                'jetonExpireLe' => $cv->getJetonExpireLe()?->format('c'),
                'derniereAnalyse' => $derniereAnalyse ? [
                    'id' => $derniereAnalyse->getId(),
                    'statut' => $derniereAnalyse->getStatut(),
                    'note' => $derniereAnalyse->getNote(),
                    'creeLe' => $derniereAnalyse->getCreeLe()->format('c'),
                    'erreur' => $derniereAnalyse->getErreur(),
                ] : null,
            ];
        }

        return $this->json([
            'donnees' => $result,
            'total' => $total,
            'page' => $page,
            'totalPages' => (int) ceil($total / $limit),
        ]);
    }

    #[Route('/cvs/{id}/analyse', name: 'api_admin_cv_analyse_detail', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function detailAnalyseCv(int $id): JsonResponse
    {
        $cv = $this->cvRepository->find($id);
        if (!$cv) {
            return $this->json(['erreur' => 'CV introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $analyses = $cv->getAnalyses();
        $derniere = $analyses->last() ?: null;

        return $this->json([
            'cv' => [
                'id' => $cv->getId(),
                'nomOriginal' => $cv->getNomOriginal(),
                'taille' => $cv->getTaille(),
                'typeMime' => $cv->getTypeMime(),
                'texteOffre' => $cv->getTexteOffre(),
                'creeLe' => $cv->getCreeLe()->format('c'),
                'proprietaire' => $cv->getProprietaire() ? [
                    'id' => $cv->getProprietaire()->getId(),
                    'email' => $cv->getProprietaire()->getEmail(),
                ] : null,
            ],
            'analyse' => $derniere ? [
                'id' => $derniere->getId(),
                'statut' => $derniere->getStatut(),
                'note' => $derniere->getNote(),
                'pointsForts' => $derniere->getPointsForts() ?? [],
                'pointsFaibles' => $derniere->getPointsFaibles() ?? [],
                'competences' => $derniere->getCompetences() ?? [],
                'recommandations' => $derniere->getRecommandations() ?? [],
                'erreur' => $derniere->getErreur(),
                'texteOffre' => $derniere->getTexteOffre(),
                'creeLe' => $derniere->getCreeLe()->format('c'),
            ] : null,
            'historiqueAnalyses' => array_map(fn(Analyse $a) => [
                'id' => $a->getId(),
                'statut' => $a->getStatut(),
                'note' => $a->getNote(),
                'creeLe' => $a->getCreeLe()->format('c'),
            ], $analyses->toArray()),
        ]);
    }

    #[Route('/cvs/{id}/telecharger', name: 'api_admin_cv_download', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function telechargerCv(int $id): Response
    {
        $cv = $this->cvRepository->find($id);
        if (!$cv) {
            return $this->json(['erreur' => 'CV introuvable.'], Response::HTTP_NOT_FOUND);
        }

        // Sécurisation anti-path traversal
        $nomFichierSecurise = basename($cv->getNomFichier());
        $chemin = $this->dossierCv . '/' . $nomFichierSecurise;
        $realDossier = realpath($this->dossierCv);
        $realChemin = realpath($chemin);

        if (!$realChemin || !$realDossier || !str_starts_with($realChemin, $realDossier) || !is_file($realChemin)) {
            return $this->json(['erreur' => 'Le fichier physique est introuvable sur le disque.'], Response::HTTP_NOT_FOUND);
        }

        // Nettoyage du nom pour éviter CRLF injection ou caractères malveillants
        $nomOriginal = preg_replace('/[^\w\.\-\s]/u', '_', basename($cv->getNomOriginal() ?: 'cv.pdf'));

        return $this->file($realChemin, $nomOriginal, ResponseHeaderBag::DISPOSITION_ATTACHMENT);
    }

    // P1: Relance d'analyse IA en 1 clic
    #[Route('/cvs/{id}/reanalyse', name: 'api_admin_cv_reanalyse', methods: ['POST'], requirements: ['id' => '\d+'])]
    public function relancerAnalyse(
        int $id,
        MessageBusInterface $bus,
    ): JsonResponse {
        $cv = $this->cvRepository->find($id);
        if (!$cv) {
            return $this->json(['erreur' => 'CV introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $nouvelleAnalyse = new Analyse($cv, $cv->getTexteOffre());
        $nouvelleAnalyse->setStatut(Analyse::STATUT_EN_ATTENTE);
        $this->em->persist($nouvelleAnalyse);
        $this->em->flush();

        $bus->dispatch(new AnalyserCvMessage($nouvelleAnalyse->getId()));

        return $this->json([
            'message' => 'Nouvelle analyse lancée et mise en file d\'attente.',
            'analyseId' => $nouvelleAnalyse->getId(),
            'statut' => $nouvelleAnalyse->getStatut(),
        ], Response::HTTP_ACCEPTED);
    }

    #[Route('/cvs/{id}', name: 'api_admin_cv_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function supprimerCv(int $id): JsonResponse
    {
        $cv = $this->cvRepository->find($id);
        if (!$cv) {
            return $this->json(['erreur' => 'CV introuvable.'], Response::HTTP_NOT_FOUND);
        }

        $chemin = $this->dossierCv . '/' . $cv->getNomFichier();
        if (file_exists($chemin)) {
            @unlink($chemin);
        }

        $this->em->remove($cv);
        $this->em->flush();

        return $this->json(['message' => 'CV et historique d\'analyses supprimés avec succès.']);
    }

    // ─────────────────────────────────────────────────────────────
    // 4. MAINTENANCE & SYSTÈME (P2, P3, P5)
    // ─────────────────────────────────────────────────────────────
    // P2: Purge RGPD des CV anonymes orphelins expirés
    #[Route('/system/purge-orphelins', name: 'api_admin_purge_orphelins', methods: ['POST'])]
    public function purgerOrphelins(): JsonResponse
    {
        $now = new \DateTimeImmutable();
        $orphelins = $this->cvRepository->createQueryBuilder('c')
            ->where('c.proprietaire IS NULL')
            ->andWhere('c.jetonExpireLe < :now')
            ->setParameter('now', $now)
            ->getQuery()
            ->getResult();

        $nbSupprimes = 0;
        $octetsLiberes = 0;

        foreach ($orphelins as $cv) {
            $chemin = $this->dossierCv . '/' . $cv->getNomFichier();
            if (file_exists($chemin)) {
                $taille = filesize($chemin);
                $octetsLiberes += $taille ?: $cv->getTaille();
                @unlink($chemin);
            } else {
                $octetsLiberes += $cv->getTaille();
            }

            $this->em->remove($cv);
            $nbSupprimes++;
        }

        $this->em->flush();

        return $this->json([
            'message' => "Purge RGPD terminée : {$nbSupprimes} CV orphelin(s) supprimé(s).",
            'fichiersSupprimes' => $nbSupprimes,
            'espaceLibereOctets' => $octetsLiberes,
            'espaceLibereMo' => round($octetsLiberes / (1024 * 1024), 2),
        ]);
    }

    // P5: Diagnostic santé & système
    #[Route('/system/health', name: 'api_admin_system_health', methods: ['GET'])]
    public function diagnosticSante(): JsonResponse
    {
        $dossierUploadExiste = is_dir($this->dossierCv);
        $dossierUploadInscriptible = is_writable($this->dossierCv);

        // Test DB
        $dbOk = true;
        try {
            $this->em->getConnection()->executeQuery('SELECT 1');
        } catch (\Throwable) {
            $dbOk = false;
        }

        return $this->json([
            'environnement' => [
                'phpVersion' => PHP_VERSION,
                'symfonyVersion' => \Symfony\Component\HttpKernel\Kernel::VERSION,
                'systeme' => PHP_OS,
            ],
            'stockage' => [
                'dossierUpload' => $this->dossierCv,
                'existe' => $dossierUploadExiste,
                'inscriptible' => $dossierUploadInscriptible,
            ],
            'baseDeDonnees' => [
                'statut' => $dbOk ? 'CONNECTÉ' : 'ERREUR',
            ],
            'horodatage' => (new \DateTimeImmutable())->format('c'),
        ]);
    }

    // P3: Export CSV Utilisateurs
    #[Route('/export/users', name: 'api_admin_export_users', methods: ['GET'])]
    public function exportUsers(): Response
    {
        $users = $this->userRepository->findBy([], ['id' => 'ASC']);

        $response = new StreamedResponse(function () use ($users) {
            $handle = fopen('php://output', 'w');
            // En-tête BOM pour Excel
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($handle, ['ID', 'Email', 'Rôle', 'Statut', 'Date Inscription', 'Nombre CVs'], ';');

            foreach ($users as $u) {
                $nbCvs = $this->cvRepository->count(['proprietaire' => $u]);
                fputcsv($handle, [
                    $u->getId(),
                    $u->getEmail(),
                    $u->getRole(),
                    $u->isActif() ? 'Actif' : 'Suspendu',
                    $u->getCreeLe()?->format('d/m/Y H:i') ?? 'N/A',
                    $nbCvs,
                ], ';');
            }

            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set('Content-Disposition', 'attachment; filename="appcv_utilisateurs_'.date('Ymd_His').'.csv"');

        return $response;
    }

    // P3: Export CSV CVs et scores ATS
    #[Route('/export/cvs', name: 'api_admin_export_cvs', methods: ['GET'])]
    public function exportCvs(): Response
    {
        $cvs = $this->cvRepository->findBy([], ['id' => 'DESC']);

        $response = new StreamedResponse(function () use ($cvs) {
            $handle = fopen('php://output', 'w');
            fprintf($handle, chr(0xEF).chr(0xBB).chr(0xBF));
            fputcsv($handle, ['ID CV', 'Nom Fichier Original', 'Taille (Ko)', 'Propriétaire', 'Date Import', 'Score ATS', 'Statut Analyse'], ';');

            foreach ($cvs as $cv) {
                $derniereAnalyse = $cv->getAnalyses()->last() ?: null;
                fputcsv($handle, [
                    $cv->getId(),
                    $cv->getNomOriginal(),
                    round($cv->getTaille() / 1024, 1),
                    $cv->getProprietaire() ? $cv->getProprietaire()->getEmail() : 'Visiteur Anonyme',
                    $cv->getCreeLe()->format('d/m/Y H:i'),
                    $derniereAnalyse?->getNote() !== null ? $derniereAnalyse->getNote() . '/100' : 'N/A',
                    $derniereAnalyse?->getStatut() ?? 'NON_ANALYSE',
                ], ';');
            }

            fclose($handle);
        });

        $response->headers->set('Content-Type', 'text/csv; charset=utf-8');
        $response->headers->set('Content-Disposition', 'attachment; filename="appcv_analyses_'.date('Ymd_His').'.csv"');

        return $response;
    }
}
