// Модуль валидации
class ValidationManager {
    constructor() {
        this.regPattern = /^\d{4}[A-Z]{2}-[1-8]$/;
        this.vinPattern = /^[A-Z0-9]{4}$/;
        this.fullVinPattern = /^[A-Z0-9]{17}$/;
    }

    // Валидация идентификатора
    validateIdentifier(value, type) {
        const trimmedValue = value.trim().toUpperCase();

        if (type === 'reg') {
            return {
                isValid: this.regPattern.test(trimmedValue),
                value: trimmedValue,
                error: 'Формат белорусского номера: 1234AB-1 (цифра после дефиса от 1 до 8)'
            };
        } else if (type === 'vin') {
            if (trimmedValue.length === 4) {
                return {
                    isValid: this.vinPattern.test(trimmedValue),
                    value: trimmedValue,
                    error: 'Введите последние 4 символа VIN (буквы и цифры)'
                };
            } else if (trimmedValue.length === 17) {
                if (this.fullVinPattern.test(trimmedValue)) {
                    return {
                        isValid: true,
                        value: trimmedValue.slice(-4),
                        error: ''
                    };
                }
                return {
                    isValid: false,
                    value: trimmedValue,
                    error: 'Полный VIN должен содержать 17 символов (буквы и цифры)'
                };
            } else {
                return {
                    isValid: false,
                    value: trimmedValue,
                    error: 'Введите последние 4 символа VIN (например: Z9X8)'
                };
            }
        }

        return {
            isValid: false,
            value: trimmedValue,
            error: 'Неверный тип идентификатора'
        };
    }

    // Валидация нормо-часов
    validateHours(hours) {
        const hoursNum = parseFloat(hours);
        const isValid = !isNaN(hoursNum) && hoursNum >= 0.1 && hoursNum <= 24;
        
        return {
            isValid,
            value: hoursNum,
            error: isValid ? '' : 'Диапазон: 0.1-24'
        };
    }

    // Проверка формы перед отправкой
    validateForm(identifier, identifierType, hours) {
        const identifierValidation = this.validateIdentifier(identifier, identifierType);
        const hoursValidation = this.validateHours(hours);

        return {
            isValid: identifierValidation.isValid && hoursValidation.isValid,
            identifier: identifierValidation,
            hours: hoursValidation
        };
    }
}

