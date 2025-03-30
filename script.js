const elements = {
    carForm: document.getElementById('car-form'),
    identifierInput: document.getElementById('identifier-input'),
    hoursInput: document.getElementById('hours'),
    carTableBody: document.querySelector('#car-table tbody'),
    savedHoursTableBody: document.getElementById('saved-hours-table-body'),
    totalCars: document.getElementById('total-cars'),
    totalHours: document.getElementById('total-hours'),
    tableContainer: document.getElementById('table-container'),
    savedHoursContainer: document.getElementById('saved-hours-container')
};

let carDatabase = JSON.parse(localStorage.getItem('carDatabase')) || [];

function init() {
    renderCarTable();
    renderSavedHoursTable();
    updateStats();
    bindEvents();
    checkMobile();
}

function bindEvents() {
    elements.carForm.addEventListener('submit', handleFormSubmit);
    document.addEventListener('click', handleTableActions);
    window.addEventListener('resize', checkMobile);
    
    // Обработчики для FAB меню
    document.querySelectorAll('.fab-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const action = e.currentTarget.dataset.action;
            handleFabAction(action);
            toggleFabMenu();
        });
    });
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
    localStorage.setItem('carDatabase', JSON.stringify(carDatabase));
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
    const identifier = elements.identifierInput.value.trim();
    const hours = parseFloat(elements.hoursInput.value);

    if (identifier && hours > 0) {
        const date = getCurrentDate();
        let car = carDatabase.find(c => c.identifier === identifier);

        if (!car) {
            car = { identifier, records: [] };
            carDatabase.push(car);
        }

        car.records.push({ date, hours });
        saveData();
        renderCarTable();
        renderSavedHoursTable();
        updateStats();
        elements.carForm.reset();
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
    const newHours = parseFloat(
        prompt('Введите новые часы:', carDatabase[index].records[recordIndex].hours)
    );

    if (!isNaN(newHours) {
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
