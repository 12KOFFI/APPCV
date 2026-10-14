// À remplir : configuration du client HTTP avec base URL et intercepteur JWT
import axios from 'axios';


const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config; 
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const isConnexionUrl = error.config?.url?.includes('/api/connexion');

    if (error.response?.status === 401 && !isConnexionUrl) {
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default client;
