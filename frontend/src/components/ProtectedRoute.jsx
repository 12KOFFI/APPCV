import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

export default function ProtectedRoute() {
  const { token, chargement } = useAuth();

  // ── Pendant la vérification du JWT, on affiche un spinner ──
  // Sans ça, on verrait la page Login pendant 200ms puis un retour au Dashboard
  if (chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  // Pas de token = pas connecté → rediriger vers /login 
  // "replace" empêche de revenir sur la page protégée avec le bouton "retour"
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ── Connecté → afficher la page demandée ──
  // <Outlet /> est un "trou" qui affiche les routes enfants (Dashboard, Upload…)
  return <Outlet />;
}
