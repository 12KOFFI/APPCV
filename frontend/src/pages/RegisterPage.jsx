import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import {
  FileTextIcon,
  MailIcon,
  LockIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
} from '../components/ui/Icons';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmMotDePasse, setConfirmMotDePasse] = useState('');
  const [showMotDePasse, setShowMotDePasse] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
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

    setLoading(true);

    try {
      await register(email, motDePasse);
      setSucces('Compte créé avec succès ! Redirection vers la connexion...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const data = err.response?.data;
      setErreur(data?.erreur || data?.detail || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12 bg-slate-50 fade-in">
      <Card className="w-full max-w-md p-8 sm:p-10 shadow-xl bg-white border-slate-200/90">
        {/* Logo & Titre */}
        <div className="text-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-slate-900 flex items-center justify-center text-white mx-auto mb-4 shadow-xs">
            <FileTextIcon className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Créer votre compte
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1.5">
            Optimisez vos CV dès aujourd'hui sans carte de crédit
          </p>
        </div>

        {/* Message d'erreur */}
        {erreur && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3.5 mb-6 text-xs flex items-center gap-2.5">
            <AlertCircleIcon className="w-4 h-4 text-red-600 shrink-0" />
            <span>{erreur}</span>
          </div>
        )}

        {/* Message de succès */}
        {succes && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3.5 mb-6 text-xs flex items-center gap-2.5">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{succes}</span>
          </div>
        )}

        {/* Formulaire accessible */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            type="email"
            label="Adresse email professionnelle"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nom@exemple.com"
            icon={<MailIcon className="w-4 h-4" />}
          />

          <Input
            id="motDePasse"
            type={showMotDePasse ? 'text' : 'password'}
            label="Mot de passe"
            required
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            placeholder="Minimum 8 caractères"
            helperText="8 caractères minimum recommandés."
            icon={<LockIcon className="w-4 h-4" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowMotDePasse(!showMotDePasse)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                title={showMotDePasse ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showMotDePasse ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            }
          />

          <Input
            id="confirmMotDePasse"
            type={showConfirm ? 'text' : 'password'}
            label="Confirmation du mot de passe"
            required
            value={confirmMotDePasse}
            onChange={(e) => setConfirmMotDePasse(e.target.value)}
            placeholder="••••••••"
            icon={<LockIcon className="w-4 h-4" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                title={showConfirm ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showConfirm ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            }
          />

          <div className="pt-2">
            <Button
              type="submit"
              disabled={loading}
              loading={loading}
              variant="primary"
              size="lg"
              className="w-full shadow-md"
            >
              <span>Créer mon compte</span>
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </form>

        {/* Pied de formulaire */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="text-slate-900 font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}