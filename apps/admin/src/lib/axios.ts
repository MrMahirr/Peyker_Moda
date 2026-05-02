import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        // TODO: Add auth token to headers
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // HTTP 401 Unauthorized hatası yakalandığında sisteme global bir event fırlatıyoruz.
        // Bu sayede Axios, React'e bağımlı kalmadan "Decoupled" çalışıyor (SOLID - Dependency Inversion).
        if (error.response?.status === 401) {
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        
        return Promise.reject(error);
    }
);

export default api;
