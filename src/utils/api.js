import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add a request interceptor
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    error => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (!error.response) {
            console.error('Network Error:', error.message);
            return Promise.reject(error);
        }

        if (error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default api; 