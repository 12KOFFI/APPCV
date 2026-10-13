import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import CvCard from '../components/CvCard';

export default function DashboardPage() {
  const [cvs, setCvs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    async function chargerCvs() {
      try {
        const res = await client.get('/api/cv');
        setCvs(res.data);
      } catch (err) {
        setErreur(err.response?.data?.erreur || 'Impossible de récupérer la liste des CV.');
      } finally {
        setChargement(false);
      }
    }

    chargerCvs();
  }, []);

  if (chargement) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="spinner" />
        <p className="text-sm text-slate-400">Chargement de vos CV...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Mes CV enregistrés</h1>
          <p className="text-slate-400 text-sm mt-1">
            Gérez vos documents et lancez vos diagnostics personnalisés par intelligence artificielle.
          </p>
        </div>
        <Link
          to="/upload"
          className="py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20 shrink-0"
        >
          + Ajouter un CV
        </Link>
      </div>

      {erreur && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          ❌ {erreur}
        </div>
      )}

      {cvs.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-800/40 border border-slate-700/60 rounded-3xl">
          <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center text-3xl mx-auto mb-4">
            📂
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Aucun CV pour l'instant</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Importez votre premier document PDF ou Word pour obtenir un diagnostic complet de vos compétences.
          </p>
          <Link
            to="/upload"
            className="inline-block py-2.5 px-6 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition"
          >
            Importer mon premier CV
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cvs.map((cv) => (
            <CvCard key={cv.id} cv={cv} />
          ))}
        </div>
      )}
    </div>
  );
}