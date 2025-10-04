## Team Information

- **Team Name**: Team Hack
- **Members**:
  - Bhanu Aswanth sai — Team Leader
  - Sai Aditya — Team Member 1
  - Venkatesh — Team Member 2
  - Rama Krishna — Team Member 3
- **Problem Statement**: Expense Tracker Application
- **Reviewer**: Aman Patel (ampa)

---

# Expense Management System

A full-stack monorepo for an Expense Management System.

Tech stack:
- Backend: Node.js, Express.js, Prisma ORM, PostgreSQL
- Frontend: React (Vite), Tailwind CSS
- APIs: restcountries (countries + currencies), exchangerate.host (currency conversion)

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

---

## Features Overview

- **Authentication & Company auto-setup**
  - On signup, creates a `Company` and an `Admin` user.
  - Company currency is derived from the selected country via Rest Countries API.

- **Roles & Permissions**
  - Admin: manage users, assign roles, set manager relationships, configure approval rules, view all expenses, override approvals.
  - Manager: approve/reject with comments, view team expenses, see pending approvals routed to them.
  - Employee: submit expenses in any currency, view status history.

- **Expense submission**
  - Fields: amount (any currency), category, description, date.
  - Converts to company currency on create. Per-request display currency supported via `GET /api/expenses?targetCurrency=INR`.

- **OCR receipt scanning (client-side)**
  - Drag-and-drop receipt, Tesseract.js OCR, progress bar, extracted preview, manual edit.
  - Auto-fills amount, date, description, merchant, basic category guess.

- **Approval workflow**
  - Manager-first (if "Is Manager Approver" is enabled) then configurable approver sequence.
  - Sequential routing: next approver is activated only after the current decision.
  - Conditional rules:
    - Percentage rule (e.g., 60% approvals => auto-approved).
    - Specific approver rule (e.g., CFO approves => auto-approved).
    - Hybrid (percentage OR specific approver).

- **UI/UX**
  - Searchable currency dropdown with recent selections and keyboard navigation.
  - Dark mode only (enforced). All text/colors tuned for dark surfaces.
  - Optional background slideshow with fade transitions.
  - Animated gradient, hover/focus states, floating labels, tooltips.
  - Skeleton loaders, toasts, empty states.

---

## Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL 13+

### Backend Setup
1) Create `backend/.env`:
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/expense_mgmt?schema=public"
JWT_SECRET="your_jwt_secret_here"
PORT=4000
```
2) Install deps, migrate DB, and run:
```
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```

### Frontend Setup
1) Install deps (includes OCR and UI libs):
```
cd frontend
npm install

# In case you need to add individually
npm i react-hot-toast react-dropzone lucide-react fuse.js react-country-flag clsx tailwind-merge framer-motion
npm i tesseract.js
```
2) Start Vite dev server:
## Quick Test Checklist (current code)

- [ ] Add three images under `frontend/public/image/` named `expense1.jpg`, `expense3.jpg`, `expense4.jpg` (if using slideshow).
- [ ] Run backend `npm run dev` and frontend `npm run dev`.
- [ ] Visit `/login` and sign in. You should be redirected to `/dashboard`.
- [ ] In dark mode, verify form inputs and all Admin/Approvals/Expenses table headers and rows are readable.
- [ ] Use the Sidebar for navigation; no buttons in the dashboard header.

---

## License

MIT (see LICENSE if provided). Contributions welcome.
