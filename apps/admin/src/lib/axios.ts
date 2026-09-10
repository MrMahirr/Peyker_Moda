import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Staging ortamı için HTTP Basic Authentication desteği
        const basicAuthUser = import.meta.env.VITE_BASIC_AUTH_USER;
        const basicAuthPass = import.meta.env.VITE_BASIC_AUTH_PASS;

        if (basicAuthUser && basicAuthPass) {
            const basicAuthToken = btoa(`${basicAuthUser}:${basicAuthPass}`);
            config.headers['X-Basic-Auth'] = `Basic ${basicAuthToken}`;
            // XMLHttpRequest ile otomatik basic auth için
            config.withCredentials = true;
            config.auth = {
                username: basicAuthUser,
                password: basicAuthPass
            };
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // HTTP 401: Global event dispatch for session expiry (Decoupled - SOLID DIP)
        if (error.response?.status === 401) {
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        
        return Promise.reject(error);
    }
);

export default api;
