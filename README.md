# 👟 FADEAWAY — Sneakers Store

> Финальный проект курса **Python Fundamentals and Applied Development**
> Преподаватель: Bekdaulet Shapigullin
> Автор: Nassipkali Yernur, Adilzhan Kairgaliev

Full-stack интернет-магазин кроссовок <b>FADEAWAY</b>: каталог, корзина, авторизация, оформление заказов, административная панель.

---

## 🌐 Живая версия

| Сервис | URL |
|---|---|
| **Frontend (React)** | https://fadeaway.vercel.app |
| **Backend API (Django REST)** | https://fadeaway-backend-07ey.onrender.com/api/sneakers/ |
| **Admin панель** | https://fadeaway-backend-07ey.onrender.com/admin/ |

> ⚠️ Первый запрос к бэкенду может занять 30–50 секунд — Render Free Tier усыпляет сервис после 15 минут неактивности.

---

## 🎯 Какую задачу решает проект

**Проблема:** маленьким локальным селлерам кроссовок нужна площадка для продаж без затрат на разработку и аренду готовых платформ (Shopify ≈ $30/мес).

**Решение:** open-source full-stack витрина, которую можно развернуть бесплатно (Render + Vercel = $0/мес) и наполнить через удобную админку — без программистов после первичной настройки.

**Ценность:**
- Полный CRUD товаров и заказов из коробки (Django Admin).
- JWT-авторизация — безопасно и стандартно для REST.
- Готовый адаптивный фронтенд с фильтрами, поиском, корзиной и оформлением.
- Полное покрытие тестами критичной логики (заказы, склад, авторизация).

---

## 🧰 Стек технологий

### Backend
- **Python 3.13** — основной язык
- **Django 6.0** — веб-фреймворк
- **Django REST Framework 3.17** — REST API
- **SimpleJWT 5.5** — JWT-токены (access + refresh)
- **PostgreSQL 16** — реляционная база данных
- **psycopg2** — драйвер Postgres
- **gunicorn** — WSGI-сервер для прода
- **whitenoise** — отдача статики без отдельного nginx
- **django-cors-headers** — CORS для общения с фронтом
- **python-decouple** — переменные окружения

### Frontend
- **React 18** — UI-библиотека
- **Vite 4** — сборщик (быстрее CRA в ~10 раз)
- **React Router 6** — клиентская маршрутизация
- **Swiper 9** — слайдеры для главной и галереи
- **Sass (SCSS)** — стили с миксинами и переменными
- **React Icons** — иконки (IoMd*, Bs*, Ai*, Si*)

### DevOps
- **Render** — хостинг бэкенда + PostgreSQL
- **Vercel** — хостинг фронтенда (CDN + auto-deploy)
- **GitHub** — версионирование и CI триггеры

---

## ✨ Основные возможности

### Для покупателей
1. **Каталог** с фильтрами по бренду, категории, цене и сортировкой (latest/featured/top rated/price asc/desc)
2. **Поиск** по названию товара (мгновенный, через модалку)
3. **Карточка товара** с галереей картинок, рейтингом, похожими товарами
4. **Корзина** (хранится в localStorage до checkout)
5. **Регистрация и вход** (JWT-токены в localStorage)
6. **Оформление заказа** — создаёт `Order` + `OrderItem`-ы в базе, уменьшает склад
7. **История заказов** `/orders` со статус-бейджами (pending / paid / shipped / cancelled)
8. **Toast-уведомления** на действия (логин, добавление в корзину, ошибки)

### Для администратора
1. **Django Admin** (`/admin/`) — полноценный CRUD для всех моделей
2. **Inline-редактирование** картинок товара (можно добавлять/удалять прямо на странице)
3. **Inline-просмотр позиций** заказа (без перехода)
4. **Фильтры и поиск** в админке (по бренду, категории, статусу, дате)
5. **Управление статусом заказа** (dropdown: pending → paid → shipped → cancelled)
6. **Управление пользователями** и правами

