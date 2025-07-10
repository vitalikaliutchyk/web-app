// Firebase конфигурация для Netlify
const firebaseConfig = {
    apiKey: "AIzaSyDkUIUXmSF4cYG4EcjMGyvuJAwatNzLVo0",
    authDomain: "autosave-ec76f.firebaseapp.com",
    projectId: "autosave-ec76f",
    storageBucket: "autosave-ec76f.firebasestorage.app",
    messagingSenderId: "602316950855",
    appId: "1:602316950855:web:9914a6f9b9f7676e09d062",
    measurementId: "G-V2G3C8THK8"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);

// Инициализация сервисов
const auth = firebase.auth();
const db = firebase.firestore();

// Глобальные переменные
let currentUser = null;
let carsData = [];
let currentPage = 1;
const itemsPerPage = 10;
let filteredData = [];
let searchTerm = '';
let sortBy = 'timestamp-desc';
let dateFilter = 'all'; 