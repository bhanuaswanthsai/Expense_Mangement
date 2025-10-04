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
  - Dark/Light mode toggle with persistence.
  - Animated gradient background, hover and focus states, floating labels, tooltips.
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
```
npm run dev
```

---

## Usage

- Visit `http://localhost:5173/login` and sign up.
  - Signup creates your company with currency based on selected country and an Admin user.

- As Admin (`/admin`):
  - Create Employees/Managers, assign manager relationships.
  - Configure approval rules (manager-first, approver sequence, percentage/specific/hybrid conditions).

- As Employee (`/expenses`):
  - Drag & drop receipt and click "Scan Receipt" to auto-fill.
  - Choose input currency with the currency selector.
  - Submit and track status with color badges.

- As Manager (`/approvals`):
  - View pending approvals routed to you.
  - Approve/Reject with comments; decisions recorded in history.

---

## Configuration Notes

- Currency conversion uses `exchangerate.host` with fallbacks and alias normalization (e.g., IND → INR).
- You can request expenses in a specific display currency via `GET /api/expenses?targetCurrency=INR`.
- Tailwind dark mode is enabled via `darkMode: 'class'` in `frontend/tailwind.config.js`.

---

## Key Files

- Backend
  - `backend/src/controllers/authController.js` – signup creates company/admin using Rest Countries.
  - `backend/src/controllers/expenseController.js` – create/list/approve/reject; manager-first; conditional rules.
  - `backend/src/utils/currencyConverter.js` – conversion with fallbacks and aliases.

- Frontend
  - `frontend/src/components/OCR/OCRUpload.jsx` – drag-drop OCR with Tesseract.js.
  - `frontend/src/components/Currency/CurrencySelect.jsx` – searchable currencies.
  - `frontend/src/components/Theme/ThemeProvider.jsx` + `ThemeToggle.jsx` – dark/light mode.
  - `frontend/src/pages/ExpensesPage.jsx` – enhanced form with OCR and currency selector.
  - `frontend/src/pages/ApprovalsPage.jsx` – improved approvals UI.

---

## Troubleshooting

- If Vite reports missing modules, ensure you installed frontend deps from `frontend/`.
- For Windows PowerShell, quote scoped packages only if needed; here you just need `tesseract.js`.
- If Prisma migrate fails, verify `DATABASE_URL` and that Postgres is running.

---

## License

MIT (see LICENSE if provided). Contributions welcome.
