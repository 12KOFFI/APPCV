# ═══════════════════════════════════════════════════════════════════════
# ÉTAPE 8 — FRONTEND REACT : AFFICHAGE DES RÉSULTATS (AUTHENTIFIÉ)
# ═══════════════════════════════════════════════════════════════════════
#
# ✅ Sous-étapes complétées :
# - 8.1 : Setup React (Client API Axios, AuthContext, ProtectedRoute)
# - 8.2 : Pages Connexion / Inscription + Navigation (Navbar, Login, Register)
#
# 🎯 Sous-étapes à réaliser ci-dessous :
# - 8.3 : Dashboard (liste des CV) + Upload (drag & drop)
# - 8.4 : Analyse IA de CV (Formulaire, Polling asynchrone & Résultat)
# - 8.5 : Historique des analyses d'un CV & Comparatif
#
# ═══════════════════════════════════════════════════════════════════════

# ─────────────────────────────────────────────────────────────────────
# SOUS-ÉTAPE 8.3 — Dashboard (liste des CV) + Upload (drag & drop)
# ─────────────────────────────────────────────────────────────────────

## 1. Objectif
À la fin de cette sous-étape :
- Tu as un **composant réutilisable de glisser-déposer** (`FileDropzone.jsx`) avec validation immédiate côté client (formats PDF ou DOCX, taille max 5 Mo).
- Tu as une **page d'upload** (`UploadPage.jsx`) qui transmet le fichier via `POST /api/cv` en `multipart/form-data`, affiche la barre de progression, l'aperçu du texte extrait et propose d'enchaîner sur l'analyse ou de revenir au Dashboard.
- Tu as un **composant carte de CV** (`CvCard.jsx`) affichant le nom du fichier, la date d'ajout formatée, le nombre de caractères et les boutons d'action rapide.
- Tu as un **Dashboard complet** (`DashboardPage.jsx`) qui interroge `GET /api/cv`, gère l'état de chargement, les erreurs et affiche la grille de tes documents ou un message d'accueil guidant l'utilisateur.
- `App.jsx` est mis à jour pour brancher les vraies pages `DashboardPage` et `UploadPage`.

## 2. Concepts

### Qu'est-ce que `multipart/form-data` et `FormData` ?
Quand on transmet du texte classique (login, mot de passe), le navigateur utilise du JSON (`application/json`).
Mais un document PDF ou Word est un flux binaire lourd. L'encapsuler en JSON nécessiterait de le convertir en Base64, ce qui ajouterait un surcoût de 33% sur la bande passante.
Le standard HTTP utilise donc `multipart/form-data` via l'objet JavaScript natif `FormData` :
```js
const formData = new FormData();
// Le champ DOIT correspondre à l'argument #[MapUploadedFile] du contrôleur Symfony
formData.append('cv', fichier);
await client.post('/api/cv', formData);
```
Axios détecte l'objet `FormData` et configure automatiquement le header avec sa chaîne de délimitation unique (`boundary`).

### Défense en profondeur (Validation Client vs Serveur)
- **Côté client** : Vérifier la taille (`fichier.size <= 5 * 1024 * 1024`) et l'extension dans React offre une expérience fluide et prévient des transferts réseau inutiles.
- **Côté serveur** : Un utilisateur malveillant peut contourner React avec curl. Le backend Symfony reste la seule autorité infalsifiable avec `fileinfo` qui lit les magic bytes (%PDF...).

### Événements HTML5 Drag & Drop
React intercepte les événements natifs du navigateur :
- `onDragOver={(e) => e.preventDefault()}` : autorise la zone à recevoir un dépôt.
- `onDragLeave` : réinitialise l'état visuel quand le curseur quitte la zone.
- `onDrop={(e) => ...}` : extrait le fichier déposé depuis `e.dataTransfer.files[0]`.

## 3. Instructions

### Fichiers à créer / modifier
| Fichier | Rôle |
|---------|------|
| `frontend/src/components/FileDropzone.jsx` | Zone interactive de dépôt de fichier |
| `frontend/src/pages/UploadPage.jsx` | Page d'envoi multipart et feedback |
| `frontend/src/components/CvCard.jsx` | Carte de prévisualisation et actions par CV |
| `frontend/src/pages/DashboardPage.jsx` | Grille récapitulative de vos CV |
| `frontend/src/App.jsx` | Import des pages réelles dans le routeur |

## 4. Code

