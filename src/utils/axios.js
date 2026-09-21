import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.10.8.219:8000/api', // Sesuaikan URL API Laravel kamu
  headers: {
    'Accept': 'application/json', // SANGAT IMPORTANT agar Laravel merespon format API
  }
});

// Otomatis tempel token di setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;