# TransitOps – Smart Transport Operations Platform

Modern ERP-style frontend for fleet & transport operations. Built with React, Vite, Tailwind, React Router, Recharts, Lucide.

## Install & Run

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Folder Structure

```
frontend/
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── src/
    ├── assets/
    ├── components/     # Reusable UI (Sidebar, Navbar, DataTable, KpiCard, Modal, ...)
    ├── data/           # Mock JSON data
    ├── hooks/          # Custom hooks (useToast)
    ├── layouts/        # AppLayout
    ├── pages/          # Dashboard, Vehicles, Drivers, Trips, Maintenance, Fuel, Reports, Settings
    ├── services/       # Axios client stub
    ├── utils/          # Formatters
    ├── App.jsx
    ├── main.jsx
    └── index.css
```

## Dependencies

react, react-dom, react-router-dom, axios, lucide-react, recharts, tailwindcss.

## Modules

- Dashboard (KPIs, charts, alerts)
- Vehicles (CRUD, search, filter, pagination)
- Drivers (CRUD)
- Trips (CRUD + validation)
- Maintenance
- Fuel & Expenses
- Reports (charts)
- Settings

All data is mocked in `src/data/` — no backend required.
