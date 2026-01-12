// Centralized Axios config(Base URL, Interceptors)
import axios from 'axios';
import { refresh_token } from './apiEndpoints';

const API_URL = import.meta.env.VITE_API_URL

const API = axios.create({
    baseURL: API_URL,
    withCredentials: true, // send cookies automatically
    timeout: 10000, // 10 second timeout
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

        // Prevent infinite loops - skip retry for refresh endpoint, network errors, and already retried requests
        if (
            !error.response ||
            originalRequest._retry ||
            originalRequest.url.includes('/auth/token/refresh/') ||
            originalRequest.url.includes('/auth/login/') ||
            originalRequest.url.includes('/auth/register/')
        ) {
            return Promise.reject(error);
        }

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401) {
            // const hasRefresh = document.cookie
            //     .split(';')
            //     .some(c => c.trim().startsWith('refresh_token='));

            // if (!hasRefresh) {
            //     // User is NOT logged in → don't refresh → don't logout
            //     return Promise.reject(error);
            // }

            if (isRefreshing) {
                // If already refreshing, queue this request to retry after refresh completes
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
                processQueue(null); // Notify queued requests to retry
                return API(originalRequest); // Retry the original request
            } catch (refreshError) {
                processQueue(refreshError); // Reject all queued requests

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