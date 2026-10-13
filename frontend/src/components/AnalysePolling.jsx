import { useEffect, useState } from 'react';
import client from '../api/client';

export default function AnalysePolling({ analyseId, onTermine, onErreur }) {
  const [statut, setStatut] = useState('EN_ATTENTE');
  const [secondes, setSecondes] = useState(0);

  useEffect(() => {
    const chrono = setInterval(() => {
      setSecondes((s) => s + 1);
    }, 1000);

    return () => clearInterval(chrono);
  }, []);

  useEffect(() => {
    let timerId = null;

    async function verifierStatut() {
      try {
        const res = await client.get(`/api/analyse/${analyseId}`);
        const data = res.data;
        setStatut(data.statut);

        if (data.statut === 'TERMINE') {
          if (timerId) clearInterval(timerId);
          onTermine(data);
        } else if (data.statut === 'ERREUR') {
          if (timerId) clearInterval(timerId);
          onErreur(data.erreur || 'L\'analyse a rencontré une erreur.');
        }
      } catch (err) {
        if (timerId) clearInterval(timerId);
        onErreur(err.response?.data?.erreur || 'Impossible de joindre le serveur.');
      }
    }

    verifierStatut(); // Premier appel immédiat
    timerId = setInterval(verifierStatut, 2000);

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [analyseId, onTermine, onErreur]);

  const messagesStatut = {
    EN_ATTENTE: "Analyse placée dans la file d'attente...",
    EN_COURS: "Claude analyse la structure et les compétences de votre CV...",
    TERMINE: "Audit terminé ! Finalisation de votre rapport...",
  };

  return (
    <div className="text-center py-12 px-6 bg-slate-800/60 border border-slate-700 rounded-3xl max-w-xl mx-auto shadow-2xl">
      <div className="spinner mx-auto mb-6" />
      <h3 className="text-xl font-bold text-white mb-2">
        {statut === 'EN_COURS' ? 'Audit en cours par Claude' : 'Traitement en cours'}
      </h3>
      <p className="text-sm text-indigo-300 font-medium mb-6">
        {messagesStatut[statut] || 'Analyse en cours...'}
      </p>

      <div className="progress-bar mb-4">
        <div className="progress-bar-indeterminate" />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
        <span>Statut : {statut}</span>
        <span>Chronomètre : {secondes}s</span>
      </div>
    </div>
  );
}