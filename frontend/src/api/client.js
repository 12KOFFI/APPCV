// À remplir : configuration du client HTTP avec base URL et intercepteur JWT
import axios from 'axios';


const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config; 
});


client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      if (token) {
        // Le token existait mais le serveur l'a refusé = il a expiré
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      // Si pas de token, c'est normal (ex: mauvais mot de passe sur /api/connexion)
      // → on ne redirige PAS, on laisse le composant gérer l'erreur
    }
    return Promise.reject(error);  // On propage l'erreur au composant appelant
  }
);

export default client;
