// Centralized Axios config(Base URL, Interceptors)
// src/api/axiosInstance.js
import axios from 'axios';

const API = axios.create({
    baseURL: 'http://127.0.0.1:8000/',
    timeout: 5000,
    withCredentials: true,
});

// // Automatically attach JWT token if it exists
// API.interceptors.request.use((config) => {
//     (response) => response,
//     async (error) => {
//         const original_request = error.config;
//         if (error.response?.status === 401 && !original_request._retry) {
//             original_request._retry = true;
//             try {
//                 await refresh_token();
//                 return axios(original_request);
//             } catch (refreshError) {
//                 window.location.href = '/login'
//                 return Promise.reject(refreshError)
//             }
//         }
//         return Promise.reject(error);

//     }
// });

export default API;