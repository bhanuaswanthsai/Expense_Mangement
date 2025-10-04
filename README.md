# Expense Management System

A full-stack monorepo for an Expense Management System.

Tech stack:
- Backend: Node.js, Express.js, Prisma ORM, PostgreSQL
- Frontend: React (Vite), Tailwind CSS
- APIs: restcountries, exchangerate-api

## Monorepo Structure

```
expense-management/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── models/  (Prisma models in prisma/schema.prisma)
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── server.js
│   ├── package.json
│   └── .env (create locally)
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

## Prerequisites
- Node.js >= 18
- PostgreSQL 13+

## Backend Setup
1. Create `backend/.env`:
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/expense_mgmt?schema=public"
JWT_SECRET="your_jwt_secret_here"
PORT=4000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

2. Install and generate Prisma client:
```
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

## Frontend Setup
```
cd frontend
npm install
npm run dev
```

## Scripts
- Backend: `npm run dev` starts server with nodemon at http://localhost:4000
- Frontend: `npm run dev` starts Vite at http://localhost:5173

## Notes
- Security: helmet, CORS, rate limiting, JWT auth
- Logging: morgan
- Validation: simple validators and centralized error handler
- Currency conversion and country/currency via utilities calling public APIs

Refer to inline comments for implementation details.
