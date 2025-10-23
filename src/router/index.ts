import { createRouter, createWebHistory } from 'vue-router';
import { getUser, getAccessToken, setAccessToken, removePendingUserId } from '@/utils/storage';
import { isValidToken } from '@/utils/validation';
import { authApi } from "@/api/authApi.ts";

const router = createRouter({
    history: createWebHistory(import.meta.env.VITE_BASE_URL),
    routes: [
        {
            path: '/',
            name: 'welcome',
            component: () => import('../views/WelcomeView/WelcomeView.vue'),
        },
        {
            path: '/home',
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
            path: '/reset-password',
            name: 'reset-password',
            component: () => import('../views/ResetPasswordView/ResetPasswordView.vue'),
        },
        {
            path: '/change-password',
            name: 'change-password',
            component: () => import('../views/ChangePasswordView/ChangePasswordView.vue'),
            beforeEnter: async (to, _from, next) => {
                const token = to.query.token as string;

                if (!token) {
                    return next({ name: 'NotFound' });
                }

                try {
                    const isValid = await authApi.verifyResetToken(token);
                    if (isValid) {
                        next();
                    } else {
                        next({ name: 'NotFound' });
                    }
                } catch (error) {
                    next({ name: 'NotFound' });
                }
            }
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
    const tokenValid = isValidToken(token);
    const user = getUser();

    if (to.meta.isAuthCallback) {
        const callbackToken = to.query.token as string;
        if (callbackToken) {
            setAccessToken(callbackToken);
            removePendingUserId();
            return next({ path: '/home', replace: true });
        }
        return next({
            name: 'auth-error',
            query: { error: 'no_token', messageKey: 'auth.error.default' },
            replace: true
        });
    }

    if ((to.name === 'login' || to.name === 'register') && tokenValid) {
        const destination = user && !user.is_verified ? 'verify-email' : 'home';
        return next({ name: destination, replace: true });
    }

    if (to.meta.requiresAuth && !tokenValid) {
        return next({
            name: 'auth-error',
            query: { error: 'unauthorized', messageKey: 'auth.error.authRequired' },
            replace: true
        });
    }

    if (to.meta.requiresVerification && user && !user.is_verified && to.name !== 'verify-email') {
        return next({ name: 'verify-email', replace: true });
    }

    next();
});

export default router;