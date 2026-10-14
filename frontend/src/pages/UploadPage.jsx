import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../contexts/useAuth';
import FileDropzone from '../components/FileDropzone';
import TurnstileWidget from '../components/upload/TurnstileWidget';
import TeaserResult from '../components/upload/TeaserResult';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  CheckCircleIcon,
  SparklesIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  TargetIcon,
} from '../components/ui/Icons';

export default function UploadPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fichier, setFichier] = useState(null);
  const [texteOffre, setTexteOffre] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [reponseCv, setReponseCv] = useState(null);

  async function handleEnvoyer(e) {
    e.preventDefault();
    if (!fichier) {
      setErreur('Veuillez sélectionner un fichier avant de lancer l\'analyse.');
      return;
    }

    setChargement(true);
    setErreur('');

    const formData = new FormData();
    formData.append('cv', fichier);
    if (texteOffre.trim()) {
      formData.append('texteOffre', texteOffre.trim());
    }
    if (turnstileToken) {
      formData.append('cf-turnstile-response', turnstileToken);
    }

    try {
      const res = await client.post('/api/cv', formData, {
        headers: {
          'cf-turnstile-response': turnstileToken || '',
        },
      });

      setReponseCv(res.data);

      // Si l'utilisateur est déjà connecté et qu'une analyse a été lancée directement
      if (res.data?.analyseId && user) {
        navigate(`/cv/${res.data.analyseId}/analyse`);
      }
    } catch (err) {
      const msg =
        err.response?.data?.erreur ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Une erreur est survenue lors du téléversement du fichier.';
      setErreur(msg);
    } finally {
      setChargement(false);
    }
  }

  // Contenu principal de la page
  const pageContent = (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 fade-in">
      {/* ── Si un Teaser a été généré pour le visiteur anonyme ── */}
      {reponseCv && reponseCv.teaser ? (
        <TeaserResult
          data={reponseCv}
          onRecommencer={() => {
            setReponseCv(null);
            setFichier(null);
            setTexteOffre('');
            setTurnstileToken('');
          }}
        />
      ) : reponseCv && reponseCv.rattacheAuCompte ? (
        <Card className="p-6 sm:p-8 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xl space-y-6 fade-in">
          <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">CV téléversé avec succès</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {reponseCv.nombreCaracteres} caractères
                </span>{' '}
                extraits depuis <span className="font-medium text-slate-700 dark:text-slate-300">{reponseCv.nomOriginal}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            {reponseCv.analyseId ? (
              <Button
                onClick={() => navigate(`/cv/${reponseCv.analyseId}/analyse`)}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto flex-1 shadow-md"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>Consulter l'audit en direct</span>
              </Button>
            ) : (
              <Button
                onClick={() => navigate(`/cv/${reponseCv.id}/analyse`)}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto flex-1 shadow-md"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>Lancer l'audit avec l'IA</span>
              </Button>
            )}
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full">
                Voir mon Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
              <SparklesIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Audit ATS Instantané {user ? '' : '• Sans inscription préalable'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Testez votre CV face aux algorithmes ATS
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
              Importez votre CV (PDF ou Word ≤ 5 Mo). Obtenez un diagnostic préliminaire immédiat de vos chances de recrutement.
            </p>
          </div>

          {erreur && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              <span className="font-medium">{erreur}</span>
            </div>
          )}

          <Card className="p-6 sm:p-8 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xl space-y-6">
            <form onSubmit={handleEnvoyer} className="space-y-6">
              {/* 1. Zone de dépôt du fichier CV */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  1. Votre document CV (PDF ou DOCX, max 5 Mo)
                </label>
                <FileDropzone onFichierSelectionne={setFichier} disabled={chargement} />
              </div>

              {/* 2. Offre d'emploi ciblée facultative */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="texteOffre"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
                  >
                    <TargetIcon className="w-4 h-4 text-slate-400" />
                    <span>2. Offre d'emploi ciblée</span>
                  </label>
                  <span className="text-[11px] font-semibold text-slate-400">Facultatif</span>
                </div>
                <textarea
                  id="texteOffre"
                  rows={3}
                  value={texteOffre}
                  onChange={(e) => setTexteOffre(e.target.value)}
                  disabled={chargement}
                  placeholder="Collez ici l'intitulé ou le texte de l'offre d'emploi visée pour vérifier la pertinence de vos mots-clés..."
                  className="w-full text-xs p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all resize-y"
                />
              </div>

              {/* 3. Sécurité Turnstile (uniquement pour les visiteurs non authentifiés) */}
              {!user && (
                <div>
                  <TurnstileWidget onVerify={setTurnstileToken} />
                </div>
              )}

              {/* Barre de progression pendant l'envoi */}
              {chargement && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <span>Analyse préliminaire en cours...</span>
                    <span className="font-mono text-slate-400">Traitement</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-indeterminate" />
                  </div>
                </div>
              )}

              {/* 4. Boutons d'action */}
              <div className="flex items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link to={user ? '/dashboard' : '/'}>
                  <Button variant="ghost" size="md">
                    Annuler
                  </Button>
                </Link>

                <Button
                  type="submit"
                  disabled={!fichier || chargement}
                  loading={chargement}
                  variant="primary"
                  size="md"
                  className="px-6 py-2.5 font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <SparklesIcon className="w-4 h-4 mr-1.5" />
                  <span>{user ? 'Analyser mon CV' : 'Générer mon Teaser ATS'}</span>
                  <ArrowRightIcon className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );

  // Si l'utilisateur est connecté, on intègre la Sidebar et le Header via AppLayout
  if (user) {
    return <AppLayout>{pageContent}</AppLayout>;
  }

  // Si visiteur anonyme, affichage plein écran public élégant
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F9FAFB] dark:bg-[#0B0F19] transition-colors duration-200">
      {pageContent}
    </div>
  );
}