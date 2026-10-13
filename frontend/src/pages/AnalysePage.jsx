import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import AnalysePolling from '../components/AnalysePolling';
import AnalyseResult from '../components/AnalyseResult';

export default function AnalysePage() {
  const { id } = useParams();
  const [texteOffre, setTexteOffre] = useState('');
  const [etape, setEtape] = useState('formulaire'); // 'formulaire' | 'chargement' | 'resultat'
  const [analyseId, setAnalyseId] = useState(null);
  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState('');
  const [chargementLancement, setChargementLancement] = useState(false);

  async function handleLancerAnalyse(e) {
    e.preventDefault();
    setErreur('');
    setChargementLancement(true);

    try {
      const payload = texteOffre.trim() ? { texteOffre: texteOffre.trim() } : {};
      const res = await client.post(`/api/cv/${id}/analyse`, payload);
      setAnalyseId(res.data.analyseId);
      setEtape('chargement');
    } catch (err) {
      setErreur(err.response?.data?.erreur || "Impossible d'initier l'analyse.");
    } finally {
      setChargementLancement(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 fade-in">
      <div className="mb-8">
        <Link to="/dashboard" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1 mb-3">
          ← Retour au Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Analyse de profil par IA</h1>
        <p className="text-slate-400 text-sm mt-1">
          Évaluez la pertinence de votre CV et obtenez des conseils sur-mesure pour maximiser votre impact.
        </p>
      </div>

      {erreur && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          ❌ {erreur}
        </div>
      )}

      {etape === 'formulaire' && (
        <form onSubmit={handleLancerAnalyse} className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div>
            <label htmlFor="offre" className="block text-sm font-semibold text-slate-200 mb-2">
              Description du poste visé <span className="text-slate-500 font-normal">(Optionnel)</span>
            </label>
            <p className="text-xs text-slate-400 mb-3">
              Collez le texte d'une offre d'emploi pour évaluer l'adéquation exacte de votre profil avec le poste ciblé. Laissez vide pour un audit généraliste.
            </p>
            <textarea
              id="offre"
              rows="6"
              value={texteOffre}
              onChange={(e) => setTexteOffre(e.target.value)}
              placeholder="Ex: Nous recherchons un développeur Symfony / React avec 3 ans d'expérience..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to="/dashboard" className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition">
              Annuler
            </Link>
            <button
              type="submit"
              disabled={chargementLancement}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition shadow-lg shadow-indigo-600/20"
            >
              {chargementLancement ? 'Initialisation...' : "Démarrer l'analyse"}
            </button>
          </div>
        </form>
      )}

      {etape === 'chargement' && (
        <AnalysePolling
          analyseId={analyseId}
          onTermine={(donnees) => {
            setResultat(donnees);
            setEtape('resultat');
          }}
          onErreur={(msg) => {
            setErreur(msg);
            setEtape('formulaire');
          }}
        />
      )}

      {etape === 'resultat' && resultat && (
        <AnalyseResult
          analyse={resultat}
          onRecommencer={() => {
            setResultat(null);
            setEtape('formulaire');
          }}
        />
      )}
    </div>
  );
}