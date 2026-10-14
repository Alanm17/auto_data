# SaleScout — Kaspi Repricing Engine (Прайс-бот)

Решение тестового задания для стажёра / web-разработчика **SaleScout**.  
Сервис автоматического управления ценами продавцов на **Kaspi.kz**: бот отслеживает предложения конкурентов и выставляет оптимальную цену, чтобы продавец выигрывал 1-е место (Buy Box) с сохранением маржинальности.

---

## ⚡ Быстрый старт

### Требования
- **Node.js**: >= 20.x
- **npm**: >= 10.x

### Установка зависимостей
```bash
npm install
```

### Запуск тестов (Vitest)
```bash
npm test
```
> Запускает 20 тестов: алгоритм `calculatePrice` (включая проверку соответствия `products.json` → `expected.json`, граничные условия, округление, tie-break, `inStock: false`) и интеграционные тесты API `POST /reprice` (валидация, статус 400 при некорректном теле, статус 200).

### Запуск проекта (Backend + Frontend)
Для одновременного запуска сервера и интерфейса с горячей перезагрузкой (HMR):
```bash
npm run dev
```
- **Web UI (Vite + React)**: [http://localhost:5173](http://localhost:5173) (проксирует `/reprice` на порт 3000)
- **API Server (Express)**: [http://localhost:3000](http://localhost:3000)
- **Health Check**: [http://localhost:3000/health](http://localhost:3000/health)

### Раздельный запуск (по желанию)
```bash
# Терминал 1: Запуск API сервера Express (порт 3000)
npm run server:dev

# Терминал 2: Запуск фронтенда Vite (порт 5173)
npm run client:dev
```

### Сборка и продакшн-запуск
```bash
# Сборка фронтенда
npm run build

# Запуск сервера, который также раздает готовую статику фронтенда из dist/
npm run server
```

---

## 🏗 Архитектура решения

```
├── data/
│   ├── products.json            # Исходные демо-товары
│   └── expected.json            # Эталонный результат расчёта
├── src/
│   ├── pricing.ts               # Чистая функция calculatePrice(product) [НЕ МЕНЯЛАСЬ СИГНАТУРА]
│   ├── pricing.test.ts          # Vitest тесты на calculatePrice (все граничные случаи)
│   ├── types.ts                 # Базовые типы (Product, Competitor, PriceResult, Reason)
│   ├── server.ts                # Express HTTP API (POST /reprice, GET /health, GET /api/products)
│   ├── server.test.ts           # Интеграционные тесты API с supertest
│   └── client/                  # Полнофункциональный веб-интерфейс на React (Vite)
│       ├── main.tsx             # Точка входа React
│       ├── App.tsx              # Главный дашборд
│       ├── types.ts             # Типы клиентской части (RBAC, AuditLog, SortConfig)
│       ├── index.css            # Дизайн-система (CSS Custom Properties, Dark/Light темы, анимации)
│       ├── context/
│       │   └── AuthContext.tsx  # Ролевая модель доступа (RBAC: Admin, Analyst, Viewer)
│       └── components/
│           ├── Navbar.tsx       # Шапка: статус API, авто-пилот бот, журнал, темы, смена ролей
│           ├── StatsCards.tsx   # KPI-карточки (UNDERCUT, AT_MIN, AT_MAX, NO_COMPETITORS, Win Rate)
│           ├── Toolbar.tsx      # Поиск по SKU/названию, фильтры причин, экспорт CSV, JSON
│           ├── PricingTable.tsx # Таблица «Было / Стало» со шкалой маржи и действиями
│           ├── ProductDetailDrawer.tsx # What-If симулятор конкурентов в реальном времени
│           ├── AddProductModal.tsx     # Модальное окно добавления нового товара
│           ├── JsonModal.tsx           # Интерактивный JSON-редактор каталога
│           └── AuditLogModal.tsx       # Журнал аудита всех операций пересчёта
├── index.html                   # Корневой HTML с шрифтами Inter и JetBrains Mono
├── vite.config.ts               # Конфигурация Vite с API-проксированием
└── tsconfig.json                # Строгий TypeScript с поддержкой React JSX
```

---

## 🌟 Ключевые возможности интерфейса

1. **Таблица «Было / Стало»**:
   - Отображение SKU (с возможностью быстрого копирования в буфер обмена).
   - Название товара, шаг демпинга (`step`).
   - Границы `[minPrice — maxPrice]` с **визуальной шкалой безопасности маржи** (Margin Safety Gauge), показывающей положение новой цены в допустимом диапазоне.
   - Старая цена (`oldPrice` / `myPrice`), новая цена (`newPrice`) в тенге (`₸`).
   - Разница в тенге и в процентах с цветовой индикацией.
   - Цветные бейджи причин с подробными всплывающими подсказками (`UNDERCUT`, `AT_MIN`, `AT_MAX`, `NO_COMPETITORS`).
   - Сортировка по любому столбцу (SKU, название, старая цена, новая цена, дельта, причина).

2. **Ролевая модель доступа (RBAC)**:
   - В правом верхнем углу доступен мгновенный переключатель ролей (в 1 клик):
     - **Admin (Алишер Касымов)**: полный доступ — изменение порогов цен (`minPrice`/`maxPrice`), добавление/удаление товаров, пересчет, управление авто-пилотом.
     - **Pricing Analyst (Динара Сатпаева)**: ручной пересчет цен, запуск What-If симулятора, экспорт отчетов. Защитные пороги заблокированы от случайного изменения.
     - **Auditor / Viewer (Ерлан Нургалиев)**: режим только для чтения.

3. **What-If Симулятор конкурентов (Drawer)**:
   - Клик по товару или кнопке конкурентов открывает боковую панель.
   - Можно в реальном времени изменить цену любого конкурента, выключить чекбокс *«В наличии»* или добавить нового конкурента — и мгновенно увидеть результат пересчёта формулы!

4. **Авто-пилот Kaspi Bot (Simulation Mode)**:
   - Кнопка «🤖 Авто-пилот» в шапке включает периодический фоновый пересчет каталога с обратным отсчетом и анимацией пульса.
   - Все изменения автоматически логируются в **Журнал аудита**.

5. **Журнал аудита (Audit Trail)**:
   - Хранит хронологию каждого пересчёта: точное время, товар, старая цена → новая цена, причина и автор изменения.

6. **Импорт / Экспорт**:
   - Кнопка **«Экспорт»** выгружает отчёт «было / стало» в формате CSV (Excel-совместимый с кодировкой UTF-8 BOM).
   - Кнопка **«JSON»** открывает редактор для вставки или редактирования произвольного массива `Product[]`.

7. **Темы оформления (Dark & Light Mode)**:
   - Переключение между тёмной темой в стиле современных торговых терминалов (Linear/Kaspi Red) и светлой темой с сохранением выбора в `localStorage`.

---

## 📐 Правила расчёта цены (`calculatePrice`)

Реализована чистая функция в [`src/pricing.ts`](file:///Users/test/Downloads/salescout-intern-task-main/src/pricing.ts):

1. **Фильтрация**: учитываются только конкуренты с `inStock: true`.
2. **Нет конкурентов**: если активных конкурентов нет (или список пуст) → `newPrice = maxPrice`, `reason = "NO_COMPETITORS"`.
3. **Лучшая цена (`best`)**: находим минимальную цену среди конкурентов в наличии.
4. **Кандидат**: `candidate = Math.floor(best - product.step)` (округление вниз до целого тенге).
5. **Ограничение диапазоном**:
   - `candidate < minPrice` → `newPrice = minPrice`, `reason = "AT_MIN"`;
   - `candidate > maxPrice` → `newPrice = maxPrice`, `reason = "AT_MAX"`;
   - иначе (`minPrice <= candidate <= maxPrice`) → `newPrice = candidate`, `reason = "UNDERCUT"`.
6. `myPrice` не участвует в математике и возвращается как `oldPrice`.

---

## 📡 HTTP API (`POST /reprice`)

- **URL**: `http://localhost:3000/reprice`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body**: `Product[]`
- **Ответ 200**: `PriceResult[]` в том же порядке.
- **Ответ 400**: При невалидном теле (не массив, синтаксическая ошибка JSON или некорректная структура товара).

Пример вызова через curl:
```bash
curl -X POST http://localhost:3000/reprice \
  -H "Content-Type: application/json" \
  -d @data/products.json
```

---

## 🧪 Тестирование

Тесты написаны на **Vitest** и покрывают:
- Полное совпадение с эталонными `data/products.json` → `data/expected.json`;
- Правило `NO_COMPETITORS` при пустом списке конкурентов;
- Правило `NO_COMPETITORS` при наличии только конкурентов `inStock: false`;
- `UNDERCUT` при целочисленном шаге и шаге с плавающей точкой (напр. 0.5 ₸);
- Поддержка `step = 0`;
- Обработка ничьей (несколько конкурентов с одинаковой минимальной ценой);
- Срабатывание нижнего порога `AT_MIN`;
- Срабатывание верхнего порога `AT_MAX`;
- Включение границ диапазона (`candidate === minPrice` и `candidate === maxPrice` дают `UNDERCUT`);
- Независимость расчета от `myPrice`;
- API-тесты (200 OK, 400 Bad Request на объекты/строки/битый JSON/неверные поля).

Запуск:
```bash
npm test
```

---

## 📜 Осмысленная история коммитов

В репозитории сохранена чистая, поэтапная история коммитов:
1. `chore: initial commit from template`
2. `feat(pricing): implement calculatePrice algorithm`
3. `test(pricing): add comprehensive unit tests for calculatePrice with vitest`
4. `feat(api): implement Express server with POST /reprice and validation`
5. `feat(ui): implement modern React dashboard with RBAC, What-If simulator, and dark/light themes`
6. `docs: update README with full documentation, architecture, and run guides`
