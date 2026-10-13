<?php

namespace App\Controller;

use App\Dto\ChangerMotDePasseDto;
use App\Dto\InscriptionDto;
use App\Entity\User;
use App\Repository\CvRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

#[Route('/api')]
final class AuthController extends AbstractController
{
    public function __construct(
        private readonly ?CvRepository $cvRepository = null,
    ) {}

    #[Route('/inscription', name: 'api_inscription', methods: ['POST'])]
    public function inscription(
        #[MapRequestPayload] InscriptionDto $dto,
        UserRepository $userRepository,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $em,
    ): JsonResponse {
        $email = mb_strtolower(trim($dto->email));

        if ($userRepository->findOneBy(['email' => $email]) !== null) {
            return $this->json(
                ['erreur' => 'Cet email est déjà utilisé.'],
                Response::HTTP_CONFLICT
            );
        }

        $user = new User();
        $user->setEmail($email);
        $user->setPassword($passwordHasher->hashPassword($user, $dto->motDePasse));

        $em->persist($user);
        $em->flush();

        return $this->json(
            ['id' => $user->getId(), 'email' => $user->getEmail()],
            Response::HTTP_CREATED
        );
    }

    #[Route('/moi', name: 'api_moi', methods: ['GET'])]
    public function moi(#[CurrentUser] User $user): JsonResponse
    {
        $nombreCvs = $this->cvRepository ? $this->cvRepository->count(['proprietaire' => $user]) : 0;

        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
            'nombreCvs' => $nombreCvs,
        ]);
    }

    #[Route('/profil/mot-de-passe', name: 'api_profil_changer_mot_de_passe', methods: ['POST'])]
    public function changerMotDePasse(
        #[CurrentUser] User $user,
        #[MapRequestPayload] ChangerMotDePasseDto $dto,
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $em,
    ): JsonResponse {
        if (!$passwordHasher->isPasswordValid($user, $dto->ancienMotDePasse)) {
            return $this->json(
                ['erreur' => 'Le mot de passe actuel est incorrect.'],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        if ($dto->ancienMotDePasse === $dto->nouveauMotDePasse) {
            return $this->json(
                ['erreur' => 'Le nouveau mot de passe doit être différent de l\'ancien mot de passe.'],
                Response::HTTP_UNPROCESSABLE_ENTITY
            );
        }

        $user->setPassword($passwordHasher->hashPassword($user, $dto->nouveauMotDePasse));
        $em->flush();

        return $this->json([
            'message' => 'Votre mot de passe a été modifié avec succès.',
        ]);
    }
}
