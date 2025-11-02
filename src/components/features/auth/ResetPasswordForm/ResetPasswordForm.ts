import { isValidEmail } from '@/utils/validation';
import { getTranslatedErrorMessage, createErrorKey } from '@/utils/errors';
import { authApi } from '@/api/authApi';

export interface ResetPasswordState {
    email: string;
    errorKey: string;
    isLoading: boolean;
    isSuccess: boolean;
}

const ERROR_PREFIX = 'auth.resetPassword';

export const createInitialResetPasswordState = (): ResetPasswordState => ({
    email: '',
    errorKey: '',
    isLoading: false,
    isSuccess: false
});

export { getTranslatedErrorMessage };

export const handleResetPasswordLogic = async (
    state: ResetPasswordState,
): Promise<void> => {
    state.errorKey = '';
    state.isSuccess = false;

    if (!isValidEmail(state.email)) {
        state.errorKey = createErrorKey(ERROR_PREFIX, 'invalidEmail');
        return;
    }

    state.isLoading = true;

    try {
        const response = await authApi.requestPasswordReset(state.email);

        if (response.success) {
            state.isSuccess = true;
            state.email = '';
        } else {
            state.errorKey = 'errors.generalFailed|errors.general';
        }
    } catch (error: any) {
        const status = error.response?.status;

        if (status === 404) {
            state.errorKey = createErrorKey(ERROR_PREFIX, 'emailNotFound');
        } else if (status === 429) {
            state.errorKey = createErrorKey(ERROR_PREFIX, 'tooManyAttempts');
        } else {
            state.errorKey = 'errors.generalFailed|errors.general';
        }
    } finally {
        state.isLoading = false;
    }
};