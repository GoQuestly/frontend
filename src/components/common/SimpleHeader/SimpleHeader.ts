import type { ComputedRef, Ref } from 'vue';
import type { RouteLocationNormalizedLoaded, Router } from 'vue-router';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getUser } from '@/utils/storage';
import type { User } from '@/types/user';
import logoImage from '@/assets/images/logo.png';

export const HEADER_CONFIG = {
    logoSrc: logoImage,
    logoAlt: 'GoQuestly',
    logoText: 'GoQuestly',
    homeRoute: '/',
    myQuestsRoute: '/my-quests',
    profileEditRoute: '/profile/edit'
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
    user: Ref<User | null>;
    isAuthenticated: ComputedRef<boolean>;
    isLoggedIn: ComputedRef<boolean>;
    userInitial: ComputedRef<string>;
}

const handleStorageChange = (e: StorageEvent, user: Ref<User | null>) => {
    if (e.key === 'user' || e.key === null) {
        user.value = getUser();
    }
};

export const getUserData = (): UserData => {
    const user = ref<User | null>(getUser());

    onMounted(() => {
        user.value = getUser();
        const storageHandler = (e: StorageEvent) => handleStorageChange(e, user);
        window.addEventListener('storage', storageHandler);
    });

    onUnmounted(() => {
        const storageHandler = (e: StorageEvent) => handleStorageChange(e, user);
        window.removeEventListener('storage', storageHandler);
    });

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

export const handleProfileNavigation = (router: Router): void => {
    router.replace({ name: 'profile-edit' });
};

export const handleLogoNavigation = (router: Router): void => {
    router.replace({ name: 'welcome' });
};

export const handleMyQuestsNavigation = (router: Router): void => {
    router.replace({ name: 'my-quests' });
};