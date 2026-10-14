import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import AnalysePage from './pages/AnalysePage';
import HistoriquePage from './pages/HistoriquePage';
import ProfilePage from './pages/ProfilePage';
import MesCvsPage from './pages/MesCvsPage';

// Pages Espace Administration
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCvsPage from './pages/admin/AdminCvsPage';
import AdminSystemPage from './pages/admin/AdminSystemPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            {/* Page d'accueil publique */}
            <Route path="/" element={<HomePage />} />

            {/* Routes publiques d'authentification */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Route d'upload publique (accessible aux visiteurs et aux connectés) */}
            <Route path="/upload" element={<UploadPage />} />

            {/* Routes protégées candidat : ProtectedRoute vérifie le JWT */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/mes-cvs" element={<MesCvsPage />} />
              <Route path="/cvs" element={<Navigate to="/mes-cvs" replace />} />
              <Route path="/profil" element={<ProfilePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/cv/:id/analyse" element={<AnalysePage />} />
              <Route path="/cv/:id/historique" element={<HistoriquePage />} />
            </Route>

            {/* Routes réservées aux administrateurs (ROLE_ADMIN obligatoire) */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/utilisateurs" element={<Navigate to="/admin/users" replace />} />
              <Route path="/admin/cvs" element={<AdminCvsPage />} />
              <Route path="/admin/system" element={<AdminSystemPage />} />
            </Route>

            {/* Toute URL inconnue ── redirige vers l'accueil */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
