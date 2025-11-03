import { apiClient } from './apiClient';
import type {
    UpdateProfileRequest,
    UpdateProfileResponse,
    UploadAvatarResponse,
    GetProfileResponse
} from '@/types/profile';

export const profileApi = {
    async getProfile(): Promise<GetProfileResponse> {
        const response = await apiClient.get<GetProfileResponse>('/user/profile');
        return response.data;
    },

    async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
        const response = await apiClient.patch<UpdateProfileResponse>(
            '/user/profile',
            data
        );
        return response.data;
    },

    async uploadAvatar(file: File): Promise<UploadAvatarResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post<UploadAvatarResponse>(
            '/user/profile/avatar',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    }
};