### Безопасность
- Пароли хранятся как **PBKDF2-хеши** (стандарт Django)
- **JWT-подпись** HS256 + secret из env
- **Throttling**: 10 логинов / 5 регистраций / 120 анонимных запросов в минуту (anti-bruteforce)
- **CORS** ограничен заранее заданными origins
- **Stock validation** при оформлении — нельзя купить больше чем есть (atomic transaction)
- **Server-side ценообразование** — клиент не может подделать `unit_price` через payload

---

## 🏗 Архитектура

```
┌──────────────────┐         HTTPS/JSON           ┌────────────────────┐
│  React frontend  │  ←──────────────────────→    │  Django backend    │
│  Vercel CDN      │   /api/* + JWT Bearer        │  Render (gunicorn) │
└──────────────────┘                              └─────────┬──────────┘
                                                            │ SQL
                                                            ▼
                                                   ┌─────────────────┐
                                                   │ PostgreSQL 16   │
                                                   │ Render Managed  │
                                                   └─────────────────┘
```

**Flow добавления товара в корзину и оформления заказа:**

1. React: `useProducts()` → `GET /api/sneakers/` → Django читает Postgres → JSON ответ
2. Пользователь жмёт "Add to cart" → ProductCard добавляет в `cartContext` (localStorage)
3. Cart → "Checkout" → `POST /api/orders/` с массивом items + JWT Bearer
4. Django:
   - валидирует stock (`OrderSerializer.validate_items`)
   - в транзакции создаёт Order + OrderItems
   - уменьшает stock у каждой Sneakers
   - возвращает 201 + созданный объект
5. React: toast "Order placed" → redirect на `/orders`

---

## 🗃 Схема базы данных

```
┌──────────┐    1—N    ┌────────────┐    1—N    ┌──────────────┐
│ Category │──────────→│  Sneakers  │──────────→│ SneakerImage │
└──────────┘           └─────┬──────┘           └──────────────┘
                             │ N
                             │ (PROTECT)
                             ▼
                      ┌────────────┐    N—1    ┌──────────┐
                      │ OrderItem  │──────────→│  Order   │
                      └────────────┘           └────┬─────┘
                                                    │ N—1
                                                    ▼
                                             ┌──────────┐
                                             │   User   │ (django.contrib.auth)
                                             └──────────┘
```

### Модели

| Модель | Ключевые поля | Связи |
|---|---|---|
| **Category** | name, slug | → many Sneakers (`SET_NULL` при удалении) |
| **Sneakers** | brand, title, info, final_price, original_price, ratings, rate_count, tag, hero_image, stock, timestamps | category (FK), → many SneakerImage |
| **SneakerImage** | url, position | → Sneakers (`CASCADE`) |
| **Order** | total_amount, status, address, phone, created_at | user (FK), → many OrderItem |
| **OrderItem** | quantity, unit_price | order (`CASCADE`), sneaker (`PROTECT`) |

**Важные ограничения:**
- `Category.slug` — `UNIQUE`
- `OrderItem.sneaker` — `PROTECT`: нельзя удалить кроссовку, если она в чьём-то заказе (целостность истории)
- `OrderItem.order` — `CASCADE`: удаление заказа удаляет его позиции
- Цены — `DecimalField` (не Float — иначе округление)
- `auto_now_add=True` на created_at, `auto_now=True` на updated_at

---

## 🔌 REST API

База: `https://fadeaway-backend-07ey.onrender.com`

