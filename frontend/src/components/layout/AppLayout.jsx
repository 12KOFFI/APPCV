import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../dashboard/Sidebar';
import Header from '../dashboard/Header';
import client from '../../api/client';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cvsCount, setCvsCount] = useState(0);
  const [recherche, setRecherche] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Charger le nombre de CV pour les badges de la sidebar
  useEffect(() => {
    async function chargerCvs() {
      try {
        const res = await client.get('/api/cv');
        setCvsCount(res.data?.length || 0);
      } catch {
        // Silencieux si non connecté ou erreur réseau
      }
    }
    chargerCvs();
  }, [location.pathname]);

  function handleFocusSearch() {
    if (location.pathname !== '/mes-cvs') {
      navigate('/mes-cvs');
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-700 flex flex-col lg:flex-row">
      {/* ── 1. Barre latérale gauche (Sidebar persistante pour tous les écrans connectés) ── */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        cvsCount={cvsCount}
      />

      {/* ── 2. Conteneur principal à droite ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* En-tête supérieur TailAdmin unifié */}
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          recherche={recherche}
          setRecherche={setRecherche}
          onFocusSearch={handleFocusSearch}
        />

        {/* Contenu spécifique de la page (Dashboard, Upload, Profil, Analyse, Historique...) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto fade-in">
          <Outlet context={{ cvsCount, recherche, setRecherche }} />
        </main>
      </div>
    </div>
  );
}
