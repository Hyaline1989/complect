// КОНФИГУРАЦИЯ SUPABASE
const SUPABASE_URL = 'https://gujvwqcwxnkeaaggvjqw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1anZ3cWN3eG5rZWFhZ2d2anF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MjU1MzYsImV4cCI6MjA3NjIwMTUzNn0.c0pv6V5kKUS-sbsL8lgrPDcWIB-dpTbVC4V7W3o8m-4';

// Конфигурация Google Sheets (НОВАЯ ТАБЛИЦА)
const SHEET_ID = '1M2uFFMmSHcbQHSqRW3D2oBjayfdyHuRIBC68Y64uQhI'; // Замените на реальный ID
const SHEET_NAME = 'Заявка';
const SHEET_RANGE = 'A1:H100'; // A: Объект, B: Должность, C: М, D: Ж, E: СЕМ.П, F: Всего М, G: Всего Ж, H: Всего сем

// ПАРОЛИ
const PASSWORDS = {
    "user": "complect2025",
    "admin": "bigboss"
};

// Настройки сессии
const SESSION_DURATION = 12 * 60 * 60 * 1000;
const SESSION_KEY = "sessionData";

// Настройки уведомлений
const NOTIFICATION_KEY = "vacancyNotifications";
const NOTIFICATION_TIMEOUT = 5000; // 5 секунд для показа уведомления