### Fichier : `frontend/src/components/FileDropzone.jsx`
```jsx
import { useState, useRef } from 'react';

export default function FileDropzone({ onFichierSelectionne, disabled }) {
  const [estSurvole, setEstSurvole] = useState(false);
  const [fichierLocal, setFichierLocal] = useState(null);
  const [erreur, setErreur] = useState('');
  const inputRef = useRef(null);

  const extensionsAcceptees = ['.pdf', '.docx'];
  const tailleMaxMo = 5;

  function validerEtTransmettre(fichier) {
    setErreur('');
    if (!fichier) return;

    const nomFichier = fichier.name.toLowerCase();
    const estValide = extensionsAcceptees.some((ext) => nomFichier.endsWith(ext));

    if (!estValide) {
      setErreur('Format non accepté. Seuls les fichiers PDF et Word (.docx) sont autorisés.');
      return;
    }

    if (fichier.size > tailleMaxMo * 1024 * 1024) {
      setErreur(`Le fichier est trop volumineux (maximum ${tailleMaxMo} Mo).`);
      return;
    }

    setFichierLocal(fichier);
    onFichierSelectionne(fichier);
  }

  function handleDrop(e) {
    e.preventDefault();
    setEstSurvole(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validerEtTransmettre(e.dataTransfer.files[0]);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    if (!disabled) setEstSurvole(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setEstSurvole(false);
  }

  return (
    <div className="w-full">
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`dropzone cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          estSurvole
            ? 'dropzone-active border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-700 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/70'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              validerEtTransmettre(e.target.files[0]);
            }
          }}
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center text-2xl text-indigo-400">
            📄
          </div>
          <div>
            <p className="text-base font-medium text-slate-200">
              {fichierLocal ? (
                <span className="text-indigo-400 font-semibold">{fichierLocal.name}</span>
              ) : (
                'Glissez-déposez votre CV ici, ou cliquez pour parcourir'
              )}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Formats acceptés : PDF ou Word (.docx) — Max 5 Mo
            </p>
          </div>
          {fichierLocal && (
            <span className="text-xs font-mono bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full">
              {(fichierLocal.size / (1024 * 1024)).toFixed(2)} Mo
            </span>
          )}
        </div>
      </div>

      {erreur && (
        <p className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
          ⚠️ {erreur}
        </p>
      )}
    </div>
  );
}
```

---

### Fichier : `frontend/src/pages/UploadPage.jsx`
```jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import FileDropzone from '../components/FileDropzone';

