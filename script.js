const elements = {
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



// Firebase уже инициализирован в config.js
// Используем глобальные переменные auth и db из config.js

// Глобальные переменные уже определены в config.js
let repairsUnsubscribe = null;
let repairsData = []; // Глобальный массив для хранения данных о ремонтах

// Настройки пагинации и кэширования
const PAGINATION_CONFIG = {
    itemsPerPage: 20,
    currentPage: 1,
    totalPages: 1
};

// Кэш для данных
const dataCache = {
    repairs: new Map(),
    stats: null,
    lastUpdate: null,
    cacheTimeout: 5 * 60 * 1000 // 5 минут
};

// Состояние приложения
const appState = {
    isLoading: false,
    isOnline: navigator.onLine,
    currentView: 'form', // form, table, history
    sortBy: 'timestamp',
    sortOrder: 'desc',
    filter: ''
};

// Глобальная обработка ошибок
function setupGlobalErrorHandling() {
    // Обработка необработанных ошибок
    window.addEventListener('error', (event) => {
        console.error('Global error:', event.error);
        if (typeof showValidationMessage === 'function') {
            showValidationMessage('Произошла ошибка в приложении. Попробуйте обновить страницу.', false);
        }
    });

    // Обработка необработанных отклонений промисов
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
        if (typeof showValidationMessage === 'function') {
            showValidationMessage('Произошла ошибка при выполнении операции. Попробуйте позже.', false);
        }
    });

    // Обработка ошибок сети
    window.addEventListener('online', () => {
        if (typeof showValidationMessage === 'function') {
            showValidationMessage('Соединение восстановлено', true);
        }
    });

    window.addEventListener('offline', () => {
        if (typeof showValidationMessage === 'function') {
            showValidationMessage('Нет подключения к интернету', false);
        }
    });
}

function init() {
    setupGlobalErrorHandling();
    bindEvents();
    checkMobile();
    checkAuthState();
}

function bindEvents() {
    // Проверяем существование элементов перед привязкой событий
    if (elements.carForm) {
        elements.carForm.addEventListener('submit', handleFormSubmit);
    }
    if (elements.identifierInput) {
        elements.identifierInput.addEventListener('input', validateIdentifier);
    }
    if (elements.hoursInput) {
        elements.hoursInput.addEventListener('input', validateHours);
    }
    
    document.addEventListener('click', handleTableActions);
    window.addEventListener('resize', checkMobile);

    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', handleLogin);
    }
    if (elements.registerForm) {
        elements.registerForm.addEventListener('submit', handleRegister);
    }
    if (elements.showRegisterBtn) {
        elements.showRegisterBtn.addEventListener('click', showRegister);
    }
    if (elements.showLoginBtn) {
        elements.showLoginBtn.addEventListener('click', showLogin);
    }
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', logout);
    }

    // Новые элементы для поиска и фильтрации
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const sortSelect = document.getElementById('sort-select');
    const dateFilter = document.getElementById('date-filter');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');

    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        searchBtn.addEventListener('click', handleSearch);
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSort);
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', handleDateFilter);
    }
    
    if (prevPageBtn && nextPageBtn) {
        prevPageBtn.addEventListener('click', () => changePage(-1));
        nextPageBtn.addEventListener('click', () => changePage(1));
    }

    document.querySelectorAll('.fab-item').forEach(button => {
        button.addEventListener('click', e => {
            const action = e.currentTarget.dataset.action;
            handleFabAction(action);
            toggleFabMenu();
        });
    });
}

// Функция debounce для оптимизации поиска
function debounce(func, wait) {
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

// Обработчики поиска и фильтрации
function handleSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    appState.filter = searchTerm;
    PAGINATION_CONFIG.currentPage = 1;
    renderCarTable();
}

function handleSort() {
    const sortValue = document.getElementById('sort-select').value;
    const [field, order] = sortValue.split('-');
    appState.sortBy = field;
    appState.sortOrder = order;
    renderCarTable();
}

function handleDateFilter() {
    const filterValue = document.getElementById('date-filter').value;
    appState.dateFilter = filterValue;
    PAGINATION_CONFIG.currentPage = 1;
    renderCarTable();
}

