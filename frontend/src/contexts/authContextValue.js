import { createContext } from 'react';

// ── Le "canal radio" : créé dans un fichier séparé ──
// pour que Fast Refresh fonctionne (un fichier = que des composants OU que des non-composants)
export const AuthContext = createContext(null);
