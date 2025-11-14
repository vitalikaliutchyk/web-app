// Главный файл приложения
class CarRepairApp {
    constructor() {
        this.authManager = null;
        this.firestoreManager = null;
        this.ui = null;
        this.validationManager = null;
        this.pdfExporter = null;
        
        // Состояние приложения
        this.appState = {
            isLoading: false,
            isOnline: navigator.onLine,
            currentView: 'form',
            sortBy: 'timestamp',
            sortOrder: 'desc',
            filter: '',
            dateFilter: 'all'
        };

        // Настройки пагинации
        this.paginationConfig = {
            itemsPerPage: 20,
            currentPage: 1,
            totalPages: 1
        };
    }

    // Инициализация приложения
    async init() {
        try {
            // Проверка инициализации Firebase
            if (typeof firebase === 'undefined' || !firebase.apps.length) {
                throw new Error('Firebase не инициализирован. Проверьте config.js');
            }

            // Инициализация модулей
            this.ui = new UIManager();
            this.validationManager = new ValidationManager();
            this.authManager = new AuthManager(firebase.auth(), this.ui);
            this.firestoreManager = new FirestoreManager(firebase.firestore(), this.authManager);
            this.pdfExporter = new PDFExporter(this.ui);

            // Настройка обработчиков
            this.setupGlobalErrorHandling();
            this.bindEvents();
            this.checkMobile();
            
            // Инициализация аутентификации
            this.authManager.init((user) => {
                if (user) {
                    this.onUserLogin(user);
                } else {
                    this.onUserLogout();
                }
            });
        } catch (error) {
            console.error('Application initialization error:', error);
            this.ui.showMessage('Ошибка инициализации приложения. Попробуйте обновить страницу.', false);
        }
    }

    // Обработчик входа пользователя
    onUserLogin(user) {
        this.ui.showApp(user.email);
        this.firestoreManager.init((repairsData) => {
            this.renderAll(repairsData);
        });
    }

    // Обработчик выхода пользователя
    onUserLogout() {
        this.ui.showAuth();
        this.firestoreManager.unsubscribe();
    }

