const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Загружаем переменные окружения из .env.local
function loadEnvVars() {
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        const envVars = {};
        
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                envVars[key.trim()] = value.trim();
            }
        });
        
        return envVars;
    }
    return {};
}

// Создаем config.js из переменных окружения
function createConfigJS(envVars) {
    return `// Конфигурация Firebase из переменных окружения
window.APP_CONFIG = {
    firebase: {
        apiKey: "${envVars.FIREBASE_API_KEY || 'YOUR_API_KEY'}",
        authDomain: "${envVars.FIREBASE_AUTH_DOMAIN || 'your-project.firebaseapp.com'}",
        projectId: "${envVars.FIREBASE_PROJECT_ID || 'your-project-id'}",
        storageBucket: "${envVars.FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com'}",
        messagingSenderId: "${envVars.FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID'}",
        appId: "${envVars.FIREBASE_APP_ID || 'YOUR_APP_ID'}"
    },
    app: {
        name: "Car Repair Tracker",
        version: "2.0.0",
        debug: true
    }
};

// Проверка конфигурации для разработки
(function() {
    const config = window.APP_CONFIG.firebase;
    const requiredFields = ['apiKey', 'authDomain', 'projectId'];
    
    const missingFields = requiredFields.filter(field => 
        !config[field] || config[field].includes('YOUR_') || config[field].includes('your-')
    );
    
    if (missingFields.length > 0) {
        console.warn('Firebase configuration incomplete. Missing:', missingFields);
        console.warn('Create .env.local file with your Firebase configuration');
        
        document.addEventListener('DOMContentLoaded', () => {
            const warning = document.createElement('div');
            warning.style.cssText = \`
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #ff9800;
                color: white;
                padding: 10px;
                text-align: center;
                z-index: 10000;
                font-weight: bold;
            \`;
            warning.textContent = '⚠️ Демо-режим. Создайте .env.local для полноценной работы.';
            document.body.appendChild(warning);
        });
    } else {
        console.log('✅ Firebase configuration loaded from environment variables');
    }
})();`;
}

// MIME типы
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Создаем HTTP сервер
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;
    
    // Обрабатываем запрос к config.js
    if (pathname === '/config.js') {
        const envVars = loadEnvVars();
        const configJS = createConfigJS(envVars);
        
        res.writeHead(200, {
            'Content-Type': 'application/javascript',
            'Cache-Control': 'no-cache'
        });
        res.end(configJS);
        return;
    }
    
    // Обрабатываем корневой путь
    if (pathname === '/') {
        pathname = '/index.html';
    }
    
    // Получаем расширение файла
    const ext = path.extname(pathname);
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    // Читаем файл
    const filePath = path.join(__dirname, pathname);
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 - Internal Server Error</h1>');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`🚀 Сервер разработки запущен на http://localhost:${PORT}`);
    console.log(`📁 Корневая папка: ${__dirname}`);
    console.log(`🔧 Config.js создается динамически из переменных окружения`);
    
    const envVars = loadEnvVars();
    if (Object.keys(envVars).length === 0) {
        console.log(`⚠️  Файл .env.local не найден. Приложение работает в демо-режиме.`);
        console.log(`📝 Создайте .env.local с вашими Firebase ключами для полноценной работы.`);
    } else {
        console.log(`✅ Переменные окружения загружены из .env.local`);
    }
    
    console.log(`\n📖 Документация:`);
    console.log(`   - GITHUB_SECRETS_SETUP.md - настройка GitHub Secrets`);
    console.log(`   - README.md - общая документация`);
    console.log(`   - SECURITY.md - руководство по безопасности`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Сервер остановлен');
    server.close(() => {
        process.exit(0);
    });
}); 