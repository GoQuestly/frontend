import type {Router} from 'vue-router';
import {clearAuth, getUser, setUser} from '@/utils/storage';
import {authApi} from '@/api/authApi';

export interface VerifyEmailFormState {
    code: string;
    errorKey: string;
    canResend: boolean;
    isLoading: boolean;
    isResending: boolean;
    timerDuration: number;
}

export const CODE_LENGTH = 6;

export const createInitialState = (): VerifyEmailFormState => ({
    code: '',
    errorKey: '',
    canResend: false,
    isLoading: false,
    isResending: false,
    timerDuration: 0
});

export const getTranslatedErrorMessage = (
    errorKey: string,
    t: (key: string) => string
): string => {
    if (!errorKey) return '';
    const [mainKey, detailKey] = errorKey.split('|');
    return `${t(mainKey)}\n${t(detailKey)}`;
};

export const calculateSecondsUntil = (targetTime: string, serverTime: string): number => {
    const target = new Date(targetTime).getTime();
    const server = new Date(serverTime).getTime();
    const difference = Math.floor((target - server) / 1000);
    return Math.max(0, difference);
};

export const fetchVerificationStatusLogic = async (
    state: VerifyEmailFormState,
    router: Router,
    timerRef: InstanceType<any> | null
): Promise<void> => {
    try {
        const status = await authApi.getVerificationStatus();

        if (status.is_verified) {
            const user = getUser();
            if (user) {
                user.is_verified = true;
                setUser(user);
            }
            await router.replace('/');
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
            state.timerDuration = secondsUntilResend;
            state.canResend = secondsUntilResend === 0;
            setTimeout(() => {
                if (timerRef) timerRef.reset();
            }, 50);
        }
    } catch (error: any) {
        if (error.response?.status === 401) {
            clearAuth();
            await router.replace({
                name: 'auth-error',
                query: {
                    error: 'unauthorized',
                    message: 'Your session has expired. Please log in again.'
                }
            });
        }
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
        setTimeout(() => {
            if (timerRef) timerRef.reset();
        }, 50);
    } catch (error: any) {
        if (error.response?.status === 401) {
            clearAuth();
            await router.replace({
                name: 'auth-error',
                query: {
                    error: 'unauthorized',
                    message: 'Your session has expired. Please log in again.'
                }
            });
        } else {
            state.errorKey = 'auth.verifyEmail.errors.failed|auth.verifyEmail.errors.general';
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
    if (state.code.length < CODE_LENGTH) {
        state.errorKey = 'auth.verifyEmail.errors.failed|auth.verifyEmail.errors.invalidCode';
        return;
    }
    state.isLoading = true;
    try {
        await authApi.verifyEmail(state.code);
        const user = getUser();
        if (user) {
            user.is_verified = true;
            setUser(user);
        }
        await router.replace('/');
    } catch (error: any) {
        if (error.response?.status === 401) {
            clearAuth();
            await router.replace({
                name: 'auth-error',
                query: {
                    error: 'unauthorized',
                    message: 'Your session has expired. Please log in again.'
                }
            });
        } else if (error.response?.status === 409) {
            state.errorKey = 'auth.verifyEmail.errors.failed|auth.verifyEmail.errors.codeExpired';
        } else {
            state.errorKey = 'auth.verifyEmail.errors.failed|auth.verifyEmail.errors.codeInvalid';
        }
    } finally {
        state.isLoading = false;
    }
};