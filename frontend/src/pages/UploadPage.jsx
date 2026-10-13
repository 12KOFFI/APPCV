import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import FileDropzone from '../components/FileDropzone';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { CheckCircleIcon, SparklesIcon, AlertCircleIcon, ArrowRightIcon } from '../components/ui/Icons';

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
    <div className="min-h-[calc(100vh-4rem)] px-4 py-12 max-w-2xl mx-auto fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Téléverser un nouveau CV
        </h1>
        <p className="text-slate-500 text-sm mt-1.5">
          Importez votre CV au format PDF ou Word pour extraire son contenu et lancer l'audit IA.
        </p>
      </div>

      {erreur && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
          <AlertCircleIcon className="w-5 h-5 text-red-600 shrink-0" />
          <span>{erreur}</span>
        </div>
      )}

      {!reponseCv ? (
        <Card className="p-6 sm:p-8 bg-white border-slate-200/90 shadow-xl space-y-6">
          <form onSubmit={handleEnvoyer} className="space-y-6">
            <FileDropzone onFichierSelectionne={setFichier} disabled={chargement} />

            {chargement && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>Extraction du texte en cours par le serveur...</span>
                  <span className="font-mono text-slate-400">Traitement</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-indeterminate" />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <Link to="/dashboard">
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
              >
                <span>Téléverser le CV</span>
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card className="p-6 sm:p-8 bg-white border-slate-200/90 shadow-xl space-y-6 fade-in">
          <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">CV téléversé avec succès</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                <span className="font-semibold text-slate-800">{reponseCv.nombreCaracteres} caractères</span> extraits depuis{' '}
                <span className="font-medium text-slate-700">{reponseCv.nomOriginal}</span>
              </p>
            </div>
          </div>

          {reponseCv.apercu && (
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">Aperçu du texte extrait</span>
                <Badge variant="neutral" size="sm">Format validé</Badge>
              </div>
              <p className="text-xs text-slate-600 font-mono italic leading-relaxed line-clamp-3">
                « {reponseCv.apercu}... »
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              onClick={() => navigate(`/cv/${reponseCv.id}/analyse`)}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto flex-1 shadow-md"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>Lancer l'audit avec l'IA</span>
            </Button>
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full">
                Voir mon Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}