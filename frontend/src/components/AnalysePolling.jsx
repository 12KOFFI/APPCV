import { useEffect, useState } from 'react';
import client from '../api/client';
import { Card } from './ui/Card';
import Badge from './ui/Badge';
import { SparklesIcon, ClockIcon } from './ui/Icons';

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
          onErreur(data.erreur || "L'analyse a rencontré une erreur.");
        }
      } catch (err) {
        if (timerId) clearInterval(timerId);
        onErreur(err.response?.data?.erreur || 'Impossible de joindre le serveur.');
      }
    }

    verifierStatut();
    timerId = setInterval(verifierStatut, 2000);

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [analyseId, onTermine, onErreur]);

  const messagesStatut = {
    EN_ATTENTE: "Analyse placée dans la file d'attente sécurisée...",
    EN_COURS: "L'IA analyse la structure, les compétences et les mots-clés de votre CV...",
    TERMINE: 'Audit terminé ! Finalisation de votre rapport...',
  };

  return (
    <Card className="text-center py-12 px-6 sm:px-10 max-w-xl mx-auto shadow-xl bg-white border-slate-200/90 fade-in">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 mx-auto mb-6">
        <SparklesIcon className="w-6 h-6 text-slate-900 animate-spin" />
      </div>

      <h3 className="text-xl font-extrabold text-slate-900 mb-2">
        {statut === 'EN_COURS' ? 'Audit approfondi en cours' : 'Traitement de votre profil'}
      </h3>

      <p className="text-xs sm:text-sm text-slate-600 font-medium mb-8 max-w-sm mx-auto leading-relaxed">
        {messagesStatut[statut] || 'Analyse en cours...'}
      </p>

      <div className="progress-bar mb-6">
        <div className="progress-bar-indeterminate" />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
        <Badge variant={statut === 'EN_COURS' ? 'blue' : 'neutral'} size="sm">
          {statut}
        </Badge>
        <span className="flex items-center gap-1">
          <ClockIcon className="w-3.5 h-3.5" />
          <span>{secondes}s écoulées</span>
        </span>
      </div>
    </Card>
  );
}