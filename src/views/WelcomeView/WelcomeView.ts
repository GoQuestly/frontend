import type { Router } from 'vue-router';
import { getAccessToken, getUser } from '@/utils/storage';
import { isValidToken } from '@/utils/validation';

export const handleWelcomeStartClick = (router: Router): void => {
    const token = getAccessToken();
    const tokenValid = isValidToken(token);
    const user = getUser();

    if (!tokenValid || !user) {
        router.push('/login');
        return;
    }

    if (!user.is_verified) {
        router.push('/verify-email');
        return;
    }

    router.push('/my-quests');
};