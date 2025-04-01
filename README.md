# 🚗 Car Repair Tracker

Веб-приложение для учета ремонтов автомобилей с автоматическим экспортом данных и деплоем на GitHub Pages.

[![GitHub Pages](https://img.shields.io/badge/-Live%20Demo-success?style=flat&logo=github)](https://ваш-username.github.io/ваш-репозиторий/)
![GitHub last commit](https://img.shields.io/github/last-commit/ваш-username/ваш-репозиторий)

## 🌟 Основные функции
- Добавление/редактирование/удаление записей
- Статистика в реальном времени
- Экспорт данных в CSV/JSON
- Валидация данных:
  - Гос. номер РБ: `1234 AB-1`
  - VIN: последние 4 символа (Z9X8)
  - Часы: 0.1-24
- Адаптивный интерфейс

## 🛠️ Технологии
- HTML5/CSS3/JavaScript
- GitHub Pages
- GitHub Actions

## 🚀 Быстрый старт

### 1. Клонирование репозитория
```bash
git clone https://github.com/ваш-username/ваш-репозиторий.git
cd ваш-репозиторий

### 2. Локальный запуск
Откройте index.html в браузере.
📦 GitHub Actions

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

### 4.📝 Использование

### 5. Добавление записи:
    Выберите тип идентификатора
    Введите данные:
        Идентификатор: 1234 AB-1 (гос. номер) или Z9X8 (VIN)
        Часы: 2.5

### 6. Управление данными:
    Редактирование: кнопка ✎
    Удаление: кнопка 🗑
    Экспорт через FAB-меню

### 7. 
Чтобы использовать:
    1. Замените все `ваш-username/ваш-репозиторий` на реальные значения
    2. Добавьте файл скриншота интерфейса (screenshot.png)
    3. При необходимости дополните разделы

Этот файл:
    - Содержит всю ключевую информацию
    - Поддерживает Markdown-форматирование
    - Включает бейджи для визуального оформления
    - Предоставляет прямые ссылки для взаимодействия
    - Совместим с GitHub/GitLab    