// Centralized Axios config(Base URL, Interceptors)
import axios from 'axios';
import { refresh_token } from './apiEndpoints';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/',
    timeout: 5000,
    withCredentials: true,
});

// Track if we're currently refreshing to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Don't retry refresh endpoint itself
        if (originalRequest.url?.includes('/auth/token/refresh/')) {
            isRefreshing = false;
            return Promise.reject(error);
        }

        // Handle 401 errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(() => API(originalRequest))
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await refresh_token();
                processQueue(null);
                return API(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError);

                // Dispatch custom event for auth failure
                window.dispatchEvent(new CustomEvent('auth:logout'));

                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default API;