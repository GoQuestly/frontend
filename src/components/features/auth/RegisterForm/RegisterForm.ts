import type { Router } from 'vue-router';
import { authApi } from '@/api/authApi';
import { setAccessToken, setUser } from '@/utils/storage';
import { nextTick } from 'vue';
import { isValidEmail, validatePasswordFields } from '@/utils/validation';
import { getTranslatedErrorMessage, createErrorKey } from '@/utils/errors';
import { handleGoogleAuthLogic } from '@/utils/auth';

export interface RegisterFormState {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    errorKey: string;
    isLoading: boolean;
}

const ERROR_PREFIX = 'auth.register';

export const createInitialRegisterState = (): RegisterFormState => ({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    errorKey: '',
    isLoading: false
});

export { getTranslatedErrorMessage };

export const handleRegisterLogic = async (
    state: RegisterFormState,
    router: Router
): Promise<void> => {
    state.errorKey = '';

    if (!isValidEmail(state.email)) {
        state.errorKey = createErrorKey(ERROR_PREFIX, 'invalidEmail');
        return;
    }

    const passwordError = validatePasswordFields(state.password, state.confirmPassword);
    if (passwordError) {
        state.errorKey = createErrorKey(ERROR_PREFIX, passwordError);
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

        if ((status === 400 || status === 409) && message?.toLowerCase().includes('email already registered')) {
            state.errorKey = createErrorKey(ERROR_PREFIX, 'emailExists');
        } else {
            state.errorKey = 'errors.generalFailed|errors.general';
        }
    } finally {
        state.isLoading = false;
    }
};

export const handleGoogleRegisterLogic = async (setErrorKey: (key: string) => void): Promise<void> => {
    await handleGoogleAuthLogic(setErrorKey, ERROR_PREFIX);
};