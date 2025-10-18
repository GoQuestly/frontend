import type { Router } from 'vue-router';
import { authApi } from '@/api/authApi';
import { setAccessToken, setUser } from '@/utils/storage';
import { nextTick } from 'vue';

export interface RegisterFormState {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    errorKey: string;
    isLoading: boolean;
}

export const MIN_PASSWORD_LENGTH = 4;

export const createInitialState = (): RegisterFormState => ({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    errorKey: '',
    isLoading: false
});

export const getTranslatedErrorMessage = (
    errorKey: string,
    t: (key: string) => string
): string => {
    if (!errorKey) return '';
    const [mainKey, detailKey] = errorKey.split('|');
    return `${t(mainKey)}\n${t(detailKey)}`;
};

export const handleRegisterLogic = async (
    state: RegisterFormState,
    router: Router
): Promise<void> => {
    state.errorKey = '';

    if (state.password.length < MIN_PASSWORD_LENGTH) {
        state.errorKey = 'auth.register.errors.failed|auth.register.errors.passwordTooShort';
        return;
    }

    if (state.password !== state.confirmPassword) {
        state.errorKey = 'auth.register.errors.failed|auth.register.errors.passwordMismatch';
        return;
    }

    state.isLoading = true;

    try {
        const response = await authApi.register({
            email: state.email,
            name: state.name,
            password: state.password,
        });

        setAccessToken(response.access_token);
        setUser(response.user);

        await nextTick();
        await router.replace('/verify-email');
    } catch (error: any) {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        if (status === 400 || status === 409) {
            if (message && message.toLowerCase().includes('email already registered')) {
                state.errorKey = 'auth.register.errors.failed|auth.register.errors.emailExists';
            } else {
                state.errorKey = 'auth.register.errors.failed|auth.register.errors.general';
            }
        } else {
            state.errorKey = 'auth.register.errors.failed|auth.register.errors.general';
        }
    } finally {
        state.isLoading = false;
    }
};

export const handleGoogleRegisterLogic = async (
    setErrorKey: (key: string) => void
): Promise<void> => {
    try {
        const { url } = await authApi.getGoogleAuthUrl();
        window.location.href = url;
    } catch (error) {
        setErrorKey('auth.register.errors.failed|auth.register.errors.general');
    }
};

export const goToLoginLogic = (router: Router): void => {
    router.replace('/login');
};