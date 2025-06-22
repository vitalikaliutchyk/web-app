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

// Firebase конфигурация (ЗАМЕНИТЕ НА ВАШУ)
const firebaseConfig = FIREBASE_API_KEY

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let repairsUnsubscribe = null;
let repairsData = []; // Глобальный массив для хранения данных о ремонтах

function init() {
    bindEvents();
    checkMobile();
    checkAuthState();
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
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            showApp();
            setupRealtimeUpdates();
        } else {
            showAuth();
        }
    });
}

function setupRealtimeUpdates() {
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
            let message = 'Ошибка входа';
            switch (error.code) {
                case 'auth/user-not-found':
                    message = 'Пользователь не найден';
                    break;
                case 'auth/wrong-password':
                    message = 'Неверный пароль';
                    break;
                case 'auth/invalid-email':
                    message = 'Неверный формат email';
                    break;
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
            let message = 'Ошибка регистрации';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    message = 'Email уже используется';
                    break;
                case 'auth/weak-password':
                    message = 'Слабый пароль (минимум 6 символов)';
                    break;
                case 'auth/invalid-email':
                    message = 'Неверный формат email';
                    break;
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
        
        // Проверка аутентификации
        if (!currentUser || !currentUser.uid) {
            showValidationMessage('Ошибка: пользователь не аутентифицирован', false);
            return;
        }
        
        db.collection('repairs').add({
            userId: currentUser.uid,
            identifier,
            date,
            hours,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            elements.carForm.reset();
            // Сообщение об успехе покажет onSnapshot после обновления данных
        })
        .catch(error => {
            console.error('Add repair error:', error);
            
            let message = 'Ошибка при добавлении данных';
            if (error.code === 'permission-denied') {
                message = 'Недостаточно прав. Проверьте правила Firestore.';
            } else if (error.code === 'failed-precondition') {
                message = 'Требуется создать индекс. Проверьте консоль.';
            }
            
            showValidationMessage(message, false);
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
    elements.carTableBody.innerHTML = '';
    
    repairsData.forEach(repair => {
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

function exportFullHistory(format) {
    const repairs = repairsData.map(repair => ({
        date: repair.date,
        identifier: repair.identifier,
        hours: repair.hours
    }));
    
    const today = new Date().toISOString().slice(0, 10);
    
    if (format === 'csv') {
        const csvContent = [
            'Дата;Идентификатор;Часы',
            ...repairs.map(item => `${item.date};${item.identifier};${item.hours.toFixed(1)}`)
        ].join('\n');
        
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8' });
        downloadFile(blob, `история_ремонтов_${today}.csv`);
    } else {
        const jsonData = {
            generated: new Date().toISOString(),
            totalRecords: repairs.length,
            repairs: repairs
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

// Инициализация приложения
init();
