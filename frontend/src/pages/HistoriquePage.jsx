import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import AnalyseResult from '../components/AnalyseResult';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { FileTextIcon, PlusIcon, AlertCircleIcon } from '../components/ui/Icons';

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
      setErreur('Impossible de charger les détails de cette analyse.');
    } finally {
      setChargementDetail(false);
    }
  }

  if (chargement) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="spinner" />
        <p className="text-xs font-medium text-slate-500">Chargement de votre historique...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-in text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            to="/dashboard"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition flex items-center gap-1.5 mb-2"
          >
            <span>←</span> Retour au Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Historique des audits
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Consultez l'évolution des scores et les rapports précédents générés pour ce document.
          </p>
        </div>

        <Link to={`/cv/${id}/analyse`}>
          <Button variant="primary" size="md">
            <PlusIcon className="w-4 h-4" />
            <span>Nouvelle analyse</span>
          </Button>
        </Link>
      </div>

      {erreur && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
          <AlertCircleIcon className="w-5 h-5 text-red-600 shrink-0" />
          <span>{erreur}</span>
        </div>
      )}

      {/* Si une analyse est sélectionnée, on affiche son rapport complet */}
      {analyseSelectionnee ? (
        <div className="space-y-6">
          <Button
            onClick={() => setAnalyseSelectionnee(null)}
            variant="ghost"
            size="sm"
            className="text-slate-600 hover:text-slate-900"
          >
            <span>←</span> Revenir à la liste des analyses
          </Button>
          <AnalyseResult analyse={analyseSelectionnee} />
        </div>
      ) : analyses.length === 0 ? (
        <Card className="text-center py-16 px-4 bg-white border-slate-200/90 shadow-xs max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 mx-auto mb-4">
            <FileTextIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Aucune analyse réalisée</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto mb-6 leading-relaxed">
            Ce document n'a pas encore fait l'objet d'un audit par l'intelligence artificielle.
          </p>
          <Link to={`/cv/${id}/analyse`}>
            <Button variant="primary" size="md">
              Lancer le premier audit
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="overflow-hidden bg-white border-slate-200/90 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                  <th className="py-3.5 px-6">Date de l'audit</th>
                  <th className="py-3.5 px-6">Type d'analyse</th>
                  <th className="py-3.5 px-6">Statut</th>
                  <th className="py-3.5 px-6 text-center">Score obtenu</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm text-slate-700">
                {analyses.map((a) => {
                  const date = new Intl.DateTimeFormat('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }).format(new Date(a.creeLe));

                  const badgeScoreVariant =
                    a.note >= 70 ? 'success' : a.note >= 50 ? 'warning' : 'error';

                  return (
                    <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900">{date}</td>
                      <td className="py-4 px-6">
                        {a.aOffre ? (
                          <Badge variant="blue" size="sm">Offre ciblée</Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">Audit généraliste</Badge>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {a.statut}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center font-bold">
                        {a.note !== null ? (
                          <Badge variant={badgeScoreVariant} size="sm">
                            {a.note} / 100
                          </Badge>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          onClick={() => afficherDetails(a.id)}
                          disabled={chargementDetail}
                          variant="secondary"
                          size="sm"
                        >
                          Consulter
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}