# 🔥 Руководство по Firebase Console

## Доступ к данным

### 1. Вход в Firebase Console
1. Перейдите на [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Войдите под своим Google аккаунтом
3. Выберите проект `carrepairtracker`

### 2. Просмотр пользователей
**Путь**: Authentication → Users

Здесь вы увидите:
- Email пользователей
- Дата регистрации
- Последний вход
- Статус (активен/заблокирован)
- UID (уникальный идентификатор)

### 3. Просмотр данных о ремонтах
**Путь**: Firestore Database → Data → repairs

Структура данных:
```json
{
  "userId": "user_uid_here",
  "identifier": "1234 AB-1",
  "date": "10.07.2025",
  "hours": 2.5,
  "timestamp": "2025-07-10T00:00:00.000Z"
}
```

### 4. Экспорт данных
**Для пользователей:**
1. Authentication → Users
2. Нажмите "..." → "Export users"
3. Выберите формат (CSV/JSON)

**Для ремонтов:**
1. Firestore Database → Data
2. Выберите коллекцию `repairs`
3. Используйте кнопку экспорта в вашем приложении

## Управление данными

### Добавление тестовых данных
```javascript
// В консоли браузера на странице приложения
db.collection('repairs').add({
    userId: 'test_user_id',
    identifier: '1234 AB-1',
    date: '10.07.2025',
    hours: 2.5,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
});
```

### Удаление данных
**В Firebase Console:**
1. Выберите документ
2. Нажмите "Delete"

**Программно:**
```javascript
db.collection('repairs').doc('document_id').delete();
```

## Безопасность

### Правила доступа
Файл `firestore.rules` содержит правила безопасности:
- Пользователи видят только свои данные
- Требуется аутентификация для всех операций
- Валидация данных на уровне базы

### Резервное копирование
1. Firestore Database → Settings → Backup
2. Настройте автоматическое резервное копирование
3. Экспортируйте данные вручную при необходимости

## Мониторинг

### Аналитика
**Путь**: Analytics → Dashboard
- Активные пользователи
- События в приложении
- Производительность

### Логи
**Путь**: Functions → Logs (если используются функции)
- Ошибки приложения
- Выполненные операции

## Полезные команды

### В консоли браузера
```javascript
// Получить всех пользователей (только для админа)
auth.listUsers()

// Получить все записи ремонтов
db.collection('repairs').get().then(snapshot => {
    snapshot.forEach(doc => console.log(doc.data()));
});

// Получить записи конкретного пользователя
db.collection('repairs')
  .where('userId', '==', 'user_uid_here')
  .get()
  .then(snapshot => {
      snapshot.forEach(doc => console.log(doc.data()));
  });
```

### Экспорт через приложение
1. Войдите в приложение
2. Нажмите FAB-меню (кнопка с тремя полосками)
3. Выберите "Экспорт CSV" или "Экспорт JSON"
4. Файл скачается автоматически 