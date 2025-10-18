import type { Router } from 'vue-router';
import { authApi } from '@/api/authApi';
import { setAccessToken, setUser } from '@/utils/storage';

export interface LoginFormState {
    email: string;
    password: string;
    errorKey: string;
    isLoading: boolean;
}

export const MIN_PASSWORD_LENGTH = 4;

export const createInitialState = (): LoginFormState => ({
    email: '',
    password: '',
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

export const handleLoginLogic = async (
    state: LoginFormState,
    router: Router
): Promise<void> => {
    state.errorKey = '';

    if (state.password.length < MIN_PASSWORD_LENGTH) {
        state.errorKey = 'auth.login.errors.failed|auth.login.errors.passwordTooShort';
        return;
    }

    state.isLoading = true;

    try {
        const response = await authApi.login({
            email: state.email,
            password: state.password,
        });

        setAccessToken(response.access_token);
        setUser(response.user);

        await router.replace('/verify-email');
    } catch (error: any) {
        if (error.response?.status === 401) {
            state.errorKey = 'auth.login.errors.failed|auth.login.errors.invalidCredentials';
        } else {
            state.errorKey = 'auth.login.errors.failed|auth.login.errors.general';
        }
    } finally {
        state.isLoading = false;
    }
};

export const handleGoogleLoginLogic = async (
    setErrorKey: (key: string) => void
): Promise<void> => {
    try {
        const { url } = await authApi.getGoogleAuthUrl();
        window.location.href = url;
    } catch (error) {
        setErrorKey('auth.login.errors.failed|auth.login.errors.general');
    }
};

export const goToRegisterLogic = (router: Router): void => {
    router.replace('/register');
};