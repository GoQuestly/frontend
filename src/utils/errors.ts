import type { Router } from 'vue-router';
import { clearAuth } from '@/utils/storage';

export const getTranslatedErrorMessage = (
    errorKey: string,
    t: (key: string) => string
): string => {
    if (!errorKey) return '';

    if (errorKey.includes('|')) {
        const [mainKey, detailKey] = errorKey.split('|');
        return `${t(mainKey)}\n${t(detailKey)}`;
    }

    return t(errorKey);
};

export const createErrorKey = (prefix: string, errorType: string): string => {
    return `${prefix}.errors.failed|${prefix}.errors.${errorType}`;
};

export const handleUnauthorizedError = async (error: any, router: Router): Promise<boolean> => {
    if (error.response?.status === 401) {
        clearAuth();
        await router.replace({
            name: 'auth-error',
            query: {
                error: 'unauthorized',
                messageKey: 'errors.sessionExpired'
            }
        });
        return true;
    }
    return false;
};