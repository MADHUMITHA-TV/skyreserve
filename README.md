# ✈️ SkyReserve

SkyReserve is a full-stack airline reservation and management system. It lets users search flights, pick seats, and book tickets, while giving admins tools to manage airlines, aircraft, airports, and flights.

## Tech Stack

**Backend**
- Node.js + Express
- Prisma ORM (MySQL)
- Redis (caching / locking)
- JWT authentication (access + refresh tokens)
- Socket.IO (real-time updates)
- Jest + Supertest (testing)
- Swagger (API docs)

**Frontend**
- React 19 + Vite
- Material UI (MUI)
- React Router
- Formik + Yup (forms & validation)
- Axios
- Framer Motion

## Features

- User registration, login, and JWT-based auth with refresh tokens
- Role-based access control (Admin / User)
- Flight search and filtering
- Interactive seat selection
- Booking management with passenger details
- Payment processing flow
- Admin dashboard for managing airlines, aircraft, airports, and flights
- Real-time updates via WebSockets
- Rate limiting, Helmet security headers, and centralized error handling

## Project Structure

```
skyreserve/
├── backend/
│   ├── src/
│   │   ├── modules/       # auth, user, admin, flight, booking, payment, etc.
│   │   ├── middleware/     # auth, error handling, rate limiting
│   │   ├── config/         # env, database, redis, logger
│   │   └── utils/
│   ├── prisma/             # schema, migrations, seed scripts
│   └── tests/               # Jest test suites
└── frontend/
    └── src/
        ├── components/      # auth, flights, seat map, layout
        ├── pages/            # Home, Flights, Login, Register, Seat Selection, etc.
        └── services/          # API service layer
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL
- Redis

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in your DATABASE_URL, JWT secrets, etc.
npx prisma migrate dev
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Testing

```bash
cd backend
npm test
```

