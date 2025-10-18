import apiClient from './apiClient';
import {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    GoogleAuthUrlResponse,
    VerifyEmailResponse,
    VerificationStatusResponse,
    ResendVerificationResponse,
    User
} from '@/types/index.ts';

const mapUserResponse = (userData: any): User => ({
    id: userData.userId ?? userData.id,
    email: userData.email,
    name: userData.name,
    is_verified: userData.isEmailVerified ?? userData.is_verified ?? false,
    photo_url: userData.photoUrl ?? userData.photo_url,
});

export const authApi = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/login', data);
        return {
            access_token: response.data.access_token,
            user: mapUserResponse(response.data.user),
        };
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await apiClient.post('/auth/register', data);
        return {
            access_token: response.data.access_token,
            user: mapUserResponse(response.data.user),
        };
    },

    getGoogleAuthUrl: async (): Promise<GoogleAuthUrlResponse> => {
        const response = await apiClient.get('/auth/google');
        return response.data;
    },

    verifyEmail: async (code: string): Promise<VerifyEmailResponse> => {
        const response = await apiClient.post('/auth/verify-email', { code });
        return response.data;
    },

    getVerificationStatus: async (): Promise<VerificationStatusResponse> => {
        const response = await apiClient.get('/auth/verification-status');
        return response.data;
    },

    resendVerification: async (): Promise<ResendVerificationResponse> => {
        const response = await apiClient.post('/auth/send-verification-code');
        return response.data;
    },
};