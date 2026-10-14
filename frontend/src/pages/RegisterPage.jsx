import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../contexts/useAuth';
import AuthIllustration from '../components/auth/AuthIllustration';
import {
  FileTextIcon,
  EyeIcon,
  EyeOffIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  HelpCircleIcon,
} from '../components/ui/Icons';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmMotDePasse, setConfirmMotDePasse] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showMotDePasse, setShowMotDePasse] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setSucces('');

    if (motDePasse.length < 8) {
      setErreur('Le mot de passe doit faire au moins 8 caractères.');
      return;
    }
    if (motDePasse !== confirmMotDePasse) {
      setErreur('Les mots de passe ne correspondent pas.');
      return;
    }
    if (!agreeTerms) {
      setErreur("Veuillez accepter les conditions d'utilisation pour continuer.");
      return;
    }

    setLoading(true);

    try {
      await register(email, motDePasse);
      // Connexion automatique immédiate pour récupérer le JWT
      try {
        await login(email, motDePasse);
        // Tentative de rattachement automatique du CV téléversé anonymement
        try {
          const claimRes = await client.post('/api/cv/rattacher');
          if (claimRes.data?.analyseId) {
            navigate(`/cv/${claimRes.data.analyseId}/analyse`);
            return;
          }
        } catch {
          // Aucun CV anonyme en attente
        }
        navigate('/dashboard');
        return;
      } catch {
        setSucces('Compte créé avec succès ! Redirection vers la connexion...');
        setTimeout(() => navigate('/login'), 1000);
      }
    } catch (err) {
      const data = err.response?.data;
      setErreur(data?.erreur || data?.detail || data?.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#F9FAFB] fade-in">
      {/* ── Colonne Gauche : Formulaire ── */}
      <div className="flex flex-col justify-between px-6 py-8 sm:px-12 lg:px-16 xl:px-24 min-h-screen">
        {/* Logo APPCV et Bouton retour vers l'accueil */}
        <div className="pt-2 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-slate-800 transition-colors">
              <FileTextIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-slate-900 text-xl tracking-tight">APPCV</span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-2xs"
            title="Retourner à la page d'accueil"
          >
            <span>← Retour à l'accueil</span>
          </Link>
        </div>

        {/* Corps central du formulaire */}
        <div className="w-full max-w-md mx-auto my-auto py-6">
          {/* Titre & Sous-titre */}
          <div className="mb-6 text-left">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Bienvenue
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Créez votre compte pour commencer vos analyses de CV
            </p>
          </div>

          {/* Bannières d'alerte */}
          {erreur && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 mb-5 text-xs flex items-center gap-2.5 text-left">
              <AlertCircleIcon className="w-4 h-4 text-red-600 shrink-0" />
              <span>{erreur}</span>
            </div>
          )}

          {succes && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 mb-5 text-xs flex items-center gap-2.5 text-left">
              <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{succes}</span>
            </div>
          )}

          {/* Formulaire LoopCV Style */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Champ Email */}
            <div className="space-y-1 text-left">
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
                Adresse e-mail <span className="text-blue-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                className="w-full text-sm text-slate-900 bg-[#F3F4F6] border border-slate-200/90 rounded-lg px-3.5 py-2.5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Rangée 2 colonnes : Mot de passe & Confirmation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="space-y-1">
                <label htmlFor="motDePasse" className="block text-xs font-semibold text-slate-700">
                  Mot de passe <span className="text-blue-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="motDePasse"
                    type={showMotDePasse ? 'text' : 'password'}
                    required
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    placeholder="Minimum 8 caractères"
                    className="w-full text-sm text-slate-900 bg-[#F3F4F6] border border-slate-200/90 rounded-lg pl-3 pr-8 py-2.5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMotDePasse(!showMotDePasse)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    title={showMotDePasse ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showMotDePasse ? <EyeOffIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="confirmMotDePasse" className="block text-xs font-semibold text-slate-700">
                  Confirmer le mot de passe <span className="text-blue-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmMotDePasse"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmMotDePasse}
                    onChange={(e) => setConfirmMotDePasse(e.target.value)}
                    placeholder="Retapez le mot de passe"
                    className="w-full text-sm text-slate-900 bg-[#F3F4F6] border border-slate-200/90 rounded-lg pl-3 pr-8 py-2.5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    title={showConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showConfirm ? <EyeOffIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Checkbox Conditions d'utilisation */}
            <div className="pt-1 text-left flex items-start gap-2">
              <input
                id="agreeTerms"
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="agreeTerms" className="text-xs text-slate-600 leading-tight cursor-pointer">
                J'accepte les{' '}
                <span className="text-blue-600 font-semibold hover:underline">Conditions d'utilisation</span>{' '}
                et la{' '}
                <span className="text-blue-600 font-semibold hover:underline">Politique de confidentialité</span>{' '}
                <span className="text-blue-500">*</span>
              </label>
            </div>

            {/* Bouton Créer un compte */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-full bg-[#0B132B] hover:bg-slate-800 text-white font-semibold text-sm transition-all duration-150 shadow-sm cursor-pointer disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {loading && <div className="spinner-sm" />}
                <span>Créer mon compte</span>
              </button>
            </div>
          </form>

          {/* Lien vers connexion */}
          <div className="text-left mt-6">
            <p className="text-xs text-slate-600">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Espace bas pour équilibrer la mise en page */}
        <div className="h-4" />
      </div>

      {/* ── Colonne Droite : Bannière Bleue LoopCV avec Illustration ── */}
      <div className="hidden lg:flex flex-col justify-center items-center relative bg-[#3B82F6] min-h-screen px-12 overflow-hidden select-none">
        <AuthIllustration className="w-full max-w-lg" />

        {/* Bouton d'aide flottant en bas à droite */}
        <div className="absolute bottom-6 right-6">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0E3D69] text-white text-xs font-semibold shadow-md hover:bg-[#0B3154] transition-colors cursor-pointer"
          >
            <HelpCircleIcon className="w-3.5 h-3.5 text-white" />
            <span>Aide</span>
          </button>
        </div>
      </div>
    </div>
  );
}