import axios from 'axios';
import { getAccessToken, clearAuth } from '@/utils/storage';

const API_URL = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const accessToken = getAccessToken();
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthEndpoint =
            error.config?.url?.includes('/auth/login') ||
            error.config?.url?.includes('/auth/register') ||
            error.config?.url?.includes('/auth/google') ||
            error.config?.url?.includes('/auth/verify-email');

        if (error.response?.status === 401 && !isAuthEndpoint) {
            clearAuth();
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default apiClient;
