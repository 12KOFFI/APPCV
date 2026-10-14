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
        // Environnement de test (CI) : validation automatique
        if ($this->environment === 'test') {
            return true;
        }

        // Clé secrète absente : on laisse passer uniquement en développement.
        // En production, on refuse (fail closed) pour ne jamais désactiver l'anti-bot silencieusement.
        if (empty($this->secretKey)) {
            return $this->environment !== 'prod';
        }

        // Jeton de test officiel Cloudflare : uniquement hors production (dev / test)
        if ($this->environment !== 'prod' && ($token === '1x00000000000000000000AA' || $token === 'test-token')) {
            return true;
        }

        if (empty($token) || $this->httpClient === null) {
            return false;
        }

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
            // En cas d'indisponibilité réseau temporaire de Cloudflare, ne pas bloquer si en dev
            return $this->environment === 'dev';
        }
    }
}
