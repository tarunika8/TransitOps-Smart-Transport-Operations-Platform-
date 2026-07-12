# TransitOps · Smart Transport Operations Platform

TransitOps is a centralized operations platform that helps organizations manage the complete lifecycle of their transport operations—from vehicle registration and driver management to dispatching, maintenance, fuel logging, compliance tracking, and analytics.

## Features

- **Role-based access control** — Fleet Manager, Dispatcher, Safety Officer, and Financial Analyst scopes.
- **Fleet management** — Register vehicles, track status, odometer, capacity, acquisition cost, and documents.
- **Driver management** — Store license details, contact info, safety scores, and compliance status.
- **Dispatch & trips** — Create trips, assign vehicles and drivers, track cargo, distance, and revenue.
- **Maintenance** — Log service history, costs, and close-out notes.
- **Fuel & expenses** — Record fuel logs and categorize operational expenses.
- **Analytics** — Visual dashboards and charts for operational insights.
- **Dark / light mode** — Theme toggle built in.

## Tech Stack

- **Framework:** TanStack Start v1
- **Build Tool:** Vite
- **Language:** TypeScript
- **UI Library:** React 19
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui + Radix UI primitives
- **Routing:** TanStack Router
- **Data:** TanStack Query + TanStack Start server functions
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React
- **Charts:** Recharts

## Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/) 1.0+
- A package manager: `npm`, `yarn`, `pnpm`, or `bun`

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/transitops.git
cd transitops
2. Install dependencies
Using npm:

npm install
Using Bun:

bun install
3. Run the development server
npm run dev
The app will be available at http://localhost:8080 by default.
```
