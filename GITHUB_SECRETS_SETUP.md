# 🔐 Настройка GitHub Secrets для переменных окружения

## Что такое GitHub Secrets?

GitHub Secrets - это зашифрованные переменные окружения, которые можно использовать в GitHub Actions. Они не видны в логах и не попадают в код.

## 🚀 Как настроить Secrets для Firebase

### 1. Получите конфигурацию Firebase

1. Откройте [Firebase Console](https://console.firebase.google.com/)
2. Выберите ваш проект
3. Перейдите в **Project Settings** (⚙️)
4. В разделе **Your apps** найдите веб-приложение
5. Скопируйте конфигурацию:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBlFjb3N6BdiCT9kH94yrh01hVUprn_JzU",
  authDomain: "carrepairtracker.firebaseapp.com",
  projectId: "carrepairtracker",
  storageBucket: "carrepairtracker.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### 2. Добавьте Secrets в GitHub

1. Откройте ваш репозиторий на GitHub
2. Перейдите в **Settings** → **Secrets and variables** → **Actions**
3. Нажмите **New repository secret**
4. Добавьте следующие секреты:

| Имя Secret | Значение |
|------------|----------|
| `FIREBASE_API_KEY` | `AIzaSyBlFjb3N6BdiCT9kH94yrh01hVUprn_JzU` |
| `FIREBASE_AUTH_DOMAIN` | `carrepairtracker.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | `carrepairtracker` |
| `FIREBASE_STORAGE_BUCKET` | `carrepairtracker.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | `123456789012` |
| `FIREBASE_APP_ID` | `1:123456789012:web:abcdef1234567890` |

### 3. Проверьте настройки

После добавления всех секретов:

1. Сделайте коммит и пуш в ветку `main` или `export--4.0-firebase-final`
2. GitHub Actions автоматически создаст `config.js` с вашими секретами
3. Приложение будет развернуто на GitHub Pages

## 🔒 Безопасность

- ✅ Секреты зашифрованы
- ✅ Не видны в логах
- ✅ Не попадают в код
- ✅ Можно обновить в любой момент
- ✅ Доступны только в GitHub Actions

## 🛠️ Локальная разработка

Для локальной разработки создайте файл `.env.local`:

```bash
FIREBASE_API_KEY=AIzaSyBlFjb3N6BdiCT9kH94yrh01hVUprn_JzU
FIREBASE_AUTH_DOMAIN=carrepairtracker.firebaseapp.com
FIREBASE_PROJECT_ID=carrepairtracker
FIREBASE_STORAGE_BUCKET=carrepairtracker.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789012
FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

И используйте локальный сервер с поддержкой переменных окружения.

## 📋 Чек-лист

- [ ] Получена конфигурация Firebase
- [ ] Добавлены все 6 секретов в GitHub
- [ ] Сделан коммит и пуш
- [ ] GitHub Actions выполнился успешно
- [ ] Приложение работает на GitHub Pages

## 🚨 Устранение неполадок

### Если приложение не работает:

1. **Проверьте GitHub Actions** - есть ли ошибки в логах
2. **Проверьте секреты** - все ли добавлены правильно
3. **Проверьте консоль браузера** - есть ли ошибки JavaScript
4. **Проверьте Firebase Console** - включена ли аутентификация

### Если секреты не работают:

1. Убедитесь, что имена секретов точно совпадают с теми, что в workflow
2. Проверьте, что значения скопированы без лишних пробелов
3. Попробуйте пересоздать секреты

---

**Важно**: Никогда не коммитьте реальные ключи Firebase в код! 