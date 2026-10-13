import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import FileDropzone from '../components/FileDropzone';

export default function UploadPage() {
  const [fichier, setFichier] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [reponseCv, setReponseCv] = useState(null);
  const navigate = useNavigate();

  async function handleEnvoyer(e) {
    e.preventDefault();
    if (!fichier) {
      setErreur('Veuillez sélectionner un fichier avant d\'envoyer.');
      return;
    }

    setChargement(true);
    setErreur('');

    const formData = new FormData();
    // Le champ DOIT s'appeler 'cv' (attendu par CvController::upload)
    formData.append('cv', fichier);

    try {
      const res = await client.post('/api/cv', formData);
      setReponseCv(res.data);
    } catch (err) {
      const msg = err.response?.data?.erreur || err.response?.data?.detail || 'Erreur lors de l\'upload du fichier.';
      setErreur(msg);
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-12 max-w-2xl mx-auto fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">Ajouter un nouveau CV</h1>
        <p className="text-slate-400 mt-2">
          Importez votre CV au format PDF ou Word pour pouvoir l'analyser avec l'IA.
        </p>
      </div>

      {erreur && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          ❌ {erreur}
        </div>
      )}

      {!reponseCv ? (
        <form onSubmit={handleEnvoyer} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
          <FileDropzone onFichierSelectionne={setFichier} disabled={chargement} />

          {chargement && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-indigo-300">
                <span>Extraction du texte en cours par le serveur...</span>
                <span>Traitement...</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-indeterminate" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-2">
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700/50 transition"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={!fichier || chargement}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-600/20"
            >
              {chargement ? 'Envoi en cours...' : 'Téléverser le CV'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6 fade-in">
          <div className="flex items-center gap-3 text-emerald-400">
            <span className="text-2xl">✅</span>
            <div>
              <h2 className="text-lg font-bold text-white">CV téléversé avec succès !</h2>
              <p className="text-xs text-slate-400">
                {reponseCv.nombreCaracteres} caractères extraits depuis <span className="text-slate-200">{reponseCv.nomOriginal}</span>
              </p>
            </div>
          </div>

          {reponseCv.apercu && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <p className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-2">Aperçu du texte extrait :</p>
              <p className="text-xs text-slate-300 font-mono italic leading-relaxed line-clamp-3">
                "{reponseCv.apercu}..."
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => navigate(`/cv/${reponseCv.id}/analyse`)}
              className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition text-center shadow-lg shadow-indigo-600/20"
            >
              Lancer une analyse avec l'IA
            </button>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto py-3 px-5 rounded-xl text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition text-center"
            >
              Voir mon Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}