    // Глобальная обработка ошибок
    setupGlobalErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.ui.showMessage('Произошла ошибка в приложении. Попробуйте обновить страницу.', false);
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.ui.showMessage('Произошла ошибка при выполнении операции. Попробуйте позже.', false);
        });

        window.addEventListener('online', () => {
            this.appState.isOnline = true;
            this.ui.showMessage('Соединение восстановлено', true);
        });

        window.addEventListener('offline', () => {
            this.appState.isOnline = false;
            this.ui.showMessage('Нет подключения к интернету', false);
        });
    }

    // Привязка событий
    bindEvents() {
        const elements = this.ui.getElements();

        // Форма добавления записи
        if (elements.carForm) {
            elements.carForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Валидация в реальном времени
        if (elements.identifierInput) {
            elements.identifierInput.addEventListener('input', () => this.handleIdentifierInput());
        }

        if (elements.hoursInput) {
            elements.hoursInput.addEventListener('input', () => this.handleHoursInput());
        }

        // Аутентификация
        if (elements.loginForm) {
            elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        if (elements.registerForm) {
            elements.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        if (elements.showRegisterBtn) {
            elements.showRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.ui.showRegister();
            });
        }

        if (elements.showLoginBtn) {
            elements.showLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.ui.showLogin();
            });
        }

        if (elements.logoutBtn) {
            elements.logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Поиск и фильтрация
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');
        const sortSelect = document.getElementById('sort-select');
        const dateFilter = document.getElementById('date-filter');
        const prevPageBtn = document.getElementById('prev-page');
        const nextPageBtn = document.getElementById('next-page');

        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => this.handleSearch(), 300));
            if (searchBtn) {
                searchBtn.addEventListener('click', () => this.handleSearch());
            }
        }

        if (sortSelect) {
            sortSelect.addEventListener('change', () => this.handleSort());
        }

        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.handleDateFilter());
        }

        if (prevPageBtn && nextPageBtn) {
            prevPageBtn.addEventListener('click', () => this.changePage(-1));
            nextPageBtn.addEventListener('click', () => this.changePage(1));
        }

        // FAB меню
        document.querySelectorAll('.fab-item').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleFabAction(action);
                toggleFabMenu();
            });
        });

        // Действия с таблицей
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete')) {
                this.handleDelete(e);
            } else if (e.target.classList.contains('edit')) {
                this.handleEdit(e);
            }
        });

        window.addEventListener('resize', () => this.checkMobile());
    }

    // Debounce функция
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Обработка ввода идентификатора
    handleIdentifierInput() {
        const elements = this.ui.getElements();
        const type = document.getElementById('identifier-type').value;
        const value = elements.identifierInput.value;

        const validation = this.validationManager.validateIdentifier(value, type);
        elements.identifierInput.value = validation.value;
        this.ui.setFieldValidation(elements.identifierInput, validation.isValid);
    }

    // Обработка ввода часов
    handleHoursInput() {
        const elements = this.ui.getElements();
        const validation = this.validationManager.validateHours(elements.hoursInput.value);
        this.ui.setFieldValidation(elements.hoursInput, validation.isValid);
    }

    // Обработка отправки формы
    async handleFormSubmit(e) {
        e.preventDefault();
        
        const elements = this.ui.getElements();
        if (!elements.carForm.checkValidity()) {
            elements.carForm.reportValidity();
            return;
        }

        const identifierType = document.getElementById('identifier-type').value;
        const identifier = elements.identifierInput.value.trim().toUpperCase();
        const hours = parseFloat(elements.hoursInput.value);

        const validation = this.validationManager.validateForm(identifier, identifierType, hours);

        if (!validation.isValid) {
            const errors = [];
            if (!validation.identifier.isValid) errors.push(validation.identifier.error);
            if (!validation.hours.isValid) errors.push(validation.hours.error);
            this.ui.showMessage(errors.join('. '), false);
            return;
        }

        const date = this.getCurrentDate();
        const submitBtn = elements.carForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        try {
            this.appState.isLoading = true;
            submitBtn.textContent = 'Добавление...';
            submitBtn.disabled = true;

            await this.firestoreManager.addRepair(validation.identifier.value, validation.hours.value, date);
            
            this.ui.resetForm();
            this.ui.showMessage('Запись успешно добавлена!', true);
        } catch (error) {
            console.error('Form submit error:', error);
            this.ui.showMessage(error.message, false);
        } finally {
            this.appState.isLoading = false;
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Обработка входа
    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            await this.authManager.login(email, password);
        } catch (error) {
            this.ui.showMessage(error.message, false);
        }
    }

    // Обработка регистрации
    async handleRegister(e) {
        e.preventDefault();
        const email = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm').value;

        try {
            await this.authManager.register(email, password, confirmPassword);
            this.ui.showMessage('Регистрация прошла успешно!', true);
        } catch (error) {
            this.ui.showMessage(error.message, false);
        }
    }

    // Обработка выхода
    async handleLogout() {
        try {
            await this.authManager.logout();
        } catch (error) {
            this.ui.showMessage(error.message, false);
        }
    }

    // Обработка поиска
    handleSearch() {
        const searchInput = document.getElementById('search-input');
        this.appState.filter = searchInput.value.toLowerCase();
        this.paginationConfig.currentPage = 1;
        this.renderCarTable();
    }

    // Обработка сортировки
    handleSort() {
        const sortSelect = document.getElementById('sort-select');
        const [field, order] = sortSelect.value.split('-');
        this.appState.sortBy = field;
        this.appState.sortOrder = order;
        this.renderCarTable();
    }

    // Обработка фильтра по дате
    handleDateFilter() {
        const dateFilter = document.getElementById('date-filter');
        this.appState.dateFilter = dateFilter.value;
        this.paginationConfig.currentPage = 1;
        this.renderCarTable();
    }

    // Изменение страницы
    changePage(direction) {
        const newPage = this.paginationConfig.currentPage + direction;
        if (newPage >= 1 && newPage <= this.paginationConfig.totalPages) {
            this.paginationConfig.currentPage = newPage;
            this.renderCarTable();
        }
    }

    // Обработка удаления
    handleDelete(e) {
        const id = e.target.dataset.id;
        const identifier = e.target.closest('tr').querySelector('td').textContent;

        this.ui.showConfirmDialog(
            `Вы уверены, что хотите удалить запись для "${identifier}"?`,
            async () => {
                try {
                    await this.firestoreManager.deleteRepair(id);
                    this.ui.showMessage('Запись успешно удалена', true);
                } catch (error) {
                    this.ui.showMessage(error.message, false);
                }
            }
        );
    }

    // Обработка редактирования
    handleEdit(e) {
        const id = e.target.dataset.id;
        const currentHours = parseFloat(e.target.dataset.hours);

        this.ui.showEditDialog(
            currentHours,
            async (newHours) => {
                try {
                    await this.firestoreManager.updateRepair(id, newHours);
                    this.ui.showMessage('Запись успешно обновлена', true);
                } catch (error) {
                    this.ui.showMessage(error.message, false);
                }
            }
        );
    }

    // Обработка FAB действий
    handleFabAction(action) {
        const elements = this.ui.getElements();
        switch(action) {
            case 'toggle-table':
                elements.tableContainer.classList.toggle('hidden');
                break;
            case 'toggle-history':
                elements.savedHoursContainer.classList.toggle('hidden');
                break;
            case 'export-pdf':
                const repairsData = this.firestoreManager.getRepairsData();
                if (repairsData.length === 0) {
                    this.ui.showMessage('Нет данных для экспорта', false);
                } else {
                    this.pdfExporter.exportFullHistoryPDF(repairsData);
                }
                break;
        }
    }

    // Рендер всех компонентов
    renderAll(repairsData) {
        this.renderCarTable(repairsData);
        this.renderSavedHoursTable(repairsData);
        this.updateStats(repairsData);
    }

    // Рендер таблицы автомобилей
    renderCarTable(repairsData = null) {
        const data = repairsData || this.firestoreManager.getRepairsData();
        const elements = this.ui.getElements();

        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.remove('hidden');
        }

        // Фильтрация
        let filteredData = this.filterData(data);

        // Сортировка
        filteredData = this.sortData(filteredData);

        // Пагинация
        const totalItems = filteredData.length;
        this.paginationConfig.totalPages = Math.ceil(totalItems / this.paginationConfig.itemsPerPage);
        
        const startIndex = (this.paginationConfig.currentPage - 1) * this.paginationConfig.itemsPerPage;
        const endIndex = startIndex + this.paginationConfig.itemsPerPage;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        elements.carTableBody.innerHTML = '';

        paginatedData.forEach(repair => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${repair.identifier}</td>
                <td>${repair.date}</td>
                <td>${repair.hours.toFixed(1)}</td>
                <td>
                    <button class="edit" 
                            data-id="${repair.id}"
                            data-hours="${repair.hours}"
                            title="Редактировать">
                        ✎
                    </button>
                    <button class="delete" 
                            data-id="${repair.id}"
                            title="Удалить">
                        🗑
                    </button>
                </td>
            `;
            elements.carTableBody.appendChild(row);
        });

        this.updatePagination();

        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
    }

    // Рендер таблицы истории дней
    renderSavedHoursTable(repairsData = null) {
        const data = repairsData || this.firestoreManager.getRepairsData();
        const elements = this.ui.getElements();

        const daysMap = {};
        
        data.forEach(repair => {
            if (!daysMap[repair.date]) {
                daysMap[repair.date] = { cars: 0, hours: 0 };
            }
            daysMap[repair.date].cars++;
            daysMap[repair.date].hours += repair.hours;
        });

        const sortedDays = Object.entries(daysMap)
            .map(([date, data]) => ({ date, ...data }))
            .sort((a, b) => {
                const [dA, mA, yA] = a.date.split('.');
                const [dB, mB, yB] = b.date.split('.');
                return new Date(yB, mB-1, dB) - new Date(yA, mA-1, dA);
            });

        elements.savedHoursTableBody.innerHTML = sortedDays
            .map(day => `
                <tr>
                    <td>${day.date}</td>
                    <td>${day.cars}</td>
                    <td>${day.hours.toFixed(1)}</td>
                </tr>
            `).join('');
    }

    // Обновление статистики
    updateStats(repairsData = null) {
        const data = repairsData || this.firestoreManager.getRepairsData();
        const today = this.getCurrentDate();
        this.ui.updateStats(data, today);
    }

    // Фильтрация данных
    filterData(data) {
        let filtered = [...data];

        // Фильтр по поиску
        if (this.appState.filter) {
            filtered = filtered.filter(repair => 
                repair.identifier.toLowerCase().includes(this.appState.filter)
            );
        }

        // Фильтр по дате
        if (this.appState.dateFilter && this.appState.dateFilter !== 'all') {
            const today = new Date();
            const todayStr = this.getCurrentDate();

            filtered = filtered.filter(repair => {
                switch (this.appState.dateFilter) {
                    case 'today':
                        return repair.date === todayStr;
                    case 'week':
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return this.isDateInRange(repair.date, weekAgo, today);
                    case 'month':
                        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return this.isDateInRange(repair.date, monthAgo, today);
                    default:
                        return true;
                }
            });
        }

        return filtered;
    }

    // Сортировка данных
    sortData(data) {
        return data.sort((a, b) => {
            let aValue, bValue;

            switch (this.appState.sortBy) {
                case 'identifier':
                    aValue = a.identifier;
                    bValue = b.identifier;
                    break;
                case 'hours':
                    aValue = parseFloat(a.hours);
                    bValue = parseFloat(b.hours);
                    break;
                case 'timestamp':
                default:
                    aValue = a.timestamp ? a.timestamp.toDate() : new Date(0);
                    bValue = b.timestamp ? b.timestamp.toDate() : new Date(0);
                    break;
            }

            if (this.appState.sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }

    // Проверка даты в диапазоне
    isDateInRange(dateStr, startDate, endDate) {
        const [day, month, year] = dateStr.split('.').map(Number);
        const date = new Date(year, month - 1, day);
        return date >= startDate && date <= endDate;
    }

    // Обновление пагинации
    updatePagination() {
        const pagination = document.getElementById('pagination');
        const pageInfo = document.getElementById('page-info');
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        if (!pagination || !pageInfo || !prevBtn || !nextBtn) return;

        if (this.paginationConfig.totalPages <= 1) {
            pagination.classList.add('hidden');
            return;
        }

        pagination.classList.remove('hidden');
        pageInfo.textContent = `Страница ${this.paginationConfig.currentPage} из ${this.paginationConfig.totalPages}`;

        prevBtn.disabled = this.paginationConfig.currentPage === 1;
        nextBtn.disabled = this.paginationConfig.currentPage === this.paginationConfig.totalPages;
    }

    // Получить текущую дату
    getCurrentDate() {
        const d = new Date();
        return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
            .toString()
            .padStart(2, '0')}.${d.getFullYear()}`;
    }

    // Проверка мобильного устройства
    checkMobile() {
        document.body.classList.toggle('mobile', window.innerWidth < 768);
    }
}

// Функция toggleFabMenu (глобальная для HTML)
function toggleFabMenu() {
    const fabMain = document.querySelector('.fab-main');
    const fabMenu = document.querySelector('.fab-menu');
    
    if (fabMain && fabMenu) {
        fabMain.classList.toggle('active');
        fabMenu.classList.toggle('hidden');
        
        if (!fabMenu.classList.contains('hidden')) {
            setTimeout(() => {
                document.addEventListener('click', closeFabMenuOnClickOutside);
            }, 10);
        }
    }
}

function closeFabMenuOnClickOutside(e) {
    const fabContainer = document.querySelector('.fab-container');
    if (fabContainer && !fabContainer.contains(e.target)) {
        toggleFabMenu();
        document.removeEventListener('click', closeFabMenuOnClickOutside);
    }
}

// Инициализация приложения
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new CarRepairApp();
    app.init();
});

