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

    public function testChangerMotDePasseSucces(): void
    {
        $client = static::createClient();
        $email = $this->genererEmailUnique();
        $motDePasseInitial = 'AncienMotDePasse123!';
        $nouveauMotDePasse = 'NouveauMotDePasse456!';

        // 1. Inscription
        $client->request(
            'POST',
            '/api/inscription',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => $email, 'motDePasse' => $motDePasseInitial])
        );
        $this->assertResponseStatusCodeSame(201);

        // 2. Connexion initiale
        $client->request(
            'POST',
            '/api/connexion',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => $email, 'motDePasse' => $motDePasseInitial])
        );
        $this->assertResponseIsSuccessful();
        $token = json_decode($client->getResponse()->getContent(), true)['token'];

        // 3. Changement de mot de passe avec l'ancien token
        $client->request(
            'POST',
            '/api/profil/mot-de-passe',
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
            ],
            json_encode([
                'ancienMotDePasse' => $motDePasseInitial,
                'nouveauMotDePasse' => $nouveauMotDePasse,
            ])
        );
        $this->assertResponseIsSuccessful();
        $res = json_decode($client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('message', $res);

        // 4. L'ancienne connexion doit maintenant échouer
        $client->request(
            'POST',
            '/api/connexion',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => $email, 'motDePasse' => $motDePasseInitial])
        );
        $this->assertResponseStatusCodeSame(401);

        // 5. La connexion avec le nouveau mot de passe doit réussir
        $client->request(
            'POST',
            '/api/connexion',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => $email, 'motDePasse' => $nouveauMotDePasse])
        );
        $this->assertResponseIsSuccessful();
    }

    public function testChangerMotDePasseMauvaisAncienMotDePasse(): void
    {
        $client = static::createClient();
        $email = $this->genererEmailUnique();
        $motDePasse = 'BonMotDePasse123!';

        // Inscription & connexion
        $client->request(
            'POST',
            '/api/inscription',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => $email, 'motDePasse' => $motDePasse])
        );
        $client->request(
            'POST',
            '/api/connexion',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => $email, 'motDePasse' => $motDePasse])
        );
        $token = json_decode($client->getResponse()->getContent(), true)['token'];

        // Requête avec faux ancien mot de passe
        $client->request(
            'POST',
            '/api/profil/mot-de-passe',
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_AUTHORIZATION' => 'Bearer ' . $token,
            ],
            json_encode([
                'ancienMotDePasse' => 'FauxMotDePasse999!',
                'nouveauMotDePasse' => 'NouveauMotDePasse456!',
            ])
        );
        $this->assertResponseStatusCodeSame(422);
    }
}
