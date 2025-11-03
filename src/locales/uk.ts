export default {
    common: {
        login: 'Вхід',
        email: 'Електронна пошта',
        logout: 'Вийти',
        register: 'Реєстрація',
        password: 'Пароль',
        name: "Ім'я",
        emailPlaceholder: 'Введіть вашу електронну пошту',
        passwordPlaceholder: 'Введіть ваш пароль',
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
        },
        login: {
            title: 'Ласкаво просимо до',
            brand: 'GoQuestly',
            forgotPassword: 'Забули пароль?',
            loginButton: 'Увійти',
            loggingIn: 'Вхід...',
            googleLogin: 'Увійти через Google',
            errors: {
                failed: 'Помилка входу',
                invalidCredentials: 'Невірна електронна пошта або пароль.',
            },
        },
        register: {
            title: 'GoQuestly',
            subtitle: 'Створюйте та керуйте інтерактивними квестами',
            confirmPasswordPlaceholder: 'Підтвердіть пароль',
            registering: 'Реєстрація...',
            googleRegister: 'Зареєструватися через Google',
            alreadyHaveAccount: 'Вже є акаунт?',
            errors: {
                failed: 'Помилка реєстрації',
                emailExists: 'Електронна пошта вже зареєстрована.',
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
                couldNotResend: 'Не вдалося надіслати код повторно. Спробуйте ще раз.',
                codeExpired: 'Код верифікації закінчився.',
                codeInvalid: 'Невірний код верифікації.',
            },
        },
        resetPassword: {
            title: 'Скидання пароля',
            sendButton: 'Надіслати посилання для скидання',
            sending: 'Надсилання...',
            backToLogin: 'Повернутися до входу',
            successMessage: 'Посилання для скидання паролю надіслано на вашу пошту',
            errors: {
                failed: 'Помилка запиту',
                emailNotFound: 'Електронну пошту не знайдено',
                tooManyAttempts: 'Забагато спроб. Спробуйте пізніше',
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
                samePassword: 'Новий пароль має відрізнятися від поточного пароля',
                invalidToken: 'Недійсне або застаріле посилання для скидання',
                invalidPassword: 'Невірний формат пароля',
            },
        },
        error: {
            title: 'Помилка автентифікації',
            default: 'Сталася помилка автентифікації.',
            authRequired: 'Необхідна автентифікація. Будь ласка, увійдіть, щоб отримати доступ до цієї сторінки.',
        },
    },
    myQuests: {
        title: 'Мої Квести',
        newQuest: 'Новий Квест',
        searchPlaceholder: 'Пошук квестів...',
        loading: 'Завантаження квестів...',
        emptyState: {
            title: 'Тут Ще Немає Квестів',
            subtitle: 'Схоже, ви ще не створили жодного квесту. Давайте це виправимо!'
        },
        noDescription: 'Опису ще немає. Додайте його, щоб зацікавити гравців!',
        checkpoints: 'Контрольні точки',
        duration: {
            min: 'хв',
            hr: 'год'
        },
        last: 'Остання',
        next: 'Наступна',
        noSessionData: 'Дані про сесії ще недоступні.',
    },
    profile: {
        title: 'Редагувати профіль',
        subtitle: 'Керуйте деталями вашого облікового запису',
        changePhoto: 'Змінити фото',
        uploading: 'Завантаження...',
        fileInfo: 'JPG, PNG або WEBP, до 5МБ',
        fullNamePlaceholder: "Введіть ваше ім'я",
        cancel: 'Скасувати',
        saveChanges: 'Зберегти зміни',
        saving: 'Збереження...',
        success: {
            updated: 'Профіль успішно оновлено',
            avatarUpdated: 'Фото успішно оновлено',
        },
        errors: {
            failed: 'Помилка оновлення',
            noChanges: 'Немає змін для збереження',
            loadFailed: 'Не вдалося завантажити дані профілю',
            uploadFailed: 'Не вдалося завантажити фото',
            updateFailed: 'Не вдалося оновити профіль',
            avatarTooLarge: 'Розмір фото має бути менше 5МБ',
            avatarInvalidType: 'Дозволені лише формати JPG, PNG та WEBP',
        },
    },
    navigation: {
        myquests: 'Мої Квести',
        profile: 'Профіль'
    },
    notFound: {
        message: 'На жаль, сторінку, яку ви шукаєте, не знайдено.',
    },
    footer: {
        copyright: 'GoQuestly ©2025',
    },
    errors: {
        sessionExpired: 'Ваша сесія закінчилася. Будь ласка, увійдіть знову.',
        invalidEmail: 'Будь ласка, введіть коректну електронну пошту',
        passwordTooShort: 'Пароль повинен містити щонайменше 4 символи',
        passwordMismatch: 'Паролі не співпадають',
        generalFailed: 'Помилка запиту',
        general: 'Виникла помилка. Спробуйте ще раз.',
    }
};