### Публичные эндпоинты

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/sneakers/` | Список товаров с пагинацией (24 на странице) |
| GET | `/api/sneakers/{id}/` | Один товар с массивом картинок |
| GET | `/api/categories/` | Список категорий |

**Query параметры для `/api/sneakers/`:**
- `?search=nike` — поиск по brand/title/info
- `?brand=Nike` — фильтр по бренду
- `?category=Rap` — фильтр по категории
- `?tag=featured-product` — фильтр по тегу (hero/featured/regular)
- `?max_price=10000` — максимальная цена
- `?ordering=final_price` — сортировка (или `-final_price` для убывания)
- `?page=2` — пагинация

### Авторизация

| Метод | Путь | Описание |
|---|---|---|
| POST | `/api/auth/register/` | `{username, email, password}` → 201 User |
| POST | `/api/auth/login/` | `{username, password}` → `{access, refresh}` |
| POST | `/api/auth/refresh/` | `{refresh}` → `{access}` (новый) |
| GET | `/api/auth/me/` | Текущий юзер (требует Bearer) |

### Защищённые (требуют JWT)

| Метод | Путь | Описание |
|---|---|---|
| GET | `/api/orders/` | Свои заказы (admin видит все) |
| POST | `/api/orders/` | Создать заказ из массива items |
| POST/PUT/DELETE | `/api/sneakers/...` | CRUD товаров (только admin) |

### Пример запроса (создать заказ)

```bash
curl -X POST https://fadeaway-backend-07ey.onrender.com/api/orders/ \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"items":[{"sneaker":1,"quantity":2},{"sneaker":5,"quantity":1}]}'
```

Ответ:
```json
{
  "id": 42,
  "total_amount": "205997.00",
  "status": "pending",
  "items": [
    {"id": 1, "sneaker_title": "Air Max 97 SE", "quantity": 2, "unit_price": "99999.00"},
    {"id": 2, "sneaker_title": "M2002RXF", "quantity": 1, "unit_price": "5999.00"}
  ],
  "created_at": "2026-05-21T16:45:23Z"
}
```

---

## 🔐 Авторизация (JWT flow)

```
1. POST /api/auth/register/  ──→  Создаёт User в Postgres (пароль хешируется PBKDF2)
2. POST /api/auth/login/     ──→  Возвращает { access (1h), refresh (7d) }
3. React сохраняет токены в localStorage
4. Защищённые запросы:  Authorization: Bearer <access>
5. Когда access протух (401):
   ─→  React сам делает POST /api/auth/refresh/
   ─→  Получает новый access
   ─→  Повторяет исходный запрос
6. logout = просто удалить токены из localStorage (stateless)
```

**Почему JWT а не сессии:**
- Stateless — бэк не хранит сессии, легко масштабируется
- Подходит для SPA / mobile
- Можно использовать в кросс-доменных запросах (фронт на Vercel, бэк на Render)

---

## 📁 Структура проекта

```
fadeaway/
├── backend/                      # Django проект
│   ├── config/
│   │   ├── settings.py           # настройки (Postgres/JWT/CORS/throttling)
│   │   ├── urls.py               # /admin/ + /api/
│   │   └── wsgi.py
│   ├── shop/
│   │   ├── models.py             # 5 моделей со связями FK
│   │   ├── serializers.py        # DRF serializers + валидация
│   │   ├── views.py              # ViewSets + permissions + filters
│   │   ├── urls.py               # /api/sneakers/, /api/orders/, /api/auth/...
│   │   ├── admin.py              # кастомные ModelAdmin с inlines
│   │   ├── fixtures/products.json  # seed-данные (19 кроссовок)
│   │   ├── management/commands/seed_products.py  # ./manage.py seed_products
│   │   ├── tests/                # 38 тестов
│   │   │   ├── test_models.py
│   │   │   ├── test_sneakers_api.py
│   │   │   ├── test_auth.py
│   │   │   └── test_orders.py
│   │   └── migrations/
│   ├── build.sh                  # скрипт деплоя на Render
│   ├── requirements.txt
│   └── .env.example
│
├── src/                          # React приложение
│   ├── api/client.js             # fetch-клиент + JWT auto-refresh
│   ├── contexts/
│   │   ├── auth/                 # JWT state, login/logout/me
│   │   ├── cart/                 # корзина (useReducer)
│   │   ├── products/             # глобальный список товаров
│   │   ├── filters/              # фильтры + сортировка
│   │   ├── toast/                # уведомления
│   │   └── common/               # общее (search, scroll)
│   ├── pages/
│   │   ├── Home.jsx              # главная (hero + featured + top)
│   │   ├── AllProducts.jsx       # каталог + фильтры
│   │   ├── ProductDetails.jsx    # карточка товара
│   │   ├── Cart.jsx              # корзина + checkout
│   │   ├── Login.jsx             # форма входа
│   │   ├── Register.jsx          # форма регистрации
│   │   ├── Orders.jsx            # история заказов
│   │   └── ErrorPage.jsx         # 404
│   ├── components/
│   │   ├── common/               # Header, Footer, SearchBar, BackTop
│   │   ├── product/              # ProductCard, ProductSummary, TopProducts
│   │   ├── sliders/              # HeroSlider, FeaturedSlider, RelatedSlider
│   │   ├── filters/              # FilterBar
│   │   └── cart/                 # CartItem
│   ├── styles/                   # SCSS (partials, mixins, variables)
│   ├── helpers/utils.js          # displayMoney, calculateDiscount, ...
│   ├── hooks/                    # useDocTitle, useActive, useOutsideClose
│   ├── routes/RouterRoutes.jsx
│   ├── data/                     # статичные данные UI (brands, footer links)
│   ├── App.jsx
│   └── main.jsx
│
├── public/images/                # картинки товаров
├── scripts/dump_products.mjs     # экспорт productsData.js → fixture JSON
├── vite.config.js                # dev-proxy /api → :8000
├── vercel.json                   # SPA rewrites для React Router
├── render.yaml                   # Render Blueprint (web + db)
└── package.json
```

---

## ⚙️ Локальный запуск

### Prerequisites
- Python 3.13: `brew install python@3.13`
- PostgreSQL 16: `brew install postgresql@16 && brew services start postgresql@16`
- Node 18+ (рекомендуется 22)

### 1. База
```bash
createdb fadeaway
```

### 2. Backend
```bash
cd backend
python3.13 -m venv ../venv
source ../venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Открой .env и пропиши DB_USER своего Postgres-юзера

