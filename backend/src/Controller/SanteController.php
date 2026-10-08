<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;


class SanteController extends AbstractController
{
    #[Route('/api/sante', name: 'app_sante' , methods: ['GET'])]
    public function verifier(): JsonResponse
    {
        return $this->json([
            'statut' => 'ok',
            'message' => 'Api Analyseur de CV operationnelle.',
        ]);
    }
}

