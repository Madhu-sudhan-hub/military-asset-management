import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add a request interceptor to append JWT
api.interceptors.request.use(
    (config) => {
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
        if (error.response) {
            const status = error.response.status;
            if (status === 401) {
                console.error("Unauthorized! Logging out...");
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            } else if (status === 403) {
                console.error("Forbidden! Access Denied.");
                if (window.location.pathname !== '/unauthorized') {
                    window.location.href = '/unauthorized';
                }
            } else if (status >= 500) {
                console.error("Server Error:", error.response.data.message || "An unexpected error occurred");
                // Fallback handled by individual components
            }
        }
        return Promise.reject(error);
    }
);

export default api;
