// Модуль UI компонентов и утилит
class UIManager {
    constructor() {
        this.elements = this.initializeElements();
        this.modalContainer = null;
    }

    // Инициализация элементов DOM
    initializeElements() {
        return {
            carForm: document.getElementById('car-form'),
            identifierInput: document.getElementById('identifier-input'),
            hoursInput: document.getElementById('hours'),
            carTableBody: document.querySelector('#car-table tbody'),
            savedHoursTableBody: document.getElementById('saved-hours-table-body'),
            totalCars: document.getElementById('total-cars'),
            totalHours: document.getElementById('total-hours'),
            tableContainer: document.getElementById('table-container'),
            savedHoursContainer: document.getElementById('saved-hours-container'),
            authContainer: document.getElementById('auth-container'),
            loginForm: document.getElementById('loginForm'),
            registerForm: document.getElementById('registerForm'),
            loginContainer: document.getElementById('login-form'),
            registerContainer: document.getElementById('register-form'),
            appContent: document.getElementById('app-content'),
            logoutBtn: document.getElementById('logout-btn'),
            showRegisterBtn: document.getElementById('show-register'),
            showLoginBtn: document.getElementById('show-login'),
            userInfo: document.getElementById('user-info'),
            userEmail: document.getElementById('user-email')
        };
    }

    // Показать сообщение
    showMessage(message, isSuccess = true, duration = 3000) {
        document.querySelectorAll('.error-message, .success-message').forEach(el => el.remove());
        
        const messageDiv = document.createElement('div');
        messageDiv.className = isSuccess ? 'success-message' : 'error-message';
        messageDiv.textContent = message;
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translateX(-50%)';
        messageDiv.style.padding = '10px 20px';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.zIndex = '10000';
        messageDiv.style.backgroundColor = isSuccess ? '#4CAF50' : '#f44336';
        messageDiv.style.color = 'white';
        messageDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        messageDiv.style.maxWidth = '90%';
        messageDiv.style.wordWrap = 'break-word';
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, duration);
    }

    // Показать приложение
    showApp(userEmail) {
        this.elements.authContainer.classList.add('hidden');
        this.elements.appContent.classList.remove('hidden');
        this.elements.userInfo.classList.remove('hidden');
        this.elements.userEmail.textContent = userEmail;
    }

    // Показать форму аутентификации
    showAuth() {
        this.elements.authContainer.classList.remove('hidden');
        this.elements.appContent.classList.add('hidden');
        this.elements.userInfo.classList.add('hidden');
        this.elements.userEmail.textContent = '';
        this.showLogin();
    }

    // Показать форму входа
    showLogin() {
        this.elements.registerContainer.classList.add('hidden');
        this.elements.loginContainer.classList.remove('hidden');
    }

    // Показать форму регистрации
    showRegister() {
        this.elements.loginContainer.classList.add('hidden');
        this.elements.registerContainer.classList.remove('hidden');
    }

    // Модальное окно подтверждения
    showConfirmDialog(message, onConfirm, onCancel = null) {
        if (this.modalContainer) {
            this.modalContainer.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Подтверждение</h3>
                <p>${message}</p>
                <div class="modal-actions">
                    <button class="modal-btn modal-btn-confirm">Да</button>
                    <button class="modal-btn modal-btn-cancel">Отмена</button>
                </div>
            </div>
        `;

        const confirmBtn = modal.querySelector('.modal-btn-confirm');
        const cancelBtn = modal.querySelector('.modal-btn-cancel');

        confirmBtn.addEventListener('click', () => {
            modal.remove();
            if (onConfirm) onConfirm();
        });

        cancelBtn.addEventListener('click', () => {
            modal.remove();
            if (onCancel) onCancel();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                if (onCancel) onCancel();
            }
        });

        document.body.appendChild(modal);
        this.modalContainer = modal;
    }

    // Модальное окно редактирования
    showEditDialog(currentHours, onSave, onCancel = null) {
        if (this.modalContainer) {
            this.modalContainer.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content modal-edit">
                <h3>Редактировать нормо-часы</h3>
                <div class="modal-form-group">
                    <label for="edit-hours">Нормо-часы:</label>
                    <input type="number" 
                           id="edit-hours" 
                           min="0.1" 
                           max="24" 
                           step="0.1" 
                           value="${currentHours}"
                           required>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn modal-btn-confirm">Сохранить</button>
                    <button class="modal-btn modal-btn-cancel">Отмена</button>
                </div>
            </div>
        `;

        const hoursInput = modal.querySelector('#edit-hours');
        const saveBtn = modal.querySelector('.modal-btn-confirm');
        const cancelBtn = modal.querySelector('.modal-btn-cancel');

        hoursInput.focus();
        hoursInput.select();

        saveBtn.addEventListener('click', () => {
            const newHours = parseFloat(hoursInput.value);
            if (!isNaN(newHours) && newHours >= 0.1 && newHours <= 24) {
                modal.remove();
                if (onSave) onSave(newHours);
            } else {
                hoursInput.setCustomValidity('Диапазон: 0.1-24');
                hoursInput.reportValidity();
            }
        });

        cancelBtn.addEventListener('click', () => {
            modal.remove();
            if (onCancel) onCancel();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                if (onCancel) onCancel();
            }
        });

        // Закрытие по Escape
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escapeHandler);
                if (onCancel) onCancel();
            }
        };
        document.addEventListener('keydown', escapeHandler);

        document.body.appendChild(modal);
        this.modalContainer = modal;
    }

    // Прогресс бар для PDF
    showProgressBar(message = 'Экспорт PDF...') {
        if (this.modalContainer) {
            this.modalContainer.remove();
        }

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content modal-progress">
                <h3>${message}</h3>
                <div class="progress-bar-container">
                    <div class="progress-bar">
                        <div class="progress-bar-fill"></div>
                    </div>
                </div>
                <p class="progress-text">0%</p>
            </div>
        `;

        document.body.appendChild(modal);
        this.modalContainer = modal;

        return {
            update: (percent) => {
                const fill = modal.querySelector('.progress-bar-fill');
                const text = modal.querySelector('.progress-text');
                if (fill) fill.style.width = `${percent}%`;
                if (text) text.textContent = `${Math.round(percent)}%`;
            },
            close: () => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }
        };
    }

    // Обновить статистику
    updateStats(repairsData, currentDate) {
        const todayRepairs = repairsData.filter(repair => repair.date === currentDate);
        const totalCars = todayRepairs.length;
        const totalHours = todayRepairs.reduce((sum, repair) => sum + repair.hours, 0);
        
        this.elements.totalCars.textContent = totalCars;
        this.elements.totalHours.textContent = totalHours.toFixed(1);
    }

    // Очистить форму
    resetForm() {
        if (this.elements.carForm) {
            this.elements.carForm.reset();
            this.elements.identifierInput.classList.remove('valid', 'invalid');
        }
    }

    // Валидация поля (визуальная)
    setFieldValidation(field, isValid) {
        field.classList.remove('valid', 'invalid');
        if (isValid !== null) {
            field.classList.add(isValid ? 'valid' : 'invalid');
        }
    }

    // Получить элементы
    getElements() {
        return this.elements;
    }
}

