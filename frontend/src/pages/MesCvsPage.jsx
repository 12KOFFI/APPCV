import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import client from '../api/client';
import CvTable from '../components/dashboard/CvTable';
import { PlusIcon, AlertCircleIcon, FileTextIcon } from '../components/ui/Icons';

export default function MesCvsPage() {
  const context = useOutletContext() || {};
  const rechercheGlobale = context.recherche || '';
  const setRechercheGlobale = context.setRecherche || (() => {});

  const [cvs, setCvs] = useState([]);
  const [rechercheLocale, setRechercheLocale] = useState('');
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  // Synchronisation avec la recherche éventuelle passée par l'en-tête
  const rechercheActive = rechercheLocale || rechercheGlobale;

  useEffect(() => {
    async function chargerCvs() {
      try {
        setChargement(true);
        const res = await client.get('/api/cv');
        setCvs(res.data || []);
      } catch (err) {
        setErreur(
          err.response?.data?.erreur ||
            'Impossible de charger vos documents enregistrés.'
        );
      } finally {
        setChargement(false);
      }
    }

    chargerCvs();
  }, []);

  if (chargement) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="spinner" />
        <p className="text-xs font-semibold text-slate-500">
          Chargement de vos CV enregistrés...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* ── 1. En-tête de la page dédiée ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
            <FileTextIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Mes CV Enregistrés
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                {cvs.length} document{cvs.length > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Retrouvez l'ensemble de vos documents téléversés, visualisez vos bilans ATS et lancez de nouvelles analyses en un clic.
            </p>
          </div>
        </div>

        <Link to="/upload" className="self-start sm:self-auto shrink-0">
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-colors"
          >
            <PlusIcon className="w-4 h-4 text-white" />
            <span>Déposer un nouveau CV</span>
          </button>
        </Link>
      </div>

      {/* Message d'erreur éventuel */}
      {erreur && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
          <AlertCircleIcon className="w-5 h-5 text-red-600 shrink-0" />
          <span>{erreur}</span>
        </div>
      )}

      {/* ── 2. Tableau de Documents & Analyses ── */}
      <CvTable
        cvs={cvs}
        recherche={rechercheActive}
        setRecherche={(val) => {
          setRechercheLocale(val);
          setRechercheGlobale(val);
        }}
      />
    </div>
  );
}
