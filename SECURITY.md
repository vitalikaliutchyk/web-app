# 🔒 Руководство по безопасности

## API ключи Firebase

### Почему API ключи безопасны в браузере?

API ключи Firebase **безопасны** для использования в клиентском коде по следующим причинам:

1. **Ограничения по домену**: API ключи привязаны к конкретным доменам
2. **Правила безопасности**: Доступ контролируется правилами Firestore
3. **Аутентификация**: Пользователи должны войти в систему
4. **Авторизация**: Каждый пользователь видит только свои данные

### Настройка безопасности

#### 1. Firebase Console - Authentication
```
1. Перейдите в Firebase Console → Authentication
2. Включите Email/Password аутентификацию
3. Добавьте разрешенные домены (ваш домен)
4. Настройте правила паролей (минимум 6 символов)
```

#### 2. Firebase Console - Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Пользователи могут читать/писать только свои данные
    match /repairs/{document} {
      allow read, write: if request.auth != null && 
                           request.auth.uid == resource.data.userId;
    }
    
    // Создание новых записей
    match /repairs/{document} {
      allow create: if request.auth != null && 
                      request.auth.uid == request.resource.data.userId;
    }
  }
}
```

#### 3. Ограничения API ключа
```
1. Firebase Console → Project Settings → General
2. В разделе "Your apps" найдите ваш веб-приложение
3. Нажмите "Add domain" и добавьте только ваши домены
4. Удалите ненужные домены
```

### Дополнительные меры безопасности

#### 1. Переменные окружения (для продакшена)
```bash
# Создайте .env файл (не добавляйте в Git)
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
```

#### 2. Content Security Policy (CSP)
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' https://www.gstatic.com; 
               connect-src 'self' https://your-project.firebaseapp.com;">
```

#### 3. HTTPS обязателен
- Всегда используйте HTTPS в продакшене
- Firebase требует HTTPS для аутентификации
- GitHub Pages автоматически предоставляет HTTPS

### Мониторинг безопасности

#### 1. Firebase Console - Usage
```
1. Отслеживайте использование API
2. Проверяйте логи аутентификации
3. Мониторьте подозрительную активность
```

#### 2. Логирование ошибок
```javascript
// В script.js уже настроено логирование
console.error('Security event:', {
  user: currentUser?.email,
  action: 'login_attempt',
  timestamp: new Date().toISOString()
});
```

### Чек-лист безопасности

- [ ] API ключ привязан к домену
- [ ] Настроены правила Firestore
- [ ] Включена аутентификация
- [ ] Используется HTTPS
- [ ] config.js добавлен в .gitignore
- [ ] Мониторинг активности включен
- [ ] Пароли соответствуют требованиям
- [ ] Регулярное обновление зависимостей

### В случае компрометации

1. **Немедленно** измените API ключ в Firebase Console
2. Проверьте логи на подозрительную активность
3. Обновите config.js с новым ключом
4. Уведомите пользователей о необходимости перелогина
5. Рассмотрите возможность сброса всех сессий

### Контакты для безопасности

Если вы обнаружили уязвимость:
1. Создайте Issue в GitHub с тегом `security`
2. Не публикуйте детали публично
3. Опишите проблему в личном сообщении

---

**Важно**: Это руководство должно регулярно обновляться в соответствии с новыми угрозами и лучшими практиками безопасности. 