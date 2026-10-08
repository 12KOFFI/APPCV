import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [sante, setSante] = useState(null)
  const [erreur, setErreur] = useState(null)

  useEffect(() => {
    const controleur = new AbortController()

    fetch(`${API_URL}/api/sante`, { signal: controleur.signal })
      .then((reponse) => {
        if (!reponse.ok) {
          throw new Error(`Erreur HTTP ${reponse.status}`)
        }
        return reponse.json()
      })
      .then((donnees) => setSante(donnees))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setErreur(err.message)
        }
      })

    return () => controleur.abort()
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Analyseur de CV</h1>

        {erreur && <p className="text-red-600">❌ {erreur}</p>}
        {!erreur && !sante && <p className="text-slate-500">Connexion à l'API…</p>}
        {sante && <p className="text-green-600">✅ {sante.message}</p>}
      </div>
    </main>
  )
}

export default App
