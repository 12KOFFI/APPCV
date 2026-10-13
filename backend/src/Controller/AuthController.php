<?php

namespace App\Controller;

use App\Dto\InscriptionDto;
use App\Entity\User;
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
        return $this->json([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
        ]);
    }
}
