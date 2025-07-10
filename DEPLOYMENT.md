# Развертывание на Netlify

## Шаг 1: Подготовка Firebase проекта

1. **Создайте Firebase проект:**
   - Перейдите на [console.firebase.google.com](https://console.firebase.google.com/)
   - Создайте новый проект
   - Добавьте веб-приложение

2. **Настройте Authentication:**
   - Authentication → Sign-in method → Email/Password → Enable

3. **Создайте Firestore Database:**
   - Firestore Database → Create database → Start in test mode

4. **Настройте правила безопасности Firestore:**
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

## Шаг 2: Обновите конфигурацию Firebase

Откройте файл `config.js` и замените `firebaseConfig` на ваши ключи:

```javascript
const firebaseConfig = {
  apiKey: "ваш-api-key",
  authDomain: "ваш-проект.firebaseapp.com",
  projectId: "ваш-проект-id",
  storageBucket: "ваш-проект.appspot.com",
  messagingSenderId: "ваш-sender-id",
  appId: "ваш-app-id"
};
```

## Шаг 3: Развертывание на Netlify

### Вариант 1: Через Netlify UI

1. **Загрузите файлы:**
   - Перейдите на [netlify.com](https://netlify.com)
   - Нажмите "New site from Git" или "Deploy manually"
   - Загрузите папку с проектом

2. **Настройте переменные окружения (опционально):**
   - В настройках сайта → Environment variables
   - Добавьте Firebase ключи

### Вариант 2: Через Git (рекомендуется)

1. **Загрузите в Git:**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Подключите к Netlify:**
   - В Netlify выберите "New site from Git"
   - Подключите ваш GitHub репозиторий
   - Выберите ветку (main или master)
   - Настройте переменные окружения

## Шаг 4: Настройка домена в Firebase

1. **В Firebase Console:**
   - Project Settings → Your apps → Add domain
   - Добавьте ваш netlify.app домен

## Шаг 5: Проверка работы

1. Откройте ваш сайт на Netlify
2. Зарегистрируйтесь с новым аккаунтом
3. Добавьте тестовые записи
4. Проверьте экспорт PDF

## Возможные проблемы

### Ошибка "auth/api-key-not-valid"
- Проверьте правильность API ключа в `config.js`
- Убедитесь, что проект Firebase создан правильно

### Ошибка "permission-denied"
- Проверьте правила безопасности Firestore
- Убедитесь, что пользователь авторизован

### CORS ошибки
- Проверьте настройки домена в Firebase
- Убедитесь, что домен добавлен в разрешенные

## Структура файлов для деплоя

```
web-app/
├── index.html          # Главная страница
├── script.js           # Основная логика
├── styles.css          # Стили
├── config.js           # Firebase конфигурация
├── netlify.toml        # Конфигурация Netlify
├── .gitignore          # Исключения Git
├── README.md           # Документация
└── DEPLOYMENT.md       # Инструкции по развертыванию
``` 