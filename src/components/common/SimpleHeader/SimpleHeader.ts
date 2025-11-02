import type { ComputedRef } from 'vue';
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';
import { computed } from 'vue';
import { getUser } from '@/utils/storage';
import type { User } from '@/types/user';

export const HEADER_CONFIG = {
    logoSrc: '/src/assets/images/logo.png',
    logoAlt: 'GoQuestly',
    logoText: 'GoQuestly',
    homeRoute: '/',
    myQuestsRoute: '/my-quests'
} as const;

export interface NavigationItem {
    label: string;
    route: string;
    requiresAuth: boolean;
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
    {
        label: 'My Quests',
        route: '/my-quests',
        requiresAuth: true
    }
];

export interface UserData {
    user: ComputedRef<User | null>;
    isAuthenticated: ComputedRef<boolean>;
    isLoggedIn: ComputedRef<boolean>;
    userInitial: ComputedRef<string>;
}

export const getUserData = (): UserData => {
    const user = computed(() => getUser());

    const isAuthenticated = computed(() => {
        const currentUser = user.value;
        return currentUser !== null && currentUser.is_verified;
    });

    const isLoggedIn = computed(() => {
        return user.value !== null;
    });

    const userInitial = computed(() => {
        const currentUser = user.value;
        if (!currentUser || !currentUser.name) return '?';
        return currentUser.name.charAt(0).toUpperCase();
    });

    return {
        user,
        isAuthenticated,
        isLoggedIn,
        userInitial
    };
};

export const getVisibleNavItems = (isAuthenticated: boolean): NavigationItem[] => {
    return NAVIGATION_ITEMS.filter(item =>
        !item.requiresAuth || isAuthenticated
    );
};

export const checkIsActiveRoute = (
    route: RouteLocationNormalizedLoaded,
    routePath: string
): boolean => {
    return route.path === routePath;
};

export const handleProfileNavigation = (): void => {
    // TODO: Navigate to profile page when it's ready
};

export const handleLogoNavigation = (router: Router): void => {
    router.replace('/');
};

export const handleMyQuestsNavigation = (router: Router): void => {
    router.replace('/my-quests');
};