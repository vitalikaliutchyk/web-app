# ⚡ Быстрый старт с переменными окружения

## 🚀 Ваше приложение теперь использует переменные окружения!

### Для продакшена (GitHub Pages):

1. **Добавьте GitHub Secrets:**
   - Откройте репозиторий → Settings → Secrets and variables → Actions
   - Добавьте 6 секретов (см. `GITHUB_SECRETS_SETUP.md`)

2. **Запушьте изменения:**
   ```bash
   git push origin export--4.0-firebase-final
   ```

3. **GitHub Actions автоматически:**
   - Создаст `config.js` с вашими секретами
   - Развернет приложение на GitHub Pages

### Для локальной разработки:

1. **Создайте `.env.local`:**
   ```bash
   FIREBASE_API_KEY=AIzaSyBlFjb3N6BdiCT9kH94yrh01hVUprn_JzU
   FIREBASE_AUTH_DOMAIN=carrepairtracker.firebaseapp.com
   FIREBASE_PROJECT_ID=carrepairtracker
   FIREBASE_STORAGE_BUCKET=carrepairtracker.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=123456789012
   FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
   ```

2. **Запустите сервер:**
   ```bash
   npm start
   # или
   node dev-server.js
   ```

3. **Откройте:** http://localhost:3000

## 🔒 Безопасность

- ✅ **GitHub Secrets** - зашифрованы, не видны в логах
- ✅ **.env.local** - не попадает в Git
- ✅ **Автоматическое создание config.js** - только при деплое
- ✅ **Демо-режим** - работает без ключей

## 📁 Новые файлы

- `.github/workflows/deploy.yml` - автоматический деплой
- `dev-server.js` - локальный сервер с переменными окружения
- `package.json` - управление зависимостями
- `GITHUB_SECRETS_SETUP.md` - подробная инструкция
- `.env.local` - ваши локальные ключи (создайте сами)

## 🎯 Что изменилось

1. **Убран открытый API ключ** из кода
2. **Добавлены GitHub Secrets** для продакшена
3. **Создан локальный сервер** для разработки
4. **Автоматический деплой** с переменными окружения
5. **Демо-режим** для тестирования

---

**Приложение готово к безопасному деплою!** 🎉 