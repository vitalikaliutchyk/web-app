const elements = {
    carForm: document.getElementById('car-form'),
    identifierInput: document.getElementById('identifier-input'),
    hoursInput: document.getElementById('hours'),
    carTableBody: document.querySelector('#car-table tbody'),
    savedHoursTableBody: document.getElementById('saved-hours-table-body'),
    currentDateElement: document.getElementById('current-date'),
    totalCarsElement: document.getElementById('total-cars'),
    totalHoursElement: document.getElementById('total-hours'),
    tableContainer: document.getElementById('table-container'),
    savedHoursContainer: document.getElementById('saved-hours-container')
};

let carDatabase = JSON.parse(localStorage.getItem('carDatabase')) || [];
let savedDays = JSON.parse(localStorage.getItem('savedDays')) || [];

// Инициализация
function init() {
    renderAll();
    setInterval(() => {
        checkDayChange();
        renderAll();
    }, 10000);
}

// Основные функции
function getCurrentDate() {
    const d = new Date();
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth()+1).toString().padStart(2, '0')}.${d.getFullYear()}`;
}

function saveData() {
    localStorage.setItem('carDatabase', JSON.stringify(carDatabase));
    localStorage.setItem('savedDays', JSON.stringify(savedDays));
}

function addCar(identifier, hours) {
    const date = getCurrentDate();
    const car = carDatabase.find(c => c.identifier === identifier) || { identifier, records: [] };
    
    car.records.push({ date, hours });
    if(!carDatabase.includes(car)) carDatabase.push(car);
    
    saveData();
    renderAll();
}

function deleteRecord(carIndex, recordIndex) {
    const car = carDatabase[carIndex];
    car.records.splice(recordIndex, 1);
    if(car.records.length === 0) carDatabase.splice(carIndex, 1);
    saveData();
    renderAll();
}

// Рендер
function renderAll() {
    renderCarTable();
    renderHistory();
    updateStats();
}

function renderCarTable() {
    elements.carTableBody.innerHTML = carDatabase
        .flatMap((car, carIndex) => 
            car.records.map((record, recordIndex) => `
                <tr>
                    <td>${car.identifier}</td>
                    <td>${record.date}</td>
                    <td>${record.hours.toFixed(1)}</td>
                    <td>
                        <button onclick="editRecord(${carIndex}, ${recordIndex})">✏️</button>
                        <button onclick="deleteRecord(${carIndex}, ${recordIndex})">🗑️</button>
                    </td>
                </tr>
            `)
        ).join('');
}

function renderHistory() {
    elements.savedHoursTableBody.innerHTML = savedDays
        .map(day => `
            <tr>
                <td>${day.date}</td>
                <td>${day.totalCars}</td>
                <td>${day.totalHours.toFixed(1)}</td>
            </tr>
        `).join('');
}

function updateStats() {
    const today = getCurrentDate();
    const todayData = carDatabase
        .flatMap(c => c.records)
        .filter(r => r.date === today);
    
    elements.totalCarsElement.textContent = todayData.length;
    elements.totalHoursElement.textContent = 
        todayData.reduce((sum, r) => sum + r.hours, 0).toFixed(1);
    elements.currentDateElement.textContent = today;
}

// Обработчики событий
elements.carForm.addEventListener('submit', e => {
    e.preventDefault();
    const identifier = elements.identifierInput.value.trim();
    const hours = parseFloat(elements.hoursInput.value);
    
    if(identifier && !isNaN(hours) {
        addCar(identifier, hours);
        elements.carForm.reset();
    }
});

function checkDayChange() {
    const lastDate = savedDays.length > 0 ? savedDays[savedDays.length-1].date : null;
    const currentDate = getCurrentDate();
    
    if(lastDate !== currentDate) {
        const yesterdayData = carDatabase
            .flatMap(c => c.records)
            .filter(r => r.date === lastDate);
        
        if(yesterdayData.length > 0) {
            savedDays.push({
                date: lastDate,
                totalCars: yesterdayData.length,
                totalHours: yesterdayData.reduce((s, r) => s + r.hours, 0)
            });
            saveData();
        }
    }
}

// Запуск
init();
