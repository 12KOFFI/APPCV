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
        <p className="text-xs font-semibold text-slate-600">Chargement de votre espace personnel...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 fade-in text-left">
      {/* ══════════════════════════════════════════════════════════════════
          1. EN-TÊTE CHALEUREUX & BOUTON D'ACTION PRINCIPAL
          ══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Mon Espace
            </h1>
            <Badge variant="blue" size="sm">
              {cvs.length} {cvs.length > 1 ? 'CV enregistrés' : 'CV enregistré'}
            </Badge>
          </div>
          <p className="text-slate-600 text-xs sm:text-sm">
            Retrouvez tous vos documents. Cliquez sur <strong>« Analyser ce CV »</strong> pour obtenir votre note et vos recommandations.
          </p>
        </div>

        <Link to="/upload">
          <Button variant="primary" size="lg" className="shadow-md">
            <PlusIcon className="w-4 h-4" />
            <span>Déposer un nouveau CV</span>
          </Button>
        </Link>
      </div>

      {erreur && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
          <AlertCircleIcon className="w-5 h-5 text-red-600 shrink-0" />
          <span>{erreur}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          2. GUIDE RAPIDE EN 3 ÉTAPES (ONBOARDING NON-INFORMATICIEN)
          ══════════════════════════════════════════════════════════════════ */}
      <div className="mb-10 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50/70 via-slate-50 to-white border border-blue-100/80 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <SparklesIcon className="w-4 h-4 text-blue-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-900">
            Guide pas-à-pas : Comment utiliser votre espace ?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/80 border border-slate-200/60">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
              1
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900">Importez votre CV</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Cliquez sur le bouton noir ci-dessus pour envoyer votre fichier Word ou PDF.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/80 border border-slate-200/60">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900">Cliquez sur « Analyser »</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                L'intelligence artificielle lit votre profil en 5 secondes et calcule votre note.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/80 border border-slate-200/60">
            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-extrabold flex items-center justify-center shrink-0">
              3
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900">Téléchargez le rapport</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Récupérez un fichier PDF clair avec vos 5 conseils prioritaires pour réussir.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          3. CARTES D'ÉTAT SIMPLES ET RASSURANTES (SANS JARGON TECHNIQUE)
          ══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900 shrink-0">
            <FileTextIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Documents disponibles</span>
            <div className="text-2xl font-extrabold text-slate-900">
              {cvs.length} <span className="text-xs text-slate-400 font-normal">CV</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">Prêts pour vos candidatures</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <SparklesIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Diagnostic IA</span>
            <div className="text-sm font-bold text-slate-900">Note & Recommandations</div>
            <p className="text-[11px] text-slate-400 font-medium">Résultat en moins de 10 secondes</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheckIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Protection des données</span>
            <div className="text-sm font-bold text-slate-900">100 % Confidentiel</div>
            <p className="text-[11px] text-slate-400 font-medium">Vos documents ne sont jamais partagés</p>
          </div>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          4. RECHERCHE SIMPLE PARMI MES CV
          ══════════════════════════════════════════════════════════════════ */}
      {cvs.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Rechercher par nom de fichier..."
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium px-2">
            {cvsFiltres.length} sur {cvs.length} document(s) affiché(s)
          </span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          5. ÉTAT VIDE TRÈS GUIDÉ (SI AUCUN CV) OU LISTE DES CV
          ══════════════════════════════════════════════════════════════════ */}
      {cvs.length === 0 ? (
        <Card className="text-center py-16 px-6 sm:px-12 bg-white border-slate-200/90 shadow-sm max-w-2xl mx-auto my-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
            <FileTextIcon className="w-8 h-8" />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 mb-2">
            Bienvenue ! Déposez votre premier CV
          </h3>

          <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto mb-8 leading-relaxed">
            Pour commencer, ajoutez votre CV au format PDF ou Word. Notre intelligence artificielle va l'analyser automatiquement et vous donner des conseils personnalisés pour décrocher plus d'entretiens.
          </p>

          <Link to="/upload" className="inline-block mb-6">
            <Button variant="primary" size="lg" className="shadow-md">
              <PlusIcon className="w-4 h-4" />
              <span>Déposer mon premier CV (PDF ou Word)</span>
            </Button>
          </Link>

          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium text-slate-600">
              <span className="text-emerald-500 font-bold">✓</span> Gratuit
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium text-slate-600">
              <span className="text-emerald-500 font-bold">✓</span> Prend moins d'une minute
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 font-medium text-slate-600">
              <span className="text-emerald-500 font-bold">✓</span> 100% confidentiel
            </span>
          </div>
        </Card>
      ) : cvsFiltres.length === 0 ? (
        <Card className="text-center py-12 bg-white border-slate-200">
          <p className="text-sm text-slate-600">Aucun document ne correspond à votre recherche « {recherche} ».</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {cvsFiltres.map((cv) => (
            <CvCard key={cv.id} cv={cv} />
          ))}
        </div>
      )}

    </div>
  );
}