import { useState } from 'react';
import client from '../api/client';

export default function AnalyseResult({ analyse, onRecommencer }) {
  const [chargementPdf, setChargementPdf] = useState(false);
  const [erreurPdf, setErreurPdf] = useState('');

  const note = analyse.note ?? 0;

  let couleurBadge = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400';
  let etiquetteScore = 'Excellent profil';
  if (note < 50) {
    couleurBadge = 'border-rose-500/40 bg-rose-500/10 text-rose-400';
    etiquetteScore = 'Des ajustements majeurs sont nécessaires';
  } else if (note < 70) {
    couleurBadge = 'border-amber-500/40 bg-amber-500/10 text-amber-400';
    etiquetteScore = 'Profil prometteur à consolider';
  }

  async function handleTelechargerPdf() {
    if (!analyse?.id) return;
    setChargementPdf(true);
    setErreurPdf('');
    try {
      const res = await client.get(`/api/analyse/${analyse.id}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport-analyse-${analyse.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      setErreurPdf('Erreur lors du téléchargement du PDF.');
    } finally {
      setChargementPdf(false);
    }
  }

  return (
    <div className="space-y-8 fade-in">
      {/* ── En-tête avec note globale & actions ── */}
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="text-center md:text-left flex-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Rapport d'audit IA</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Diagnostic de votre profil</h2>
          <p className="text-slate-400 text-sm mt-1">{etiquetteScore}</p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleTelechargerPdf}
            disabled={chargementPdf}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition shadow-lg shadow-indigo-600/30"
            title="Télécharger le rapport complet au format PDF officiel"
          >
            <span>📥</span>
            <span>{chargementPdf ? 'Génération du PDF...' : 'Télécharger le rapport PDF'}</span>
          </button>

          <div className={`flex flex-col items-center justify-center p-5 rounded-2xl border ${couleurBadge} shrink-0 min-w-[120px]`}>
            <span className="text-4xl font-extrabold">{note}</span>
            <span className="text-xs uppercase font-bold tracking-wider mt-0.5">/ 100</span>
          </div>
        </div>
      </div>

      {erreurPdf && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          ⚠️ {erreurPdf}
        </div>
      )}

      {/* ── Grille Points Forts & Faibles ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Points forts */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4 text-emerald-400 font-bold text-base">
            <span>✨</span> Points forts identifiés
          </div>
          <ul className="space-y-3">
            {analyse.pointsForts?.map((point, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Points faibles / Axes d'amélioration */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4 text-rose-400 font-bold text-base">
            <span>🎯</span> Axes d'amélioration
          </div>
          <ul className="space-y-3">
            {analyse.pointsFaibles?.map((point, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="text-rose-400 font-bold shrink-0">!</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Compétences clés détectées ── */}
      {analyse.competences && analyse.competences.length > 0 && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
            <span>🛠️</span> Compétences clés identifiées
          </h3>
          <div className="flex flex-wrap gap-2">
            {analyse.competences.map((comp, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
              >
                {comp}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── 5 Recommandations concrètes ── */}
      {analyse.recommandations && analyse.recommandations.length > 0 && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
            <span>💡</span> Recommandations prioritaires
          </h3>
          <div className="space-y-3">
            {analyse.recommandations.map((rec, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-300"
              >
                <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <p className="flex-1 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bouton pour recommencer ── */}
      {onRecommencer && (
        <div className="flex justify-end pt-4">
          <button
            onClick={onRecommencer}
            className="py-2.5 px-6 rounded-xl text-sm font-semibold text-slate-200 bg-slate-700 hover:bg-slate-600 transition"
          >
            Refaire une analyse
          </button>
        </div>
      )}
    </div>
  );
}