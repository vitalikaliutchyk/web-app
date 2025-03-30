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

function init() {
	renderCarTable()
	renderSavedHoursTable()
	updateStats()
	bindEvents()
}

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
		renderSavedHoursTable()
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
		renderSavedHoursTable()
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
			renderSavedHoursTable()
			updateStats()
		}
	}
}

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

function renderSavedHoursTable() {
	const allRecords = carDatabase.flatMap(car => car.records)
	const daysMap = {}

	allRecords.forEach(record => {
		if (!daysMap[record.date]) {
			daysMap[record.date] = {
				cars: 0,
				hours: 0,
			}
		}
		daysMap[record.date].cars++
		daysMap[record.date].hours += record.hours
	})

	const sortedDays = Object.entries(daysMap)
		.map(([date, data]) => ({ date, ...data }))
		.sort((a, b) => {
			const [dayA, monthA, yearA] = a.date.split('.')
			const [dayB, monthB, yearB] = b.date.split('.')
			return (
				new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA)
			)
		})

	elements.savedHoursTableBody.innerHTML = sortedDays
		.map(
			day => `
            <tr>
                <td>${day.date}</td>
                <td>${day.cars}</td>
                <td>${day.hours.toFixed(1)}</td>
            </tr>
        `
		)
		.join('')
}

function getAllRepairsData() {
	return carDatabase
		.flatMap(car =>
			car.records.map(record => ({
				date: record.date,
				identifier: car.identifier,
				hours: record.hours,
			}))
		)
		.sort((a, b) => {
			const [dayA, monthA, yearA] = a.date.split('.')
			const [dayB, monthB, yearB] = b.date.split('.')
			return (
				new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA)
			)
		})
}

function exportFullHistory(format) {
	const repairsData = getAllRepairsData()
	const today = new Date().toISOString().slice(0, 10)

	if (format === 'csv') {
		// CSV экспорт
		const csvHeader = 'Дата;Идентификатор;Нормо-часы'
		const csvRows = repairsData.map(
			item => `${item.date};${item.identifier};${item.hours.toFixed(1)}`
		)
		const csvContent = [csvHeader, ...csvRows].join('\n')

		const blob = new Blob(['\ufeff' + csvContent], {
			type: 'text/csv;charset=utf-8',
		})
		const link = document.createElement('a')
		link.href = URL.createObjectURL(blob)
		link.download = `полная_история_ремонтов_${today}.csv`
		link.click()
	} else if (format === 'json') {
		// JSON экспорт
		const jsonData = {
			generated: new Date().toISOString(),
			totalRecords: repairsData.length,
			repairs: repairsData,
		}

		const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
			type: 'application/json',
		})
		const link = document.createElement('a')
		link.href = URL.createObjectURL(blob)
		link.download = `полная_история_ремонтов_${today}.json`
		link.click()
	}
}

init()
