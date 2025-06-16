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

let carDatabase = [];
let currentUser = null;
const users = JSON.parse(localStorage.getItem('users')) || [];

function init() {
    bindEvents();
    checkMobile();
    checkAuthState();
}

function bindEvents() {
    // Форма автомобиля
    elements.carForm.addEventListener('submit', handleFormSubmit);
    elements.identifierInput.addEventListener('input', validateIdentifier);
    elements.hoursInput.addEventListener('input', validateHours);
    document.addEventListener('click', handleTableActions);
    window.addEventListener('resize', checkMobile);

    // Формы авторизации
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.registerForm.addEventListener('submit', handleRegister);
    elements.showRegisterBtn.addEventListener('click', showRegister);
    elements.showLoginBtn.addEventListener('click', showLogin);
    elements.logoutBtn.addEventListener('click', logout);

    // FAB меню
    document.querySelectorAll('.fab-item').forEach(button => {
        button.addEventListener('click', e => {
            const action = e.currentTarget.dataset.action;
            handleFabAction(action);
            toggleFabMenu();
        });
    });
}    

function checkAuthState() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        loadUserData();
        showApp();
    } else {
        showAuth();
    }
}

function loadUserData() {
    const userData = localStorage.getItem(`carDatabase_${currentUser}`);
    carDatabase = userData ? JSON.parse(userData) : [];
    renderAll();
}

function saveUserData() {
    localStorage.setItem(`carDatabase_${currentUser}`, JSON.stringify(carDatabase));
}

function showApp() {
    elements.authContainer.classList.add('hidden');
    elements.appContent.classList.remove('hidden');
    elements.logoutBtn.classList.remove('hidden');
    renderAll();
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
    saveUserData();
    localStorage.removeItem('currentUser');
    currentUser = null;
    carDatabase = [];
    showAuth();
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = username;
        localStorage.setItem('currentUser', username);
        loadUserData();
        showApp();
    } else {
        showValidationMessage('Неверное имя пользователя или пароль', false);
    }
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

    if (users.some(u => u.username === username)) {
        showValidationMessage('Пользователь с таким именем уже существует', false);
        return;
    }

    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    
    currentUser = username;
    localStorage.setItem('currentUser', username);
    carDatabase = [];
    saveUserData();
    showApp();
    
    showValidationMessage('Регистрация прошла успешно!', true);
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

function saveData() {
    saveUserData();
}

function updateStats() {
    const today = getCurrentDate();
    let total = { cars: 0, hours: 0 };

    carDatabase.forEach(car => {
        car.records.forEach(record => {
            if (record.date === today) {
                total.cars++;
                total.hours += record.hours;
            }
        });
    });

    elements.totalCars.textContent = total.cars;
    elements.totalHours.textContent = total.hours.toFixed(1);
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
        let car = carDatabase.find(c => c.identifier === identifier);

        if (!car) {
            car = { identifier, records: [] };
            carDatabase.push(car);
        }

        car.records.push({ date, hours });
        saveData();
        renderAll();
        elements.carForm.reset();
        showValidationMessage('Данные успешно добавлены!', true);
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
    const index = e.target.dataset.index;
    const recordIndex = e.target.dataset.record;

    carDatabase[index].records.splice(recordIndex, 1);
    if (carDatabase[index].records.length === 0) {
        carDatabase.splice(index, 1);
    }
    saveData();
    renderAll();
}

function handleEdit(e) {
    const index = e.target.dataset.index;
    const recordIndex = e.target.dataset.record;
    const currentHours = carDatabase[index].records[recordIndex].hours;
    const newHours = parseFloat(
        prompt('Введите новые часы:', currentHours)
    );

    if (!isNaN(newHours)) {
        carDatabase[index].records[recordIndex].hours = newHours;
        saveData();
        renderAll();
    }
}

function renderAll() {
    renderCarTable();
    renderSavedHoursTable();
    updateStats();
}

function renderCarTable() {
    elements.carTableBody.innerHTML = carDatabase
        .flatMap((car, index) =>
            car.records.map((record, recordIndex) => `
                <tr>
                    <td>${car.identifier}</td>
                    <td>${record.date}</td>
                    <td>${record.hours.toFixed(1)}</td>
                    <td>
                        <button class="edit" 
                                data-index="${index}" 
                                data-record="${recordIndex}">
                            ✎
                        </button>
                        <button class="delete" 
                                data-index="${index}" 
                                data-record="${recordIndex}">
                            🗑
                        </button>
                    </td>
                </tr>
            `)
        )
        .join('');
}

function renderSavedHoursTable() {
    const daysMap = carDatabase
        .flatMap(car => car.records)
        .reduce((acc, record) => {
            acc[record.date] = acc[record.date] || { cars: 0, hours: 0 };
            acc[record.date].cars++;
            acc[record.date].hours += record.hours;
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
}

function getAllRepairsData() {
    return carDatabase
        .flatMap(car => car.records.map(record => ({
            date: record.date,
            identifier: car.identifier,
            hours: record.hours
        })))
        .sort((a, b) => {
            const [dA, mA, yA] = a.date.split('.');
            const [dB, mB, yB] = b.date.split('.');
            return new Date(yB, mB-1, dB) - new Date(yA, mA-1, dA);
        });
}

function exportFullHistory(format) {
    const data = getAllRepairsData();
    const today = new Date().toISOString().slice(0, 10);

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
