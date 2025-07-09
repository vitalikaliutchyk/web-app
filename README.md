# 🚗 Car Repair Tracker

Веб-приложение для учета ремонтов автомобилей с автоматическим экспортом данных и деплоем на GitHub Pages.

[![GitHub Pages](https://img.shields.io/badge/-Live%20Demo-success?style=flat&logo=github)](https://ваш-username.github.io/ваш-репозиторий/)
![GitHub last commit](https://img.shields.io/github/last-commit/ваш-username/ваш-репозиторий)

## 🌟 Основные функции
- **Аутентификация**: Регистрация и вход пользователей
- **CRUD операции**: Добавление/редактирование/удаление записей
- **Статистика в реальном времени**: Подсчёт автомобилей и часов
- **Поиск и фильтрация**: Поиск по идентификатору, фильтр по датам
- **Сортировка**: По дате, номеру, часам
- **Пагинация**: Навигация по большим спискам данных
- **Экспорт данных**: CSV и JSON форматы
- **Улучшенная валидация данных**:
  - Гос. номер РБ: `1234 AB-1`, `1234 AB-12`
  - VIN: последние 4 символа или полный VIN (17 символов)
  - Часы: 0.1-24
- **Проверка дубликатов**: Предупреждение о существующих записях
- **Адаптивный интерфейс**: Оптимизирован для всех устройств
- **Обработка ошибок**: Глобальная обработка ошибок и сетевых проблем

## 🛠️ Технологии
- **Frontend**: HTML5/CSS3/JavaScript ES6+
- **Backend**: Firebase (Authentication, Firestore)
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions
- **Security**: Переменные окружения, валидация данных
- **Performance**: Кэширование, пагинация, debounce

## 🚀 Быстрый старт

### 1. Клонирование репозитория
```bash
git clone https://github.com/ваш-username/ваш-репозиторий.git
cd ваш-репозиторий

### 2. Настройка Firebase с переменными окружения

#### Для продакшена (GitHub Pages):
1. Создайте проект в [Firebase Console](https://console.firebase.google.com/)
2. Включите Authentication (Email/Password)
3. Создайте Firestore Database
4. **Добавьте GitHub Secrets** (см. `GITHUB_SECRETS_SETUP.md`)
5. Сделайте коммит и пуш - GitHub Actions автоматически создаст `config.js`

#### Для локальной разработки:
1. Создайте файл `.env.local` в корне проекта
2. Добавьте ваши Firebase ключи:
   ```bash
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   ```
3. Запустите локальный сервер: `npm start`

#### 🔒 Безопасность:
- API ключи хранятся в GitHub Secrets (зашифрованы)
- Локальные ключи в `.env.local` (не попадают в Git)
- Автоматическое создание `config.js` при деплое

### 3. Локальный запуск

#### С Node.js (рекомендуется):
```bash
npm start
# или
node dev-server.js
```

#### С Python:
```bash
npm run serve
# или
python3 -m http.server 8000
```

#### Простой запуск:
Откройте `index.html` в браузере (демо-режим)

### 3. Автоматический деплой при пуше в ветки:

yaml
Copy
name: Deploy Static Site

on:
  push:
    branches: [ "main", "export-2.0", "develop", "feature/*" ]

jobs:
  check-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: |
          # Проверка необходимых файлов
          required_files=("index.html" "styles.css" "script.js")
          for file in "${required_files[@]}"; do
            [ ! -f "$file" ] && exit 1
          done
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./

### 4. Использование

#### Добавление записи:
1. Выберите тип идентификатора (гос. номер или VIN)
2. Введите данные:
   - **Гос. номер**: `1234 AB-1` или `1234 AB-12`
   - **VIN**: последние 4 символа (`Z9X8`) или полный VIN (17 символов)
   - **Часы**: от 0.1 до 24

#### Управление данными:
- **Редактирование**: кнопка ✎
- **Удаление**: кнопка 🗑
- **Поиск**: введите номер в поле поиска
- **Фильтрация**: выберите период в выпадающем списке
- **Сортировка**: выберите критерий сортировки
- **Экспорт**: через FAB-меню (CSV/JSON)

#### Новые функции:
- **Пагинация**: навигация по страницам при большом количестве записей
- **Проверка дубликатов**: предупреждение о существующих записях
- **Валидация в реальном времени**: мгновенная проверка введённых данных
- **Обработка ошибок**: информативные сообщения об ошибках
- **Адаптивность**: оптимизация для мобильных устройств

### 5. Настройка для продакшена
1. Замените все `ваш-username/ваш-репозиторий` на реальные значения
2. Настройте Firebase Security Rules
3. Добавьте файл скриншота интерфейса (screenshot.png)
4. Настройте CI/CD в GitHub Actions

### 6. Структура проекта
```
web-app/
├── index.html          # Главная страница
├── script.js           # Основная логика
├── styles.css          # Стили
├── config.example.js   # Пример конфигурации
├── README.md           # Документация
└── .github/            # GitHub Actions
    └── workflows/
        └── deploy.yml
```    