export default function UploadPage() {
  const [fichier, setFichier] = useState(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [reponseCv, setReponseCv] = useState(null);
  const navigate = useNavigate();

  async function handleEnvoyer(e) {
    e.preventDefault();
    if (!fichier) {
      setErreur('Veuillez sélectionner un fichier avant d\'envoyer.');
      return;
    }

    setChargement(true);
    setErreur('');

    const formData = new FormData();
    // Le champ DOIT s'appeler 'cv' (attendu par CvController::upload)
    formData.append('cv', fichier);

    try {
      const res = await client.post('/api/cv', formData);
      setReponseCv(res.data);
    } catch (err) {
      const msg = err.response?.data?.erreur || err.response?.data?.detail || 'Erreur lors de l\'upload du fichier.';
      setErreur(msg);
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-12 max-w-2xl mx-auto fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white">Ajouter un nouveau CV</h1>
        <p className="text-slate-400 mt-2">
          Importez votre CV au format PDF ou Word pour pouvoir l'analyser avec l'IA.
        </p>
      </div>

      {erreur && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          ❌ {erreur}
        </div>
      )}

      {!reponseCv ? (
        <form onSubmit={handleEnvoyer} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
          <FileDropzone onFichierSelectionne={setFichier} disabled={chargement} />

          {chargement && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-indigo-300">
                <span>Extraction du texte en cours par le serveur...</span>
                <span>Traitement...</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-indeterminate" />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-2">
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700/50 transition"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={!fichier || chargement}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-600/20"
            >
              {chargement ? 'Envoi en cours...' : 'Téléverser le CV'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-xl space-y-6 fade-in">
          <div className="flex items-center gap-3 text-emerald-400">
            <span className="text-2xl">✅</span>
            <div>
              <h2 className="text-lg font-bold text-white">CV téléversé avec succès !</h2>
              <p className="text-xs text-slate-400">
                {reponseCv.nombreCaracteres} caractères extraits depuis <span className="text-slate-200">{reponseCv.nomOriginal}</span>
              </p>
            </div>
          </div>

          {reponseCv.apercu && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
              <p className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-2">Aperçu du texte extrait :</p>
              <p className="text-xs text-slate-300 font-mono italic leading-relaxed line-clamp-3">
                "{reponseCv.apercu}..."
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              onClick={() => navigate(`/cv/${reponseCv.id}/analyse`)}
              className="w-full sm:w-auto flex-1 py-3 px-5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition text-center shadow-lg shadow-indigo-600/20"
            >
              🚀 Lancer une analyse avec l'IA
            </button>
            <Link
              to="/dashboard"
              className="w-full sm:w-auto py-3 px-5 rounded-xl text-sm font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition text-center"
            >
              Voir mon Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### Fichier : `frontend/src/components/CvCard.jsx`
```jsx
import { Link } from 'react-router-dom';

export default function CvCard({ cv }) {
  const dateFormatee = new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(cv.creeLe));

  return (
    <div className="bg-slate-800 border border-slate-700/80 rounded-2xl p-5 hover:border-slate-600 transition shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-lg text-indigo-400 shrink-0">
            📄
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900/60 px-2 py-1 rounded-md">
            {cv.nombreCaracteres} car.
          </span>
        </div>

        <h3 className="font-semibold text-white text-base truncate mb-1" title={cv.nomOriginal}>
          {cv.nomOriginal}
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Ajouté le {dateFormatee}
        </p>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-slate-700/60">
        <Link
          to={`/cv/${cv.id}/analyse`}
          className="flex-1 py-2 px-3 text-center rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition"
        >
          Analyser
        </Link>
        <Link
          to={`/cv/${cv.id}/historique`}
          className="py-2 px-3 text-center rounded-lg text-xs font-medium text-slate-300 bg-slate-700/80 hover:bg-slate-700 transition"
        >
          Historique
        </Link>
      </div>
    </div>
  );
}
```

---

### Fichier : `frontend/src/pages/DashboardPage.jsx`
```jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import CvCard from '../components/CvCard';

export default function DashboardPage() {
  const [cvs, setCvs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    async function chargerCvs() {
      try {
        const res = await client.get('/api/cv');
        setCvs(res.data);
      } catch (err) {
        setErreur(err.response?.data?.erreur || 'Impossible de récupérer la liste des CV.');
      } finally {
        setChargement(false);
      }
    }

    chargerCvs();
  }, []);

  if (chargement) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="spinner" />
        <p className="text-sm text-slate-400">Chargement de vos CV...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Mes CV enregistrés</h1>
          <p className="text-slate-400 text-sm mt-1">
            Gérez vos documents et lancez vos diagnostics personnalisés par intelligence artificielle.
          </p>
        </div>
        <Link
          to="/upload"
          className="py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20 shrink-0"
        >
          + Ajouter un CV
        </Link>
      </div>

      {erreur && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          ❌ {erreur}
        </div>
      )}

      {cvs.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-800/40 border border-slate-700/60 rounded-3xl">
          <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center text-3xl mx-auto mb-4">
            📂
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Aucun CV pour l'instant</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
            Importez votre premier document PDF ou Word pour obtenir un diagnostic complet de vos compétences.
          </p>
          <Link
            to="/upload"
            className="inline-block py-2.5 px-6 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition"
          >
            Importer mon premier CV
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cvs.map((cv) => (
            <CvCard key={cv.id} cv={cv} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

### Fichier : `frontend/src/App.jsx`
Remplace les stubs de `DashboardPage` et `UploadPage` par leurs véritables imports :
```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';

// Stubs temporaires pour les étapes 8.4 et 8.5
function AnalysePage() { return <div className="p-10 text-center text-white">🔍 Analyse (étape 8.4)</div>; }
function HistoriquePage() { return <div className="p-10 text-center text-white">📊 Historique (étape 8.5)</div>; }

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
```

## 5. Test
1. Connecte-toi sur ton application.
2. Tu arrives sur le Dashboard avec le message "Aucun CV pour l'instant".
3. Clique sur "+ Ajouter un CV" ou "Upload" dans la Navbar.
4. Glisse un fichier PDF valide ou clique pour le sélectionner.
5. Clique "Téléverser le CV" :
   - Tu vois la barre de progression.
   - Le message de succès s'affiche avec le nombre de caractères extraits et l'aperçu du texte.
6. Clique "Voir mon Dashboard" : le CV apparaît sous forme de carte moderne !
7. **Test d'erreur** : essaie de déposer une image `.png` ou un fichier > 5 Mo : un message rouge d'avertissement bloque l'envoi immédiatement.

## 6. Questions d'entretien

**Q1 : Pourquoi ne doit-on PAS fixer manuellement le header `Content-Type: multipart/form-data` dans Axios quand on utilise `FormData` ?**
→ Si tu écris manuellement `headers: { 'Content-Type': 'multipart/form-data' }`, Axios omet la sous-partie essentielle `boundary=----WebKitFormBoundary...`. Sans ce séparateur généré aléatoirement par le navigateur, le serveur HTTP ne sait pas où commence et finit chaque champ binaire, et renvoie une erreur 400 ou 422. En laissant Axios détecter `FormData`, il injecte le bon header avec le `boundary`.

**Q2 : Quelle est la différence fondamentale entre `e.target.files` et `e.dataTransfer.files` ?**
→ `e.target.files` provient d'un élément `<input type="file">` après clic et sélection dans la boîte de dialogue système. `e.dataTransfer.files` provient de l'événement de glisser-déposer (`onDrop`) géré par l'API Drag & Drop du navigateur.

---
---

# ─────────────────────────────────────────────────────────────────────
# SOUS-ÉTAPE 8.4 — Analyse IA de CV (Formulaire, Polling asynchrone & Résultat)
# ─────────────────────────────────────────────────────────────────────

## 1. Objectif
À la fin de cette sous-étape :
- Tu as compris l'intérêt du **workflow asynchrone** (Symfony Messenger + Workers) face au temps de calcul d'une IA (3 à 10 secondes).
- Tu as un **composant de polling** (`AnalysePolling.jsx`) qui interroge régulièrement l'API (`GET /api/analyse/{id}`) et affiche un indicateur d'attente animé avec chronomètre.
- Tu as un **composant d'affichage riche** (`AnalyseResult.jsx`) qui présente la note globale /100 avec code couleur adapté, les points forts, les points faibles, les compétences et les 5 recommandations prioritaires de Claude.
- Tu as la **page d'analyse complète** (`AnalysePage.jsx`) qui gère les 3 états successifs : saisie de l'offre d'emploi cible (optionnelle) -> phase de calcul en arrière-plan -> affichage des résultats.
- `App.jsx` est mis à jour pour brancher la vraie `AnalysePage`.

## 2. Concepts

### Pourquoi un appel IA DOIT être asynchrone ?
Une requête HTTP classique attend la réponse du serveur (synchrone).
Or, l'appel à l'API Anthropic Claude prend entre 3 et 12 secondes selon la charge et la taille du prompt :
- Si 20 utilisateurs lancent une analyse en même temps de manière synchrone, les 20 workers PHP-FPM du serveur sont bloqués en attente active d'une réponse réseau externe. Le serveur ne peut plus répondre à aucune autre requête et s'effondre.
- De plus, les reverse proxies (Nginx, Cloudflare) coupent les connexions au-delà d'un court délai (Timeout 504).

**La solution d'ingénierie adoptée :**
1. React envoie `POST /api/cv/{id}/analyse`.
2. Symfony crée une entrée `Analyse` avec le statut `EN_ATTENTE`, envoie un message dans la file Messenger et **répond immédiatement en moins de 50 ms avec le code HTTP 202 Accepted**.
3. Un worker en arrière-plan (`messenger:consume`) traite la tâche et contacte Claude.
4. React fait du **polling** (questionne `GET /api/analyse/{id}` toutes les 2 secondes) jusqu'à ce que le statut passe à `TERMINE`.

### Qu'est-ce que le Short Polling ?
Le Short Polling est la méthode la plus simple et la plus robuste pour suivre une tâche asynchrone :
```
Navigateur (React)               Serveur Symfony
      │                                 │
      ├── POST /api/cv/1/analyse ──────>│ (Dispatch dans Messenger)
      │<── 202 Accepted { analyseId: 5 }│
      │                                 │
      ├── GET /api/analyse/5 ──────────>│
      │<── { statut: "EN_ATTENTE" } ────│
      │                                 │ (2 secondes plus tard)
      ├── GET /api/analyse/5 ──────────>│
      │<── { statut: "EN_COURS" } ──────│
      │                                 │ (2 secondes plus tard)
      ├── GET /api/analyse/5 ──────────>│
      │<── { statut: "TERMINE", note...}│ (Le polling s'arrête !)
```

### Le nettoyage obligatoire des timers dans React (`cleanup function`)
Si l'utilisateur quitte la page pendant que le polling tourne, le `setInterval` continuerait à faire des requêtes en arrière-plan, provoquant des fuites de mémoire. La fonction retournée dans `useEffect` garantit l'annulation immédiate du timer :
```js
useEffect(() => {
  const timer = setInterval(verifier, 2000);
  return () => clearInterval(timer); // Nettoyage au démontage du composant
}, []);
```

## 3. Instructions

### Fichiers à créer / modifier
| Fichier | Rôle |
|---------|------|
| `frontend/src/components/AnalysePolling.jsx` | Gestion de l'interrogation périodique et du loader |
| `frontend/src/components/AnalyseResult.jsx` | Rendu visuel du score et des conseils de Claude |
| `frontend/src/pages/AnalysePage.jsx` | Page orchestrant le formulaire, le polling et le résultat |
| `frontend/src/App.jsx` | Import de la vraie `AnalysePage` |

## 4. Code

### Fichier : `frontend/src/components/AnalysePolling.jsx`
```jsx
import { useEffect, useState } from 'react';
import client from '../api/client';

export default function AnalysePolling({ analyseId, onTermine, onErreur }) {
  const [statut, setStatut] = useState('EN_ATTENTE');
  const [secondes, setSecondes] = useState(0);

  useEffect(() => {
    const chrono = setInterval(() => {
      setSecondes((s) => s + 1);
    }, 1000);

    return () => clearInterval(chrono);
  }, []);

  useEffect(() => {
    let timerId = null;

    async function verifierStatut() {
      try {
        const res = await client.get(`/api/analyse/${analyseId}`);
        const data = res.data;
        setStatut(data.statut);

        if (data.statut === 'TERMINE') {
          if (timerId) clearInterval(timerId);
          onTermine(data);
        } else if (data.statut === 'ERREUR') {
          if (timerId) clearInterval(timerId);
          onErreur(data.erreur || 'L\'analyse a rencontré une erreur.');
        }
      } catch (err) {
        if (timerId) clearInterval(timerId);
        onErreur(err.response?.data?.erreur || 'Impossible de joindre le serveur.');
      }
    }

    verifierStatut(); // Premier appel immédiat
    timerId = setInterval(verifierStatut, 2000);

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [analyseId, onTermine, onErreur]);

  const messagesStatut = {
    EN_ATTENTE: "Analyse placée dans la file d'attente...",
    EN_COURS: "Claude analyse la structure et les compétences de votre CV...",
    TERMINE: "Audit terminé ! Finalisation de votre rapport...",
  };

  return (
    <div className="text-center py-12 px-6 bg-slate-800/60 border border-slate-700 rounded-3xl max-w-xl mx-auto shadow-2xl">
      <div className="spinner mx-auto mb-6" />
      <h3 className="text-xl font-bold text-white mb-2">
        {statut === 'EN_COURS' ? 'Audit en cours par Claude' : 'Traitement en cours'}
      </h3>
      <p className="text-sm text-indigo-300 font-medium mb-6">
        {messagesStatut[statut] || 'Analyse en cours...'}
      </p>

      <div className="progress-bar mb-4">
        <div className="progress-bar-indeterminate" />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 font-mono px-1">
        <span>Statut : {statut}</span>
        <span>Chronomètre : {secondes}s</span>
      </div>
    </div>
  );
}
```

---

### Fichier : `frontend/src/components/AnalyseResult.jsx`
```jsx
export default function AnalyseResult({ analyse, onRecommencer }) {
  const note = analyse.note ?? 0;

  let couleurBadge = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400';
  let etiquetteScore = 'Excellent profil';
  if (note < 50) {
    couleurBadge = 'border-rose-500/40 bg-rose-500/10 text-rose-400';
    etiquetteScore = 'Des ajustements majeurs sont nécessaires';
  } else if (note < 70) {
    couleurBadge = 'border-amber-500/40 bg-amber-500/10 text-amber-400';
    etiquetteScore = 'Profil prometteur à consolider';
  }

  return (
    <div className="space-y-8 fade-in">
      {/* ── En-tête avec note globale ── */}
      <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="text-center md:text-left">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Rapport d'audit IA</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Diagnostic de votre profil</h2>
          <p className="text-slate-400 text-sm mt-1">{etiquetteScore}</p>
        </div>

        <div className={`flex flex-col items-center justify-center p-5 rounded-2xl border ${couleurBadge} shrink-0 min-w-[140px]`}>
          <span className="text-4xl font-extrabold">{note}</span>
          <span className="text-xs uppercase font-bold tracking-wider mt-0.5">/ 100</span>
        </div>
      </div>

      {/* ── Grille Points Forts & Faibles ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Points forts */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4 text-emerald-400 font-bold text-base">
            <span>✨</span> Points forts identifiés
          </div>
          <ul className="space-y-3">
            {analyse.pointsForts?.map((point, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Points faibles / Axes d'amélioration */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4 text-rose-400 font-bold text-base">
            <span>🎯</span> Axes d'amélioration
          </div>
          <ul className="space-y-3">
            {analyse.pointsFaibles?.map((point, index) => (
              <li key={index} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="text-rose-400 font-bold shrink-0">!</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Compétences clés détectées ── */}
      {analyse.competences && analyse.competences.length > 0 && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
            <span>🛠️</span> Compétences clés identifiées
          </h3>
          <div className="flex flex-wrap gap-2">
            {analyse.competences.map((comp, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
              >
                {comp}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── 5 Recommandations concrètes ── */}
      {analyse.recommandations && analyse.recommandations.length > 0 && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg">
          <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
            <span>💡</span> Recommandations prioritaires
          </h3>
          <div className="space-y-3">
            {analyse.recommandations.map((rec, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-300"
              >
                <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <p className="flex-1 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bouton pour recommencer ── */}
      {onRecommencer && (
        <div className="flex justify-end pt-4">
          <button
            onClick={onRecommencer}
            className="py-2.5 px-6 rounded-xl text-sm font-semibold text-slate-200 bg-slate-700 hover:bg-slate-600 transition"
          >
            Refaire une analyse
          </button>
        </div>
      )}
    </div>
  );
}
```

---

### Fichier : `frontend/src/pages/AnalysePage.jsx`
```jsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import AnalysePolling from '../components/AnalysePolling';
import AnalyseResult from '../components/AnalyseResult';

export default function AnalysePage() {
  const { id } = useParams();
  const [texteOffre, setTexteOffre] = useState('');
  const [etape, setEtape] = useState('formulaire'); // 'formulaire' | 'chargement' | 'resultat'
  const [analyseId, setAnalyseId] = useState(null);
  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState('');
  const [chargementLancement, setChargementLancement] = useState(false);

  async function handleLancerAnalyse(e) {
    e.preventDefault();
    setErreur('');
    setChargementLancement(true);

    try {
      const payload = texteOffre.trim() ? { texteOffre: texteOffre.trim() } : {};
      const res = await client.post(`/api/cv/${id}/analyse`, payload);
      setAnalyseId(res.data.analyseId);
      setEtape('chargement');
    } catch (err) {
      setErreur(err.response?.data?.erreur || "Impossible d'initier l'analyse.");
    } finally {
      setChargementLancement(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 fade-in">
      <div className="mb-8">
        <Link to="/dashboard" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1 mb-3">
          ← Retour au Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Analyse de profil par IA</h1>
        <p className="text-slate-400 text-sm mt-1">
          Évaluez la pertinence de votre CV et obtenez des conseils sur-mesure pour maximiser votre impact.
        </p>
      </div>

      {erreur && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          ❌ {erreur}
        </div>
      )}

      {etape === 'formulaire' && (
        <form onSubmit={handleLancerAnalyse} className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div>
            <label htmlFor="offre" className="block text-sm font-semibold text-slate-200 mb-2">
              Description du poste visé <span className="text-slate-500 font-normal">(Optionnel)</span>
            </label>
            <p className="text-xs text-slate-400 mb-3">
              Collez le texte d'une offre d'emploi pour évaluer l'adéquation exacte de votre profil avec le poste ciblé. Laissez vide pour un audit généraliste.
            </p>
            <textarea
              id="offre"
              rows="6"
              value={texteOffre}
              onChange={(e) => setTexteOffre(e.target.value)}
              placeholder="Ex: Nous recherchons un développeur Symfony / React avec 3 ans d'expérience..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link to="/dashboard" className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition">
              Annuler
            </Link>
            <button
              type="submit"
              disabled={chargementLancement}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition shadow-lg shadow-indigo-600/20"
            >
              {chargementLancement ? 'Initialisation...' : "Démarrer l'analyse"}
            </button>
          </div>
        </form>
      )}

      {etape === 'chargement' && (
        <AnalysePolling
          analyseId={analyseId}
          onTermine={(donnees) => {
            setResultat(donnees);
            setEtape('resultat');
          }}
          onErreur={(msg) => {
            setErreur(msg);
            setEtape('formulaire');
          }}
        />
      )}

      {etape === 'resultat' && resultat && (
        <AnalyseResult
          analyse={resultat}
          onRecommencer={() => {
            setResultat(null);
            setEtape('formulaire');
          }}
        />
      )}
    </div>
  );
}
```

---

### Fichier : `frontend/src/App.jsx`
Remplace le stub d'`AnalysePage` par son import réel :
```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import AnalysePage from './pages/AnalysePage';

// Stub temporaire restant pour l'étape 8.5
function HistoriquePage() { return <div className="p-10 text-center text-white">📊 Historique (étape 8.5)</div>; }

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

            {/* Routes protégées */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/cv/:id/analyse" element={<AnalysePage />} />
              <Route path="/cv/:id/historique" element={<HistoriquePage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

## 5. Test

⚠️ **IMPORTANT — Démarrer le worker Messenger en arrière-plan :**
L'analyse est traitée par la file asynchrone Messenger. Dans un nouveau terminal dans le dossier `backend`, exécute la commande suivante pour consommer les messages :
```bash
cd i:\APP-CV\backend
php bin/console messenger:consume async -vv
```
*(Laisse ce terminal ouvert pendant tes tests).*

1. Depuis le Dashboard, clique sur **"Analyser"** sur l'un de tes CV.
2. Optionnel : colle un exemple d'offre d'emploi ou laisse le champ vide.
3. Clique **"Démarrer l'analyse"** :
   - Tu bascules immédiatement sur l'écran d'attente avec le spinner et le chronomètre.
   - Le statut passe de `EN_ATTENTE` à `EN_COURS`.
   - Dans le terminal du worker, tu vois Symfony consommer le message et contacter Claude.
4. Dès que Claude répond, l'écran bascule automatiquement sur le rapport d'audit :
   - Note sur 100 avec code couleur (vert, orange ou rouge).
   - Points forts et points faibles clairement listés.
   - Compétences extraites sous forme de tags.
   - Les 5 recommandations d'action numérotées.
5. Clique "Refaire une analyse" pour tester à nouveau.

## 6. Questions d'entretien

**Q1 : Pourquoi renvoyer un code HTTP `202 Accepted` plutôt que `200 OK` lors de l'appel à `/api/cv/{id}/analyse` ?**
→ Le code HTTP `202 Accepted` signifie selon la spécification RFC que la requête a été acceptée et validée, mais que son traitement n'est pas terminé au moment de la réponse. C'est le standard de l'industrie pour les architectures orientées événements (Event-Driven) et les files de messages asynchrones.

**Q2 : Quelles sont les alternatives au Short Polling et pourquoi ne pas avoir utilisé des WebSockets ici ?**
→ Les alternatives sont le Long Polling, les SSE (Server-Sent Events) et les WebSockets. Les WebSockets maintiennent une connexion TCP bidirectionnelle permanente mais demandent une infrastructure serveur dédiée (gestion des connexions persistantes, proxy WebSocket, cluster Redis). Pour une tâche unitaire qui dure 5 secondes, le Short Polling toutes les 2 secondes est extrêmement simple, robuste, et ne consomme quasiment aucune ressource serveur.

---
---

# ─────────────────────────────────────────────────────────────────────
# SOUS-ÉTAPE 8.5 — Historique des analyses d'un CV & Comparatif
# ─────────────────────────────────────────────────────────────────────

## 1. Objectif
À la fin de cette sous-étape :
- Tu as une **page d'historique complète** (`HistoriquePage.jsx`) qui appelle `GET /api/cv/{id}/analyses`.
- Toutes les analyses passées pour ce CV s'affichent sous forme de tableau comparatif (date, type d'audit avec ou sans offre, statut, note obtenue).
- En cliquant sur "Consulter le rapport", l'utilisateur peut réafficher l'intégralité du diagnostic sans relancer l'IA (données lues depuis la base de données).
- `App.jsx` est finalisé à 100% avec toutes ses routes branchées sur de véritables composants !

## 2. Concepts

### Réutilisation de composants
Plutôt que de réécrire l'affichage des résultats dans `HistoriquePage`, on réutilise directement le composant `<AnalyseResult analyse={...} />` créé à la sous-étape 8.4. C'est la force de la modularité de React.

### Pourquoi conserver l'historique en base de données ?
L'appel à l'API Claude a un coût financier et prend du temps. En persistant chaque analyse (`note`, `pointsForts`, `pointsFaibles`, `competences`, `recommandations`) dans la table MySQL `analyse`, l'utilisateur peut relire ses anciens rapports instantanément et gratuitement.

## 3. Instructions

### Fichiers à créer / modifier
| Fichier | Rôle |
|---------|------|
| `frontend/src/pages/HistoriquePage.jsx` | Tableau de bord de l'historique des audits |
| `frontend/src/App.jsx` | Remplacement final du dernier stub par la vraie HistoriquePage |

## 4. Code

### Fichier : `frontend/src/pages/HistoriquePage.jsx`
```jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import AnalyseResult from '../components/AnalyseResult';

export default function HistoriquePage() {
  const { id } = useParams();
  const [analyses, setAnalyses] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [analyseSelectionnee, setAnalyseSelectionnee] = useState(null);
  const [chargementDetail, setChargementDetail] = useState(false);

  useEffect(() => {
    async function chargerHistorique() {
      try {
        const res = await client.get(`/api/cv/${id}/analyses`);
        setAnalyses(res.data);
      } catch (err) {
        setErreur(err.response?.data?.erreur || "Impossible de récupérer l'historique.");
      } finally {
        setChargement(false);
      }
    }

    chargerHistorique();
  }, [id]);

  async function afficherDetails(analyseId) {
    setChargementDetail(true);
    try {
      const res = await client.get(`/api/analyse/${analyseId}`);
      setAnalyseSelectionnee(res.data);
    } catch {
      setErreur("Impossible de charger les détails de cette analyse.");
    } finally {
      setChargementDetail(false);
    }
  }

  if (chargement) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="spinner" />
        <p className="text-sm text-slate-400">Chargement de l'historique...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link to="/dashboard" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1 mb-2">
            ← Retour au Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Historique des analyses</h1>
          <p className="text-slate-400 text-sm mt-1">
            Consultez l'évolution des scores et les rapports précédents générés pour ce CV.
          </p>
        </div>
        <Link
          to={`/cv/${id}/analyse`}
          className="py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shrink-0"
        >
          + Nouvelle analyse
        </Link>
      </div>

      {erreur && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          ❌ {erreur}
        </div>
      )}

      {/* Si une analyse est sélectionnée, on affiche son rapport complet */}
      {analyseSelectionnee ? (
        <div className="space-y-6">
          <button
            onClick={() => setAnalyseSelectionnee(null)}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
          >
            ← Revenir à la liste des analyses
          </button>
          <AnalyseResult analyse={analyseSelectionnee} />
        </div>
      ) : analyses.length === 0 ? (
        <div className="text-center py-16 bg-slate-800/40 border border-slate-700/60 rounded-3xl">
          <div className="text-4xl mb-3">⏱️</div>
          <h3 className="text-lg font-semibold text-white mb-2">Aucune analyse réalisée</h3>
          <p className="text-slate-400 text-sm mb-6">
            Ce document n'a pas encore fait l'objet d'un audit par l'intelligence artificielle.
          </p>
          <Link
            to={`/cv/${id}/analyse`}
            className="inline-block py-2.5 px-6 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition"
          >
            Lancer le premier audit
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-700 bg-slate-800/60 shadow-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/60 text-xs uppercase font-semibold text-indigo-300 tracking-wider">
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Type d'audit</th>
                <th className="py-4 px-6">Statut</th>
                <th className="py-4 px-6 text-center">Score</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60 text-sm text-slate-300">
              {analyses.map((a) => {
                const date = new Intl.DateTimeFormat('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(a.creeLe));

                return (
                  <tr key={a.id} className="hover:bg-slate-700/20 transition">
                    <td className="py-4 px-6 font-medium text-white">{date}</td>
                    <td className="py-4 px-6">
                      {a.aOffre ? (
                        <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          Offre ciblée
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Généraliste</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        {a.statut}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-bold font-mono">
                      {a.note !== null ? (
                        <span className={a.note >= 70 ? 'text-emerald-400' : a.note >= 50 ? 'text-amber-400' : 'text-rose-400'}>
                          {a.note} / 100
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => afficherDetails(a.id)}
                        disabled={chargementDetail}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition"
                      >
                        Consulter le rapport
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

---

### Fichier : `frontend/src/App.jsx` (Version finale Étape 8)
Remplace l'ensemble du fichier par sa version définitive :
```jsx
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
```

## 5. Test
1. Va sur le Dashboard et clique sur **"Historique"** sur un CV ayant déjà fait l'objet d'une analyse.
2. Tu vois apparaître la liste de toutes les analyses passées avec la date, le type (offre ciblée ou généraliste) et la note.
3. Clique sur **"Consulter le rapport"** : le détail complet avec les points forts, faibles et recommandations s'affiche instantanément.
4. Clique sur "← Revenir à la liste des analyses" puis lance une "+ Nouvelle analyse".
5. Félicitations ! L'étape 8 du frontend React est entièrement achevée et connectée à ton API Symfony 7.4 !

## 6. Questions d'entretien

**Q1 : Comment sécuriser une route comme `GET /api/cv/{id}/analyses` côté backend contre les failles IDOR (Insecure Direct Object Reference) ?**
→ Une faille IDOR permettrait à un utilisateur d'accéder aux analyses d'un autre utilisateur simplement en changeant l'ID dans l'URL (`/api/cv/42/analyses`). Dans notre `CvController`, nous vérifions systématiquement :
```php
if ($cv->getProprietaire()?->getId() !== $user->getId()) {
    return $this->json(['erreur' => 'Accès refusé.'], Response::HTTP_FORBIDDEN); // 403
}
```
Si le CV n'appartient pas à l'utilisateur connecté extrait du JWT, Symfony bloque immédiatement la requête avec un code 403 Forbidden.

**Q2 : Pourquoi utiliser `Intl.DateTimeFormat` côté client plutôt que de recevoir une chaîne pré-formatée depuis le serveur ?**
→ Le serveur doit toujours renvoyer des dates standardisées au format ISO-8601 (ATOM : `2026-10-13T10:00:00+00:00`) pour être neutre vis-à-vis des fuseaux horaires. Le client utilise `Intl.DateTimeFormat` pour formater la date selon les préférences linguistiques (`fr-FR`) et le fuseau horaire local du navigateur de l'utilisateur.

---

---

# ─────────────────────────────────────────────────────────────────────
# ⚠️ PIÈGES COURANTS — RÉFÉRENCE RAPIDE
# ─────────────────────────────────────────────────────────────────────

| Symptôme | Cause | Solution |
|----------|-------|----------|
| `401` sur `/api/connexion` avec les bons identifiants | Tu envoies `"password"` au lieu de `"motDePasse"` | Vérifie le body JSON |
| `ERR_CERT_AUTHORITY_INVALID` dans le navigateur | Certificat SSL auto-signé | Visite `https://127.0.0.1:8000` et accepte |
| `CORS error` dans la console | Le frontend tourne sur un port inattendu | Vérifie `CORS_ALLOW_ORIGIN` dans `.env` backend |
| Flash de Login au rechargement | Pas de state `chargement` dans AuthContext | Déjà corrigé dans notre code ✅ |
| Page blanche sans erreur | Import manquant ou fichier mal nommé | Vérifie les chemins d'import dans App.jsx |
