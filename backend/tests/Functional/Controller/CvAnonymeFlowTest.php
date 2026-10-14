<?php

namespace App\Tests\Functional\Controller;

use Dompdf\Dompdf;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class CvAnonymeFlowTest extends WebTestCase
{
    private function creerFichierPdfValide(string $chemin): void
    {
        $dompdf = new Dompdf();
        $dompdf->loadHtml('<html><body><h1>Développeur PHP Symfony</h1><p>Expérience professionnelle de 5 ans dans le développement web, formation ingénieur, compétences techniques PHP, Symfony, Docker, contact contact@example.com, réalisation de 12 projets réussis.</p></body></html>');
        $dompdf->render();
        file_put_contents($chemin, $dompdf->output());
    }

    private function creerUtilisateurEtObtenirToken(KernelBrowser $client, string $email): string
    {
        $motDePasse = 'PasswordSecret123!';

        // Inscription
        $client->request(
            'POST',
            '/api/inscription',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => $email, 'motDePasse' => $motDePasse])
        );

        // Connexion
        $client->request(
            'POST',
            '/api/connexion',
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode(['email' => $email, 'motDePasse' => $motDePasse])
        );

        $data = json_decode($client->getResponse()->getContent(), true);
        return $data['token'] ?? '';
    }

    public function testUploadAnonymeTeaserEtRattachementAtomique(): void
    {
        $client = static::createClient();

        $tempPdf = tempnam(sys_get_temp_dir(), 'test_anon_') . '.pdf';
        $this->creerFichierPdfValide($tempPdf);

        try {
            $uploadedFile = new UploadedFile($tempPdf, 'cv_visiteur.pdf', 'application/pdf', null, true);

            $uniqueIp = sprintf('192.168.%d.%d', mt_rand(10, 200), mt_rand(10, 200));

            // 1. Upload Anonyme sur /api/cv
            $client->request(
                'POST',
                '/api/cv',
                ['texteOffre' => 'Recherche Développeur Symfony pour mission 12 mois'],
                ['cv' => $uploadedFile],
                ['REMOTE_ADDR' => $uniqueIp]
            );

            $this->assertResponseStatusCodeSame(201);
            $data = json_decode($client->getResponse()->getContent(), true);

            // Vérification de la persistance temporaire sans simulation ni teaser
            $this->assertFalse($data['rattacheAuCompte']);
            $this->assertTrue($data['enAttenteAuthentification']);
            $this->assertSame('cv_visiteur.pdf', $data['nomOriginal']);
            $this->assertArrayNotHasKey('teaser', $data);
            $this->assertArrayNotHasKey('texteExtrait', $data);
            $this->assertArrayNotHasKey('jetonAcces', $data); // Secret strictly in HttpOnly cookie!

            // Vérification de la présence du cookie HttpOnly cv_claim_token
            $cookies = $client->getResponse()->headers->getCookies();
            $claimCookie = null;
            foreach ($cookies as $c) {
                if ($c->getName() === 'cv_claim_token') {
                    $claimCookie = $c;
                    break;
                }
            }

            $this->assertNotNull($claimCookie, 'Le cookie HttpOnly cv_claim_token doit être présent.');
            $this->assertTrue($claimCookie->isHttpOnly());
            $this->assertSame('/api', $claimCookie->getPath());
            $this->assertNotEmpty($claimCookie->getValue());

            $rawClaimToken = $claimCookie->getValue();
            $cvId = $data['id'];

            // 2. Inscription d'un utilisateur
            $email = sprintf('visiteur_%s@example.com', bin2hex(random_bytes(6)));
            $tokenJwt = $this->creerUtilisateurEtObtenirToken($client, $email);

            // 3. Rattachement du CV via POST /api/cv/rattacher avec le cookie HttpOnly
            $client->getCookieJar()->set(new \Symfony\Component\BrowserKit\Cookie(
                'cv_claim_token',
                $rawClaimToken,
                null,
                '/api'
            ));

            $client->request(
                'POST',
                '/api/cv/rattacher',
                [],
                [],
                ['HTTP_AUTHORIZATION' => 'Bearer ' . $tokenJwt]
            );

            $this->assertResponseStatusCodeSame(200);
            $rattacherData = json_decode($client->getResponse()->getContent(), true);
            $this->assertTrue($rattacherData['succes']);
            $this->assertSame($cvId, $rattacherData['cvId']);

            // 4. Tentative de second rattachement (doit échouer car jeton invalidé)
            $client->getCookieJar()->set(new \Symfony\Component\BrowserKit\Cookie(
                'cv_claim_token',
                $rawClaimToken,
                null,
                '/api'
            ));

            $client->request(
                'POST',
                '/api/cv/rattacher',
                [],
                [],
                ['HTTP_AUTHORIZATION' => 'Bearer ' . $tokenJwt]
            );

            $this->assertResponseStatusCodeSame(404);
        } finally {
            if (file_exists($tempPdf)) {
                @unlink($tempPdf);
            }
        }
    }

    public function testRateLimiterBloqueApresTroisUploads(): void
    {
        $client = static::createClient();
        $ip = sprintf('10.%d.%d.%d', mt_rand(1, 200), mt_rand(1, 200), mt_rand(1, 200));

        $tempPdf = tempnam(sys_get_temp_dir(), 'test_rate_') . '.pdf';
        $this->creerFichierPdfValide($tempPdf);

        try {
            for ($i = 1; $i <= 3; $i++) {
                $copyPdf = tempnam(sys_get_temp_dir(), 'test_rate_c_') . '.pdf';
                copy($tempPdf, $copyPdf);
                $uploadedFile = new UploadedFile($copyPdf, "cv_$i.pdf", 'application/pdf', null, true);
                $client->request(
                    'POST',
                    '/api/cv',
                    [],
                    ['cv' => $uploadedFile],
                    ['REMOTE_ADDR' => $ip]
                );
                $this->assertResponseStatusCodeSame(201, "L'upload $i doit être accepté");
            }

            // 4ème upload avec la même IP -> 429 Too Many Requests
            $copyPdf4 = tempnam(sys_get_temp_dir(), 'test_rate_c_') . '.pdf';
            copy($tempPdf, $copyPdf4);
            $uploadedFile4 = new UploadedFile($copyPdf4, 'cv_4.pdf', 'application/pdf', null, true);
            $client->request(
                'POST',
                '/api/cv',
                [],
                ['cv' => $uploadedFile4],
                ['REMOTE_ADDR' => $ip]
            );
            $this->assertResponseStatusCodeSame(429, "Le 4ème upload doit être bloqué par le rate-limiter.");
            $data = json_decode($client->getResponse()->getContent(), true);
            $this->assertStringContainsString('Limite de requêtes atteinte', $data['erreur']);
        } finally {
            if (file_exists($tempPdf)) {
                @unlink($tempPdf);
            }
        }
    }

    public function testParcoursCompletRecuperationBrouillonEtLancementAnalyse(): void
    {
        $client = static::createClient();
        $tempPdf = tempnam(sys_get_temp_dir(), 'test_brouillon_') . '.pdf';
        $this->creerFichierPdfValide($tempPdf);

        try {
            $uploadedFile = new UploadedFile($tempPdf, 'cv_mon_brouillon.pdf', 'application/pdf', null, true);
            $uniqueIp = sprintf('172.16.%d.%d', mt_rand(10, 200), mt_rand(10, 200));

            // 1. Upload Anonyme avec texte d'offre facultative
            $client->request(
                'POST',
                '/api/cv',
                ['texteOffre' => 'Offre Senior Symfony / React chez TechCo'],
                ['cv' => $uploadedFile],
                ['REMOTE_ADDR' => $uniqueIp]
            );

            $this->assertResponseStatusCodeSame(201);
            $uploadData = json_decode($client->getResponse()->getContent(), true);
            $this->assertArrayHasKey('claimToken', $uploadData);
            $rawClaimToken = $uploadData['claimToken'];
            $cvId = $uploadData['id'];

            // 2. Inscription / Connexion de l'utilisateur
            $email = sprintf('candidat_%s@example.com', bin2hex(random_bytes(6)));
            $jwt = $this->creerUtilisateurEtObtenirToken($client, $email);

            // 3. Rattachement via le body JSON avec claimToken (fallback résilient)
            $client->request(
                'POST',
                '/api/cv/rattacher',
                [],
                [],
                [
                    'HTTP_AUTHORIZATION' => 'Bearer ' . $jwt,
                    'CONTENT_TYPE' => 'application/json',
                ],
                json_encode(['claimToken' => $rawClaimToken])
            );

            $this->assertResponseStatusCodeSame(200);
            $rattacherData = json_decode($client->getResponse()->getContent(), true);
            $this->assertTrue($rattacherData['succes']);
            $this->assertSame($cvId, $rattacherData['cvId']);
            $this->assertSame('Offre Senior Symfony / React chez TechCo', $rattacherData['texteOffre']);

            // 4. Récupération du brouillon sur GET /api/cv/brouillon
            $client->request(
                'GET',
                '/api/cv/brouillon',
                [],
                [],
                ['HTTP_AUTHORIZATION' => 'Bearer ' . $jwt]
            );

            $this->assertResponseStatusCodeSame(200);
            $brouillonData = json_decode($client->getResponse()->getContent(), true);
            $this->assertNotNull($brouillonData['brouillon']);
            $this->assertSame($cvId, $brouillonData['brouillon']['id']);
            $this->assertSame('cv_mon_brouillon.pdf', $brouillonData['brouillon']['nomOriginal']);
            $this->assertSame('Offre Senior Symfony / React chez TechCo', $brouillonData['brouillon']['texteOffre']);
            $this->assertGreaterThan(0, $brouillonData['brouillon']['nombreCaracteres']);

            // 5. Lancement effectif de l'analyse IA depuis /upload
            $client->request(
                'POST',
                sprintf('/api/cv/%d/analyse', $cvId),
                [],
                [],
                [
                    'HTTP_AUTHORIZATION' => 'Bearer ' . $jwt,
                    'CONTENT_TYPE' => 'application/json',
                ],
                json_encode(['texteOffre' => 'Offre Senior Symfony / React mise à jour'])
            );

            $this->assertResponseStatusCodeSame(202);
            $analyseData = json_decode($client->getResponse()->getContent(), true);
            $this->assertArrayHasKey('analyseId', $analyseData);

            // 6. Vérification : le CV étant désormais en analyse, GET /api/cv/brouillon retourne null
            $client->request(
                'GET',
                '/api/cv/brouillon',
                [],
                [],
                ['HTTP_AUTHORIZATION' => 'Bearer ' . $jwt]
            );

            $this->assertResponseStatusCodeSame(200);
            $brouillonApresAnalyse = json_decode($client->getResponse()->getContent(), true);
            $this->assertNull($brouillonApresAnalyse['brouillon']);

            // 7. Isolation de sécurité : un autre utilisateur ne peut pas accéder à ce brouillon
            $autreEmail = sprintf('autre_%s@example.com', bin2hex(random_bytes(6)));
            $autreJwt = $this->creerUtilisateurEtObtenirToken($client, $autreEmail);

            $client->request(
                'GET',
                sprintf('/api/cv/brouillon?id=%d', $cvId),
                [],
                [],
                ['HTTP_AUTHORIZATION' => 'Bearer ' . $autreJwt]
            );

            $this->assertResponseStatusCodeSame(200);
            $isolationData = json_decode($client->getResponse()->getContent(), true);
            $this->assertNull($isolationData['brouillon']);
        } finally {
            if (file_exists($tempPdf)) {
                @unlink($tempPdf);
            }
        }
    }

    public function testRattacherJetonInvalideOuInexistant(): void
    {
        $client = static::createClient();
        $email = sprintf('test_%s@example.com', bin2hex(random_bytes(6)));
        $jwt = $this->creerUtilisateurEtObtenirToken($client, $email);

        // Sans jeton -> 400
        $client->request(
            'POST',
            '/api/cv/rattacher',
            [],
            [],
            ['HTTP_AUTHORIZATION' => 'Bearer ' . $jwt]
        );
        $this->assertResponseStatusCodeSame(400);

        // Jeton inconnu ou expiré -> 404
        $client->request(
            'POST',
            '/api/cv/rattacher',
            [],
            [],
            [
                'HTTP_AUTHORIZATION' => 'Bearer ' . $jwt,
                'CONTENT_TYPE' => 'application/json',
            ],
            json_encode(['claimToken' => 'jeton_completement_invalide_1234567890'])
        );
        $this->assertResponseStatusCodeSame(404);
    }
}

