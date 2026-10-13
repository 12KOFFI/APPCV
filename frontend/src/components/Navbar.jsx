import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();           // Supprime le JWT et vide le state
    navigate('/login'); // Redirige vers la page de connexion
  }

  return (
    <nav className="navbar px-6 py-3 flex items-center justify-between">
      {/* Logo / Nom de l'app */}
      <Link
        to={user ? '/dashboard' : '/login'}
        className="text-xl font-bold text-indigo-400 hover:text-indigo-300 transition"
      >
         Analyseur CV
      </Link>

      {/* Liens de navigation */}
      <div className="flex items-center gap-1">
        {user ? (
          /* ── Connecté : Dashboard, Upload, Déconnexion ── */
          <>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`
              }
            >
               Dashboard
            </NavLink>
            <NavLink
              to="/upload"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`
              }
            >
               Upload
            </NavLink>
            <button
              onClick={handleLogout}
              className="ml-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition"
            >
              Déconnexion
            </button>
          </>
        ) : (
          /* ── Déconnecté : Connexion, Inscription ── */
          <>
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`
              }
            >
              Connexion
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`
              }
            >
              Inscription
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}