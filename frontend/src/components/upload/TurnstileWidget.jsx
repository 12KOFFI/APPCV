import { useEffect, useRef } from 'react';
import { ShieldCheckIcon } from '../ui/Icons';

export default function TurnstileWidget({ onVerify }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onVerifyRef = useRef(onVerify);

  // Synchronisation continue du callback sans recréer le widget
  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  // Clé publique Cloudflare (clé officielle de test Cloudflare '1x00000000000000000000AA' par défaut)
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

  useEffect(() => {
    let interval = null;

    function initTurnstile() {
      if (window.turnstile && containerRef.current && widgetIdRef.current === null) {
        try {
          containerRef.current.innerHTML = '';
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
            callback: (token) => {
              if (onVerifyRef.current) onVerifyRef.current(token);
            },
            'error-callback': () => {
              // Pas de jeton de contournement : le backend rejettera l'envoi sans jeton valide
              if (onVerifyRef.current) onVerifyRef.current('');
            },
            'expired-callback': () => {
              if (onVerifyRef.current) onVerifyRef.current('');
            },
          });
        } catch {
          if (onVerifyRef.current) onVerifyRef.current('');
        }
      }
    }

    if (window.turnstile) {
      initTurnstile();
    } else {
      // Attendre que le script Cloudflare soit chargé
      let attempts = 0;
      interval = setInterval(() => {
        attempts++;
        if (window.turnstile) {
          clearInterval(interval);
          initTurnstile();
        } else if (attempts >= 10) {
          clearInterval(interval);
          // Script Cloudflare bloqué (adblocker, hors ligne) : aucun jeton, l'envoi sera refusé côté serveur
          if (onVerifyRef.current) onVerifyRef.current('');
        }
      }, 300);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (window.turnstile && widgetIdRef.current !== null) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch {
          // Ignore
        }
      }
    };
  }, [siteKey]);

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/80 transition-colors">
      <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        <ShieldCheckIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span>Vérification de sécurité anti-robot Cloudflare</span>
      </div>
      <div ref={containerRef} className="min-h-[65px] flex items-center justify-center" />
    </div>
  );
}
