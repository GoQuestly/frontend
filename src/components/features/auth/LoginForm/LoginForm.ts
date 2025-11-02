import type { Router } from 'vue-router';
import { authApi } from '@/api/authApi';
import { setAccessToken, setUser } from '@/utils/storage';
import { isValidEmail, validatePasswordLength } from '@/utils/validation';
import { getTranslatedErrorMessage, createErrorKey } from '@/utils/errors';
import { handleGoogleAuthLogic } from '@/utils/auth';

export interface LoginFormState {
    email: string;
    password: string;
    errorKey: string;
    isLoading: boolean;
}

const ERROR_PREFIX = 'auth.login';

export const createInitialLoginState = (): LoginFormState => ({
    email: '',
    password: '',
    errorKey: '',
    isLoading: false
});

export { getTranslatedErrorMessage };

export const handleLoginLogic = async (
    state: LoginFormState,
    router: Router
): Promise<void> => {
    state.errorKey = '';

    if (!isValidEmail(state.email)) {
        state.errorKey = createErrorKey(ERROR_PREFIX, 'invalidEmail');
        return;
    }

    const passwordError = validatePasswordLength(state.password);
    if (passwordError) {
        state.errorKey = createErrorKey(ERROR_PREFIX, passwordError);
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
            state.errorKey = createErrorKey(ERROR_PREFIX, 'invalidCredentials');
        } else {
            state.errorKey = 'errors.generalFailed|errors.general';
        }
    } finally {
        state.isLoading = false;
    }
};

export const handleGoogleLoginLogic = async (setErrorKey: (key: string) => void): Promise<void> => {
    await handleGoogleAuthLogic(setErrorKey, ERROR_PREFIX);
};