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
    showLoginBtn: document.getElementById('show-login')
};

let currentUser = null;
let db = null;

// Инициализация IndexedDB
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('CarRepairDB', 2);
        
        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            reject(event.target.error);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('users')) {
                const usersStore = db.createObjectStore('users', { keyPath: 'username' });
                usersStore.createIndex('username', 'username', { unique: true });
            }
            
            if (!db.objectStoreNames.contains('repairs')) {
                const repairsStore = db.createObjectStore('repairs', { keyPath: 'id', autoIncrement: true });
                repairsStore.createIndex('username', 'username', { unique: false });
                repairsStore.createIndex('date', 'date', { unique: false });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve();
        };
    });
}

function init() {
    initDB().then(() => {
        bindEvents();
        checkMobile();
        checkAuthState();
    }).catch(error => {
        console.error('DB initialization failed:', error);
        alert('Ошибка инициализации базы данных');
    });
}

function bindEvents() {
    elements.carForm.addEventListener('submit', handleFormSubmit);
    elements.identifierInput.addEventListener('input', validateIdentifier);
    elements.hoursInput.addEventListener('input', validateHours);
    document.addEventListener('click', handleTableActions);
    window.addEventListener('resize', checkMobile);

    elements.loginForm.addEventListener('submit', handleLogin);
    elements.registerForm.addEventListener('submit', handleRegister);
    elements.showRegisterBtn.addEventListener('click', showRegister);
    elements.showLoginBtn.addEventListener('click', showLogin);
    elements.logoutBtn.addEventListener('click', logout);

    document.querySelectorAll('.fab-item').forEach(button => {
        button.addEventListener('click', e => {
            const action = e.currentTarget.dataset.action;
            handleFabAction(action);
            toggleFabMenu();
        });
    });
}

function checkAuthState() {
    const savedUser = sessionStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        showApp();
        renderAll();
    } else {
        showAuth();
    }
}

function showApp() {
    elements.authContainer.classList.add('hidden');
    elements.appContent.classList.remove('hidden');
    elements.logoutBtn.classList.remove('hidden');
}

function showAuth() {
    elements.authContainer.classList.remove('hidden');
    elements.appContent.classList.add('hidden');
    elements.logoutBtn.classList.add('hidden');
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
    sessionStorage.removeItem('currentUser');
    currentUser = null;
    showAuth();
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    const transaction = db.transaction(['users'], 'readonly');
    const store = transaction.objectStore('users');
    const request = store.get(username);

    request.onsuccess = (event) => {
        const user = event.target.result;
        
        if (user && user.password === password) {
            currentUser = username;
            sessionStorage.setItem('currentUser', username);
            showApp();
            renderAll();
        } else {
            showValidationMessage('Неверное имя пользователя или пароль', false);
        }
    };

    request.onerror = (event) => {
        console.error('Login error:', event.target.error);
        showValidationMessage('Ошибка при входе', false);
    };
}

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm').value;

    if (password !== confirmPassword) {
        showValidationMessage('Пароли не совпадают', false);
        return;
    }

    const transaction = db.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');
    const request = store.add({ username, password });

    request.onsuccess = () => {
        currentUser = username;
        sessionStorage.setItem('currentUser', username);
        showApp();
        renderAll();
        showValidationMessage('Регистрация прошла успешно!', true);
    };

    request.onerror = (event) => {
        if (event.target.error.name === 'ConstraintError') {
            showValidationMessage('Пользователь с таким именем уже существует', false);
        } else {
            console.error('Registration error:', event.target.error);
            showValidationMessage('Ошибка при регистрации', false);
        }
    };
}

function showValidationMessage(message, isSuccess) {
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
        document.body.removeChild(messageDiv);
    }, 3000);
}

