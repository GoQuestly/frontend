export default {
    common: {
        login: 'Login',
        email: 'Email',
        logout: 'Logout',
        register: 'Register',
        password: 'Password',
        name: 'Name',
        emailPlaceholder: 'Enter your email',
        passwordPlaceholder: 'Enter your password',
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
        },
        login: {
            title: 'Welcome to',
            brand: 'GoQuestly',
            forgotPassword: 'Forgot Password?',
            loginButton: 'Login',
            loggingIn: 'Logging in...',
            googleLogin: 'Sign in with Google',
            errors: {
                failed: 'Login Failed',
                invalidCredentials: 'Invalid email or password.',
            },
        },
        register: {
            title: 'GoQuestly',
            subtitle: 'Create and manage interactive quests',
            namePlaceholder: 'Name',
            confirmPasswordPlaceholder: 'Confirm Password',
            registerButton: 'Register',
            registering: 'Registering...',
            googleRegister: 'Sign up with Google',
            alreadyHaveAccount: 'Already have an account?',
            errors: {
                failed: 'Registration Failed',
                emailExists: 'Email already registered.',
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
                couldNotResend: 'Could not resend code. Please try again.',
                codeExpired: 'Verification code expired.',
                codeInvalid: 'Invalid verification code.',
            },
        },
        resetPassword: {
            title: 'Reset password',
            sendButton: 'Send reset link',
            sending: 'Sending...',
            backToLogin: 'Back to Login',
            successMessage: 'Reset link has been sent to your email',
            errors: {
                failed: 'Request Failed',
                emailNotFound: 'Email not found',
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
                samePassword: 'New password must be different from the current password',
                invalidToken: 'Invalid or expired reset link',
                invalidPassword: 'Invalid password format',
            },
        },
        error: {
            title: 'Authentication Error',
            default: 'An authentication error occurred.',
            authRequired: 'Authentication required. Please log in to access this page.',
        },
    },
    myQuests: {
        title: 'My Quests',
        newQuest: 'New Quest',
        searchPlaceholder: 'Search quests...',
        loading: 'Loading quests...',
        emptyState: {
            title: 'No Quests Here Yet',
            subtitle: "It looks like you haven't created any quests. Let's change that!"
        },
        noDescription: 'No description yet. Add one to entice your players!',
        checkpoints: 'Checkpoints',
        duration: {
            min: 'min',
            hr: 'hr'
        },
        last: 'Last',
        next: 'Next',
        noSessionData: 'No session data available yet.',
    },
    profile: {
        title: 'Edit profile',
        subtitle: 'Manage your account details',
        changePhoto: 'Change Photo',
        uploading: 'Uploading...',
        fileInfo: 'JPG, PNG or WEBP, up to 5MB',
        fullName: 'Full Name',
        fullNamePlaceholder: 'Enter your name',
        cancel: 'Cancel',
        saveChanges: 'Save Changes',
        saving: 'Saving...',
        success: {
            updated: 'Profile updated successfully',
            avatarUpdated: 'Photo updated successfully',
        },
        errors: {
            failed: 'Update Failed',
            noChanges: 'No changes to save',
            loadFailed: 'Failed to load profile data',
            uploadFailed: 'Failed to upload photo',
            updateFailed: 'Failed to update profile',
            avatarTooLarge: 'Photo must be less than 5MB',
            avatarInvalidType: 'Only JPG, PNG and WEBP formats are allowed',
        },
    },
    navigation: {
        myquests: 'My Quests',
        profile: 'Profile'
    },
    notFound: {
        message: 'Sorry, the page you are looking for could not be found.',
    },
    footer: {
        copyright: 'GoQuestly ©2025',
    },
    errors: {
        sessionExpired: 'Your session has expired. Please log in again.',
        invalidEmail: 'Please enter a valid email address',
        passwordTooShort: 'Password must be at least 4 characters long',
        passwordMismatch: 'Passwords do not match',
        generalFailed: 'Request Failed',
        general: 'An error occurred. Please try again.',
    }
};