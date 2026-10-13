import { useState, useEffect } from 'react';
import client from '../api/client';
import { AuthContext } from './authContextValue';


// ── 2. Le Provider : le composant qui "émet" les données ──
export function AuthProvider({ children }) {
  // user = les infos de l'utilisateur connecté (null = déconnecté)
  const [user, setUser] = useState(null);

  // token = le JWT stocké en localStorage (null = pas de JWT)
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // chargement = true seulement si un token existe et qu'on doit le vérifier
  const [chargement, setChargement] = useState(() => !!localStorage.getItem('token'));

  // ── 3. Au montage du composant : vérifier le JWT si présent ──
  useEffect(() => {
    if (!token) return;

    async function fetchUser() {
      try {
        const res = await client.get('/api/moi');
        setUser(res.data);  // { id: 1, email: "...", roles: [...] }
      } catch {
        // Le JWT est invalide ou expiré → on nettoie tout
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } finally {
        setChargement(false);  // Dans tous les cas, on a fini de charger
      }
    }

    fetchUser();
  }, [token]);

  // ── 5. Connexion ──
  async function login(email, motDePasse) {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const res = await client.post('/api/connexion', { email: cleanEmail, motDePasse });
    const nouveauToken = res.data.token;
    localStorage.setItem('token', nouveauToken);
    setToken(nouveauToken);

    try {
      const userRes = await client.get('/api/moi', {
        headers: { Authorization: `Bearer ${nouveauToken}` },
      });
      setUser(userRes.data);
    } catch {
      setUser({ email: cleanEmail });
    }
  }

  // ── 6. Inscription ──
  async function register(email, motDePasse) {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    await client.post('/api/inscription', { email: cleanEmail, motDePasse });
  }

  // ── 7. Déconnexion ──
  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  // ── 8. Rendre les données disponibles à tous les composants enfants ──
  return (
    <AuthContext.Provider value={{ user, token, chargement, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;