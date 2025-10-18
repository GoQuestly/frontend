import { createRouter, createWebHistory } from 'vue-router';
import { getUser, isValidToken, getAccessToken, setAccessToken } from '@/utils/storage';

const router = createRouter({
    history: createWebHistory(import.meta.env.VITE_BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import('../views/HomeView/HomeView.vue'),
            meta: { requiresAuth: true, requiresVerification: true },
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView/LoginView.vue'),
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('../views/RegisterView/RegisterView.vue'),
        },
        {
            path: '/verify-email',
            name: 'verify-email',
            component: () => import('../views/VerifyEmailView/VerifyEmailView.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/auth/callback',
            name: 'auth-callback',
            component: () => import('../views/HomeView/HomeView.vue'),
            meta: { isAuthCallback: true },
        },
        {
            path: '/auth/error',
            name: 'auth-error',
            component: () => import('../views/AuthErrorView/AuthErrorView.vue'),
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'NotFound',
            component: () => import('../views/NotFoundView/NotFoundView.vue'),
        },
    ],
});

router.beforeEach((to, _from, next) => {
    const token = getAccessToken();
    const user = getUser();

    if (to.meta.isAuthCallback) {
        const callbackToken = to.query.token as string;
        if (callbackToken) {
            setAccessToken(callbackToken);
            localStorage.removeItem('pendingUserId');
            return next({ path: '/', replace: true });
        }
        return next({
            name: 'auth-error',
            query: {
                error: 'no_token',
                message: 'No authentication token received'
            },
            replace: true
        });
    }

    if ((to.name === 'login' || to.name === 'register') && isValidToken(token)) {
        return next(user && !user.is_verified
            ? { name: 'verify-email', replace: true }
            : { name: 'home', replace: true });
    }

    if (to.meta.requiresAuth && !isValidToken(token)) {
        return next({
            name: 'auth-error',
            query: {
                error: 'unauthorized',
                message: 'Authentication required. Please log in to access this page.'
            },
            replace: true
        });
    }

    if (to.meta.requiresVerification && user && !user.is_verified && to.name !== 'verify-email') {
        return next({ name: 'verify-email', replace: true });
    }

    next();
});

export default router;