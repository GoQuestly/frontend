import type { User } from '@/types/user.ts';

export const getAccessToken = (): string | null => {
    return localStorage.getItem('accessToken');
};

export const setAccessToken = (token: string): void => {
    localStorage.setItem('accessToken', token);
};

export const removeAccessToken = (): void => {
    localStorage.removeItem('accessToken');
};

export const getUser = (): User | null => {
    const userString = localStorage.getItem('user');
    if (!userString) return null;
    try {
        return JSON.parse(userString);
    } catch {
        return null;
    }
};

export const setUser = (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
};

export const removeUser = (): void => {
    localStorage.removeItem('user');
};

export const clearAuth = (): void => {
    removeAccessToken();
    removeUser();
};

export const isValidToken = (token: string | null): boolean => {
    return !!token && token !== 'null' && token !== 'undefined' && token.trim() !== '';
};