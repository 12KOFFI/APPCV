import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../contexts/useAuth';
import FileDropzone from '../components/FileDropzone';
import TurnstileWidget from '../components/upload/TurnstileWidget';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import {
  CheckCircleIcon,
  SparklesIcon,
  AlertCircleIcon,
  ArrowRightIcon,
  FileTextIcon,
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

      // Si l'utilisateur est déjà connecté, redirection directe vers le dashboard ou l'analyse
      if (user && res.data?.id) {
        navigate('/dashboard', {
          state: {
            cvRattache: true,
            cvId: res.data.id,
            nomCv: res.data.nomOriginal,
          },
        });
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
      {/* ── 1. Écran de transition : CV enregistré, authentification requise ── */}
      {reponseCv && reponseCv.enAttenteAuthentification ? (
        <Card className="p-6 sm:p-8 bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-xl space-y-6 fade-in text-left">
          {/* En-tête */}
          <div className="flex items-start gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-sm">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Votre document est prêt pour l'audit IA !
                </h2>
                <Badge variant="blue" size="sm">Prêt pour l'IA</Badge>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Votre CV a été extrait et conservé en toute sécurité. Pour lancer l'analyse par intelligence artificielle et accéder à votre tableau de bord, connectez-vous ou créez votre compte gratuit.
              </p>
            </div>
          </div>

          {/* Récapitulatif du document préservé */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <FileTextIcon className="w-4 h-4 text-slate-400" />
                <span>{reponseCv.nomOriginal}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {Math.round((reponseCv.taille || 0) / 1024)} Ko
              </span>
            </div>
            {texteOffre.trim() && (
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-1.5 border-t border-slate-200/40 dark:border-slate-700/40">
                <TargetIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">Description de l'offre cible conservée</span>
              </div>
            )}
          </div>

          {/* Engagement de préservation : aucun ré-import requis */}
          <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold">Document préservé :</span> Vous n'aurez pas besoin de téléverser votre CV une seconde fois. Il sera automatiquement lié à votre profil dès votre authentification.
            </div>
          </div>

          {/* Choix d'authentification : 2 options claires */}
          <div className="space-y-4 pt-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center">
              Authentification requise pour démarrer l'analyse
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Link to="/register" className="block w-full">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center text-sm py-3.5 shadow-md font-bold"
                >
                  <SparklesIcon className="w-4 h-4 mr-1.5" />
                  <span>Créer un compte gratuit</span>
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </Button>
              </Link>

              <Link to="/login" className="block w-full">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full justify-center text-sm py-3.5 border-slate-300 dark:border-slate-700 font-bold"
                >
                  <span>J'ai déjà un compte : Me connecter</span>
                </Button>
              </Link>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setReponseCv(null);
                  setFichier(null);
                  setTexteOffre('');
                  setTurnstileToken('');
                }}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline transition-colors cursor-pointer"
              >
                Changer de document
              </button>
            </div>
          </div>
        </Card>
      ) : (
        /* ── 2. Formulaire d'upload initial ── */
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
              <SparklesIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Audit de CV par Intelligence Artificielle</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Optimisez votre CV face aux recruteurs et ATS
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-lg mx-auto">
              Importez votre CV (PDF ou Word ≤ 5 Mo). L'analyse approfondie par IA détecte les lacunes, les compétences clés et les axes d'amélioration.
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
                  placeholder="Collez ici l'intitulé ou le texte de l'offre visée pour vérifier la pertinence de vos mots-clés..."
                  className="w-full text-xs p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all resize-y"
                />
              </div>

              {/* 3. Sécurité Turnstile (visiteurs non authentifiés) */}
              {!user && (
                <div>
                  <TurnstileWidget onVerify={setTurnstileToken} />
                </div>
              )}

              {/* Barre de progression pendant l'envoi */}
              {chargement && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <span>Enregistrement sécurisé du document...</span>
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
                  <span>Analyser par IA</span>
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