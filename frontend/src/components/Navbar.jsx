import { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { FileTextIcon, PlusIcon, UserIcon, LogOutIcon } from './ui/Icons';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // La Navbar publique s'affiche sur "/" et sur "/upload" pour les visiteurs anonymes
  if (location.pathname !== '/' && (location.pathname !== '/upload' || user)) {
    return null;
  }

  function handleLogout() {
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  }

  const handleLogoClick = (e) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const heroEl = document.getElementById('hero');
      if (heroEl) {
        heroEl.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.history.pushState(null, '', '/#hero');
    } else {
      navigate('/#hero');
    }
  };

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', `/#${targetId}`);
      }
    } else {
      navigate(`/#${targetId}`);
    }
  };

  return (
    <header className="navbar-saas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* ── Logo & Marque ── */}
        <div className="flex items-center gap-8">
          <a
            href="/#hero"
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-slate-800 transition-colors">
              <FileTextIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">APPCV</span>
              <Badge variant="neutral" size="sm" className="font-semibold text-[10px] tracking-wide">
                IA
              </Badge>
            </div>
          </a>

          {/* ── Navigation Liens (Desktop) ── */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            {user ? (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `relative py-1 transition-colors hover:text-slate-900 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-slate-900 after:transition-all after:duration-200 ${
                      isActive ? 'text-slate-900 font-bold after:w-full' : 'after:w-0 hover:after:w-full'
                    }`
                  }
                >
                  Tableau de bord
                </NavLink>
                <NavLink
                  to="/upload"
                  className={({ isActive }) =>
                    `relative py-1 transition-colors hover:text-slate-900 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-slate-900 after:transition-all after:duration-200 ${
                      isActive ? 'text-slate-900 font-bold after:w-full' : 'after:w-0 hover:after:w-full'
                    }`
                  }
                >
                  Téléverser un CV
                </NavLink>
                <NavLink
                  to="/profil"
                  className={({ isActive }) =>
                    `relative py-1 transition-colors hover:text-slate-900 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-slate-900 after:transition-all after:duration-200 ${
                      isActive ? 'text-slate-900 font-bold after:w-full' : 'after:w-0 hover:after:w-full'
                    }`
                  }
                >
                  Mon Profil
                </NavLink>
              </>
            ) : (
              <>
                <a
                  href="/#comment-ca-marche"
                  onClick={(e) => handleNavClick(e, 'comment-ca-marche')}
                  className="relative py-1 transition-colors hover:text-slate-900 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-slate-900 hover:after:w-full after:transition-all after:duration-200 cursor-pointer"
                >
                  Comment ça marche
                </a>
                <a
                  href="/#fonctionnalites"
                  onClick={(e) => handleNavClick(e, 'fonctionnalites')}
                  className="relative py-1 transition-colors hover:text-slate-900 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-slate-900 hover:after:w-full after:transition-all after:duration-200 cursor-pointer"
                >
                  Fonctionnalités
                </a>
                <a
                  href="/#faq"
                  onClick={(e) => handleNavClick(e, 'faq')}
                  className="relative py-1 transition-colors hover:text-slate-900 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-slate-900 hover:after:w-full after:transition-all after:duration-200 cursor-pointer"
                >
                  FAQ
                </a>
              </>
            )}
          </nav>
        </div>

        {/* ── Actions & CTA Droite ── */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/upload" className="hidden sm:inline-flex">
                <Button variant="secondary" size="sm">
                  <PlusIcon className="w-3.5 h-3.5" />
                  Nouveau CV
                </Button>
              </Link>
              <Link
                to="/profil"
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                title="Gérer mon profil"
              >
                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-700">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col text-left pr-1">
                  <span className="text-xs font-semibold text-slate-900 truncate max-w-[130px] leading-tight">{user.email}</span>
                  <span className="text-[10px] text-slate-500 leading-tight">Mon Profil</span>
                </div>
              </Link>
              <Button
                variant="danger"
                size="sm"
                onClick={handleLogout}
              >
                <LogOutIcon className="w-3.5 h-3.5" />
                Déconnexion
              </Button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2.5">
              <Link to="/login">
                <button
                  type="button"
                  className="px-4 py-2 rounded-md text-xs font-semibold text-slate-800 bg-slate-100/90 hover:bg-slate-200 transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  Connexion
                </button>
              </Link>
              <Link to="/register">
                <button
                  type="button"
                  className="px-5 py-2 rounded-md text-xs font-bold text-white bg-slate-900 hover:bg-black transition-all hover:-translate-y-0.5 shadow-xs hover:shadow-md cursor-pointer"
                >
                  Commencer
                </button>
              </Link>
            </div>
          )}

          {/* Bouton Hamburger pour mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-all cursor-pointer"
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/98 backdrop-blur-lg px-4 pt-4 pb-6 space-y-4 shadow-xl fade-in animate-in slide-in-from-top-2 duration-200">
          {user ? (
            <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-slate-50 transition"
              >
                Tableau de bord
              </Link>
              <Link
                to="/upload"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-slate-50 transition"
              >
                Téléverser un CV
              </Link>
              <Link
                to="/profil"
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 px-3 rounded-lg hover:bg-slate-50 transition"
              >
                Mon Profil ({user.email})
              </Link>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
              <a
                href="/#comment-ca-marche"
                onClick={(e) => handleNavClick(e, 'comment-ca-marche')}
                className="py-2 px-3 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                Comment ça marche
              </a>
              <a
                href="/#fonctionnalites"
                onClick={(e) => handleNavClick(e, 'fonctionnalites')}
                className="py-2 px-3 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                Fonctionnalités
              </a>
              <a
                href="/#faq"
                onClick={(e) => handleNavClick(e, 'faq')}
                className="py-2 px-3 rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                FAQ
              </a>
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full min-h-[46px] flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full min-h-[48px] flex items-center justify-center py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-black active:bg-slate-800 shadow-md transition"
                >
                  Commencer gratuitement
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
