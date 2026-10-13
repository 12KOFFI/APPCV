import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmMotDePasse, setConfirmMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErreur('');
    setSucces('');

    // ── Validation côté client (UX, pas sécurité) ──
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
      await register(email, motDePasse);  // POST /api/inscription
      setSucces('Compte créé avec succès ! Redirection...');
      setTimeout(() => navigate('/login'), 1500);  // Redirige après 1.5s
    } catch (err) {
      const data = err.response?.data;
      // Le backend renvoie "erreur" pour 409, ou "detail" pour les erreurs de validation
      setErreur(data?.erreur || data?.detail || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 fade-in">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Créer un compte</h1>
          <p className="text-slate-400 mt-2">Rejoignez l'analyseur de CV intelligent</p>
        </div>

        {erreur && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 mb-6 text-sm">
            ❌ {erreur}
          </div>
        )}
        {succes && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg p-3 mb-6 text-sm">
            ✅ {succes}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
          </div>
          <div>
            <label htmlFor="mdp" className="block text-sm font-medium text-slate-300 mb-1.5">Mot de passe</label>
            <input id="mdp" type="password" required value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="Minimum 8 caractères"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-slate-300 mb-1.5">Confirmer le mot de passe</label>
            <input id="confirm" type="password" required value={confirmMotDePasse} onChange={(e) => setConfirmMotDePasse(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition">
            {loading ? 'Création...' : "S'inscrire"}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-6 text-sm">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}