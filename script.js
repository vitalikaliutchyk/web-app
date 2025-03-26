const elements = {
	carForm: document.getElementById('car-form'),
	identifierInput: document.getElementById('identifier-input'),
	hoursInput: document.getElementById('hours'),
	identifierType: document.getElementById('identifier-type'),
	carTableBody: document.querySelector('#car-table tbody'),
	savedHoursTableBody: document.getElementById('saved-hours-table-body'),
	totalHoursElement: document.getElementById('total-hours'),
	toggleTableButton: document.getElementById('toggle-table'),
	toggleSavedDaysButton: document.getElementById('toggle-saved-days-table'),
	tableContainer: document.getElementById('table-container'),
	savedHoursContainer: document.getElementById('saved-hours-container'),
}

// Локальная база данных
let carDatabase = JSON.parse(localStorage.getItem('carDatabase')) || []
let savedHours = JSON.parse(localStorage.getItem('savedHours')) || []
let lastSavedDate =
	savedHours.length > 0 ? savedHours[savedHours.length - 1].date : null

// Функция для сохранения данных в localStorage
function saveToLocalStorage(key, value) {
	localStorage.setItem(key, JSON.stringify(value))
}

// Функция для автоматического сохранения часов за предыдущий день
function autoSavePreviousDayHours() {
	const currentDate = new Date().toLocaleDateString()

	if (lastSavedDate !== currentDate) {
		let totalHoursYesterday = 0

		// Собираем суммарные часы за предыдущий день
		carDatabase.forEach(car => {
			car.records.forEach(record => {
				if (record.date === lastSavedDate) {
					totalHoursYesterday += record.hours
				}
			})
		})

		// Сохраняем часы за предыдущий день
		if (totalHoursYesterday > 0) {
			savedHours.push({ date: lastSavedDate, totalHours: totalHoursYesterday })
			saveToLocalStorage('savedHours', savedHours)
			renderSavedHoursTable()
		}
	}
}

// Добавление записи
function addCarRecord(identifier, hours) {
	const date = new Date().toLocaleDateString()
	let car = carDatabase.find(car => car.identifier === identifier)

	if (!car) {
		car = { identifier, records: [] }
		carDatabase.push(car)
	}

	car.records.push({ date, hours })
	saveToLocalStorage('carDatabase', carDatabase)
	renderCarTable()
}

// Рендер таблицы автомобилей
function renderCarTable() {
	elements.carTableBody.innerHTML = ''
	carDatabase.forEach((car, carIndex) => {
		car.records.forEach((record, recordIndex) => {
			const row = document.createElement('tr')
			row.innerHTML = `
                <td contenteditable="true" class="editable-identifier" data-car-index="${carIndex}" data-record-index="${recordIndex}">
                  ${car.identifier}
                </td>
                <td>${record.date}</td>
                <td contenteditable="true" class="editable-hours" data-car-index="${carIndex}" data-record-index="${recordIndex}">
                  ${record.hours.toFixed(1)}
                </td>
                <td>
                  <button class="edit" data-car-index="${carIndex}" data-record-index="${recordIndex}">Изменить</button>
                  <button class="delete" data-car-index="${carIndex}" data-record-index="${recordIndex}">Удалить</button>
                </td>
            `
			elements.carTableBody.appendChild(row)
		})
	})
}

// Рендер сохранённых часов
function renderSavedHoursTable() {
	elements.savedHoursTableBody.innerHTML = ''
	savedHours.forEach(day => {
		const row = document.createElement('tr')
		row.innerHTML = `
            <td>${day.date}</td>
            <td>${day.totalHours.toFixed(1)} ч</td>
        `
		elements.savedHoursTableBody.appendChild(row)
	})
}

// Обработчик формы
elements.carForm.addEventListener('submit', e => {
	e.preventDefault()

	const identifierType = elements.identifierType.value
	const identifierInput = elements.identifierInput.value.trim()
	const hours = parseFloat(elements.hoursInput.value)

	if (isNaN(hours) || hours <= 0) {
		alert('Введите корректное количество часов.')
		return
	}

	addCarRecord(identifierInput, hours)
	autoSavePreviousDayHours()
	elements.carForm.reset()
})

// Удаление записей
elements.carTableBody.addEventListener('click', e => {
	const carIndex = e.target.dataset.carIndex
	const recordIndex = e.target.dataset.recordIndex

	if (e.target.classList.contains('delete')) {
		carDatabase[carIndex].records.splice(recordIndex, 1)
		if (carDatabase[carIndex].records.length === 0)
			carDatabase.splice(carIndex, 1)
		saveToLocalStorage('carDatabase', carDatabase)
		renderCarTable()
	}

	if (e.target.classList.contains('edit')) {
		const newHours = prompt(
			'Введите новые нормо-часы:',
			carDatabase[carIndex].records[recordIndex].hours
		)
		if (newHours !== null && !isNaN(newHours) && parseFloat(newHours) > 0) {
			carDatabase[carIndex].records[recordIndex].hours = parseFloat(newHours)
			saveToLocalStorage('carDatabase', carDatabase)
			renderCarTable()
		}
	}
})

// Показать/скрыть таблицу автомобилей
elements.toggleTableButton.addEventListener('click', () => {
	const isHidden = elements.tableContainer.classList.toggle('hidden')
	if (isHidden) {
		showNotification('Таблица скрыта.')
	} else {
		showNotification('Таблица отображена.')
	}
})

// Показать/скрыть таблицу сохранённых дней
elements.toggleSavedDaysButton.addEventListener('click', () => {
	const isHidden = elements.savedHoursContainer.classList.toggle('hidden')
	if (isHidden) {
		showNotification('Сохранённые дни скрыты.')
	} else {
		showNotification('Сохранённые дни отображены.')
	}
})

// Показать уведомление
function showNotification(message) {
	const notification = document.createElement('div')
	notification.className = 'notification'
	notification.textContent = message
	document.body.appendChild(notification)
	setTimeout(() => {
		notification.classList.add('show')
	}, 10)
	setTimeout(() => {
		notification.classList.remove('show')
		setTimeout(() => notification.remove(), 500)
	}, 3000)
}

// Инициализация
renderCarTable()
renderSavedHoursTable()
autoSavePreviousDayHours()
