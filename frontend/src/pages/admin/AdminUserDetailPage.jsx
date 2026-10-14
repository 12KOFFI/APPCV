import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import client from '../../api/client';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import {
  UserIcon,
  FileTextIcon,
  SparklesIcon,
  DownloadIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  ClockIcon,
  TargetIcon,
  ShieldCheckIcon,
  BarChartIcon,
  KeyIcon,
} from '../../components/ui/Icons';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [chargementUser, setChargementUser] = useState(true);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  // CV actif & Diagnostic ATS
  const [selectedCvId, setSelectedCvId] = useState(null);
  const [analyseData, setAnalyseData] = useState(null);
  const [chargementAnalyse, setChargementAnalyse] = useState(false);
  const [actionEnCours, setActionEnCours] = useState(false);

  // Modales d'actions
  const [modalEditUser, setModalEditUser] = useState(false);
  const [modalDeleteUser, setModalDeleteUser] = useState(false);
  const [modalDeleteCv, setModalDeleteCv] = useState(null);

  // Formulaire d'édition
  const [editRole, setEditRole] = useState('ROLE_USER');
  const [editActif, setEditActif] = useState(true);
  const [editMdp, setEditMdp] = useState('');
  const [savingUser, setSavingUser] = useState(false);

  // 1. Charger les données utilisateur
  async function chargerUtilisateur(preserveCvSelection = false) {
    setChargementUser(true);
    setErreur('');
    try {
      const res = await client.get(`/api/admin/users/${id}`);
      setUser(res.data);
      setEditRole(res.data.role || 'ROLE_USER');
      setEditActif(res.data.actif ?? true);

      const cvs = res.data.cvs || [];
      if (cvs.length > 0) {
        if (!preserveCvSelection || !selectedCvId) {
          setSelectedCvId(cvs[0].id);
        }
      } else {
        setSelectedCvId(null);
        setAnalyseData(null);
      }
    } catch (err) {
      setErreur(err.response?.data?.erreur || "Impossible de charger la fiche de l'utilisateur.");
    } finally {
      setChargementUser(false);
    }
  }

  useEffect(() => {
    chargerUtilisateur();
  }, [id]);

  // 2. Charger le diagnostic ATS du CV sélectionné
  async function chargerDiagnostic(cvId) {
    if (!cvId) {
      setAnalyseData(null);
      return;
    }
    setChargementAnalyse(true);
    try {
      const res = await client.get(`/api/admin/cvs/${cvId}/analyse`);
      setAnalyseData(res.data);
    } catch (err) {
      setErreur(err.response?.data?.erreur || "Impossible de charger le rapport d'analyse ATS.");
    } finally {
      setChargementAnalyse(false);
    }
  }

  useEffect(() => {
    if (selectedCvId) {
      chargerDiagnostic(selectedCvId);
    }
  }, [selectedCvId]);

  // 3. Actions sur le CV (Relance IA, Téléchargement, Suppression)
  async function handleRelancerAnalyse(cvId) {
    if (!cvId) return;
    setActionEnCours(true);
    setErreur('');
    try {
      const res = await client.post(`/api/admin/cvs/${cvId}/reanalyse`);
      setSucces(res.data.message || 'Audit IA relancé avec succès.');
      await chargerDiagnostic(cvId);
      await chargerUtilisateur(true);
    } catch (err) {
      setErreur(err.response?.data?.erreur || "Échec de la relance de l'analyse.");
    } finally {
      setActionEnCours(false);
    }
  }

  async function handleTelechargerFichier(cvId, nomFichier = 'cv.pdf') {
    try {
      const res = await client.get(`/api/admin/cvs/${cvId}/telecharger`, { responseType: 'blob' });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', nomFichier);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors du téléchargement du fichier.');
    }
  }

  async function handleConfirmerSupprimerCv() {
    if (!modalDeleteCv) return;
    setActionEnCours(true);
    setErreur('');
    try {
      await client.delete(`/api/admin/cvs/${modalDeleteCv.id}`);
      setSucces(`CV #${modalDeleteCv.id} (${modalDeleteCv.nomOriginal}) supprimé avec succès.`);
      setModalDeleteCv(null);
      await chargerUtilisateur(false);
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la suppression du CV.');
    } finally {
      setActionEnCours(false);
    }
  }

  // 4. Actions sur le compte Utilisateur
  async function handleModifierUserSubmit(e) {
    e.preventDefault();
    setSavingUser(true);
    setErreur('');
    setSucces('');
    try {
      const payload = {
        role: editRole,
        actif: editActif,
      };
      if (editMdp.trim()) {
        payload.motDePasse = editMdp.trim();
      }
      await client.put(`/api/admin/users/${id}`, payload);
      setSucces('Profil utilisateur mis à jour avec succès.');
      setModalEditUser(false);
      setEditMdp('');
      await chargerUtilisateur(true);
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la modification.');
    } finally {
      setSavingUser(false);
    }
  }

  async function handleToggleStatutActif() {
    if (!user) return;
    setActionEnCours(true);
    setErreur('');
    try {
      await client.put(`/api/admin/users/${id}`, {
        actif: !user.actif,
      });
      setSucces(`Statut du compte utilisateur mis à jour : ${!user.actif ? 'Actif' : 'Suspendu'}.`);
      await chargerUtilisateur(true);
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Impossible de modifier le statut.');
    } finally {
      setActionEnCours(false);
    }
  }

  async function handleConfirmerSuppressionUser() {
    setSavingUser(true);
    setErreur('');
    try {
      await client.delete(`/api/admin/users/${id}`);
      navigate('/admin/users');
    } catch (err) {
      setErreur(err.response?.data?.erreur || "Impossible de supprimer l'utilisateur.");
      setSavingUser(false);
      setModalDeleteUser(false);
    }
  }

  if (chargementUser) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="spinner" />
        <p className="text-xs font-semibold text-slate-500">Chargement de la fiche utilisateur & des diagnostics...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircleIcon className="w-5 h-5 text-red-600 shrink-0" />
          <span>{erreur || 'Utilisateur introuvable.'}</span>
        </div>
        <Link to="/admin/users">
          <Button variant="secondary" size="sm">
            Retour à l'annuaire
          </Button>
        </Link>
      </div>
    );
  }

  const cvs = user.cvs || [];
  const activeCvInfo = cvs.find((c) => c.id === selectedCvId);
  const analyse = analyseData?.analyse;
  const historique = analyseData?.historiqueAnalyses || [];
  const isAdmin = user.role === 'ROLE_ADMIN' || user.roles?.includes('ROLE_ADMIN');

  return (
    <div className="space-y-6 fade-in pb-12">
      {/* ── Fil d'Ariane & Navigation Retour ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition cursor-pointer"
          >
            ← Retour à l'annuaire
          </Link>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
          <span className="text-xs text-slate-400 font-mono font-bold">
            Compte #{user.id}
          </span>
        </div>

        {/* Actions Rapides Utilisateur */}
        <div className="flex items-center gap-2">
          <Button
            variant={user.actif ? 'outline' : 'primary'}
            size="sm"
            onClick={handleToggleStatutActif}
            loading={actionEnCours}
            disabled={actionEnCours}
            className="text-xs"
          >
            {user.actif ? 'Suspendre l\'accès' : 'Réactiver le compte'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setModalEditUser(true)}
            className="text-xs"
          >
            <KeyIcon className="w-3.5 h-3.5 mr-1" />
            Modifier accès
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setModalDeleteUser(true)}
            className="text-xs"
          >
            Supprimer compte
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {succes && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{succes}</span>
          </div>
          <button onClick={() => setSucces('')} className="text-emerald-700 font-bold hover:underline cursor-pointer">✕</button>
        </div>
      )}

      {erreur && (
        <div className="p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircleIcon className="w-4 h-4 text-red-600 shrink-0" />
            <span>{erreur}</span>
          </div>
          <button onClick={() => setErreur('')} className="text-red-700 font-bold hover:underline cursor-pointer">✕</button>
        </div>
      )}

      {/* ── Cartouche Résumé Utilisateur (KPIs) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Identité */}
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold text-white shrink-0 ${
            isAdmin ? 'bg-purple-600' : 'bg-slate-900'
          }`}>
            {user.email ? user.email.substring(0, 2).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 dark:text-white text-sm truncate" title={user.email}>
                {user.email}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              {isAdmin ? (
                <Badge variant="purple" size="sm">Admin</Badge>
              ) : (
                <Badge variant="neutral" size="sm">Utilisateur</Badge>
              )}
              {user.actif ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Actif
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  Suspendu
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Nombre de CVs */}
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center shrink-0">
            <FileTextIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CVs Déposés</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">
              {cvs.length} document{cvs.length > 1 ? 's' : ''}
            </div>
          </div>
        </Card>

        {/* Score ATS Moyen */}
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center shrink-0">
            <BarChartIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score ATS Moyen</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{user.scoreMoyen !== null ? `${user.scoreMoyen} / 100` : 'N/A'}</span>
              {user.scoreMoyen !== null && (
                <Badge variant={user.scoreMoyen >= 70 ? 'success' : user.scoreMoyen >= 50 ? 'blue' : 'warning'} size="sm">
                  {user.scoreMoyen >= 70 ? 'Optimal' : user.scoreMoyen >= 50 ? 'Moyen' : 'Faible'}
                </Badge>
              )}
            </div>
          </div>
        </Card>

        {/* Date d'inscription */}
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0">
            <ClockIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inscription</span>
            <div className="text-xs font-extrabold text-slate-900 dark:text-white">
              {user.creeLe ? new Date(user.creeLe).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'N/A'}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Section Documents & Diagnostics ATS ── */}
      {cvs.length === 0 ? (
        <Card className="p-12 text-center bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileTextIcon className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
            Aucun CV enregistré
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Cet utilisateur n'a pas encore téléversé de document CV pour analyse sur la plateforme.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Onglets / Sélecteur de CVs si plusieurs documents */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Documents Déposés ({cvs.length})
              </span>
              <span className="text-[11px] text-slate-400">
                Cliquez sur un CV pour afficher son diagnostic ATS complet ci-dessous
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {cvs.map((cv) => {
                const isSelected = cv.id === selectedCvId;
                return (
                  <button
                    key={cv.id}
                    type="button"
                    onClick={() => setSelectedCvId(cv.id)}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 shadow-sm ring-1 ring-blue-500'
                        : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                      }`}>
                        <FileTextIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-blue-900 dark:text-blue-200' : 'text-slate-900 dark:text-white'}`}>
                          {cv.nomOriginal}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {Math.round(cv.taille / 1024)} Ko • {new Date(cv.creeLe).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {cv.note !== null && cv.note !== undefined ? (
                        <Badge variant={cv.note >= 70 ? 'success' : cv.note >= 50 ? 'blue' : 'warning'} size="sm">
                          {cv.note}%
                        </Badge>
                      ) : (
                        <Badge variant={cv.statut === 'EN_COURS' ? 'blue' : 'neutral'} size="sm">
                          {cv.statut === 'EN_COURS' ? 'En cours' : 'En attente'}
                        </Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── PANNEAU DU DIAGNOSTIC ATS COMPLET ── */}
          <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6">
            {chargementAnalyse ? (
              <div className="py-16 text-center space-y-2">
                <div className="spinner mx-auto" />
                <p className="text-xs font-semibold text-slate-500">Chargement de l'audit ATS approfondi...</p>
              </div>
            ) : !analyseData ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Sélectionnez un document pour afficher son rapport.
              </div>
            ) : (
              <>
                {/* En-tête du document & Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center shrink-0">
                      <SparklesIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                          Diagnostic ATS : {analyseData.cv?.nomOriginal}
                        </h2>
                        {analyse?.statut === 'TERMINE' ? (
                          <Badge variant="success" size="sm">Analyse Réussie</Badge>
                        ) : analyse?.statut === 'EN_COURS' ? (
                          <Badge variant="blue" size="sm">Audit en cours</Badge>
                        ) : analyse?.statut === 'ERREUR' ? (
                          <Badge variant="danger" size="sm">Erreur IA</Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">Non Analysé</Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Taille : {Math.round((analyseData.cv?.taille || 0) / 1024)} Ko • Importé le {new Date(analyseData.cv?.creeLe).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleRelancerAnalyse(analyseData.cv?.id)}
                      loading={actionEnCours}
                      disabled={actionEnCours}
                      className="cursor-pointer font-bold"
                    >
                      <SparklesIcon className="w-3.5 h-3.5 mr-1" />
                      Relancer l'Analyse IA
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleTelechargerFichier(analyseData.cv?.id, analyseData.cv?.nomOriginal || "cv.pdf")}
                      className="cursor-pointer"
                    >
                      <DownloadIcon className="w-3.5 h-3.5 mr-1" />
                      Télécharger CV
                    </Button>
                    <button
                      type="button"
                      onClick={() => setModalDeleteCv(analyseData.cv)}
                      className="p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200/60 dark:border-red-900/40 transition cursor-pointer"
                      title="Supprimer ce document"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Score ATS & Indicateurs Visuels */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 dark:from-slate-800/60 dark:via-indigo-950/30 dark:to-slate-800/60 border border-indigo-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Score de conformité ATS
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-4xl font-black text-slate-900 dark:text-white">
                        {analyse?.note !== null && analyse?.note !== undefined ? `${analyse.note}` : '--'}
                      </span>
                      <span className="text-sm font-bold text-slate-400">/ 100</span>
                      {analyse?.note !== null && analyse?.note !== undefined && (
                        <span className="ml-2 font-bold text-xs">
                          {analyse.note >= 80 ? (
                            <span className="text-emerald-600 dark:text-emerald-400">Excellente compatibilité</span>
                          ) : analyse.note >= 60 ? (
                            <span className="text-blue-600 dark:text-blue-400">Bonne compatibilité</span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400">Optimisations requises</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-full sm:w-64 space-y-1.5">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500">
                      <span>Index ATS</span>
                      <span>{analyse?.note || 0}%</span>
                    </div>
                    <div className="w-full bg-white dark:bg-slate-900 rounded-full h-3 p-0.5 border border-slate-200/80 dark:border-slate-700">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          (analyse?.note || 0) >= 70
                            ? 'bg-emerald-500'
                            : (analyse?.note || 0) >= 50
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, analyse?.note || 0)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Offre d'emploi ciblée si spécifiée */}
                {analyse?.texteOffre && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 text-xs">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1.5">
                      <TargetIcon className="w-4 h-4 text-blue-600" />
                      Offre d'emploi ciblée lors de l'audit :
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line">
                      {analyse.texteOffre}
                    </p>
                  </div>
                )}

                {/* Grille 2 Colonnes : Points Forts & Axes d'Amélioration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Points Forts */}
                  <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 space-y-2.5">
                    <h4 className="font-extrabold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                      Points Forts Identifiés
                    </h4>
                    <ul className="space-y-2 text-emerald-800 dark:text-emerald-300 leading-relaxed">
                      {(analyse?.pointsForts || []).map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-500 font-bold shrink-0">✔</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                      {(!analyse?.pointsForts || analyse?.pointsForts.length === 0) && (
                        <li className="text-slate-400">Aucun point fort mentionné par l'IA.</li>
                      )}
                    </ul>
                  </div>

                  {/* Axes d'Amélioration */}
                  <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 space-y-2.5">
                    <h4 className="font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <AlertCircleIcon className="w-4 h-4 text-amber-600" />
                      Axes d'Amélioration & Faiblesses ATS
                    </h4>
                    <ul className="space-y-2 text-amber-800 dark:text-amber-300 leading-relaxed">
                      {(analyse?.pointsFaibles || []).map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-amber-500 font-bold shrink-0">⚠</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                      {(!analyse?.pointsFaibles || analyse?.pointsFaibles.length === 0) && (
                        <li className="text-slate-400">Aucun axe d'amélioration mentionné.</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Compétences Détectées */}
                <div className="space-y-2.5 text-xs">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                    Compétences Détectées dans ce document ({analyse?.competences?.length || 0})
                  </h4>
                  {(!analyse?.competences || analyse?.competences.length === 0) ? (
                    <p className="text-slate-400 text-xs">Aucune compétence extraite.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {analyse.competences.map((comp, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold border border-slate-200/60 dark:border-slate-700/60"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recommandations Opérationnelles de l'IA */}
                <div className="space-y-2.5 text-xs">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                    Recommandations Opérationnelles de l'IA
                  </h4>
                  {(!analyse?.recommandations || analyse?.recommandations.length === 0) ? (
                    <p className="text-slate-400 text-xs">Aucune recommandation générée pour le moment.</p>
                  ) : (
                    <div className="space-y-2">
                      {analyse.recommandations.map((rec, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-2.5"
                        >
                          <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span>{rec}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Historique des audits pour ce document */}
                {historique.length > 1 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                      Historique des audits IA pour ce document ({historique.length})
                    </h4>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200/70 dark:border-slate-800 rounded-xl overflow-hidden">
                      {historique.map((h, i) => (
                        <div key={h.id} className="p-2.5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                          <span className="font-mono text-slate-400 text-[11px]">Audit #{h.id}</span>
                          <span className="text-slate-500">{new Date(h.creeLe).toLocaleString('fr-FR')}</span>
                          <Badge variant={h.statut === 'TERMINE' ? 'success' : 'neutral'} size="sm">
                            {h.note !== null ? `Score ${h.note}/100` : h.statut}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      )}

      {/* ── Modal Modifier Accès / Mot de Passe ── */}
      {modalEditUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5 fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Modifier les accès de l'utilisateur
              </h3>
              <button
                type="button"
                onClick={() => setModalEditUser(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleModifierUserSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Adresse Email
                </label>
                <input
                  type="text"
                  disabled
                  value={user.email}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Rôle de l'utilisateur
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="ROLE_USER">Utilisateur Standard (ROLE_USER)</option>
                  <option value="ROLE_ADMIN">Administrateur (ROLE_ADMIN)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Statut du Compte
                </label>
                <select
                  value={editActif ? '1' : '0'}
                  onChange={(e) => setEditActif(e.target.value === '1')}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="1">Compte Actif (accès autorisé)</option>
                  <option value="0">Compte Suspendu (soft ban)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nouveau mot de passe (optionnel)
                </label>
                <input
                  type="password"
                  placeholder="Laisser vide pour ne pas changer"
                  value={editMdp}
                  onChange={(e) => setEditMdp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button variant="secondary" size="sm" type="button" onClick={() => setModalEditUser(false)}>
                  Annuler
                </Button>
                <Button variant="primary" size="sm" type="submit" loading={savingUser} disabled={savingUser}>
                  Enregistrer les modifications
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal Confirmation Suppression Utilisateur ── */}
      {modalDeleteUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full p-6 space-y-4 fade-in">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircleIcon className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Supprimer cet utilisateur ?
              </h3>
              <p className="text-xs text-slate-500">
                Attention : Cette action est irréversible. Le compte <strong>{user.email}</strong> ainsi que tous ses CV et analyses seront définitivement supprimés.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => setModalDeleteUser(false)}
                disabled={savingUser}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                loading={savingUser}
                disabled={savingUser}
                onClick={handleConfirmerSuppressionUser}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Confirmation Suppression CV ── */}
      {modalDeleteCv && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full p-6 space-y-4 fade-in">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircleIcon className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Supprimer ce document ?
              </h3>
              <p className="text-xs text-slate-500">
                Êtes-vous sûr de vouloir supprimer définitivement le document <strong>{modalDeleteCv.nomOriginal}</strong> et son rapport ATS associé ?
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => setModalDeleteCv(null)}
                disabled={actionEnCours}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                size="sm"
                className="flex-1"
                loading={actionEnCours}
                disabled={actionEnCours}
                onClick={handleConfirmerSupprimerCv}
              >
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
