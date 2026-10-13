import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import AnalyseResult from '../components/AnalyseResult';

export default function HistoriquePage() {
  const { id } = useParams();
  const [analyses, setAnalyses] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [analyseSelectionnee, setAnalyseSelectionnee] = useState(null);
  const [chargementDetail, setChargementDetail] = useState(false);

  useEffect(() => {
    async function chargerHistorique() {
      try {
        const res = await client.get(`/api/cv/${id}/analyses`);
        setAnalyses(res.data);
      } catch (err) {
        setErreur(err.response?.data?.erreur || "Impossible de récupérer l'historique.");
      } finally {
        setChargement(false);
      }
    }

    chargerHistorique();
  }, [id]);

  async function afficherDetails(analyseId) {
    setChargementDetail(true);
    try {
      const res = await client.get(`/api/analyse/${analyseId}`);
      setAnalyseSelectionnee(res.data);
    } catch {
      setErreur("Impossible de charger les détails de cette analyse.");
    } finally {
      setChargementDetail(false);
    }
  }

  if (chargement) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="spinner" />
        <p className="text-sm text-slate-400">Chargement de l'historique...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link to="/dashboard" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1 mb-2">
            ← Retour au Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Historique des analyses</h1>
          <p className="text-slate-400 text-sm mt-1">
            Consultez l'évolution des scores et les rapports précédents générés pour ce CV.
          </p>
        </div>
        <Link
          to={`/cv/${id}/analyse`}
          className="py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shrink-0"
        >
          + Nouvelle analyse
        </Link>
      </div>

      {erreur && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          ❌ {erreur}
        </div>
      )}

      {/* Si une analyse est sélectionnée, on affiche son rapport complet */}
      {analyseSelectionnee ? (
        <div className="space-y-6">
          <button
            onClick={() => setAnalyseSelectionnee(null)}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            ← Revenir à la liste des analyses
          </button>
          <AnalyseResult analyse={analyseSelectionnee} />
        </div>
      ) : analyses.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/40 border border-slate-700/60 rounded-3xl">
          <div className="text-4xl mb-3">⏱️</div>
          <h3 className="text-lg font-semibold text-white mb-2">Aucune analyse réalisée</h3>
          <p className="text-slate-400 text-sm mb-6">
            Ce document n'a pas encore fait l'objet d'un audit par l'intelligence artificielle.
          </p>
          <Link
            to={`/cv/${id}/analyse`}
            className="inline-block py-2.5 px-6 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition"
          >
            Lancer le premier audit
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-800/60 shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/60 text-xs uppercase font-semibold text-indigo-300 tracking-wider">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Type d'audit</th>
                <th className="py-4 px-6">Statut</th>
                <th className="py-4 px-6 text-center">Score</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-sm text-slate-300">
              {analyses.map((a) => {
                const date = new Intl.DateTimeFormat('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(a.creeLe));

                return (
                  <tr key={a.id} className="hover:bg-slate-700/20 transition">
                    <td className="py-4 px-6 font-medium text-white">{date}</td>
                    <td className="py-4 px-6">
                      {a.aOffre ? (
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          Offre ciblée
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Généraliste</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        {a.statut}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-bold font-mono">
                      {a.note !== null ? (
                        <span className={a.note >= 70 ? 'text-emerald-400' : a.note >= 50 ? 'text-amber-400' : 'text-rose-400'}>
                          {a.note} / 100
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => afficherDetails(a.id)}
                        disabled={chargementDetail}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition"
                      >
                        Consulter le rapport
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}