function changePage(direction) {
    const newPage = PAGINATION_CONFIG.currentPage + direction;
    if (newPage >= 1 && newPage <= PAGINATION_CONFIG.totalPages) {
        PAGINATION_CONFIG.currentPage = newPage;
        renderCarTable();
    }
}

function checkAuthState() {
    if (!auth) {
        console.error('Firebase Auth not initialized');
        showValidationMessage('Ошибка инициализации аутентификации', false);
        return;
    }
    
    auth.onAuthStateChanged(user => {
        console.log('Auth state changed:', user);
        if (user) {
            currentUser = user;
            console.log('User logged in:', user.email, user.uid);
            showApp();
            setupRealtimeUpdates();
        } else {
            console.log('User logged out');
            showAuth();
        }
    });
}

function setupRealtimeUpdates() {
    if (!db || !currentUser) {
        console.error('Firebase DB or user not available');
        return;
    }
    
    // Отписываемся от предыдущих обновлений
    if (repairsUnsubscribe) repairsUnsubscribe();
    
    // Подписываемся на обновления для текущего пользователя
    repairsUnsubscribe = db.collection('repairs')
        .where('userId', '==', currentUser.uid)
        .orderBy('timestamp', 'desc')
        .onSnapshot(snapshot => {
            repairsData = []; // Очищаем массив перед обновлением
            
            snapshot.forEach(doc => {
                const repair = doc.data();
                repair.id = doc.id; // Сохраняем ID документа
                repairsData.push(repair);
            });
            
            // Обновляем интерфейс
            renderAll();
        }, error => {
            console.error('Realtime update error:', error);
            if (error.code === 'failed-precondition') {
                showValidationMessage('Требуется создать индекс в Firestore. Проверьте консоль для получения ссылки.', false);
            } else {
                showValidationMessage('Ошибка загрузки данных: ' + error.message, false);
            }
        });
}

function showApp() {
    elements.authContainer.classList.add('hidden');
    elements.appContent.classList.remove('hidden');
    elements.userInfo.classList.remove('hidden');
    elements.userEmail.textContent = currentUser.email;
    renderAll();
}

function showAuth() {
    elements.authContainer.classList.remove('hidden');
    elements.appContent.classList.add('hidden');
    elements.userInfo.classList.add('hidden');
    elements.userEmail.textContent = '';
    showLogin();
}

function showLogin() {
    elements.registerContainer.classList.add('hidden');
    elements.loginContainer.classList.remove('hidden');
}

function showRegister() {
    elements.loginContainer.classList.add('hidden');
    elements.registerContainer.classList.remove('hidden');
}

function logout() {
    auth.signOut().then(() => {
        currentUser = null;
        repairsData = []; // Очищаем данные
        if (repairsUnsubscribe) repairsUnsubscribe();
    }).catch(error => {
        console.error('Logout error:', error);
        showValidationMessage('Ошибка при выходе: ' + error.message, false);
    });
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    // Добавляем домен, если его нет
    const fullEmail = email.includes('@') ? email : `${email}@carrepair.com`;

    auth.signInWithEmailAndPassword(fullEmail, password)
        .then(() => {
            // Успешный вход обрабатывается в onAuthStateChanged
        })
        .catch(error => {
            console.error('Login error:', error);
            let message = 'Ошибка входа';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    message = 'Пользователь не найден. Зарегистрируйтесь или проверьте email.';
                    break;
                case 'auth/wrong-password':
                    message = 'Неверный пароль. Проверьте правильность ввода.';
                    break;
                case 'auth/invalid-email':
                    message = 'Неверный формат email.';
                    break;
                case 'auth/too-many-requests':
                    message = 'Слишком много попыток. Попробуйте позже.';
                    break;
                case 'auth/network-request-failed':
                    message = 'Ошибка сети. Проверьте интернет-соединение.';
                    break;
                case 'auth/invalid-api-key':
                    message = 'Ошибка API ключа. Проверьте конфигурацию Firebase.';
                    break;
                default:
                    message = `Ошибка входа: ${error.message}`;
            }
            
            showValidationMessage(message, false);
        });
}

