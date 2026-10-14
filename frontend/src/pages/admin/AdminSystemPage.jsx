import { useState, useEffect } from 'react';
import client from '../../api/client';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  DownloadIcon,
  ClockIcon,
  FileTextIcon,
  UserIcon,
} from '../../components/ui/Icons';

export default function AdminSystemPage() {
  const [stats, setStats] = useState(null);
  const [sante, setSante] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [actionEnCours, setActionEnCours] = useState(false);

  async function chargerDonnees() {
    setChargement(true);
    setErreur('');
    try {
      const [resStats, resSante] = await Promise.all([
        client.get('/api/admin/stats'),
        client.get('/api/admin/system/health'),
      ]);
      setStats(resStats.data);
      setSante(resSante.data);
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Impossible de charger les informations système.');
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    chargerDonnees();
  }, []);

  async function handleLancerPurge() {
    if (!window.confirm('Confirmez-vous la purge RGPD des CV anonymes orphelins dont le délai de 48h a expiré ? Cette action est irréversible.')) {
      return;
    }
    setActionEnCours(true);
    setMessage('');
    setErreur('');
    try {
      const res = await client.post('/api/admin/system/purge-orphelins');
      setMessage(res.data.message || 'Purge terminée.');
      await chargerDonnees();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la purge.');
    } finally {
      setActionEnCours(false);
    }
  }

  function handleExportUsers() {
    const token = localStorage.getItem('token');
    window.open(`${client.defaults.baseURL || ''}/api/admin/export/users?token=${token}`, '_blank');
  }

  function handleExportCvs() {
    const token = localStorage.getItem('token');
    window.open(`${client.defaults.baseURL || ''}/api/admin/export/cvs?token=${token}`, '_blank');
  }

  return (
    <div className="space-y-6 fade-in">
      {/* ── En-tête ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Système & Maintenance RGPD
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Supervision de l'infrastructure, gestion du stockage des fichiers et conformité RGPD.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={chargerDonnees} className="cursor-pointer">
          Actualiser
        </Button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage('')} className="text-emerald-700 font-bold hover:underline cursor-pointer">×</button>
        </div>
      )}

      {erreur && (
        <div className="p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircleIcon className="w-4 h-4 text-red-600 shrink-0" />
            <span>{erreur}</span>
          </div>
          <button onClick={() => setErreur('')} className="text-red-700 font-bold hover:underline cursor-pointer">×</button>
        </div>
      )}

      {/* ── Section Diagnostic Santé (P5) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <ShieldCheckIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Environnement</h3>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                PHP {sante?.environnement?.phpVersion || '...'}
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between">
              <span>Framework :</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Symfony {sante?.environnement?.symfonyVersion || '7.4'}</span>
            </div>
            <div className="flex justify-between">
              <span>Système :</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{sante?.environnement?.systeme || 'Windows'}</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <CheckCircleIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Base de Données</h3>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                MySQL 9.1
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between">
              <span>Connexion :</span>
              <Badge variant="success" size="sm">{sante?.baseDeDonnees?.statut || 'CONNECTÉ'}</Badge>
            </div>
            <div className="flex justify-between">
              <span>ORM :</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Doctrine 3.3</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <FileTextIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Stockage CV</h3>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                {Math.round((stats?.cvs?.stockageOctets || 0) / (1024 * 1024))} Mo utilisés
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between">
              <span>Dossier sécurisé :</span>
              <span className="font-semibold text-emerald-600">Inscriptible</span>
            </div>
            <div className="flex justify-between">
              <span>Fichiers totaux :</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{stats?.cvs?.total || 0}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Section Purge RGPD (P2) ── */}
      <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheckIcon className="w-5 h-5 text-amber-500" />
              Purge Automatique & RGPD des CV Anonymes
            </h3>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Lorsqu'un visiteur non connecté dépose un CV, un jeton temporaire lui permet de lier son document à un compte pendant <strong>48 heures</strong>. Passé ce délai, conformément à la réglementation RGPD et pour préserver l'espace disque, les fichiers anonymes orphelins peuvent être purgés.
            </p>
          </div>

          <Badge variant={stats?.cvs?.orphelinsExpires > 0 ? 'warning' : 'neutral'} size="sm">
            {stats?.cvs?.orphelinsExpires || 0} orphelin(s) expiré(s)
          </Badge>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <p className="font-bold text-slate-800 dark:text-slate-200">
              Statut actuel : {stats?.cvs?.orphelinsExpires || 0} CV éligibles à la suppression
            </p>
            <p className="text-slate-400">
              Cette action supprime définitivement les fichiers sur le disque et efface les enregistrements de la base de données.
            </p>
          </div>

          <Button
            variant="danger"
            size="md"
            onClick={handleLancerPurge}
            loading={actionEnCours}
            disabled={actionEnCours || (stats?.cvs?.orphelinsExpires === 0)}
            className="cursor-pointer whitespace-nowrap font-bold"
          >
            Lancer la purge RGPD
          </Button>
        </div>
      </Card>

      {/* ── Section Exports de Données (P3) ── */}
      <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 space-y-4">
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <DownloadIcon className="w-5 h-5 text-blue-600" />
            Exports & Données Analytiques (CSV)
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Téléchargez les rapports complets de la plateforme pour vos analyses statistiques ou audits externes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center">
                <UserIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Annuaire des Utilisateurs</p>
                <p className="text-[11px] text-slate-400">IDs, emails, rôles, statuts, dates</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExportUsers} className="cursor-pointer text-xs">
              <DownloadIcon className="w-3.5 h-3.5 mr-1" />
              Exporter
            </Button>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 flex items-center justify-center">
                <FileTextIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Registre des CV & Scores ATS</p>
                <p className="text-[11px] text-slate-400">Documents, candidats, notes ATS</p>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExportCvs} className="cursor-pointer text-xs">
              <DownloadIcon className="w-3.5 h-3.5 mr-1" />
              Exporter
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
