import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAccessToken, getUser, clearAuth } from '@/utils/storage';
import { isValidToken } from "@/utils/validation.ts";
import type { User } from '@/types/user';

const token = ref<string | null>(getAccessToken());
const currentUser = ref<User | null>(getUser());

const updateAuthState = () => {
    token.value = getAccessToken();
    currentUser.value = getUser();
};

const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'accessToken' || e.key === 'user' || e.key === null) {
        updateAuthState();
    }
};

const handleLocalStorageChange = () => {
    updateAuthState();
};

export const useAuth = () => {
    const router = useRouter();

    onMounted(() => {
        updateAuthState();
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('local-storage-change', handleLocalStorageChange);
    });

    onUnmounted(() => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('local-storage-change', handleLocalStorageChange);
    });

    const isAuthenticated = computed(() => isValidToken(token.value));

    const isVerified = computed(() => currentUser.value?.is_verified ?? false);

    const logout = async (): Promise<void> => {
        clearAuth();
        localStorage.removeItem('createQuestDraft');
        token.value = null;
        currentUser.value = null;
        await router.replace('/login');
    };

    return {
        token,
        isAuthenticated,
        currentUser,
        isVerified,
        logout,
        updateAuthState,
    };
};