function handleRegister(e) {
    e.preventDefault();
    
    const email = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;

    if (password !== confirmPassword) {
        showValidationMessage('Пароли не совпадают', false);
        return;
    }

    // Добавляем домен, если его нет
    const fullEmail = email.includes('@') ? email : `${email}@carrepair.com`;

    auth.createUserWithEmailAndPassword(fullEmail, password)
        .then(() => {
            showValidationMessage('Регистрация прошла успешно!', true);
        })
        .catch(error => {
            console.error('Registration error:', error);
            let message = 'Ошибка регистрации';
            
            switch (error.code) {
                case 'auth/email-already-in-use':
                    message = 'Email уже используется. Попробуйте войти или используйте другой email.';
                    break;
                case 'auth/weak-password':
                    message = 'Слабый пароль. Минимум 6 символов.';
                    break;
                case 'auth/invalid-email':
                    message = 'Неверный формат email.';
                    break;
                case 'auth/operation-not-allowed':
                    message = 'Регистрация отключена. Проверьте настройки Firebase.';
                    break;
                case 'auth/invalid-api-key':
                    message = 'Ошибка API ключа. Проверьте конфигурацию Firebase.';
                    break;
                case 'auth/network-request-failed':
                    message = 'Ошибка сети. Проверьте интернет-соединение.';
                    break;
                default:
                    message = `Ошибка регистрации: ${error.message}`;
            }
            
            showValidationMessage(message, false);
        });
}

function showValidationMessage(message, isSuccess) {
    // Удаляем предыдущие сообщения
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
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentNode) {
            document.body.removeChild(messageDiv);
        }
    }, 3000);
}

// Улучшенная валидация идентификаторов
function validateIdentifier() {
    const input = elements.identifierInput;
    const value = input.value.trim().toUpperCase();
    const type = document.getElementById('identifier-type').value;
    
    // Автоматическое приведение к верхнему регистру
    input.value = value;
    
    if (type === 'reg') {
        // Валидация белорусского гос. номера: 1234 AB-1
        const regPattern = /^\d{4}\s[A-Z]{2}-[1-8]$/;
        if (regPattern.test(value)) {
            input.setCustomValidity('');
            input.classList.remove('invalid');
            input.classList.add('valid');
        } else {
            input.setCustomValidity('Формат белорусского номера: 1234 AB-1 (цифра после дефиса от 1 до 8)');
            input.classList.remove('valid');
            input.classList.add('invalid');
        }
    } else if (type === 'vin') {
        // Валидация VIN: только последние 4 символа
        if (value.length === 4) {
            const vinPattern = /^[A-Z0-9]{4}$/;
            if (vinPattern.test(value)) {
                input.setCustomValidity('');
                input.classList.remove('invalid');
                input.classList.add('valid');
            } else {
                input.setCustomValidity('Введите последние 4 символа VIN (буквы и цифры)');
                input.classList.remove('valid');
                input.classList.add('invalid');
            }
        } else if (value.length === 17) {
            // Если введен полный VIN, извлекаем последние 4 символа
            const fullVinPattern = /^[A-Z0-9]{17}$/;
            if (fullVinPattern.test(value)) {
                input.value = value.slice(-4);
                input.setCustomValidity('');
                input.classList.remove('invalid');
                input.classList.add('valid');
            } else {
                input.setCustomValidity('Полный VIN должен содержать 17 символов (буквы и цифры)');
                input.classList.remove('valid');
                input.classList.add('invalid');
            }
        } else {
            input.setCustomValidity('Введите последние 4 символа VIN (например: Z9X8)');
            input.classList.remove('valid');
            input.classList.add('invalid');
        }
    }
    
    input.reportValidity();
}

// Проверка на дублирование записей (временно отключена для отладки)
async function checkDuplicateRecord(identifier, hours, date) {
    if (!currentUser) return false;
    
    try {
        // Временно упрощаем запрос для отладки
        const snapshot = await db.collection('repairs')
            .where('userId', '==', currentUser.uid)
            .get();
        
        // Проверяем дубликаты в памяти
        const duplicates = snapshot.docs.filter(doc => {
            const data = doc.data();
            return data.identifier === identifier && data.date === date;
        });
        
        return duplicates.length > 0;
    } catch (error) {
        console.error('Error checking duplicates:', error);
        return false;
    }
}

