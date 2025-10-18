import type { RouteLocationNormalizedLoaded } from 'vue-router';

export function getDisplayErrorMessage(
    errorMessage: string,
    t: (key: string) => string
): string {
    if (errorMessage) {
        if (errorMessage.toLowerCase().includes('authentication required')) {
            return t('auth.error.authRequired');
        }
        return errorMessage;
    }
    return t('auth.error.default');
}

export function extractErrorMessageFromRoute(route: RouteLocationNormalizedLoaded): string {
    const message = route.query.message as string;
    return message ? decodeURIComponent(message) : '';
}