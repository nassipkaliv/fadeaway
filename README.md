# FADEAWAY — Sneakers Store

Full-stack e-commerce приложение для продажи кроссовок.

- **Backend**: Django 6 + Django REST Framework + JWT auth + PostgreSQL
- **Frontend**: React 18 + Vite + React Router + Swiper
- **Auth**: JWT (access + refresh)

## Возможности

- Каталог кроссовок с фильтрами (бренд, категория, цена) и сортировкой
- Карточка товара с галереей картинок и похожими товарами
- Поиск по названию
- Корзина (localStorage)
- Регистрация и логин (JWT)
- Оформление заказа (создаёт Order + OrderItem-ы в базе)
- Страница "My Orders" — история заказов пользователя
- Django Admin для управления товарами, категориями и заказами (CRUD)

## Структура проекта

```
fadeaway/
├── backend/                Django проект
│   ├── config/             settings, urls
│   ├── shop/               models, serializers, views, admin, urls
│   │   ├── fixtures/products.json
│   │   └── management/commands/seed_products.py
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
├── src/                    React приложение
│   ├── api/client.js       Fetch-клиент + JWT logic
│   ├── contexts/           auth, cart, products, filters, common
│   ├── pages/              Home, AllProducts, ProductDetails, Cart, Login, Register, Orders
│   ├── components/
│   ├── routes/
│   └── data/               UI-меню (brands, categories, footer)
├── scripts/dump_products.mjs  одноразовый скрипт для генерации фикстуры
├── vite.config.js          dev-proxy /api → :8000
└── package.json
```

## Локальный запуск

### 1. Prerequisites

- Python 3.13 (`brew install python@3.13`)
- PostgreSQL 16 (`brew install postgresql@16 && brew services start postgresql@16`)
- Node 18+

### 2. База

```bash
createdb fadeaway
```

### 3. Backend

```bash
cd backend
python3.13 -m venv ../venv
source ../venv/bin/activate
pip install -r requirements.txt

# Скопируй .env.example → .env и заполни DB_USER своим Postgres-юзером
cp .env.example .env

python manage.py migrate
python manage.py createsuperuser     # для входа в /admin/
python manage.py seed_products       # 19 кроссовок + категории
python manage.py runserver           # http://127.0.0.1:8000
```

### 4. Frontend (в отдельном терминале)

```bash
npm install
npm run dev                          # http://localhost:5173
```

Vite-прокси сам перенаправит `/api/*` запросы на `http://127.0.0.1:8000`.

## API эндпоинты

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/sneakers/` | Список кроссовок (фильтры: `?brand=`, `?category=`, `?tag=`, `?max_price=`, `?search=`) |
| GET | `/api/sneakers/<id>/` | Один товар |
| POST/PUT/DELETE | `/api/sneakers/...` | CRUD (только admin) |
| GET | `/api/categories/` | Список категорий |
| POST | `/api/auth/register/` | Регистрация (`username, email, password`) |
| POST | `/api/auth/login/` | Логин → `{ access, refresh }` |
| POST | `/api/auth/refresh/` | Обновление access-токена |
| GET | `/api/auth/me/` | Профиль (требует Bearer-токен) |
| GET/POST | `/api/orders/` | Заказы текущего юзера / создать заказ |

## Модели базы

- **Category** (name, slug)
- **Sneakers** (brand, title, info, FK category, prices, ratings, tag, stock, timestamps)
- **SneakerImage** (FK sneaker, url, position) — массив картинок товара
- **Order** (FK user, total_amount, status, address, phone, created_at)
- **OrderItem** (FK order, FK sneaker, quantity, unit_price)

Связи: Category 1—N Sneakers — 1—N SneakerImage; User 1—N Order — 1—N OrderItem N—1 Sneakers.

## Django Admin

`http://127.0.0.1:8000/admin/` — полноценный CRUD для всех моделей с поиском, фильтрами и inline-редактированием картинок/позиций заказа.
