const elements = {
	carForm: document.getElementById('car-form'),
	identifierInput: document.getElementById('identifier-input'),
	hoursInput: document.getElementById('hours'),
	identifierType: document.getElementById('identifier-type'),
	carTableBody: document.querySelector('#car-table tbody'),
	savedHoursTableBody: document.getElementById('saved-hours-table-body'),
	currentDateElement: document.getElementById('current-date'),
	totalCarsElement: document.getElementById('total-cars'),
	totalHoursElement: document.getElementById('total-hours'),
	toggleTableButton: document.getElementById('toggle-table'),
	toggleSavedDaysButton: document.getElementById('toggle-saved-days-table'),
	tableContainer: document.getElementById('table-container'),
	savedHoursContainer: document.getElementById('saved-hours-container'),
}

let carDatabase = JSON.parse(localStorage.getItem('carDatabase')) || []
let savedHours = JSON.parse(localStorage.getItem('savedHours')) || []
let lastSavedDate =
	savedHours.length > 0 ? savedHours[savedHours.length - 1].date : null

// Единый формат даты
function getCurrentDate() {
	const date = new Date()
	return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
		.toString()
		.padStart(2, '0')}.${date.getFullYear()}`
}

function saveToLocalStorage(key, value) {
	localStorage.setItem(key, JSON.stringify(value))
}

function autoSavePreviousDayHours() {
	const currentDate = getCurrentDate()
	if (lastSavedDate !== currentDate) {
		let totalHoursYesterday = 0
		let totalCarsYesterday = 0

		carDatabase.forEach(car => {
			car.records.forEach(record => {
				if (record.date === lastSavedDate) {
					totalHoursYesterday += record.hours
					totalCarsYesterday++
				}
			})
		})

		if (totalCarsYesterday > 0) {
			savedHours.push({
				date: lastSavedDate,
				totalHours: totalHoursYesterday,
				totalCars: totalCarsYesterday,
			})
			saveToLocalStorage('savedHours', savedHours)
			renderSavedHoursTable()
		}
		lastSavedDate = currentDate
	}
}

function updateDailyStats() {
	const currentDate = getCurrentDate()
	elements.currentDateElement.textContent = currentDate

	let totalCars = 0
	let totalHours = 0

	carDatabase.forEach(car => {
		car.records.forEach(record => {
			if (record.date === currentDate) {
				totalCars++
				totalHours += record.hours
			}
		})
	})

	elements.totalCarsElement.textContent = totalCars
	elements.totalHoursElement.textContent = totalHours.toFixed(1)
}

function addCarRecord(identifier, hours) {
	const date = getCurrentDate()
	let car = carDatabase.find(car => car.identifier === identifier)

	if (!car) {
		car = { identifier, records: [] }
		carDatabase.push(car)
	}

	car.records.push({ date, hours })
	saveToLocalStorage('carDatabase', carDatabase)
	renderCarTable()
	updateDailyStats()
	autoSavePreviousDayHours()
}

function renderCarTable() {
	elements.carTableBody.innerHTML = ''
	carDatabase.forEach((car, carIndex) => {
		car.records.forEach((record, recordIndex) => {
			const row = document.createElement('tr')
			row.innerHTML = `
                <td>${car.identifier}</td>
                <td>${record.date}</td>
                <td>${record.hours.toFixed(1)}</td>
                <td>
                    <button class="edit" data-car-index="${carIndex}" data-record-index="${recordIndex}">Изменить</button>
                    <button class="delete" data-car-index="${carIndex}" data-record-index="${recordIndex}">Удалить</button>
                </td>
            `
			elements.carTableBody.appendChild(row)
		})
	})
}

function renderSavedHoursTable() {
	elements.savedHoursTableBody.innerHTML = ''
	savedHours.forEach(day => {
		const row = document.createElement('tr')
		row.innerHTML = `
            <td>${day.date}</td>
            <td>${day.totalCars} авто</td>
            <td>${day.totalHours.toFixed(1)} ч</td>
        `
		elements.savedHoursTableBody.appendChild(row)
	})
}

elements.carForm.addEventListener('submit', e => {
	e.preventDefault()
	const identifier = elements.identifierInput.value.trim()
	const hours = parseFloat(elements.hoursInput.value)

	if (!identifier || isNaN(hours) || hours <= 0) {
		showNotification('Ошибка: Проверьте введенные данные!')
		return
	}

	addCarRecord(identifier, hours)
	elements.carForm.reset()
	showNotification('Автомобиль добавлен!')
})

elements.carTableBody.addEventListener('click', e => {
	if (e.target.classList.contains('delete')) {
		const carIndex = e.target.dataset.carIndex
		const recordIndex = e.target.dataset.recordIndex

		carDatabase[carIndex].records.splice(recordIndex, 1)
		if (carDatabase[carIndex].records.length === 0) {
			carDatabase.splice(carIndex, 1)
		}

		saveToLocalStorage('carDatabase', carDatabase)
		renderCarTable()
		updateDailyStats()
	}

	if (e.target.classList.contains('edit')) {
		const carIndex = e.target.dataset.carIndex
		const recordIndex = e.target.dataset.recordIndex
		const newHours = parseFloat(
			prompt(
				'Новые нормо-часы:',
				carDatabase[carIndex].records[recordIndex].hours
			)
		)

		if (!isNaN(newHours) && newHours > 0) {
			carDatabase[carIndex].records[recordIndex].hours = newHours
			saveToLocalStorage('carDatabase', carDatabase)
			renderCarTable()
			updateDailyStats()
		}
	}
})

function showNotification(message) {
	const notification = document.createElement('div')
	notification.className = 'notification'
	notification.textContent = message
	document.body.appendChild(notification)
	setTimeout(() => notification.remove(), 3000)
}

function init() {
	renderCarTable()
	renderSavedHoursTable()
	autoSavePreviousDayHours()
	updateDailyStats()
	setInterval(() => {
		autoSavePreviousDayHours()
		updateDailyStats()
	}, 30000)
}

init()
