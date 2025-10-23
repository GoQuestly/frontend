import type { Router } from 'vue-router';
import { getAccessToken, getUser } from '@/utils/storage';
import { isValidToken } from '@/utils/validation';

export const handleWelcomeStartClick = (router: Router): void => {
    const token = getAccessToken();
    const tokenValid = isValidToken(token);
    const user = getUser();

    if (!tokenValid) {
        router.replace('/login');
        return;
    }

    if (user && !user.is_verified) {
        router.replace('/verify-email');
        return;
    }

    if (tokenValid && user?.is_verified) {
        router.replace('/home');
    }
};