function validateIdentifier() {
    const identifierType = document.getElementById('identifier-type').value;
    const identifier = elements.identifierInput.value.trim().toUpperCase();

    let isValid = false;

    if (identifierType === 'reg') {
        isValid = /^[0-9]{4}\s?[A-Z]{2}-[1-7]$/.test(identifier);
        elements.identifierInput.setCustomValidity(
            isValid ? '' : 'Формат: 1234 AB-1'
        );
    } else {
        isValid = /^[A-Z0-9]{4}$/.test(identifier);
        elements.identifierInput.setCustomValidity(
            isValid ? '' : '4 заглавных символа'
        );
    }

    elements.identifierInput.reportValidity();
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
        case 'export-csv':
            exportFullHistory('csv');
            break;
        case 'export-json':
            exportFullHistory('json');
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
        const regEx = /^[0-9]{4}\s?[A-Z]{2}-[1-7]$/;
        isValidIdentifier = regEx.test(identifier);
        errorMessage = 'Неверный формат гос. номера (Пример: 1234 AB-1)';
    } else {
        isValidIdentifier =
            identifier.length === 4 && /^[A-Z0-9]{4}$/.test(identifier);
        errorMessage = 'ВИН должен содержать 4 заглавных символа (буквы или цифры)';
    }

    const isValidHours = !isNaN(hours) && hours >= 0.1 && hours <= 24;

    if (isValidIdentifier && isValidHours) {
        const date = getCurrentDate();
        
        const transaction = db.transaction(['repairs'], 'readwrite');
        const store = transaction.objectStore('repairs');
        
        store.add({
            username: currentUser,
            identifier,
            date,
            hours
        });

        transaction.oncomplete = () => {
            renderAll();
            elements.carForm.reset();
            showValidationMessage('Данные успешно добавлены!', true);
        };

        transaction.onerror = (event) => {
            console.error('Add repair error:', event.target.error);
            showValidationMessage('Ошибка при добавлении данных', false);
        };
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
    const id = parseInt(e.target.dataset.id);
    
    const transaction = db.transaction(['repairs'], 'readwrite');
    const store = transaction.objectStore('repairs');
    store.delete(id);

    transaction.oncomplete = () => {
        renderAll();
    };

    transaction.onerror = (event) => {
        console.error('Delete error:', event.target.error);
        showValidationMessage('Ошибка при удалении записи', false);
    };
}

function handleEdit(e) {
    const id = parseInt(e.target.dataset.id);
    const currentHours = parseFloat(e.target.dataset.hours);
    const newHours = parseFloat(prompt('Введите новые часы:', currentHours));

    if (!isNaN(newHours)) {
        const transaction = db.transaction(['repairs'], 'readwrite');
        const store = transaction.objectStore('repairs');
        const request = store.get(id);

        request.onsuccess = (event) => {
            const record = event.target.result;
            if (record) {
                record.hours = newHours;
                store.put(record);
            }
        };

        transaction.oncomplete = () => {
            renderAll();
        };

        transaction.onerror = (event) => {
            console.error('Edit error:', event.target.error);
            showValidationMessage('Ошибка при редактировании записи', false);
        };
    }
}

function renderAll() {
    renderCarTable();
    renderSavedHoursTable();
    updateStats();
}

function getRepairs() {
    return new Promise((resolve, reject) => {
        if (!db) {
            reject('Database not initialized');
            return;
        }

        const transaction = db.transaction(['repairs'], 'readonly');
        const store = transaction.objectStore('repairs');
        const index = store.index('username');
        const request = index.getAll(currentUser);

        request.onsuccess = (event) => {
            resolve(event.target.result || []);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

function renderCarTable() {
    getRepairs().then(repairs => {
        elements.carTableBody.innerHTML = repairs
            .map(repair => `
                <tr>
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
                </tr>
            `)
            .join('');
    }).catch(error => {
        console.error('Render table error:', error);
    });
}

function renderSavedHoursTable() {
    getRepairs().then(repairs => {
        const daysMap = repairs.reduce((acc, repair) => {
            acc[repair.date] = acc[repair.date] || { cars: 0, hours: 0 };
            acc[repair.date].cars++;
            acc[repair.date].hours += repair.hours;
            return acc;
        }, {});

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
    }).catch(error => {
        console.error('Render history error:', error);
    });
}

function updateStats() {
    getRepairs().then(repairs => {
        const today = getCurrentDate();
        const todayRepairs = repairs.filter(repair => repair.date === today);
        
        const totalCars = todayRepairs.length;
        const totalHours = todayRepairs.reduce((sum, repair) => sum + repair.hours, 0);
        
        elements.totalCars.textContent = totalCars;
        elements.totalHours.textContent = totalHours.toFixed(1);
    }).catch(error => {
        console.error('Update stats error:', error);
    });
}

function exportFullHistory(format) {
    getRepairs().then(repairs => {
        const today = new Date().toISOString().slice(0, 10);
        const data = repairs.map(repair => ({
            date: repair.date,
            identifier: repair.identifier,
            hours: repair.hours
        }));

        if (format === 'csv') {
            const csvContent = [
                'Дата;Идентификатор;Часы',
                ...data.map(item => `${item.date};${item.identifier};${item.hours.toFixed(1)}`)
            ].join('\n');

            const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8' });
            downloadFile(blob, `история_ремонтов_${today}.csv`);
        } else {
            const jsonData = {
                generated: new Date().toISOString(),
                totalRecords: data.length,
                repairs: data
            };
            const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
            downloadFile(blob, `история_ремонтов_${today}.json`);
        }
    }).catch(error => {
        console.error('Export error:', error);
        showValidationMessage('Ошибка при экспорте данных', false);
    });
}

function downloadFile(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

init();
