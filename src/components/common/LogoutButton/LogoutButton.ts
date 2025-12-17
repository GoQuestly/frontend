export const handleLogoutLogic = async (
    logout: () => Promise<void>
): Promise<void> => {
    await logout();
};