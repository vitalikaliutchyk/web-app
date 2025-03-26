const elements = {
	carForm: document.getElementById('car-form'),
	identifierInput: document.getElementById('identifier-input'),
	hoursInput: document.getElementById('hours'),
	carTableBody: document.querySelector('#car-table tbody'),
	savedHoursTableBody: document.getElementById('saved-hours-table-body'),
	totalCars: document.getElementById('total-cars'),
	totalHours: document.getElementById('total-hours'),
	toggleTableButton: document.getElementById('toggle-table'),
	tableContainer: document.getElementById('table-container'),
	savedHoursContainer: document.getElementById('saved-hours-container'),
	toggleSavedDaysButton: document.getElementById('toggle-saved-days-table'),
}

let carDatabase = JSON.parse(localStorage.getItem('carDatabase')) || []
let savedDays = JSON.parse(localStorage.getItem('savedDays')) || []

// Инициализация
function init() {
	renderCarTable()
	updateStats()
	bindEvents()
}

// Привязка событий
function bindEvents() {
	elements.carForm.addEventListener('submit', handleFormSubmit)
	elements.toggleTableButton.addEventListener('click', () =>
		toggleElement(elements.tableContainer)
	)
	elements.toggleSavedDaysButton.addEventListener('click', () =>
		toggleElement(elements.savedHoursContainer)
	)
	document.addEventListener('click', handleTableActions)
}

// Основные функции
function toggleElement(element) {
	element.classList.toggle('hidden')
}

function getCurrentDate() {
	const d = new Date()
	return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1)
		.toString()
		.padStart(2, '0')}.${d.getFullYear()}`
}

function saveData() {
	localStorage.setItem('carDatabase', JSON.stringify(carDatabase))
	localStorage.setItem('savedDays', JSON.stringify(savedDays))
}

function updateStats() {
	const today = getCurrentDate()
	let total = { cars: 0, hours: 0 }

	carDatabase.forEach(car => {
		car.records.forEach(record => {
			if (record.date === today) {
				total.cars++
				total.hours += record.hours
			}
		})
	})

	elements.totalCars.textContent = total.cars
	elements.totalHours.textContent = total.hours.toFixed(1)
}

// Обработчики
function handleFormSubmit(e) {
	e.preventDefault()
	const identifier = elements.identifierInput.value.trim()
	const hours = parseFloat(elements.hoursInput.value)

	if (identifier && hours > 0) {
		const date = getCurrentDate()
		let car = carDatabase.find(c => c.identifier === identifier)

		if (!car) {
			car = { identifier, records: [] }
			carDatabase.push(car)
		}

		car.records.push({ date, hours })
		saveData()
		renderCarTable()
		updateStats()
		elements.carForm.reset()
	}
}

function handleTableActions(e) {
	if (e.target.classList.contains('delete')) {
		const index = e.target.dataset.index
		const recordIndex = e.target.dataset.record

		carDatabase[index].records.splice(recordIndex, 1)
		if (carDatabase[index].records.length === 0) carDatabase.splice(index, 1)
		saveData()
		renderCarTable()
		updateStats()
	}

	if (e.target.classList.contains('edit')) {
		const index = e.target.dataset.index
		const recordIndex = e.target.dataset.record
		const newHours = parseFloat(
			prompt('Новые часы:', carDatabase[index].records[recordIndex].hours)
		)

		if (!isNaN(newHours)) {
			carDatabase[index].records[recordIndex].hours = newHours
			saveData()
			renderCarTable()
			updateStats()
		}
	}
}

// Рендер таблиц
function renderCarTable() {
	elements.carTableBody.innerHTML = carDatabase
		.flatMap((car, index) =>
			car.records.map(
				(record, recordIndex) => `
                <tr>
                    <td>${car.identifier}</td>
                    <td>${record.date}</td>
                    <td>${record.hours.toFixed(1)}</td>
                    <td>
                        <button class="edit" data-index="${index}" data-record="${recordIndex}">✎</button>
                        <button class="delete" data-index="${index}" data-record="${recordIndex}">🗑</button>
                    </td>
                </tr>
            `
			)
		)
		.join('')
}

// Запуск приложения
init()
