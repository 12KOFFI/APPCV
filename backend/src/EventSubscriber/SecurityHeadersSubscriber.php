<?php

namespace App\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

final class SecurityHeadersSubscriber implements EventSubscriberInterface
{
    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::RESPONSE => ['onKernelResponse', -10],
        ];
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $response = $event->getResponse();
        $headers = $response->headers;

        // Protection contre le sniffing de type MIME
        $headers->set('X-Content-Type-Options', 'nosniff');

        // Protection anti-clickjacking (aucun embedding en iframe externe)
        $headers->set('X-Frame-Options', 'DENY');

        // Politique de diffusion du Referer sécurisée
        $headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Désactivation de l'ancien filtre XSS navigateur au profit de CSP
        $headers->set('X-XSS-Protection', '0');

        // Suppression de l'en-tête de version PHP (anti-fingerprinting)
        $headers->remove('X-Powered-By');
        if (function_exists('header_remove')) {
            @header_remove('X-Powered-By');
        }

        // Restriction des APIs sensibles du navigateur
        $headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        // En HTTPS : forcer HSTS pendant 1 an
        if ($event->getRequest()->isSecure()) {
            $headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }
    }
}
