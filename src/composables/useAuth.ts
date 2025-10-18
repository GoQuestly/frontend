import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { getAccessToken, getUser, clearAuth, isValidToken } from '@/utils/storage';

export const useAuth = () => {
    const router = useRouter();

    const token = computed(() => getAccessToken());

    const isAuthenticated = computed(() => isValidToken(token.value));

    const currentUser = computed(() => getUser());

    const isVerified = computed(() => currentUser.value?.is_verified ?? false);

    const logout = async (): Promise<void> => {
        clearAuth();
        await router.replace('/login');
    };

    return {
        token,
        isAuthenticated,
        currentUser,
        isVerified,
        logout,
    };
};