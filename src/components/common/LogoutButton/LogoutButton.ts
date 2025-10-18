import type { useAuth } from '@/composables/useAuth';

export const handleLogoutLogic = async (
    logout: ReturnType<typeof useAuth>['logout']
): Promise<void> => {
    await logout();
};