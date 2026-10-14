import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import AnalysePage from './pages/AnalysePage';
import HistoriquePage from './pages/HistoriquePage';
import ProfilePage from './pages/ProfilePage';
import MesCvsPage from './pages/MesCvsPage';

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

            {/* Routes protégées : ProtectedRoute vérifie le JWT */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/mes-cvs" element={<MesCvsPage />} />
              <Route path="/cvs" element={<Navigate to="/mes-cvs" replace />} />
              <Route path="/profil" element={<ProfilePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/cv/:id/analyse" element={<AnalysePage />} />
              <Route path="/cv/:id/historique" element={<HistoriquePage />} />
            </Route>

            {/* Toute URL inconnue → redirige vers l'accueil */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;