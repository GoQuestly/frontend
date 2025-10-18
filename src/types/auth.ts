import type { User } from './user';

export interface AuthResponse {
    access_token: string;
    user: User;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    name: string;
    password: string;
}

export interface GoogleAuthUrlResponse {
    url: string;
}

export interface VerifyEmailResponse {
    success: boolean;
    message: string;
}

export interface VerificationStatusResponse {
    is_verified: boolean;
    can_resend_code: boolean;
    can_resend_at: string | null;
    code_expires_at: string | null;
    server_time: string;
}

export interface ResendVerificationResponse {
    success: boolean;
    message: string;
    expires_at: string;
    can_resend_at: string;
    server_time: string;
}