export interface UpdateProfileRequest {
    name: string;
}

export interface UpdateProfileResponse {
    userId: number;
    email: string;
    name: string;
    photoUrl: string | null;
    isEmailVerified: boolean;
}

export interface UploadAvatarResponse {
    message: string;
    photoUrl: string;
}

export interface GetProfileResponse {
    userId: number;
    email: string;
    name: string;
    photoUrl: string | null;
    isEmailVerified: boolean;
}