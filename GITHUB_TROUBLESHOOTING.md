# 🔧 Устранение проблем с GitHub Secrets

## Проблема: "Не могу сделать Pull Request" или проблемы с деплоем

### 🔍 Диагностика проблемы

#### 1. Проверьте статус GitHub Actions
1. Откройте ваш репозиторий на GitHub
2. Перейдите в **Actions** (вкладка)
3. Посмотрите на последние запуски workflow

#### 2. Проверьте настройки GitHub Pages
1. Перейдите в **Settings** → **Pages**
2. Убедитесь, что источник установлен на **GitHub Actions**

#### 3. Проверьте GitHub Secrets
1. Перейдите в **Settings** → **Secrets and variables** → **Actions**
2. Убедитесь, что добавлены все 6 секретов

---

## 🚨 Частые проблемы и решения

### Проблема 1: "Workflow не запускается"

**Решение:**
```bash
# Проверьте, что вы в правильной ветке
git branch
git push origin export--4.0-firebase-final
```

### Проблема 2: "Secrets не найдены"

**Решение:**
1. Добавьте секреты вручную:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`

2. Или используйте демо-режим (без секретов)

### Проблема 3: "Permission denied"

**Решение:**
1. Проверьте права доступа к репозиторию
2. Убедитесь, что у вас есть права на запись

### Проблема 4: "GitHub Pages не работает"

**Решение:**
1. Проверьте настройки Pages в Settings
2. Убедитесь, что выбран источник "GitHub Actions"
3. Подождите 5-10 минут после деплоя

---

## 🛠️ Альтернативные решения

### Вариант 1: Ручной деплой без GitHub Actions

1. **Создайте config.js вручную:**
   ```javascript
   window.APP_CONFIG = {
     firebase: {
       apiKey: "ВАШ_API_КЛЮЧ",
       authDomain: "ВАШ_ПРОЕКТ.firebaseapp.com",
       projectId: "ВАШ_ПРОЕКТ",
       storageBucket: "ВАШ_ПРОЕКТ.appspot.com",
       messagingSenderId: "ВАШ_SENDER_ID",
       appId: "ВАШ_APP_ID"
     }
   };
   ```

2. **Загрузите файлы на GitHub Pages:**
   - Перейдите в Settings → Pages
   - Выберите источник "Deploy from a branch"
   - Выберите ветку `main` или `export--4.0-firebase-final`

### Вариант 2: Использование Netlify

1. **Подключите репозиторий к Netlify**
2. **Добавьте переменные окружения в Netlify:**
   - Перейдите в Site settings → Environment variables
   - Добавьте те же 6 переменных

3. **Настройте build command:**
   ```bash
   echo "window.APP_CONFIG = { firebase: { apiKey: '$FIREBASE_API_KEY', ... } };" > config.js
   ```

### Вариант 3: Локальный хостинг

1. **Создайте .env.local:**
   ```bash
   FIREBASE_API_KEY=ваш_ключ
   FIREBASE_AUTH_DOMAIN=ваш_домен
   # ... остальные переменные
   ```

2. **Запустите локальный сервер:**
   ```bash
   npm start
   ```

---

## 📋 Чек-лист для исправления

- [ ] Проверены настройки GitHub Pages
- [ ] Добавлены все 6 секретов
- [ ] Workflow запускается без ошибок
- [ ] config.js создается корректно
- [ ] Приложение загружается на Pages
- [ ] Firebase подключается успешно

---

## 🆘 Если ничего не помогает

1. **Создайте Issue в репозитории** с описанием проблемы
2. **Проверьте логи GitHub Actions** на наличие ошибок
3. **Попробуйте альтернативный хостинг** (Netlify, Vercel)
4. **Используйте локальную разработку** с `npm start`

---

## 📞 Поддержка

Если проблема не решается:
1. Скопируйте ошибки из GitHub Actions
2. Опишите шаги, которые вы выполняли
3. Укажите версию браузера и ОС

**Помните**: Приложение работает в демо-режиме даже без секретов! 