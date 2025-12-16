import axios from 'axios';
import { getAccessToken, clearAuth, getAdminToken, clearAdminAuth } from '@/utils/storage';

const API_URL = import.meta.env.VITE_API_URL;

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const isAdminEndpoint = config.url?.includes('/admin');

        if (isAdminEndpoint) {
            const adminToken = getAdminToken();
            if (adminToken) {
                config.headers.Authorization = `Bearer ${adminToken}`;
            }
        } else {
            const accessToken = getAccessToken();
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
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

        const isAdminLoginEndpoint = error.config?.url?.includes('/admin/login');
        const isAdminEndpoint = error.config?.url?.includes('/admin');

        if (error.response?.status === 401 && !isAuthEndpoint && !isAdminLoginEndpoint) {
            if (isAdminEndpoint) {
                clearAdminAuth();
                window.location.href = '/admin/login';
            } else {
                clearAuth();
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
