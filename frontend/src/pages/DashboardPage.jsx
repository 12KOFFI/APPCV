import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import CvCard from '../components/CvCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import {
  FileTextIcon,
  PlusIcon,
  SparklesIcon,
  ShieldCheckIcon,
  AlertCircleIcon,
} from '../components/ui/Icons';

export default function DashboardPage() {
  const [cvs, setCvs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [recherche, setRecherche] = useState('');

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

  const cvsFiltres = cvs.filter((cv) =>
    cv.nomOriginal.toLowerCase().includes(recherche.toLowerCase())
  );

  if (chargement) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="spinner" />
        <p className="text-xs font-medium text-slate-500">Chargement de votre espace de travail...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-in">
      {/* ── En-tête de page ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tableau de bord
            </h1>
            <Badge variant="neutral" size="sm">
              {cvs.length} {cvs.length > 1 ? 'documents' : 'document'}
            </Badge>
          </div>
          <p className="text-slate-500 text-sm">
            Gérez vos CV importés, lancez vos diagnostics IA et téléchargez vos synthèses.
          </p>
        </div>

        <Link to="/upload">
          <Button variant="primary" size="md">
            <PlusIcon className="w-4 h-4" />
            <span>Téléverser un nouveau CV</span>
          </Button>
        </Link>
      </div>

      {erreur && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5">
          <AlertCircleIcon className="w-5 h-5 text-red-600 shrink-0" />
          <span>{erreur}</span>
        </div>
      )}

      {/* ── Cartes métriques rapides (Stats Overview) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 shrink-0">
            <FileTextIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">CV Enregistrés</span>
            <div className="text-2xl font-extrabold text-slate-900">{cvs.length}</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Moteur d'analyse</span>
            <div className="text-sm font-bold text-slate-900">Claude Tool Use IA</div>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheckIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Format d'exportation</span>
            <div className="text-sm font-bold text-slate-900">PDF Haute Définition</div>
          </div>
        </Card>
      </div>

      {/* ── Barre de filtre et recherche ── */}
      {cvs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Rechercher par nom de fichier..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-xl px-3.5 py-2 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <span className="text-xs text-slate-400 self-end sm:self-center">
            {cvsFiltres.length} sur {cvs.length} affiché(s)
          </span>
        </div>
      )}

      {/* ── Grille de CV ou État vide ── */}
      {cvs.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 mx-auto mb-4">
            <FileTextIcon className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Aucun CV pour l'instant</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
            Importez votre premier document au format PDF ou Word pour évaluer la pertinence de vos compétences et générer votre rapport.
          </p>
          <Link to="/upload">
            <Button variant="primary" size="md">
              <PlusIcon className="w-4 h-4" />
              <span>Importer mon premier CV</span>
            </Button>
          </Link>
        </div>
      ) : cvsFiltres.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl">
          <p className="text-sm text-slate-500">Aucun CV ne correspond à « {recherche} ».</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cvsFiltres.map((cv) => (
            <CvCard key={cv.id} cv={cv} />
          ))}
        </div>
      )}
    </div>
  );
}