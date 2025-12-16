import type { User } from '@/types/user';

const getItem = (key: string): string | null => localStorage.getItem(key);
const setItem = (key: string, value: string): void => {
    localStorage.setItem(key, value);
    triggerStorageUpdate();
};
const removeItem = (key: string): void => {
    localStorage.removeItem(key);
    triggerStorageUpdate();
};

const triggerStorageUpdate = (): void => {
    window.dispatchEvent(new StorageEvent('storage', {
        key: null,
        storageArea: localStorage
    }));

    window.dispatchEvent(new CustomEvent('local-storage-change'));
};

export const getAccessToken = (): string | null => getItem('accessToken');
export const setAccessToken = (token: string): void => setItem('accessToken', token);
export const removeAccessToken = (): void => removeItem('accessToken');

export const getUser = (): User | null => {
    const userString = getItem('user');
    if (!userString) return null;
    try {
        return JSON.parse(userString);
    } catch {
        return null;
    }
};

export const setUser = (user: User): void => setItem('user', JSON.stringify(user));
export const removeUser = (): void => removeItem('user');

export const getLocale = (): string => getItem('locale') || 'en';
export const setLocale = (locale: string): void => setItem('locale', locale);

export const getTheme = (): string | null => getItem('theme');
export const setTheme = (theme: 'light' | 'dark'): void => setItem('theme', theme);

export const removePendingUserId = (): void => removeItem('pendingUserId');

export const clearAuth = (): void => {
    removeAccessToken();
    removeUser();
    removePendingUserId();
};

export const getAdminToken = (): string | null => getItem('adminToken');
export const setAdminToken = (token: string): void => setItem('adminToken', token);
export const removeAdminToken = (): void => removeItem('adminToken');

export const getAdminEmail = (): string | null => getItem('adminEmail');
export const setAdminEmail = (email: string): void => setItem('adminEmail', email);
export const removeAdminEmail = (): void => removeItem('adminEmail');

export const clearAdminAuth = (): void => {
    removeAdminToken();
    removeAdminEmail();
};