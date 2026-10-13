import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import {
  SidebarToggleIcon,
  SearchIcon,
  MoonIcon,
  SunIcon,
  UserIcon,
  LogOutIcon,
  UploadIcon,
  ChevronDownIcon,
} from '../ui/Icons';

export default function Header({
  onToggleSidebar,
  recherche,
  setRecherche,
  onFocusSearch,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fermer le dropdown au clic en dehors
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Raccourci clavier ⌘K / Ctrl+K
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        onFocusSearch?.();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onFocusSearch]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  function toggleTheme() {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  }

  return (
    <header className="sticky top-0 z-30 h-18 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors">
      {/* ── Gauche : Toggle Sidebar + Barre de recherche ── */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        {/* Bouton pour ouvrir la Sidebar sur mobile et tablette */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
          aria-label="Ouvrir le menu de navigation"
        >
          <SidebarToggleIcon className="w-5 h-5" />
        </button>

        {/* Barre de recherche avec raccourci ⌘K */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <SearchIcon className="w-4 h-4" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un CV, un poste, une compétence..."
            className="w-full text-xs text-slate-900 bg-slate-50/70 border border-slate-200 rounded-xl pl-9 pr-14 py-2.5 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all shadow-2xs"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] font-semibold text-slate-400 shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* ── Droite : Thème sombre (PAS DE NOTIFICATION) + Profil Utilisateur ── */}
      <div className="flex items-center gap-3">
        {/* Bouton Mode Sombre */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
          title={isDarkMode ? 'Passer au mode clair' : 'Passer au mode sombre'}
        >
          {isDarkMode ? (
            <SunIcon className="w-4 h-4 text-amber-500" />
          ) : (
            <MoonIcon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* NOTIFICATION ICON EXCLUSIVEMENT OMISE COMME DEMANDÉ PAR L'UTILISATEUR */}

        {/* Menu Déroulant Profil */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-2xs group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs group-hover:bg-slate-800 transition-colors">
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:flex flex-col text-left pr-1 max-w-[140px]">
              <span className="text-xs font-bold text-slate-900 truncate leading-tight">
                {user?.email?.split('@')[0] || 'Utilisateur'}
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">Mon Compte</span>
            </div>
            <ChevronDownIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
          </button>

          {/* Menu flottant */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 fade-in text-left">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400">Connecté en tant que</p>
                <p className="text-xs font-bold text-slate-900 truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/profil"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <span>Mon Profil & Mot de passe</span>
                </Link>
                <Link
                  to="/upload"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <UploadIcon className="w-4 h-4 text-slate-400" />
                  <span>Déposer un nouveau CV</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <LogOutIcon className="w-4 h-4 text-red-600" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
