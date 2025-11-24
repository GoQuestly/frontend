import { getUser, setUser } from '@/utils/storage';
import { createErrorKey, handleUnauthorizedError } from '@/utils/errors';
import { profileApi } from '@/api/profileApi';
import type { Router } from 'vue-router';
import type { User } from '@/types/user';

export interface ProfileEditState {
    name: string;
    email: string;
    avatarUrl?: string;
    originalName: string;
    originalAvatarUrl?: string;
    avatarFile?: File;
    isLoading: boolean;
    isSaving: boolean;
    isUploadingAvatar: boolean;
    error: string | null;
    successMessage: string | null;
    hasChanges: boolean;
}

const AUTO_CLEAR_MESSAGE_DELAY = 3000;

export const createInitialProfileEditState = (): ProfileEditState => {
    const user = getUser();

    return {
        name: user?.name || '',
        originalName: user?.name || '',
        email: user?.email || '',
        avatarUrl: user?.photo_url || undefined,
        originalAvatarUrl: user?.photo_url || undefined,
        avatarFile: undefined,
        isLoading: false,
        isSaving: false,
        isUploadingAvatar: false,
        error: null,
        successMessage: null,
        hasChanges: false,
    };
};

export const checkForChanges = (state: ProfileEditState): void => {
    state.hasChanges = state.name.trim() !== state.originalName;
};

export const resetChanges = (state: ProfileEditState): void => {
    state.name = state.originalName;
    state.hasChanges = false;
    state.error = null;
    state.successMessage = null;
};

const clearMessageAfterDelay = (state: ProfileEditState, messageType: 'error' | 'success'): void => {
    setTimeout(() => {
        if (messageType === 'success') {
            state.successMessage = null;
        } else {
            state.error = null;
        }
    }, AUTO_CLEAR_MESSAGE_DELAY);
};

const validateAvatarFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
        return createErrorKey('profile', 'avatarTooLarge');
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        return createErrorKey('profile', 'avatarInvalidType');
    }

    return null;
};

export const loadProfile = async (
    state: ProfileEditState,
    router: Router
): Promise<void> => {
    state.isLoading = true;
    state.error = null;

    try {
        const profile = await profileApi.getProfile();

        state.name = profile.name;
        state.originalName = profile.name;
        state.email = profile.email;
        state.avatarUrl = profile.photoUrl || undefined;
        state.originalAvatarUrl = profile.photoUrl || undefined;
        state.hasChanges = false;

        const currentUser = getUser();
        if (currentUser) {
            const updatedUser: User = {
                id: profile.userId,
                name: profile.name,
                email: profile.email,
                photo_url: profile.photoUrl || undefined,
                is_verified: profile.isEmailVerified,
            };
            setUser(updatedUser);
        }
    } catch (error: any) {

        const wasUnauthorized = await handleUnauthorizedError(error, router);
        if (!wasUnauthorized) {
            state.error = createErrorKey('profile', 'loadFailed');
        }
    } finally {
        state.isLoading = false;
    }
};

export const handleAvatarChange = async (
    state: ProfileEditState,
    file: File,
    router: Router
): Promise<void> => {
    state.error = null;
    state.successMessage = null;

    const validationError = validateAvatarFile(file);
    if (validationError) {
        state.error = validationError;
        return;
    }

    state.isUploadingAvatar = true;

    try {
        const response = await profileApi.uploadAvatar(file);

        state.avatarUrl = response.photoUrl;
        state.originalAvatarUrl = response.photoUrl;
        state.avatarFile = file;

        const currentUser = getUser();
        if (currentUser) {
            const updatedUser: User = {
                ...currentUser,
                photo_url: response.photoUrl || undefined,
            };
            setUser(updatedUser);
        }

        state.successMessage = 'profile.success.avatarUpdated';
        clearMessageAfterDelay(state, 'success');
    } catch (error: any) {

        const wasUnauthorized = await handleUnauthorizedError(error, router);
        if (!wasUnauthorized) {
            state.error = createErrorKey('profile', 'uploadFailed');
        }
    } finally {
        state.isUploadingAvatar = false;
    }
};

export const handleSaveProfile = async (
    state: ProfileEditState,
    router: Router
): Promise<void> => {
    state.error = null;
    state.successMessage = null;

    state.isSaving = true;

    try {
        const response = await profileApi.updateProfile({
            name: state.name.trim(),
        });

        const currentUser = getUser();
        if (currentUser) {
            const updatedUser: User = {
                id: response.userId,
                name: response.name,
                email: response.email,
                photo_url: response.photoUrl || currentUser.photo_url,
                is_verified: response.isEmailVerified,
            };
            setUser(updatedUser);

            state.originalName = response.name;
            state.hasChanges = false;
            state.successMessage = 'profile.success.updated';
            clearMessageAfterDelay(state, 'success');
        }
    } catch (error: any) {
        const wasUnauthorized = await handleUnauthorizedError(error, router);
        if (!wasUnauthorized) {
            state.error = createErrorKey('profile', 'updateFailed');
        }
    } finally {
        state.isSaving = false;
    }
};