// БАЗОВАЯ СТРУКТУРА ОБЪЕКТОВ
const objectsBase = [
    {
        id: 1,
        name: "Сберлогистика",
        ageMin: 18,
        ageMax: 45,
        allowedGenders: ["мужчина", "женщина"],
        allowedNationalities: ["РФ", "РБ"],
        allowsConviction: false,
        link: "https://docs.google.com/spreadsheets/d/13FLpkCRuY8Bhdq8VzAsUMXlH-O6DcnwMlb3a1d82z44/edit?gid=1671362639#gid=1671362639"
    },
    {
        id: 2,
        name: "СДТ",
        ageMin: 18,
        ageMax: 55,
        allowedGenders: ["мужчина", "женщина"],
        allowedNationalities: ["РФ", "РБ"],
        allowsConviction: true,
        link: "https://docs.google.com/spreadsheets/d/13FLpkCRuY8Bhdq8VzAsUMXlH-O6DcnwMlb3a1d82z44/edit?gid=807193246#gid=807193246"
    },
    {
        id: 3,
        name: "Креветки Клинские",
        ageMin: 18,
        ageMax: 50,
        allowedGenders: ["мужчина", "женщина"],
        allowedNationalities: ["РФ", "РБ", "СНГ"],
        allowsConviction: true,
        link: "https://docs.google.com/spreadsheets/d/13FLpkCRuY8Bhdq8VzAsUMXlH-O6DcnwMlb3a1d82z44/edit?gid=2035276078#gid=2035276078"
    },
    {
        id: 4,
        name: "Мэйджер",
        ageMin: 18,
        ageMax: 55,
        allowedGenders: ["мужчина", "женщина"],
        allowedNationalities: ["РФ", "РБ"],
        allowsConviction: false,
        link: "https://docs.google.com/spreadsheets/d/13FLpkCRuY8Bhdq8VzAsUMXlH-O6DcnwMlb3a1d82z44/edit?gid=1066301663#gid=1066301663"
    },
    {
        id: 5,
        name: "Спортмастер",
        ageMin: 18,
        ageMax: 50,
        allowedGenders: ["мужчина", "женщина"],
        allowedNationalities: ["РФ"],
        allowsConviction: false,
        link: "https://docs.google.com/spreadsheets/d/13FLpkCRuY8Bhdq8VzAsUMXlH-O6DcnwMlb3a1d82z44/edit?gid=2015665303#gid=2015665303"
    },
    {
        id: 6,
        name: "Метро",
        ageMin: 18,
        ageMax: 45,
        allowedGenders: ["мужчина"],
        allowedNationalities: ["РФ"],
        allowsConviction: true,
        link: "https://docs.google.com/spreadsheets/d/13FLpkCRuY8Bhdq8VzAsUMXlH-O6DcnwMlb3a1d82z44/edit?gid=2037581346#gid=2037581346"
    },
    {
        id: 7,
        name: "Клинский мясокомбинат",
        ageMin: 18,
        ageMax: 50,
        allowedGenders: ["мужчина", "женщина"],
        allowedNationalities: ["РФ", "РБ", "СНГ"],
        allowsConviction: false,
        link: "https://docs.google.com/spreadsheets/d/13FLpkCRuY8Bhdq8VzAsUMXlH-O6DcnwMlb3a1d82z44/edit?gid=484336549#gid=484336549"
    },
    {
        id: 8,
        name: "Цветы Раменское",
        ageMin: 18,
        ageMax: 50,
        allowedGenders: ["мужчина", "женщина"],
        allowedNationalities: ["РФ", "РБ"],
        allowsConviction: true,
        link: "https://docs.google.com/spreadsheets/d/13FLpkCRuY8Bhdq8VzAsUMXlH-O6DcnwMlb3a1d82z44/edit?gid=1489900442#gid=1489900442"
    },
    {
        id: 9,
        name: "Агама",
        ageMin: 25,
        ageMax: 45,
        allowedGenders: ["мужчина", "женщина"],
        allowedNationalities: ["РФ", "РБ"],
        allowsConviction: true,
        link: "https://docs.google.com/spreadsheets/d/13FLpkCRuY8Bhdq8VzAsUMXlH-O6DcnwMlb3a1d82z44/edit?gid=371889370#gid=371889370"
    },
    {
        id: 10,
        name: "ФитнесШок",
        ageMin: 18,
        ageMax: 50,
        allowedGenders: ["мужчина", "женщина"],
        allowedNationalities: ["РФ", "РБ"],
        allowsConviction: true,
        link: "https://docs.google.com/spreadsheets/d/13FLpkCRuY8Bhdq8VzAsUMXlH-O6DcnwMlb3a1d82z44/edit?gid=1609895640#gid=1609895640"
    },
    {
        id: 11,
        name: "Тамбовский бекон",
        ageMin: 18,
        ageMax: 50,
        allowedGenders: ["мужчина", "женщина"],
        allowedNationalities: ["РФ"],
        allowsConviction: true,
        link: "https://docs.google.com/spreadsheets/d/13FLpkCRuY8Bhdq8VzAsUMXlH-O6DcnwMlb3a1d82z44/edit?gid=2134096102#gid=2134096102"
    },
    {
        id: 12,
        name: "Павловская птицефабрика",
        ageMin: 18,
        ageMax: 55,
        allowedGenders: ["мужчина", "женщина"],
        allowedNationalities: ["РФ", "РБ", "СНГ"],
        allowsConviction: true,
        link: "https://docs.google.com/spreadsheets/d/13FLpkCRuY8Bhdq8VzAsUMXlH-O6DcnwMlb3a1d82z44/edit?gid=459944799#gid=459944799"
    },
    {
        id: 13,
        name: "АртПак",
        ageMin: 18,
        ageMax: 50,
        allowedGenders: ["мужчина", "женщина"],
        allowedNationalities: ["РФ", "РБ"],
        allowsConviction: true,
        link: "https://docs.google.com/spreadsheets/d/13FLpkCRuY8Bhdq8VzAsUMXlH-O6DcnwMlb3a1d82z44/edit?gid=1786219261#gid=1786219261"
    },
    {
        id: 14,
        name: "Мяснов",
        ageMin: 18,
        ageMax: 55,
        allowedGenders: ["мужчина", "женщина"],
        allowedNationalities: ["РФ", "РБ"],
        allowsConviction: false,
        link: "https://docs.google.com/spreadsheets/d/13FLpkCRuY8Bhdq8VzAsUMXlH-O6DcnwMlb3a1d82z44/edit?gid=912447009#gid=912447009"
    },
    {
        id: 15,
        name: "Мираторг Брянск",
        ageMin: 18,
        ageMax: 55,
        allowedGenders: ["мужчина", "женщина"],
        allowedNationalities: ["РФ", "РБ"],
        allowsConviction: false,
        link: "https://docs.google.com/spreadsheets/d/13FLpkCRuY8Bhdq8VzAsUMXlH-O6DcnwMlb3a1d82z44/edit?gid=1137221797#gid=1137221797"
    },
    {
        id: 16,
        name: "Мираторг Тула",
        ageMin: 18,
        ageMax: 55,
        allowedGenders: ["мужчина", "женщина"],
        allowedNationalities: ["РФ", "РБ"],
        allowsConviction: true,
        link: "https://docs.google.com/spreadsheets/d/13FLpkCRuY8Bhdq8VzAsUMXlH-O6DcnwMlb3a1d82z44/edit?gid=1209986820#gid=1209986820"
    },
    {
        id: 17,
        name: "БелГранКорм",
        ageMin: 18,
        ageMax: 50,
        allowedGenders: ["мужчина", "женщина"],
        allowedNationalities: ["РФ", "РБ", "СНГ"],
        allowsConviction: true,
        link: "https://docs.google.com/spreadsheets/d/13FLpkCRuY8Bhdq8VzAsUMXlH-O6DcnwMlb3a1d82z44/edit?gid=2042428287#gid=2042428287"
    },
    {
        id: 18,
        name: "Индейка Калуга",
        ageMin: 18,
        ageMax: 50,
        allowedGenders: ["мужчина", "женщина"],
        allowedNationalities: ["РФ", "РБ"],
        allowsConviction: true,
        link: "https://docs.google.com/spreadsheets/d/13FLpkCRuY8Bhdq8VzAsUMXlH-O6DcnwMlb3a1d82z44/edit?gid=478943669#gid=478943669"
    },
    {
        id: 19,
        name: "Спортмастер СПБ",
        ageMin: 18,
        ageMax: 45,
        allowedGenders: ["мужчина", "женщина"],
        allowedNationalities: ["РФ", "РБ"],
        allowsConviction: false,
        link: "https://docs.google.com/spreadsheets/d/13FLpkCRuY8Bhdq8VzAsUMXlH-O6DcnwMlb3a1d82z44/edit?gid=1368572665#gid=1368572665"
    },
    {
        id: 20,
        name: "КуулКлевер",
        ageMin: 18,
        ageMax: 55,
        allowedGenders: ["мужчина", "женщина"],
        allowedNationalities: ["СНГ"],
        allowsConviction: false,
        link: "https://docs.google.com/spreadsheets/d/13FLpkCRuY8Bhdq8VzAsUMXlH-O6DcnwMlb3a1d82z44/edit?gid=1379171118#gid=1379171118"
    },
    {
        id: 21,
        name: "Яндекс Тарный",
        ageMin: 18,
        ageMax: 45,
        allowedGenders: ["мужчина", "женщина"],
        allowedNationalities: ["РФ"],
        allowsConviction: false,
        link: "https://docs.google.com/spreadsheets/d/13FLpkCRuY8Bhdq8VzAsUMXlH-O6DcnwMlb3a1d82z44/edit?gid=244932662#gid=244932662"
    },
    {
        id: 22,
        name: "Мармеладыч",
        ageMin: 18,
        ageMax: 50,
        allowedGenders: ["мужчина", "женщина"],
        allowedNationalities: ["РФ", "РБ"],
        allowsConviction: true,
        link: "https://docs.google.com/spreadsheets/d/13FLpkCRuY8Bhdq8VzAsUMXlH-O6DcnwMlb3a1d82z44/edit?gid=1707924363#gid=1707924363"
    }
];

// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
let currentAccessLevel = "";
let isMenuOpen = false;
let sessionTimer = null;
let updateInterval = null;
let objects = [];
let vacancyData = {};
let previousVacancyData = {}; // Для отслеживания изменений
let debugMode = false;
let globalOrder = [];
let hasUnsavedChanges = false;
let isTabActive = true; // Отслеживаем активность вкладки
let pendingNotifications = []; // Очередь уведомлений

// Инициализация Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);