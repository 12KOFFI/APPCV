import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../contexts/useAuth';
import StatCards from '../components/dashboard/StatCards';
import AreaChartCard from '../components/dashboard/AreaChartCard';
import DonutChartCard from '../components/dashboard/DonutChartCard';
import {
  AlertCircleIcon,
  FileTextIcon,
  UploadIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  SparklesIcon,
} from '../components/ui/Icons';
import Badge from '../components/ui/Badge';

export default function DashboardPage() {
  const { user } = useAuth();
  const [cvs, setCvs] = useState([]);
  const [stats, setStats] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    async function chargerDonnees() {
      try {
        const [resCvs, resStats] = await Promise.all([
          client.get('/api/cv'),
          client.get('/api/dashboard/stats'),
        ]);
        setCvs(resCvs.data || []);
        setStats(resStats.data || null);
      } catch (err) {
        setErreur(
          err.response?.data?.erreur ||
            'Impossible de récupérer les statistiques du tableau de bord.'
        );
      } finally {
        setChargement(false);
      }
    }

    chargerDonnees();
  }, []);

  const isAdmin = Boolean(
    stats?.isAdmin ||
      user?.role === 'ROLE_ADMIN' ||
      user?.roles?.includes('ROLE_ADMIN')
  );

  if (chargement) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="spinner" />
        <p className="text-xs font-semibold text-slate-500">
          Chargement de vos statistiques réelles...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* ── Bannière de rôle Admin si applicable ── */}
      {isAdmin && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-indigo-950">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                Vue Administrateur Plateforme
              </p>
              <p className="text-[11px] text-indigo-700">
                Vous visualisez l'ensemble des analyses et indicateurs consolidés de la plateforme.
              </p>
            </div>
          </div>
          <Badge variant="blue" size="sm" className="font-bold self-start sm:self-auto">
            ROLE_ADMIN
          </Badge>
        </div>
      )}

      {/* Bannière d'erreur si l'API échoue */}
      {erreur && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
          <AlertCircleIcon className="w-5 h-5 text-red-600 shrink-0" />
          <span>{erreur}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          1. 4 CARTES MÉTRIQUES KPI (DONNÉES RÉELLES DE L'UTILISATEUR OU ADMIN)
          ══════════════════════════════════════════════════════════════════ */}
      <StatCards stats={stats} cvsCount={cvs.length} />

      {/* ══════════════════════════════════════════════════════════════════
          2. SECTION ANALYTIQUE :
             - ADMIN : Graphique d'analyse & Score ATS + Répartition Donut
             - CANDIDAT (USER) : Indicateur "Statistiques d'analyse & Score ATS" masqué,
               affichage de la répartition et des accès rapides.
          ══════════════════════════════════════════════════════════════════ */}
      {isAdmin ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <div className="lg:col-span-2">
            <AreaChartCard historique={stats?.historique || []} />
          </div>
          <div className="lg:col-span-1">
            <DonutChartCard stats={stats} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Répartition réelle des bilans du candidat */}
          <div className="h-full">
            <DonutChartCard stats={stats} />
          </div>

          {/* Espace Candidat & Accès Rapides */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Espace Candidat & Accès Rapides
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Gérez vos documents et optimisez vos candidatures
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <SparklesIcon className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <Link
                  to="/mes-cvs"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors">
                      <FileTextIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        Mes CV enregistrés
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {cvs.length} document{cvs.length > 1 ? 's' : ''} disponible{cvs.length > 1 ? 's' : ''} pour consultation ou analyse
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </Link>

                <Link
                  to="/upload"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-100 hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors">
                      <UploadIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        Déposer un nouveau CV
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Formats PDF (.pdf) et Word (.docx) supportés
                      </p>
                    </div>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                <span>Analyses propulsées par IA asynchrone</span>
              </span>
              <Link
                to="/mes-cvs"
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Voir la page dédiée →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}