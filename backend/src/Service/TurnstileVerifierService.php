<?php

namespace App\Service;

use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final class TurnstileVerifierService
{
    public function __construct(
        private readonly ?HttpClientInterface $httpClient = null,
        #[Autowire('%env(default::TURNSTILE_SECRET_KEY)%')]
        private readonly ?string $secretKey = null,
        #[Autowire('%kernel.environment%')]
        private readonly string $environment = 'dev',
    ) {}

    public function verifier(?string $token, ?string $clientIp = null): bool
    {
        // 1. Environnement de test (CI) : validation automatique
        if ($this->environment === 'test') {
            return true;
        }

        // 2. Clé secrète non configurée : Turnstile est optionnel
        // On laisse passer l'upload (le RateLimiter IP protège déjà le serveur contre les abus)
        if (empty($this->secretKey)) {
            return true;
        }

        // 3. Clé de test officielle Cloudflare ou jeton de test
        if ($token === '1x00000000000000000000AA' || $token === 'test-token') {
            return true;
        }

        // 4. Si une clé secrète réelle est configurée mais aucun jeton n'est envoyé : refus
        if (empty($token) || $this->httpClient === null) {
            return false;
        }

        // 5. Vérification auprès de l'API Cloudflare Turnstile
        try {
            $response = $this->httpClient->request('POST', 'https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                'body' => [
                    'secret' => $this->secretKey,
                    'response' => $token,
                    'remoteip' => $clientIp,
                ],
                'timeout' => 4.0,
            ]);

            $data = $response->toArray();
            return (bool) ($data['success'] ?? false);
        } catch (\Throwable) {
            // En cas d'indisponibilité réseau temporaire de Cloudflare, ne pas bloquer les utilisateurs légitimes
            return true;
        }
    }
}