function validateHours() {
    const hours = parseFloat(elements.hoursInput.value);
    const isValid = !isNaN(hours) && hours >= 0.1 && hours <= 24;

    elements.hoursInput.setCustomValidity(isValid ? '' : 'Диапазон: 0.1-24');
    elements.hoursInput.reportValidity();
}

function handleFabAction(action) {
    switch(action) {
        case 'toggle-table':
            toggleElement(elements.tableContainer);
            break;
        case 'toggle-history':
            toggleElement(elements.savedHoursContainer);
            break;

        case 'export-pdf':
            exportFullHistoryPDF();
            break;
    }
}

function toggleElement(element) {
    element.classList.toggle('hidden');
    if (!element.classList.contains('hidden')) {
        setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

function getCurrentDate() {
    const d = new Date();
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
        .toString()
        .padStart(2, '0')}.${d.getFullYear()}`;
}

function handleFormSubmit(e) {
    e.preventDefault();
    const identifierType = document.getElementById('identifier-type').value;
    const identifier = elements.identifierInput.value.trim().toUpperCase();
    const hours = parseFloat(elements.hoursInput.value);

    if (!elements.carForm.checkValidity()) {
        elements.carForm.reportValidity();
        return;
    }

    let isValidIdentifier = false;
    let errorMessage = '';

    if (identifierType === 'reg') {
        // Валидация белорусского гос. номера
        const regEx = /^[0-9]{4}\s[A-Z]{2}-[1-8]$/;
        isValidIdentifier = regEx.test(identifier);
        errorMessage = 'Неверный формат белорусского номера (Пример: 1234 AB-1, цифра от 1 до 8)';
    } else {
        // Валидация VIN (последние 4 символа)
        isValidIdentifier = identifier.length === 4 && /^[A-Z0-9]{4}$/.test(identifier);
        errorMessage = 'VIN должен содержать 4 заглавных символа (буквы или цифры)';
    }

    const isValidHours = !isNaN(hours) && hours >= 0.1 && hours <= 24;

    if (isValidIdentifier && isValidHours) {
        const date = getCurrentDate();
        
        // Проверка аутентификации
        console.log('Проверка пользователя:', currentUser);
        if (!currentUser || !currentUser.uid) {
            showValidationMessage('Ошибка: пользователь не аутентифицирован', false);
            return;
        }
        
        // Временно отключаем проверку дубликатов для отладки
            
        // Показываем индикатор загрузки
            appState.isLoading = true;
            const submitBtn = elements.carForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Добавление...';
            submitBtn.disabled = true;
            
            console.log('Добавление записи:', { userId: currentUser.uid, identifier, date, hours });
            
            db.collection('repairs').add({
                userId: currentUser.uid,
                identifier,
                date,
                hours,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
            .then(() => {
                elements.carForm.reset();
                showValidationMessage('Запись успешно добавлена!', true);
                // Сброс состояния формы
                elements.identifierInput.classList.remove('valid', 'invalid');
            })
            .catch(error => {
                console.error('Add repair error:', error);
                
                let message = 'Ошибка при добавлении данных';
                if (error.code === 'permission-denied') {
                    message = 'Недостаточно прав. Проверьте правила Firestore.';
                } else if (error.code === 'failed-precondition') {
                    message = 'Требуется создать индекс. Проверьте консоль.';
                } else if (error.code === 'unavailable') {
                    message = 'Сервис временно недоступен. Проверьте подключение к интернету.';
                }
                
                showValidationMessage(message, false);
            })
            .finally(() => {
                // Восстанавливаем состояние кнопки
                appState.isLoading = false;
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            });
    } else {
        let errors = [];
        if (!isValidIdentifier) errors.push(errorMessage);
        if (!isValidHours) errors.push('Часы должны быть от 0.1 до 24');
        showValidationMessage(errors.join('<br>'), false);
    }
}

function handleTableActions(e) {
    if (e.target.classList.contains('delete')) {
        handleDelete(e);
    } else if (e.target.classList.contains('edit')) {
        handleEdit(e);
    }
}

function handleDelete(e) {
    const id = e.target.dataset.id;
    
    db.collection('repairs').doc(id).delete()
        .catch(error => {
            console.error('Delete error:', error);
            showValidationMessage('Ошибка при удалении записи: ' + error.message, false);
        });
}

function handleEdit(e) {
    const id = e.target.dataset.id;
    const currentHours = parseFloat(e.target.dataset.hours);
    const newHours = parseFloat(prompt('Введите новые часы:', currentHours));

    if (!isNaN(newHours)) {
        db.collection('repairs').doc(id).update({
            hours: newHours
        })
        .catch(error => {
            console.error('Edit error:', error);
            showValidationMessage('Ошибка при редактировании записи: ' + error.message, false);
        });
    }
}

function renderAll() {
    renderCarTable();
    renderSavedHoursTable();
    updateStats();
}

function renderCarTable() {
    // Показываем индикатор загрузки
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
    }
    
    // Фильтрация данных
    let filteredData = filterData(repairsData);
    
    // Сортировка данных
    filteredData = sortData(filteredData);
    
    // Пагинация
    const totalItems = filteredData.length;
    PAGINATION_CONFIG.totalPages = Math.ceil(totalItems / PAGINATION_CONFIG.itemsPerPage);
    
    const startIndex = (PAGINATION_CONFIG.currentPage - 1) * PAGINATION_CONFIG.itemsPerPage;
    const endIndex = startIndex + PAGINATION_CONFIG.itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);
    
    // Очищаем таблицу
    elements.carTableBody.innerHTML = '';
    
    // Рендерим данные
    paginatedData.forEach(repair => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${repair.identifier}</td>
            <td>${repair.date}</td>
            <td>${repair.hours.toFixed(1)}</td>
            <td>
                <button class="edit" 
                        data-id="${repair.id}"
                        data-hours="${repair.hours}">
                    ✎
                </button>
                <button class="delete" 
                        data-id="${repair.id}">
                    🗑
                </button>
            </td>
        `;
        
        elements.carTableBody.appendChild(row);
    });
    
    // Обновляем пагинацию
    updatePagination();
    
    // Скрываем индикатор загрузки
    if (loadingIndicator) {
        loadingIndicator.classList.add('hidden');
    }
}

