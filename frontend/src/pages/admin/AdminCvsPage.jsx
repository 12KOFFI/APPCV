import { useState, useEffect } from 'react';
import client from '../../api/client';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import {
  FileTextIcon,
  SearchIcon,
  DownloadIcon,
  SparklesIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  TargetIcon,
} from '../../components/ui/Icons';

export default function AdminCvsPage() {
  const [cvs, setCvs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');

  // Modals state
  const [modalAnalyse, setModalAnalyse] = useState(null); // { cv, analyse, historique, chargement }
  const [modalSuppression, setModalSuppression] = useState(null); // cv to delete
  const [actionEnCours, setActionEnCours] = useState(false);

  async function chargerCvs() {
    setChargement(true);
    setErreur('');
    try {
      const res = await client.get('/api/admin/cvs', {
        params: {
          recherche: recherche.trim(),
          page,
          limit: 15,
        },
      });
      setCvs(res.data.donnees || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors du chargement des documents.');
    } finally {
      setChargement(false);
    }
  }

  useEffect(() => {
    chargerCvs();
  }, [page]);

  function handleRechercheSubmit(e) {
    e.preventDefault();
    setPage(1);
    chargerCvs();
  }

  async function ouvrirDetailAnalyse(cvId) {
    setModalAnalyse({ chargement: true });
    try {
      const res = await client.get(`/api/admin/cvs/${cvId}/analyse`);
      setModalAnalyse({
        cv: res.data.cv,
        analyse: res.data.analyse,
        historique: res.data.historiqueAnalyses || [],
        chargement: false,
      });
    } catch (err) {
      setModalAnalyse(null);
      setErreur(err.response?.data?.erreur || 'Impossible de charger l\'analyse IA.');
    }
  }

  // P1: Relance de l'analyse IA
  async function handleRelancerAnalyse(cvId) {
    setActionEnCours(true);
    setErreur('');
    try {
      const res = await client.post(`/api/admin/cvs/${cvId}/reanalyse`);
      setSucces(res.data.message || 'Analyse relancée avec succès.');
      if (modalAnalyse && modalAnalyse.cv?.id === cvId) {
        await ouvrirDetailAnalyse(cvId);
      }
      chargerCvs();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Impossible de relancer l\'analyse.');
    } finally {
      setActionEnCours(false);
    }
  }

  async function handleSupprimerCv() {
    if (!modalSuppression) return;
    setActionEnCours(true);
    setErreur('');
    try {
      await client.delete(`/api/admin/cvs/${modalSuppression.id}`);
      setSucces(`CV #${modalSuppression.id} supprimé avec succès.`);
      setModalSuppression(null);
      chargerCvs();
    } catch (err) {
      setErreur(err.response?.data?.erreur || 'Erreur lors de la suppression.');
    } finally {
      setActionEnCours(false);
    }
  }

  function handleTelechargerFichier(cvId) {
    const token = localStorage.getItem('token');
    window.open(`${client.defaults.baseURL || ''}/api/admin/cvs/${cvId}/telecharger?token=${token}`, '_blank');
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
            Surveillance des CV & Analyses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {total} document(s) enregistré(s). Visualisez les scores ATS, consultez les diagnostics IA et relancez les audits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" onClick={handleExportCvs} className="cursor-pointer">
            <DownloadIcon className="w-3.5 h-3.5 mr-1" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {succes && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{succes}</span>
          </div>
          <button onClick={() => setSucces('')} className="text-emerald-700 font-bold hover:underline cursor-pointer">×</button>
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

      {/* ── Barre de Recherche ── */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800">
        <form onSubmit={handleRechercheSubmit} className="flex items-center gap-3">
          <div className="relative flex-1">
            <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom de document ou email du candidat..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Rechercher
          </Button>
        </form>
      </Card>

      {/* ── Table des CVs ── */}
      <Card className="overflow-hidden bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 font-bold">Document</th>
                <th className="py-3.5 px-4 font-bold">Candidat</th>
                <th className="py-3.5 px-4 font-bold">Score ATS</th>
                <th className="py-3.5 px-4 font-bold">Statut IA</th>
                <th className="py-3.5 px-4 font-bold">Date Import</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {chargement ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="spinner mx-auto mb-2" />
                    Chargement des CV...
                  </td>
                </tr>
              ) : cvs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Aucun CV trouvé.
                  </td>
                </tr>
              ) : (
                cvs.map((cv) => {
                  const derniere = cv.derniereAnalyse;
                  const note = derniere?.note;

                  return (
                    <tr key={cv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                            <FileTextIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block max-w-[200px] truncate" title={cv.nomOriginal}>
                              {cv.nomOriginal}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {Math.round(cv.taille / 1024)} Ko • #{cv.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {cv.proprietaire ? (
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {cv.proprietaire.email}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200/60">
                            Visiteur Anonyme
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {note !== null && note !== undefined ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-extrabold text-[11px] ${
                            note >= 80 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            note >= 60 ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {note} / 100
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">N/A</span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {derniere?.statut === 'TERMINE' ? (
                          <Badge variant="success" size="sm">Terminé</Badge>
                        ) : derniere?.statut === 'EN_COURS' ? (
                          <Badge variant="blue" size="sm">En cours</Badge>
                        ) : derniere?.statut === 'ERREUR' ? (
                          <Badge variant="danger" size="sm">Erreur</Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">En attente</Badge>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-500">
                        {new Date(cv.creeLe).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => ouvrirDetailAnalyse(cv.id)}
                            className="px-2.5 py-1 rounded-md text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 transition cursor-pointer"
                            title="Consulter l'audit IA"
                          >
                            Analyse
                          </button>
                          <button
                            type="button"
                            onClick={() => handleTelechargerFichier(cv.id)}
                            className="px-2 py-1 rounded-md text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 transition cursor-pointer"
                            title="Télécharger l'original"
                          >
                            <DownloadIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRelancerAnalyse(cv.id)}
                            className="px-2 py-1 rounded-md text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 transition cursor-pointer"
                            title="Relancer l'analyse IA"
                          >
                            <SparklesIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setModalSuppression(cv)}
                            className="px-2 py-1 rounded-md text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950/60 transition cursor-pointer"
                            title="Supprimer"
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page} sur {totalPages} ({total} documents)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                Précédent
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Suivant
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Modal Consultation Analyse IA Complète ── */}
      {modalAnalyse && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full p-6 space-y-6 fade-in max-h-[90vh] overflow-y-auto">
            {modalAnalyse.chargement ? (
              <div className="py-16 text-center">
                <div className="spinner mx-auto mb-3" />
                <p className="text-xs font-semibold text-slate-500">Chargement de l'audit complet...</p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center shrink-0">
                      <SparklesIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        Diagnostic ATS : {modalAnalyse.cv?.nomOriginal}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Candidat : {modalAnalyse.cv?.proprietaire?.email || 'Visiteur Anonyme'} • Importé le {new Date(modalAnalyse.cv?.creeLe).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalAnalyse(null)}
                    className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer"
                  >
                    ×
                  </button>
                </div>

                {/* Score ATS & Jauge */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-purple-50/70 border border-indigo-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Score de conformité ATS
                    </span>
                    <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {modalAnalyse.analyse?.note !== null && modalAnalyse.analyse?.note !== undefined
                        ? `${modalAnalyse.analyse.note} / 100`
                        : 'Non évalué'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRelancerAnalyse(modalAnalyse.cv?.id)}
                      loading={actionEnCours}
                      disabled={actionEnCours}
                    >
                      <SparklesIcon className="w-3.5 h-3.5 mr-1 text-purple-600" />
                      Relancer l'Analyse IA
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTelechargerFichier(modalAnalyse.cv?.id)}
                    >
                      <DownloadIcon className="w-3.5 h-3.5 mr-1" />
                      Fichier original
                    </Button>
                  </div>
                </div>

                {modalAnalyse.analyse?.texteOffre && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1">
                      <TargetIcon className="w-4 h-4 text-blue-600" />
                      Offre d'emploi ciblée :
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 line-clamp-3">
                      {modalAnalyse.analyse.texteOffre}
                    </p>
                  </div>
                )}

                {/* Points Forts & Points Faibles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 space-y-2">
                    <h4 className="font-extrabold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                      Points Forts Identifiés
                    </h4>
                    <ul className="space-y-1.5 text-emerald-800 dark:text-emerald-400">
                      {(modalAnalyse.analyse?.pointsForts || []).map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                      {(!modalAnalyse.analyse?.pointsForts || modalAnalyse.analyse?.pointsForts.length === 0) && (
                        <li className="text-slate-400">Aucun point fort mentionné.</li>
                      )}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 space-y-2">
                    <h4 className="font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <AlertCircleIcon className="w-4 h-4 text-amber-600" />
                      Axes d'Amélioration
                    </h4>
                    <ul className="space-y-1.5 text-amber-800 dark:text-amber-400">
                      {(modalAnalyse.analyse?.pointsFaibles || []).map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                      {(!modalAnalyse.analyse?.pointsFaibles || modalAnalyse.analyse?.pointsFaibles.length === 0) && (
                        <li className="text-slate-400">Aucun axe mentionné.</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Compétences Détectées */}
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Compétences Détectées dans ce document
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(modalAnalyse.analyse?.competences || []).map((comp, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommandations de l'IA */}
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                    Recommandations Opérationnelles de l'IA
                  </h4>
                  <div className="space-y-2">
                    {(modalAnalyse.analyse?.recommandations || []).map((rec, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300"
                      >
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="secondary" size="sm" onClick={() => setModalAnalyse(null)}>
                    Fermer
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Modal Suppression de CV ── */}
      {modalSuppression && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full p-6 space-y-4 fade-in">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircleIcon className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Supprimer ce document ?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Voulez-vous supprimer <strong>{modalSuppression.nomOriginal}</strong> ? Le fichier physique ainsi que toutes les analyses IA associées seront définitivement effacés.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setModalSuppression(null)}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                size="sm"
                loading={actionEnCours}
                disabled={actionEnCours}
                onClick={handleSupprimerCv}
              >
                Confirmer la suppression
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
