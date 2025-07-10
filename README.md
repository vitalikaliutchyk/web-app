# 🚗 Учёт автомобилей - Веб-приложение

Веб-приложение для учёта ремонтов автомобилей с аутентификацией и базой данных Firebase.

## ✨ Возможности

- 🔐 **Регистрация и авторизация** пользователей
- 📝 **Добавление записей** о ремонтах автомобилей
- 🔍 **Поиск и фильтрация** по идентификаторам
- 📊 **Статистика** по дням и часам
- 📱 **Адаптивный дизайн** для мобильных устройств
- 📤 **Экспорт данных** в CSV и JSON форматах
- 🔄 **Пагинация** для больших списков

## 🚀 Развертывание на Netlify

### 1. Подготовка проекта

1. **Создайте Firebase проект:**
   - Перейдите на [console.firebase.google.com](https://console.firebase.google.com/)
   - Создайте новый проект
   - Добавьте веб-приложение
   - Включите Authentication (Email/Password)
   - Создайте Firestore Database

2. **Обновите конфигурацию:**
   - Откройте файл `config.js`
   - Замените `firebaseConfig` на ваши ключи

### 2. Развертывание на Netlify

#### Вариант 1: Через Netlify UI

1. **Загрузите файлы:**
   - Перейдите на [netlify.com](https://netlify.com)
   - Нажмите "New site from Git" или "Deploy manually"
   - Загрузите папку с проектом

2. **Настройте переменные окружения:**
   - В настройках сайта → Environment variables
   - Добавьте Firebase ключи (если используете env vars)

#### Вариант 2: Через Git

1. **Загрузите в Git:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/repo-name.git
   git push -u origin main
   ```

2. **Подключите к Netlify:**
   - В Netlify выберите "New site from Git"
   - Подключите ваш репозиторий
   - Настройте переменные окружения

### 3. Настройка Firebase

1. **В Firebase Console:**
   - Authentication → Sign-in method → Email/Password → Enable
   - Firestore Database → Create database → Start in test mode
   - Project Settings → Your apps → Add domain (ваш netlify.app домен)

2. **Правила безопасности Firestore:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/cars/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

## 📁 Структура проекта

```
web-app/
├── index.html          # Главная страница
├── styles.css          # Стили
├── script.js           # Основная логика
├── config.js           # Firebase конфигурация
├── README.md           # Документация
└── .gitignore          # Исключения Git
```

## 🔧 Локальная разработка

1. **Клонируйте репозиторий:**
   ```bash
   git clone https://github.com/username/repo-name.git
   cd repo-name
   ```

2. **Настройте Firebase:**
   - Обновите `config.js` с вашими ключами

3. **Запустите локальный сервер:**
   ```bash
   # Python 3
   python3 -m http.server 8000
   
   # Или Node.js
   npx serve .
   
   # Или любой другой сервер
   ```

4. **Откройте в браузере:**
   ```
   http://localhost:8000
   ```

## 🎯 Использование

### Регистрация и вход
1. Откройте приложение
2. Нажмите "Зарегистрироваться"
3. Введите email и пароль
4. Подтвердите пароль
5. Нажмите "Зарегистрироваться"

### Добавление записей
1. Войдите в систему
2. Выберите тип идентификатора (номер или VIN)
3. Введите идентификатор автомобиля
4. Укажите количество нормо-часов
5. Нажмите "Добавить запись"

### Поиск и фильтрация
- Используйте поиск по идентификатору
- Фильтруйте по датам
- Сортируйте по различным параметрам

### Экспорт данных
- Нажмите на FAB меню (круглая кнопка)
- Выберите "Экспорт CSV" или "Экспорт JSON"

## 🔒 Безопасность

- Все данные хранятся в Firebase Firestore
- Аутентификация через Firebase Auth
- Правила безопасности на уровне базы данных
- Валидация данных на клиенте и сервере

## 🐛 Устранение неполадок

### Ошибка "auth/api-key-not-valid"
- Проверьте правильность API ключа в `config.js`
- Убедитесь, что проект Firebase создан правильно

### Ошибка "permission-denied"
- Проверьте правила безопасности Firestore
- Убедитесь, что пользователь авторизован

### Данные не загружаются
- Проверьте консоль браузера на ошибки
- Убедитесь, что Firestore Database создана
- Проверьте подключение к интернету

## 📞 Поддержка

При возникновении проблем:
1. Проверьте консоль браузера (F12)
2. Убедитесь, что все настройки Firebase корректны
3. Проверьте правила безопасности Firestore

## 📄 Лицензия

MIT License - используйте свободно для любых целей.    