import { useEffect, useState } from 'react';
import client from '../api/client';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import StatCards from '../components/dashboard/StatCards';
import AreaChartCard from '../components/dashboard/AreaChartCard';
import DonutChartCard from '../components/dashboard/DonutChartCard';
import InsightsCards from '../components/dashboard/InsightsCards';
import CvTable from '../components/dashboard/CvTable';
import { AlertCircleIcon } from '../components/ui/Icons';

export default function DashboardPage() {
  const [cvs, setCvs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [recherche, setRecherche] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function chargerCvs() {
      try {
        const res = await client.get('/api/cv');
        setCvs(res.data);
      } catch (err) {
        setErreur(
          err.response?.data?.erreur ||
            'Impossible de récupérer la liste des documents.'
        );
      } finally {
        setChargement(false);
      }
    }

    chargerCvs();
  }, []);

  function handleScrollToDocs() {
    const el = document.getElementById('mes-documents');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  if (chargement) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center gap-3">
        <div className="spinner" />
        <p className="text-xs font-semibold text-slate-600">
          Chargement de votre tableau de bord TailAdmin...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-700 flex flex-col lg:flex-row">
      {/* ── 1. Barre latérale gauche (Sidebar) ── */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        cvsCount={cvs.length}
        onScrollToDocs={handleScrollToDocs}
      />

      {/* ── 2. Zone de contenu principal à droite ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* En-tête supérieur TailAdmin (Header) */}
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          recherche={recherche}
          setRecherche={setRecherche}
          onFocusSearch={handleScrollToDocs}
        />

        {/* Corps du tableau de bord */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto fade-in">
          {/* Bannière d'erreur si l'API échoue */}
          {erreur && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
              <AlertCircleIcon className="w-5 h-5 text-red-600 shrink-0" />
              <span>{erreur}</span>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              1. 4 CARTES MÉTRIQUES KPI (TOTAL CV, ANALYSES IA, SCORE ATS, MOTS-CLÉS)
              ══════════════════════════════════════════════════════════════════ */}
          <StatCards cvsCount={cvs.length} />

          {/* ══════════════════════════════════════════════════════════════════
              2. GRILLE ANALYTIQUE CENTRALE (GRAPHIQUE AIRE + DONUT RÉPARTITION)
              ══════════════════════════════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2">
              <AreaChartCard />
            </div>
            <div className="lg:col-span-1">
              <DonutChartCard cvsCount={cvs.length} />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              3. CARTES D'INSIGHTS & AUDIT TECHNIQUE (CONFORMITÉ + RECOMMANDATIONS)
              ══════════════════════════════════════════════════════════════════ */}
          <InsightsCards cvsCount={cvs.length} />

          {/* ══════════════════════════════════════════════════════════════════
              4. TABLEAU DE MES DOCUMENTS & ANALYSES RÉCENTES (AVEC PAGINATION)
              ══════════════════════════════════════════════════════════════════ */}
          <CvTable
            cvs={cvs}
            recherche={recherche}
            setRecherche={setRecherche}
          />
        </main>
      </div>
    </div>
  );
}