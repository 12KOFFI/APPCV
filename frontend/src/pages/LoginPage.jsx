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
  HelpCircleIcon,
} from '../components/ui/Icons';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [showMotDePasse, setShowMotDePasse] = useState(false);
  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErreur('');

    try {
      await login(email, motDePasse);

      // Rattachement automatique du CV téléversé avant connexion
      try {
        const claimRes = await client.post('/api/cv/rattacher');
        if (claimRes.data?.succes) {
          navigate('/dashboard', {
            state: {
              cvRattache: true,
              cvId: claimRes.data.cvId,
              nomCv: claimRes.data.nomOriginal,
            },
          });
          return;
        }
      } catch {
        // Aucun CV en attente ou déjà rattaché
      }

      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 401 || err.response?.data?.message === 'Invalid credentials.') {
        setErreur('Adresse email ou mot de passe incorrect.');
      } else if (!err.response) {
        setErreur('Impossible de contacter le serveur. Veuillez vérifier votre connexion.');
      } else {
        setErreur(err.response?.data?.message || 'Une erreur est survenue lors de la connexion.');
      }
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
        <div className="w-full max-w-md mx-auto my-auto py-8">
          {/* Titre */}
          <h1 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight text-left">
            Bon retour parmi nous !
          </h1>

          {/* Bannière d'erreur */}
          {erreur && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 mb-6 text-xs flex items-center gap-2.5 text-left">
              <AlertCircleIcon className="w-4 h-4 text-red-600 shrink-0" />
              <span>{erreur}</span>
            </div>
          )}

          {/* Formulaire LoopCV Style */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Champ Email */}
            <div className="space-y-1.5 text-left">
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
                className="w-full text-sm text-slate-900 bg-[#F3F4F6] border border-slate-200/90 rounded-lg px-3.5 py-3 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Champ Mot de passe */}
            <div className="space-y-1.5 text-left">
              <div className="flex items-center justify-between">
                <label htmlFor="motDePasse" className="block text-xs font-semibold text-slate-700">
                  Mot de passe <span className="text-blue-500">*</span>
                </label>
                <span className="text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                  Mot de passe oublié ?
                </span>
              </div>
              <div className="relative">
                <input
                  id="motDePasse"
                  type={showMotDePasse ? 'text' : 'password'}
                  required
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  placeholder="Saisissez votre mot de passe"
                  className="w-full text-sm text-slate-900 bg-[#F3F4F6] border border-slate-200/90 rounded-lg pl-3.5 pr-10 py-3 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowMotDePasse(!showMotDePasse)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors p-1"
                  title={showMotDePasse ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showMotDePasse ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Bouton de connexion */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-full bg-[#0B132B] hover:bg-slate-800 text-white font-semibold text-sm transition-all duration-150 shadow-sm cursor-pointer disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {loading && <div className="spinner-sm" />}
                <span>Se connecter</span>
              </button>
            </div>
          </form>

          {/* Lien vers inscription */}
          <div className="text-left mt-6">
            <p className="text-xs text-slate-600">
              Pas encore inscrit ?{' '}
              <Link to="/register" className="text-blue-600 font-semibold hover:underline">
                Créer un compte.
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