// Функция фильтрации данных
function filterData(data) {
    let filtered = [...data];
    
    // Фильтр по поиску
    if (appState.filter) {
        filtered = filtered.filter(repair => 
            repair.identifier.toLowerCase().includes(appState.filter)
        );
    }
    
    // Фильтр по дате
    if (appState.dateFilter && appState.dateFilter !== 'all') {
        const today = new Date();
        const todayStr = getCurrentDate();
        
        filtered = filtered.filter(repair => {
            switch (appState.dateFilter) {
                case 'today':
                    return repair.date === todayStr;
                case 'week':
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return isDateInRange(repair.date, weekAgo, today);
                case 'month':
                    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                    return isDateInRange(repair.date, monthAgo, today);
                default:
                    return true;
            }
        });
    }
    
    return filtered;
}

// Функция сортировки данных
function sortData(data) {
    return data.sort((a, b) => {
        let aValue, bValue;
        
        switch (appState.sortBy) {
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
        
        if (appState.sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
}

// Функция проверки даты в диапазоне
function isDateInRange(dateStr, startDate, endDate) {
    const [day, month, year] = dateStr.split('.').map(Number);
    const date = new Date(year, month - 1, day);
    return date >= startDate && date <= endDate;
}

// Функция обновления пагинации
function updatePagination() {
    const pagination = document.getElementById('pagination');
    const pageInfo = document.getElementById('page-info');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    
    if (!pagination || !pageInfo || !prevBtn || !nextBtn) return;
    
    if (PAGINATION_CONFIG.totalPages <= 1) {
        pagination.classList.add('hidden');
        return;
    }
    
    pagination.classList.remove('hidden');
    pageInfo.textContent = `Страница ${PAGINATION_CONFIG.currentPage} из ${PAGINATION_CONFIG.totalPages}`;
    
    prevBtn.disabled = PAGINATION_CONFIG.currentPage === 1;
    nextBtn.disabled = PAGINATION_CONFIG.currentPage === PAGINATION_CONFIG.totalPages;
}

function renderSavedHoursTable() {
    const daysMap = {};
    
    repairsData.forEach(repair => {
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

function updateStats() {
    const today = getCurrentDate();
    const todayRepairs = repairsData.filter(repair => repair.date === today);
    
    const totalCars = todayRepairs.length;
    const totalHours = todayRepairs.reduce((sum, repair) => sum + repair.hours, 0);
    
    elements.totalCars.textContent = totalCars;
    elements.totalHours.textContent = totalHours.toFixed(1);
}







function exportFullHistoryPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape' });

    // Создаем canvas с высоким разрешением для четкого текста
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Увеличиваем разрешение в 2 раза для четкости
    const scale = 2;
    canvas.width = 1600 * scale;
    canvas.height = 1200 * scale;
    
    // Масштабируем контекст
    ctx.scale(scale, scale);
    
    // Устанавливаем сглаживание для лучшего качества
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Устанавливаем шрифт для canvas с большим размером
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';

    // Рендерим заголовок
    ctx.fillText('История ремонтов', 800, 50);

    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    const today = new Date().toLocaleDateString('ru-RU');
    ctx.fillText(`Дата экспорта: ${today}`, 50, 90);

    // Рендерим таблицу
    let y = 120;
    const headers = ['Дата', 'Идентификатор', 'Часы'];
    const colWidths = [220, 450, 180];
    let x = 50;

    // Заголовки таблицы с улучшенным дизайном
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(x, y - 25, colWidths[0], 30);
    ctx.fillRect(x + colWidths[0], y - 25, colWidths[1], 30);
    ctx.fillRect(x + colWidths[0] + colWidths[1], y - 25, colWidths[2], 30);

    // Границы заголовков
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y - 25, colWidths[0], 30);
    ctx.strokeRect(x + colWidths[0], y - 25, colWidths[1], 30);
    ctx.strokeRect(x + colWidths[0] + colWidths[1], y - 25, colWidths[2], 30);

    ctx.fillStyle = 'black';
    ctx.fillText(headers[0], x + 15, y);
    ctx.fillText(headers[1], x + colWidths[0] + 15, y);
    ctx.fillText(headers[2], x + colWidths[0] + colWidths[1] + 15, y);

    y += 35;

    // Данные таблицы
    ctx.font = '14px Arial';
    repairsData.forEach((repair, index) => {
        if (y > 1100) {
            // Добавляем новую страницу
            doc.addPage();
            y = 80;
        }

        // Альтернативные цвета строк для лучшей читаемости
        if (index % 2 === 0) {
            ctx.fillStyle = '#fafafa';
            ctx.fillRect(x, y - 20, colWidths[0] + colWidths[1] + colWidths[2], 25);
        }

        ctx.fillStyle = 'black';
        ctx.fillText(repair.date, x + 15, y);
        ctx.fillText(repair.identifier, x + colWidths[0] + 15, y);
        ctx.fillText(repair.hours.toFixed(1), x + colWidths[0] + colWidths[1] + 15, y);

        y += 25;
    });

    // Конвертируем canvas в изображение с высоким качеством
    const imgData = canvas.toDataURL('image/png', 1.0);
    doc.addImage(imgData, 'PNG', 0, 0, 297, 210);

    const fileDate = new Date().toISOString().slice(0, 10);
    doc.save(`история_ремонтов_${fileDate}.pdf`);
}





function toggleFabMenu() {
    const fabMain = document.querySelector('.fab-main');
    const fabMenu = document.querySelector('.fab-menu');
    
    fabMain.classList.toggle('active');
    fabMenu.classList.toggle('hidden');
    
    if (!fabMenu.classList.contains('hidden')) {
        setTimeout(() => {
            document.addEventListener('click', closeFabMenuOnClickOutside);
        }, 10);
    }
}

function closeFabMenuOnClickOutside(e) {
    const fabContainer = document.querySelector('.fab-container');
    if (!fabContainer.contains(e.target)) {
        toggleFabMenu();
        document.removeEventListener('click', closeFabMenuOnClickOutside);
    }
}

function checkMobile() {
    document.body.classList.toggle('mobile', window.innerWidth < 768);
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    try {
        init();
    } catch (error) {
        console.error('Application initialization error:', error);
        showValidationMessage('Ошибка инициализации приложения. Попробуйте обновить страницу.', false);
    }
});
