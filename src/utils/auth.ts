
import { authApi } from '@/api/authApi';

export const handleGoogleAuthLogic = async (
    setErrorKey: (key: string) => void,
    errorPrefix: string
): Promise<void> => {
    try {
        const { url } = await authApi.getGoogleAuthUrl();
        window.location.href = url;
    } catch (error) {
        setErrorKey(`${errorPrefix}.errors.failed|${errorPrefix}.errors.general`);
    }
};

export const calculateSecondsUntil = (targetTime: string, serverTime: string): number => {
    const target = new Date(targetTime).getTime();
    const server = new Date(serverTime).getTime();
    return Math.max(0, Math.floor((target - server) / 1000));
};

