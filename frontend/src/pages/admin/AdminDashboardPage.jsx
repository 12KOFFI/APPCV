import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import {
  UserIcon,
  FileTextIcon,
  SparklesIcon,
  BarChartIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from '../../components/ui/Icons';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [purgeEnCours, setPurgeEnCours] = useState(false);

  async function chargerStats() {
    setChargement(true);
    setErreur('');
    try {
      const res = await client.get('/api/admin/stats');
      setStats(res.data);
    } catch (err) {
      setErreur(
        err.response?.data?.erreur ||
        err.response?.data?.message ||
        'Impossible de charger les statistiques administrateur.'
      );
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    chargerStats();
  }, []);

  async function handlePurgeRapide() {
    if (!window.confirm('Voulez-vous purger définitivement tous les CV anonymes orphelins dont le délai de 48h a expiré ?')) {
      return;
    }
    setPurgeEnCours(true);
    setActionMessage('');
    try {
      const res = await client.post('/api/admin/system/purge-orphelins');
      setActionMessage(res.data.message || 'Purge terminée avec succès.');
      await chargerStats();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la purge.');
    } finally {
      setPurgeEnCours(false);
    }
  }

  if (chargement) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="spinner" />
        <p className="text-xs font-semibold text-slate-500">Chargement des données de la plateforme...</p>
      </div>
    );
  }

  if (erreur && !stats) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircleIcon className="w-5 h-5 text-red-600 shrink-0" />
          <span>{erreur}</span>
        </div>
        <Button variant="secondary" size="sm" onClick={chargerStats}>
          Réessayer
        </Button>
      </div>
    );
  }

  const { utilisateurs, cvs, analyses, topCompetences, activite7Jours } = stats || {};

  return (
    <div className="space-y-8 fade-in">
      {/* ── En-tête de la Console Admin ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Console d'Administration
            </h1>
            <Badge variant="purple" size="sm" className="font-extrabold text-[11px] px-2 py-0.5">
              Super Admin
            </Badge>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            Supervision globale de la plateforme APPCV, suivi des utilisateurs, des documents et de l'intelligence artificielle.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={chargerStats}>
            Actualiser
          </Button>
          <Link to="/admin/users">
            <Button variant="primary" size="sm">
              <UserIcon className="w-3.5 h-3.5 mr-1" />
              Gérer les Utilisateurs
            </Button>
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 text-xs">
          <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* ── 4 Indicateurs Clés Principaux ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1 : Utilisateurs */}
        <Card className="p-5 relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Utilisateurs Inscrits</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <UserIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {utilisateurs?.total ?? 0}
          </div>
          <div className="flex items-center gap-2 mt-3 text-[11px]">
            <span className="inline-flex items-center text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
              +{utilisateurs?.nouveaux7Jours ?? 0}
            </span>
            <span className="text-slate-400">cette semaine (+{utilisateurs?.nouveaux30Jours ?? 0} ce mois)</span>
          </div>
        </Card>

        {/* KPI 2 : CVs téléversés */}
        <Card className="p-5 relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">CVs Traités</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileTextIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {cvs?.total ?? 0}
          </div>
          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span>{cvs?.assignes ?? 0} rattachés</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>{cvs?.anonymes ?? 0} anonymes</span>
          </div>
        </Card>

        {/* KPI 3 : Analyses IA */}
        <Card className="p-5 relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Analyses IA</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <SparklesIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {analyses?.total ?? 0}
          </div>
          <div className="flex items-center gap-2 mt-3 text-[11px]">
            <span className="text-emerald-600 font-semibold">{analyses?.terminees ?? 0} réussies</span>
            {analyses?.erreurs > 0 && (
              <span className="text-red-500 font-semibold">({analyses.erreurs} err.)</span>
            )}
          </div>
        </Card>

        {/* KPI 4 : Score ATS Moyen */}
        <Card className="p-5 relative overflow-hidden bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Score ATS Moyen</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BarChartIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-baseline gap-1.5">
            <span>{analyses?.scoreMoyen ?? 0}</span>
            <span className="text-xs font-semibold text-slate-400">/ 100</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${analyses?.scoreMoyen ?? 0}%` }}
            />
          </div>
        </Card>
      </div>

      {/* ── Section Graphiques & Analytique ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Répartition des Scores ATS */}
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Répartition des Scores ATS
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Niveau global de conformité des CV analysés sur la plateforme
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Excellent (≥ 80)
                </span>
                <span className="text-slate-900 dark:text-white font-bold">{analyses?.repartition?.excellent ?? 0}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{
                    width: `${analyses?.terminees ? Math.round(((analyses.repartition?.excellent || 0) / analyses.terminees) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  Bon (60 à 79)
                </span>
                <span className="text-slate-900 dark:text-white font-bold">{analyses?.repartition?.bon ?? 0}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${analyses?.terminees ? Math.round(((analyses.repartition?.bon || 0) / analyses.terminees) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  À améliorer (&lt; 60)
                </span>
                <span className="text-slate-900 dark:text-white font-bold">{analyses?.repartition?.aAmeliorer ?? 0}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{
                    width: `${analyses?.terminees ? Math.round(((analyses.repartition?.aAmeliorer || 0) / analyses.terminees) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Évolution d'Activité sur 7 Jours */}
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Activité sur 7 Jours
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Flux quotidien des nouveaux CV et analyses IA
          </p>

          <div className="space-y-3">
            {(activite7Jours || []).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="font-semibold text-slate-600 dark:text-slate-300 font-mono">{item.date}</span>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-slate-900 dark:text-white font-bold">
                    <FileTextIcon className="w-3.5 h-3.5 text-blue-500" />
                    {item.cvs} CV
                  </span>
                  <span className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
                    <SparklesIcon className="w-3.5 h-3.5" />
                    {item.analyses} IA
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top 10 Compétences Détectées */}
        <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Compétences Phares
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Mots-clés et technologies les plus fréquents dans les CV
          </p>

          {(!topCompetences || topCompetences.length === 0) ? (
            <p className="text-xs text-slate-400 text-center py-8">Aucune compétence extraite pour le moment.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {topCompetences.map((comp, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/40"
                >
                  <span>{comp.nom}</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-white dark:bg-slate-900 text-[10px] font-bold text-blue-800 dark:text-blue-200">
                    {comp.frequence}
                  </span>
                </span>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Section Raccourcis & Actions Administrateur ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Raccourci Gestion Utilisateurs */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center mb-3">
              <UserIcon className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-1.5">Gestion des Comptes</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Consultez les utilisateurs, créez des comptes, modifiez les privilèges ou réinitialisez les accès.
            </p>
          </div>
          <Link to="/admin/users">
            <Button variant="primary" size="sm" className="w-full justify-center">
              Ouvrir l'annuaire ({utilisateurs?.total ?? 0})
              <ArrowRightIcon className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </Card>

        {/* Raccourci Audits & Diagnostics ATS */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center mb-3">
              <FileTextIcon className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-1.5">Audits & Analyses IA</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Consultez les scores ATS, diagnostics détaillés et relancez les audits directement depuis les fiches candidats.
            </p>
          </div>
          <Link to="/admin/users">
            <Button variant="secondary" size="sm" className="w-full justify-center bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 font-bold">
              Consulter les diagnostics ({cvs?.total ?? 0} CV)
              <ArrowRightIcon className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </Card>

        {/* Actions Rapides Système & Purge RGPD */}
        <Card className="p-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50 flex items-center justify-center">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
              {cvs?.orphelinsExpires > 0 && (
                <Badge variant="warning" size="sm">
                  {cvs.orphelinsExpires} expirés
                </Badge>
              )}
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-1.5">Maintenance & RGPD</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Stockage total : <strong className="text-slate-900 dark:text-white font-semibold">{Math.round((cvs?.stockageOctets || 0) / (1024 * 1024))} Mo</strong>. Purgez les CV anonymes expirés ou configurez le système.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              className="flex-1 text-xs justify-center"
              onClick={handlePurgeRapide}
              loading={purgeEnCours}
              disabled={purgeEnCours || (cvs?.orphelinsExpires === 0)}
            >
              Purger orphelins
            </Button>
            <Link to="/admin/system">
              <Button variant="secondary" size="sm" className="text-xs font-semibold">
                Système
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
