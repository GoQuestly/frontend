import type { RouteLocationNormalizedLoaded } from 'vue-router';


export function getDisplayErrorMessage(
    errorKey: string,
    t: (key: string) => string
): string {
    if (!errorKey) {
        return t('auth.error.default');
    }

    if (errorKey.startsWith('errors.') || errorKey.startsWith('auth.')) {
        return t(errorKey);
    }

    return errorKey;
}


export function extractErrorMessageFromRoute(route: RouteLocationNormalizedLoaded): string {
    const messageKey = route.query.messageKey as string;
    if (messageKey) {
        return messageKey;
    }

    const message = route.query.message as string;
    return message ? decodeURIComponent(message) : '';
}
