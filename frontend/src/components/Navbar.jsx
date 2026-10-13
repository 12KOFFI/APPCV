import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import Button from './ui/Button';
import Badge from './ui/Badge';
import { FileTextIcon, PlusIcon } from './ui/Icons';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="navbar-saas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* ── Logo & Marque ── */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-slate-800 transition-colors">
              <FileTextIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">APPCV</span>
              <Badge variant="neutral" size="sm" className="font-semibold text-[10px] tracking-wide">
                IA
              </Badge>
            </div>
          </Link>

          {/* ── Navigation Liens (Desktop) ── */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            {user ? (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `transition-colors hover:text-slate-900 ${
                      isActive ? 'text-slate-900 font-semibold' : ''
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/upload"
                  className={({ isActive }) =>
                    `transition-colors hover:text-slate-900 ${
                      isActive ? 'text-slate-900 font-semibold' : ''
                    }`
                  }
                >
                  Téléverser un CV
                </NavLink>
              </>
            ) : (
              <>
                <a href="#fonctionnalites" className="transition-colors hover:text-slate-900">
                  Fonctionnalités
                </a>
                <a href="#comment-ca-marche" className="transition-colors hover:text-slate-900">
                  Comment ça marche
                </a>
                <a href="#faq" className="transition-colors hover:text-slate-900">
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
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900 truncate max-w-[160px]">{user.email}</span>
                <span className="text-[10px] text-slate-400">Compte vérifié</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-600 hover:text-red-600"
              >
                Déconnexion
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Connexion
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Commencer
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}