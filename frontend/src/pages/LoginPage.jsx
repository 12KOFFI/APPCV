import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();       // Récupère la fonction login depuis le contexte
  const navigate = useNavigate();    // Pour rediriger après la connexion

  async function handleSubmit(e) {
    e.preventDefault();              // Empêche le rechargement de la page
    setLoading(true);
    setErreur('');

    try {
      await login(email, motDePasse);  // Appelle POST /api/connexion
      navigate('/dashboard');           // Succès → va au dashboard
    } catch (err) {
      // Lexik renvoie : { "code": 401, "message": "Invalid credentials." }
      setErreur(err.response?.data?.message || 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 fade-in">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8">
        {/* Titre */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Connexion</h1>
          <p className="text-slate-400 mt-2">Accédez à votre espace d'analyse CV</p>
        </div>

        {/* Message d'erreur */}
        {erreur && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-6 text-sm">
            ❌ {erreur}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input
              id="email" type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <label htmlFor="motDePasse" className="block text-sm font-medium text-slate-300 mb-1.5">Mot de passe</label>
            <input
              id="motDePasse" type="password" required
              value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        {/* Lien vers inscription */}
        <p className="text-center text-slate-400 mt-6 text-sm">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}