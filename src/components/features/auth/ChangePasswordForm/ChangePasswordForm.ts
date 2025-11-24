import type { Router } from 'vue-router';
import { authApi } from '@/api/authApi';
import { getTranslatedErrorMessage, createErrorKey } from '@/utils/errors';
import { validatePasswordFields } from '@/utils/validation';

export interface ChangePasswordState {
    password: string;
    confirmPassword: string;
    token: string;
    errorKey: string;
    isLoading: boolean;
    isSuccess: boolean;
}

const ERROR_PREFIX = 'auth.changePassword';

export const createInitialChangePasswordState = (): ChangePasswordState => ({
    password: '',
    confirmPassword: '',
    token: '',
    errorKey: '',
    isLoading: false,
    isSuccess: false
});

export { getTranslatedErrorMessage };

export const initializeToken = (state: ChangePasswordState, token: string | null, router: Router): void => {
    if (!token)
    {
        router.replace({ name: 'NotFound' });
        return;
    }
    state.token = token;
};

export const handleChangePasswordLogic = async (
    state: ChangePasswordState,
    router: Router
): Promise<void> =>
{
    state.errorKey = '';
    state.isSuccess = false;

    const passwordError = validatePasswordFields(state.password, state.confirmPassword);
    if (passwordError)
    {
        state.errorKey = `errors.${passwordError}`;
        return;
    }

    state.isLoading = true;

    try
    {
        const response = await authApi.resetPassword(state.token, state.password);

        if (response.success)
        {
            state.isSuccess = true;
            state.password = '';
            state.confirmPassword = '';
            await router.replace('/login');
        }
        else
        {
            state.errorKey = 'errors.generalFailed|errors.general';
        }
    }
    catch (error: any)
    {
        const status = error.response?.status;
        const errorMessage = error.response?.data?.message || '';

        if (status === 401)
        {
            state.errorKey = createErrorKey(ERROR_PREFIX, 'invalidToken');
        }
        else if (status === 400)
        {
            if (errorMessage.includes('must be different from the current password'))
            {
                state.errorKey = createErrorKey(ERROR_PREFIX, 'samePassword');
            }
            else
            {
                state.errorKey = createErrorKey(ERROR_PREFIX, 'invalidPassword');
            }
        }
        else
        {
            state.errorKey = 'errors.generalFailed|errors.general';
        }
    }
    finally
    {
        state.isLoading = false;
    }
};