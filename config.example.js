// ПРИМЕР КОНФИГУРАЦИИ FIREBASE
// Скопируйте этот файл как config.js и замените значения на ваши реальные

window.APP_CONFIG = {
    firebase: {
        apiKey: "AIzaSyBlFjb3N6BdiCT9kH94yrh01hVUprn_JzU", // Ваш API ключ из Firebase Console
        authDomain: "carrepairtracker.firebaseapp.com", // Ваш домен аутентификации
        projectId: "carrepairtracker", // ID вашего проекта
        storageBucket: "carrepairtracker.appspot.com", // Ваш storage bucket
        messagingSenderId: "123456789012", // Ваш Sender ID
        appId: "1:123456789012:web:abcdef1234567890" // Ваш App ID
    },
    app: {
        name: "Car Repair Tracker",
        version: "2.0.0",
        debug: false
    }
};

// ИНСТРУКЦИИ ПО НАСТРОЙКЕ:
// 1. Создайте проект в Firebase Console (https://console.firebase.google.com/)
// 2. Включите Authentication (Email/Password)
// 3. Создайте Firestore Database
// 4. Скопируйте конфигурацию из настроек проекта
// 5. Замените значения выше на ваши реальные данные
// 6. Переименуйте этот файл в config.js
// 7. Добавьте config.js в .gitignore для безопасности

// ПРАВИЛА БЕЗОПАСНОСТИ FIREBASE:
// В Firebase Console настройте правила безопасности:
// - Authentication: разрешите Email/Password
// - Firestore: настройте правила доступа по пользователям
// - Storage: отключите, если не используется 