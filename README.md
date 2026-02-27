# Masjid Ustad Daily Food Sponsorship System

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
