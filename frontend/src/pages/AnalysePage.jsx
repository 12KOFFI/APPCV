import { useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import client from '../api/client';
import AnalysePolling from '../components/AnalysePolling';
import AnalyseResult from '../components/AnalyseResult';
import Button from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SparklesIcon, AlertCircleIcon } from '../components/ui/Icons';

export default function AnalysePage() {
  const { id } = useParams();
  const location = useLocation();
  const [texteOffre, setTexteOffre] = useState(location.state?.texteOffre || '');
  const [etape, setEtape] = useState(location.state?.analyseId ? 'chargement' : 'formulaire');
  const [analyseId, setAnalyseId] = useState(location.state?.analyseId || null);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-in">
      <div className="mb-8 text-left">
        <Link
          to="/dashboard"
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition flex items-center gap-1.5 mb-3"
        >
          <span>←</span> Retour au Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Audit de profil par intelligence artificielle
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Évaluez la pertinence de votre document et optimisez son impact face aux recruteurs.
        </p>
      </div>

      {erreur && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
          <AlertCircleIcon className="w-5 h-5 text-red-600 shrink-0" />
          <span>{erreur}</span>
        </div>
      )}

      {etape === 'formulaire' && (
        <Card className="p-6 sm:p-8 bg-white border-slate-200/90 shadow-xl space-y-6">
          <form onSubmit={handleLancerAnalyse} className="space-y-6 text-left">
            <div>
              <label htmlFor="offre" className="block text-xs font-semibold text-slate-900 mb-1.5">
                Description de l'offre d'emploi cible <span className="text-slate-400 font-normal">(Optionnel)</span>
              </label>
              <p className="text-xs text-slate-500 mb-3">
                Collez le texte d'une offre d'emploi pour évaluer l'adéquation exacte de vos compétences avec le poste visé. Laissez vide pour un audit généraliste.
              </p>
              <textarea
                id="offre"
                rows="6"
                value={texteOffre}
                onChange={(e) => setTexteOffre(e.target.value)}
                placeholder="Exemple : Nous recherchons un développeur Symfony / React avec 3 ans d'expérience, maîtrisant Docker et les API REST..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <Link to="/dashboard">
                <Button variant="ghost" size="md">
                  Annuler
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={chargementLancement}
                loading={chargementLancement}
                variant="primary"
                size="md"
              >
                <SparklesIcon className="w-4 h-4" />
                <span>{chargementLancement ? 'Initialisation...' : "Démarrer l'analyse"}</span>
              </Button>
            </div>
          </form>
        </Card>
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