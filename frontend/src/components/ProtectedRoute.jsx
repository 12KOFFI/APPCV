import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import AppLayout from './layout/AppLayout';

export default function ProtectedRoute() {
  const { token, chargement } = useAuth();

  // ── Pendant la vérification du JWT, on affiche un spinner ──
  if (chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  // Pas de token = pas connecté → rediriger vers /login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // ── Connecté → Afficher la mise en page unifiée avec la Sidebar TailAdmin ──
  return <AppLayout />;
}
