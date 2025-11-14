// Модуль аутентификации
class AuthManager {
    constructor(auth, ui) {
        this.auth = auth;
        this.ui = ui;
        this.currentUser = null;
        this.onAuthStateChangedCallback = null;
    }

    // Инициализация отслеживания состояния аутентификации
    init(callback) {
        if (!this.auth) {
            console.error('Firebase Auth not initialized');
            this.ui.showMessage('Ошибка инициализации аутентификации', false);
            return;
        }

        this.onAuthStateChangedCallback = callback;
        
        this.auth.onAuthStateChanged(user => {
            console.log('Auth state changed:', user);
            this.currentUser = user;
            if (user) {
                console.log('User logged in:', user.email, user.uid);
            } else {
                console.log('User logged out');
            }
            if (callback) callback(user);
        });
    }

    // Вход в систему
    async login(email, password) {
        try {
            const trimmedEmail = email.trim();
            const fullEmail = trimmedEmail.includes('@') ? trimmedEmail : `${trimmedEmail}@carrepair.com`;

            await this.auth.signInWithEmailAndPassword(fullEmail, password);
        } catch (error) {
            console.error('Login error:', error);
            throw this.getAuthErrorMessage(error, 'входа');
        }
    }

    // Регистрация
    async register(email, password, confirmPassword) {
        if (password !== confirmPassword) {
            throw new Error('Пароли не совпадают');
        }

        try {
            const trimmedEmail = email.trim();
            const fullEmail = trimmedEmail.includes('@') ? trimmedEmail : `${trimmedEmail}@carrepair.com`;

            await this.auth.createUserWithEmailAndPassword(fullEmail, password);
        } catch (error) {
            console.error('Registration error:', error);
            throw this.getAuthErrorMessage(error, 'регистрации');
        }
    }

    // Выход из системы
    async logout() {
        try {
            await this.auth.signOut();
            this.currentUser = null;
        } catch (error) {
            console.error('Logout error:', error);
            throw new Error('Ошибка при выходе: ' + error.message);
        }
    }

    // Получить текущего пользователя
    getCurrentUser() {
        return this.currentUser;
    }

    // Получить сообщение об ошибке
    getAuthErrorMessage(error, action) {
        const messages = {
            'auth/user-not-found': 'Пользователь не найден. Зарегистрируйтесь или проверьте email.',
            'auth/wrong-password': 'Неверный пароль. Проверьте правильность ввода.',
            'auth/invalid-email': 'Неверный формат email.',
            'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже.',
            'auth/network-request-failed': 'Ошибка сети. Проверьте интернет-соединение.',
            'auth/invalid-api-key': 'Ошибка API ключа. Проверьте конфигурацию Firebase.',
            'auth/email-already-in-use': 'Email уже используется. Попробуйте войти или используйте другой email.',
            'auth/weak-password': 'Слабый пароль. Минимум 6 символов.',
            'auth/operation-not-allowed': 'Регистрация отключена. Проверьте настройки Firebase.'
        };

        const message = messages[error.code] || `Ошибка ${action}: ${error.message}`;
        return new Error(message);
    }
}

