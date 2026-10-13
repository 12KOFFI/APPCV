<?php

namespace App\Tests\Functional\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class AuthControllerTest extends WebTestCase
{
    private function genererEmailUnique(): string
    {
        return sprintf('test_user_%s@example.com', bin2hex(random_bytes(6)));
    }

    public function testInscriptionConnexionEtProfilMoi(): void
    {
        $client = static::createClient();
        $email = $this->genererEmailUnique();
        $motDePasse = 'MonSuperMotDePasse123!';

        // 1. Inscription
        $client->request(
            'POST',
            '/api/inscription',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => $email,
                'motDePasse' => $motDePasse,
            ])
        );

        $this->assertResponseStatusCodeSame(201);
        $dataInscription = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('id', $dataInscription);
        $this->assertSame(mb_strtolower($email), $dataInscription['email']);

        // 2. Inscription doublon (même email) -> 409 Conflict
        $client->request(
            'POST',
            '/api/inscription',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => $email,
                'motDePasse' => $motDePasse,
            ])
        );
        $this->assertResponseStatusCodeSame(409);

        // 3. Connexion valide -> 200 OK avec Token JWT
        $client->request(
            'POST',
            '/api/connexion',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => $email,
                'motDePasse' => $motDePasse,
            ])
        );

        $this->assertResponseIsSuccessful();
        $dataConnexion = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('token', $dataConnexion, 'La connexion doit renvoyer un token JWT.');
        $token = $dataConnexion['token'];

        // 4. Accès à /api/moi avec le JWT valide -> 200 OK
        $client->request(
            'GET',
            '/api/moi',
            [],
            [],
            ['HTTP_AUTHORIZATION' => 'Bearer ' . $token]
        );

        $this->assertResponseIsSuccessful();
        $dataMoi = json_decode($client->getResponse()->getContent(), true);
        $this->assertSame(mb_strtolower($email), $dataMoi['email']);
        $this->assertContains('ROLE_USER', $dataMoi['roles']);

        // 5. Accès à /api/moi sans JWT -> 401 Unauthorized
        $client->request('GET', '/api/moi');
        $this->assertResponseStatusCodeSame(401);
    }

    public function testConnexionMauvaisMotDePasseRetourne401(): void
    {
        $client = static::createClient();

        $client->request(
            'POST',
            '/api/connexion',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode([
                'email' => 'utilisateur_inexistant@example.com',
                'motDePasse' => 'mauvais_mdp',
            ])
        );

        $this->assertResponseStatusCodeSame(401);
    }
}