python manage.py migrate
python manage.py createsuperuser
python manage.py seed_products       # загрузит 19 кроссовок и 4 категории
python manage.py runserver           # http://127.0.0.1:8000
```

### 3. Frontend (в новом терминале)
```bash
npm install
npm run dev                          # http://localhost:5173
```

Vite-прокси автоматически направит `/api/*` на бэк.

---

## 🧪 Тестирование

38 автотестов покрывают:
- **Модели** (10) — `__str__`, FK behavior (`CASCADE` / `SET_NULL` / `PROTECT`), defaults, сортировка
- **Sneakers API** (9) — листинг, фильтры, поиск, сортировка, ограничение записи для анонимов
- **Авторизация** (9) — register, password hashing, weak password rejection, JWT login/refresh, `/me`
- **Заказы** (10) — atomic creation, stock validation, stock decrement, изоляция между юзерами, `unit_price` нельзя подделать клиентом

Запуск:
```bash
cd backend
python manage.py test shop --verbosity=2
```

```
Ran 38 tests in 2.7s
OK
```

---

## 🚀 Деплой

### Backend → Render

Конфиг в [`render.yaml`](render.yaml) — Render автоматически создаёт PostgreSQL и web-service.

1. https://dashboard.render.com → **New → Blueprint**
2. Подключи репо → Render найдёт `render.yaml` → Apply
3. Render создаст `fadeaway-db` (Postgres) и `fadeaway-backend` (web)
4. `build.sh` выполнит:
   ```bash
   pip install -r requirements.txt
   python manage.py collectstatic --noinput
   python manage.py migrate --noinput
   python manage.py seed_products
   # + создание суперюзера из env vars DJANGO_SUPERUSER_*
   ```
5. Gunicorn запускается: `gunicorn config.wsgi:application`

### Frontend → Vercel

1. https://vercel.com → Add New Project → выбрать репо
2. Framework Preset: Vite (определяется автоматически)
3. **Environment Variable:**
   - `VITE_API_URL = https://fadeaway-backend-07ey.onrender.com`
4. Deploy → ~1-2 минуты → готов
5. Обновить `CORS_ALLOWED_ORIGINS` на Render: добавить Vercel-домен

### Особенности Free tier

| Сервис | Ограничение |
|---|---|
| Render Free Web | "Засыпает" после 15 мин неактивности (первый запрос ~30-50 сек) |
| Render Postgres Free | База существует 90 дней, потом пересоздаётся |
| Vercel | Без лимитов для статики |

---

## 📜 Лицензия

MIT — учебный проект, можно использовать как основу для своих.

---
