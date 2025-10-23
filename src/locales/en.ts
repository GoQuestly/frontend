export default {
    common: {
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        name: 'Name',
        submit: 'Submit',
        cancel: 'Cancel',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
    },
    auth: {
        welcome: {
            title: 'Welcome to GoQuestly',
            subtitle: 'Design and play interactive quests anywhere in the world.',
            description: 'Explore, create, and share adventures with your friends',
            features: {
                create: {
                    title: 'Create Quests',
                    description: 'Build custom adventures with checkpoints and unique tasks.'
                },
                host: {
                    title: 'Host Sessions',
                    description: 'Start and manage live quest sessions with real-time tracking.'
                },
                results: {
                    title: 'View Results',
                    description: 'Analyze performance and progress for each player or group.'
                }
            },
            startButton: 'Start',
            copyright: '© 2025 GoQuestly. All Rights Reserved.',
        },
        login: {
            title: 'Welcome to',
            brand: 'GoQuestly',
            emailPlaceholder: 'Enter your email',
            passwordPlaceholder: 'Enter your password',
            forgotPassword: 'Forgot Password?',
            loginButton: 'Login',
            loggingIn: 'Logging in...',
            registerButton: 'Register',
            googleLogin: 'Sign in with Google',
            errors: {
                failed: 'Login Failed',
                invalidCredentials: 'Invalid email or password.',
                passwordTooShort: 'Password must be at least 4 characters long.',
                invalidEmail: 'Please enter a valid email address.',
                general: 'An error occurred. Please try again.',
            },
        },
        register: {
            title: 'GoQuestly',
            subtitle: 'Create and manage interactive quests',
            namePlaceholder: 'Name',
            emailPlaceholder: 'Email',
            passwordPlaceholder: 'Password',
            confirmPasswordPlaceholder: 'Confirm Password',
            registerButton: 'Register',
            registering: 'Registering...',
            googleRegister: 'Sign up with Google',
            alreadyHaveAccount: 'Already have an account?',
            errors: {
                failed: 'Registration Failed',
                invalidEmail: 'Please enter a valid email address',
                passwordMismatch: 'Passwords do not match.',
                passwordTooShort: 'Password must be at least 4 characters long.',
                emailExists: 'Email already registered.',
                general: 'An error occurred. Please try again.',
            },
        },
        verifyEmail: {
            title: 'Please enter code from your email',
            resendButton: 'Resend code',
            resending: 'Sending...',
            verifyButton: 'Ok',
            verifying: 'Verifying...',
            resendSuccess: 'Verification code resent! Check your email.',
            errors: {
                failed: 'Verification Failed',
                invalidCode: 'Please enter a valid 6-digit code.',
                noUserId: 'User ID not found. Please register again.',
                couldNotResend: 'Could not resend code. Please try again.',
                codeExpired: 'Verification code expired.',
                codeInvalid: 'Invalid verification code.',
                general: 'An error occurred. Please try again.',
            },
        },
        resetPassword: {
            title: 'Reset password',
            emailPlaceholder: 'Enter your email',
            sendButton: 'Send reset link',
            sending: 'Sending...',
            backToLogin: 'Back to Login',
            successMessage: 'Reset link has been sent to your email',
            errors: {
                failed: 'Request Failed',
                emailNotFound: 'Email not found',
                invalidEmail: 'Please enter a valid email address',
                tooManyAttempts: 'Too many attempts. Please try again later',
                general: 'An error occurred. Please try again.',
            },
        },
        changePassword: {
            title: 'Change Password',
            newPasswordPlaceholder: 'New password',
            confirmPasswordPlaceholder: 'Confirm new password',
            confirmButton: 'Confirm',
            confirming: 'Confirming...',
            backToLogin: 'Back to Login',
            passwordChangedSuccess: 'Password has been successfully changed',
            errors: {
                failed: 'Change Failed',
                passwordTooShort: 'Password must be at least 4 characters long',
                passwordMismatch: 'Passwords do not match',
                invalidToken: 'Invalid or expired reset link',
                invalidPassword: 'Invalid password format',
                general: 'An error occurred. Please try again.',
            },
        },
        error: {
            title: 'Authentication Error',
            default: 'An authentication error occurred.',
            authRequired: 'Authentication required. Please log in to access this page.',
        },
    },
    home: {
        title: 'Welcome to GoQuestly!',
        subtitle: 'Create exciting quests and share them with the world',
    },
    notFound: {
        message: 'Sorry, the page you are looking for could not be found.',
    },
    footer: {
        copyright: 'GoQuestly ©2025',
    },
    errors: {
        sessionExpired: 'Your session has expired. Please log in again.'
    }
};