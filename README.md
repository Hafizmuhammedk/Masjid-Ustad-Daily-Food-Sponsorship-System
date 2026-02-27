# Masjid Ustad Daily Food Sponsorship System

<<<<<<< ours
Next.js (App Router) application for booking daily food sponsorships with admin-controlled cancellations.

## Stack

- Next.js + TypeScript
- Local JSON file storage (no PostgreSQL/pgAdmin)
- JWT auth (`jose`) + `bcryptjs`
- Zod validation
- Tailwind CSS

## Storage

Data is stored in `data/local-db.json`.

- File is created automatically on first API call.
- Default admin is created using:
  - `ADMIN_DEFAULT_USERNAME`
  - `ADMIN_DEFAULT_PASSWORD`

## Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Required values:

```env
JWT_SECRET="1234567"
JWT_EXPIRES_IN="30m"
ADMIN_DEFAULT_USERNAME="admin"
ADMIN_DEFAULT_PASSWORD="admin12345"
```

## Run

```bash
npm install
npm run dev
```

## API Endpoints

- `POST /api/sponsors`
- `POST /api/bookings`
- `GET /api/bookings?month=3&year=2026`
- `POST /api/admin/login`
- `GET /api/admin/bookings?month=3&year=2026` (admin only)
- `DELETE /api/admin/bookings/:id` (admin only)

## Example Requests

### Create Sponsor

```bash
curl -X POST http://localhost:3000/api/sponsors \
  -H "Content-Type: application/json" \
  -d '{
    "fullName":"Hafis Muhammed",
    "phone":"9876543210",
    "email":"hafis@email.com"
  }'
```

### Create Booking

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "sponsorId":1,
    "bookingDate":"2026-03-01",
    "foodNote":"Chicken Biriyani"
  }'
```

### Admin Login

```bash
curl -i -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin12345"}' \
  -c cookies.txt
```

### Admin Cancel Booking

```bash
curl -X DELETE http://localhost:3000/api/admin/bookings/1 -b cookies.txt
```
=======
Production-ready FastAPI backend for managing daily food sponsorship bookings.

## Features

- Sponsor registration
- Booking creation with future-date and uniqueness validation
- Monthly schedule retrieval
- Admin login with JWT
- Admin-only booking cancellation
- Built-in frontend dashboard at `/` for quick operations
- SQLAlchemy ORM + Alembic migrations
- PostgreSQL-ready configuration via environment variables

## Project Structure

```text
masjid_food_scheduler/
├── app/
│   ├── main.py
│   ├── database.py
│   ├── config.py
│   ├── models.py
│   ├── schemas.py
│   ├── crud/
│   │   ├── sponsor_crud.py
│   │   ├── booking_crud.py
│   │   └── admin_crud.py
│   ├── routers/
│   │   ├── sponsor_routes.py
│   │   ├── booking_routes.py
│   │   └── admin_routes.py
│   ├── auth/
│   │   ├── jwt_handler.py
│   │   └── password.py
│   └── dependencies.py
├── alembic/
├── scripts/
│   └── create_admin.py
├── alembic.ini
├── requirements.txt
└── README.md
```

## Environment Variables

Create `.env` file:

```env
DATABASE_URL=postgresql://username:password@localhost/masjid_food_scheduler
SECRET_KEY=your_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Setup Instructions

1. Create Python 3.11+ virtual environment and install dependencies:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. Create PostgreSQL database named `masjid_food_scheduler`.
3. Run migrations:
   ```bash
   alembic upgrade head
   ```
4. Start API server:
   ```bash
   uvicorn app.main:app --reload
   ```
5. Open frontend: `http://127.0.0.1:8000/`
6. Open API docs: `http://127.0.0.1:8000/docs`

## Sample Admin Creation Script

```bash
python scripts/create_admin.py --username admin --password StrongPass123
```

## Example cURL Commands

### 1) Register Sponsor

```bash
curl -X POST http://127.0.0.1:8000/sponsors \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Abdur Rahman","phone":"+8801712345678","email":"rahman@example.com"}'
```

### 2) Create Booking

```bash
curl -X POST http://127.0.0.1:8000/bookings \
  -H "Content-Type: application/json" \
  -d '{"sponsor_id":1,"booking_date":"2026-03-10","food_note":"Rice and fish"}'
```

### 3) Get Monthly Schedule

```bash
curl "http://127.0.0.1:8000/bookings?month=3&year=2026"
```

### 4) Admin Login

```bash
curl -X POST http://127.0.0.1:8000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"StrongPass123"}'
```

### 5) Cancel Booking (Admin only)

```bash
curl -X DELETE http://127.0.0.1:8000/admin/bookings/1 \
  -H "Authorization: Bearer <access_token>"
```

## HTTP Status Codes

- `200 OK`
- `201 Created`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `422 Validation Error`
- `500 Internal Server Error`
>>>>>>> theirs
