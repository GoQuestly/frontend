export default {
    common: {
        login: 'Вхід',
        register: 'Реєстрація',
        logout: 'Вийти',
        email: 'Електронна пошта',
        password: 'Пароль',
        name: "Ім'я",
        submit: 'Надіслати',
        cancel: 'Скасувати',
        loading: 'Завантаження...',
        error: 'Помилка',
        success: 'Успішно',
    },
    auth: {
        welcome: {
            title: 'Вітаємо у GoQuestly',
            subtitle: 'Створюйте та грайте в інтерактивні квести будь-де у світі.',
            description: 'Досліджуйте, створюйте та діліться пригодами з друзями',
            features: {
                create: {
                    title: 'Створення Квестів',
                    description: 'Створюйте власні пригоди з контрольними точками та унікальними завданнями.'
                },
                host: {
                    title: 'Проведення Сесій',
                    description: 'Запускайте та керуйте живими сесіями квестів з відстеженням у реальному часі.'
                },
                results: {
                    title: 'Перегляд Результатів',
                    description: 'Аналізуйте продуктивність та прогрес кожного гравця або групи.'
                }
            },
            startButton: 'Почати',
            copyright: '© 2025 GoQuestly. Всі права захищені.',
        },
        login: {
            title: 'Ласкаво просимо до',
            brand: 'GoQuestly',
            emailPlaceholder: 'Введіть вашу електронну пошту',
            passwordPlaceholder: 'Введіть ваш пароль',
            forgotPassword: 'Забули пароль?',
            loginButton: 'Увійти',
            loggingIn: 'Вхід...',
            registerButton: 'Реєстрація',
            googleLogin: 'Увійти через Google',
            errors: {
                failed: 'Помилка входу',
                invalidCredentials: 'Невірна електронна пошта або пароль.',
                passwordTooShort: 'Пароль повинен містити щонайменше 4 символи.',
                invalidEmail: 'Будь ласка, введіть коректну електронну пошту.',
                general: 'Сталася помилка. Спробуйте ще раз.',
            },
        },
        register: {
            title: 'GoQuestly',
            subtitle: 'Створюйте та керуйте інтерактивними квестами',
            namePlaceholder: "Ім'я",
            emailPlaceholder: 'Електронна пошта',
            passwordPlaceholder: 'Пароль',
            confirmPasswordPlaceholder: 'Підтвердіть пароль',
            registerButton: 'Зареєструватися',
            registering: 'Реєстрація...',
            googleRegister: 'Зареєструватися через Google',
            alreadyHaveAccount: 'Вже є акаунт?',
            errors: {
                failed: 'Помилка реєстрації',
                invalidEmail: 'Будь ласка, введіть коректну електронну пошту',
                passwordMismatch: 'Паролі не співпадають.',
                passwordTooShort: 'Пароль повинен містити щонайменше 4 символи.',
                emailExists: 'Електронна пошта вже зареєстрована.',
                general: 'Сталася помилка. Спробуйте ще раз.',
            },
        },
        verifyEmail: {
            title: 'Будь ласка, введіть код з вашої електронної пошти',
            resendButton: 'Надіслати код повторно',
            resending: 'Надсилання...',
            verifyButton: 'Ок',
            verifying: 'Перевірка...',
            resendSuccess: 'Код верифікації надіслано! Перевірте вашу пошту.',
            errors: {
                failed: 'Помилка верифікації',
                invalidCode: 'Будь ласка, введіть дійсний 6-значний код.',
                noUserId: 'ID користувача не знайдено. Зареєструйтеся знову.',
                couldNotResend: 'Не вдалося надіслати код повторно. Спробуйте ще раз.',
                codeExpired: 'Код верифікації закінчився.',
                codeInvalid: 'Невірний код верифікації.',
                general: 'Сталася помилка. Спробуйте ще раз.',
            },
        },
        resetPassword: {
            title: 'Скидання пароля',
            emailPlaceholder: 'Введіть вашу електронну пошту',
            sendButton: 'Надіслати посилання для скидання',
            sending: 'Надсилання...',
            backToLogin: 'Повернутися до входу',
            successMessage: 'Посилання для скидання паролю надіслано на вашу пошту',
            errors: {
                failed: 'Помилка запиту',
                emailNotFound: 'Електронну пошту не знайдено',
                invalidEmail: 'Будь ласка, введіть коректну електронну пошту',
                tooManyAttempts: 'Забагато спроб. Спробуйте пізніше',
                general: 'Виникла помилка. Спробуйте ще раз.',
            },
        },
        changePassword: {
            title: 'Зміна пароля',
            newPasswordPlaceholder: 'Новий пароль',
            confirmPasswordPlaceholder: 'Підтвердіть новий пароль',
            confirmButton: 'Підтвердити',
            confirming: 'Підтвердження...',
            backToLogin: 'Повернутися до входу',
            passwordChangedSuccess: 'Пароль успішно змінено',
            errors: {
                failed: 'Помилка зміни',
                passwordTooShort: 'Пароль має містити щонайменше 4 символа',
                passwordMismatch: 'Паролі не співпадають',
                invalidToken: 'Недійсне або застаріле посилання для скидання',
                invalidPassword: 'Невірний формат пароля',
                general: 'Виникла помилка. Спробуйте ще раз.',
            },
        },
        error: {
            title: 'Помилка автентифікації',
            default: 'Сталася помилка автентифікації.',
            authRequired: 'Необхідна автентифікація. Будь ласка, увійдіть, щоб отримати доступ до цієї сторінки.',
        },
    },
    home: {
        title: 'Ласкаво просимо до GoQuestly!',
        subtitle: 'Створюйте захопливі квести та діліться ними зі світом',
    },
    notFound: {
        message: 'На жаль, сторінку, яку ви шукаєте, не знайдено.',
    },
    footer: {
        copyright: 'GoQuestly ©2025',
    },
    errors: {
        sessionExpired: 'Ваша сесія закінчилася. Будь ласка, увійдіть знову.'
    }
};