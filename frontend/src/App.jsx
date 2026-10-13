import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import AnalysePage from './pages/AnalysePage';
import HistoriquePage from './pages/HistoriquePage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="pt-16">
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Routes protégées : ProtectedRoute vérifie le JWT */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/cv/:id/analyse" element={<AnalysePage />} />
              <Route path="/cv/:id/historique" element={<HistoriquePage />} />
            </Route>

            {/* Toute URL inconnue → redirige vers login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;