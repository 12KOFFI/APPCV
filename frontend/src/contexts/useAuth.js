import { useContext } from 'react';
import { AuthContext } from './authContextValue';

// ── Hook custom pour accéder au contexte facilement ──
// Au lieu d'écrire useContext(AuthContext) partout, on écrit useAuth()
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return context;
}
