import type { Router } from 'vue-router';
import { authApi } from '@/api/authApi';
import { getTranslatedErrorMessage, createErrorKey, handleUnauthorizedError } from '@/utils/errors';
import { validateCode } from '@/utils/validation';
import { calculateSecondsUntil } from '@/utils/auth';
import { getUser, setUser } from '@/utils/storage';

export interface VerifyEmailFormState {
    code: string;
    errorKey: string;
    canResend: boolean;
    isLoading: boolean;
    isResending: boolean;
    timerDuration: number;
}

const ERROR_PREFIX = 'auth.verifyEmail';
const CODE_LENGTH = 6;

const updateUserVerificationStatus = (isVerified: boolean): void => {
    const user = getUser();
    if (user) {
        user.is_verified = isVerified;
        setUser(user);
    }
};

export const createInitialVerifyState = (): VerifyEmailFormState => ({
    code: '',
    errorKey: '',
    canResend: false,
    isLoading: false,
    isResending: false,
    timerDuration: 0
});

export { getTranslatedErrorMessage };

export const fetchVerificationStatusLogic = async (
    state: VerifyEmailFormState,
    router: Router,
    timerRef: InstanceType<any> | null
): Promise<void> => {
    try {
        const status = await authApi.getVerificationStatus();

        if (status.is_verified) {
            updateUserVerificationStatus(true);
            await router.replace('/my-quests');
            return;
        }

        if (status.can_resend_code) {
            await handleResendCodeLogic(state, router, timerRef);
            return;
        }

        if (status.can_resend_at) {
            const secondsUntilResend = calculateSecondsUntil(
                status.can_resend_at,
                status.server_time
            );
            state.timerDuration = Math.max(0, secondsUntilResend);
            state.canResend = secondsUntilResend <= 0;
        }
    } catch (error: any) {
        await handleUnauthorizedError(error, router);
    }
};

export const handleResendCodeLogic = async (
    state: VerifyEmailFormState,
    router: Router,
    timerRef: InstanceType<any> | null,
): Promise<void> => {
    state.errorKey = '';
    state.isResending = true;

    try {
        const response = await authApi.resendVerification();
        state.timerDuration = calculateSecondsUntil(
            response.can_resend_at,
            response.server_time
        );
        state.canResend = false;

        if (timerRef) {
            setTimeout(() => timerRef.reset(), 50);
        }
    } catch (error: any) {
        const isHandled = await handleUnauthorizedError(error, router);
        if (!isHandled) {
            state.errorKey = createErrorKey(ERROR_PREFIX, 'couldNotResend');
        }
    } finally {
        state.isResending = false;
    }
};

export const handleVerifyLogic = async (
    state: VerifyEmailFormState,
    router: Router
): Promise<void> => {
    state.errorKey = '';

    const codeError = validateCode(state.code, CODE_LENGTH);
    if (codeError) {
        state.errorKey = createErrorKey(ERROR_PREFIX, codeError);
        return;
    }

    state.isLoading = true;

    try {
        await authApi.verifyEmail(state.code);
        updateUserVerificationStatus(true);
        await router.replace('/home');
    } catch (error: any) {
        const isHandled = await handleUnauthorizedError(error, router);
        if (!isHandled) {
            const errorMessage = error.response?.data?.message;
            if (errorMessage?.toLowerCase().includes('expired')) {
                state.errorKey = createErrorKey(ERROR_PREFIX, 'codeExpired');
                state.canResend = true;
            } else if (errorMessage?.toLowerCase().includes('invalid')) {
                state.errorKey = createErrorKey(ERROR_PREFIX, 'codeInvalid');
            } else {
                state.errorKey = createErrorKey(ERROR_PREFIX, 'failed');
            }
        }
    } finally {
        state.isLoading = false;
    }
};