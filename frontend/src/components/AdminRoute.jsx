import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import AppLayout from './layout/AppLayout';

export default function AdminRoute() {
  const { user, token, chargement } = useAuth();

  if (chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="spinner" />
          <p className="text-xs font-semibold text-slate-500">Vérification des droits d'administration...</p>
        </div>
      </div>
    );
  }

  // Si pas connecté -> redirection vers login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Vérification stricte du rôle ADMIN
  const isAdmin = Boolean(
    user?.role === 'ROLE_ADMIN' ||
    user?.roles?.includes('ROLE_ADMIN')
  );

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AppLayout />;
}
