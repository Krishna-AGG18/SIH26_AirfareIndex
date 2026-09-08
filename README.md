# SIH 2026 — Real-Time Airfare APIx Index

Monorepo starter for Smart India Hackathon 2026 problem statement SIH26056. The prototype collects Google Flights results through SerpApi, stores normalized fare observations in Neon Postgres, and exposes an API for the visualization dashboard.

The reference architecture intentionally keeps data provenance explicit. Each observation carries a `source` value (`live` for SerpApi now; `synthetic`/scraped sources can be added later) so a future Scrapy + Scrapling + Playwright collector can be introduced without changing the frontend contract.

## Repository layout

```text
.
├── frontend/                 # Next.js dashboard; Vite-powered Vitest test runner
│   └── src/
├── backend/                  # FastAPI service and Python package
│   ├── app/
│   │   ├── api/              # HTTP routes
│   │   ├── db/               # Neon/Postgres session and SQLAlchemy models
│   │   └── services/         # SerpApi client and index calculations
│   ├── alembic/              # Schema migrations
│   └── pyproject.toml
├── neon.ts                   # Neon branch infrastructure configuration
└── package.json              # Root workspace scripts
```

Next.js and Vite are alternative app runtimes, so the app runs on Next.js and Vite is used for the frontend's fast Vitest test runner. This avoids an unsupported Next.js/Vite runtime combination while keeping both requested tools in the stack.

## Prerequisites

- Node.js 20+
- npm 10+
- Python 3.11+
- A SerpApi key for live Google Flights collection
- A Neon account with access to project `withered-glade-57887585`

## Install

```powershell
npm install
python -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install -e ".\\backend[dev]"
```

Copy the environment templates before running the services:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.local.example frontend/.env.local
```

Fill in `SERPAPI_API_KEY`. The Neon CLI writes `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, and `NEON_BRANCH` to the ignored root `.env.local`; the backend loads that file automatically. Keep secrets out of git.

## Neon setup

The repo includes `neon.ts` and the `.gitignore` entries needed for the linked project metadata. After authenticating with Neon, run the requested project setup from the repository root:

```powershell
npm i -g neon@latest
neon login
neon skills -y
neon mcp -y
neon link --project-id withered-glade-57887585 --branch production -y
neon config init
```

Then make sure `neon.ts` contains:

```ts
import { defineConfig } from "@neon/config/v1";

export default defineConfig({});
```

Finally deploy the declared configuration and pull the branch environment into your local dotenv file:

```powershell
neon deploy
```

Use the pooled `DATABASE_URL` for API traffic and `DATABASE_URL_UNPOOLED` for Alembic migrations.

## Run locally

Start both services from the repository root:

```powershell
npm run dev
```

Or run them independently:

```powershell
npm run dev:frontend
npm run dev:backend
```

- Dashboard: http://localhost:3000
- API docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

Apply the initial database schema after `DATABASE_URL_UNPOOLED` is available:

```powershell
npm run db:migrate
```

Run frontend checks:

```powershell
npm run lint
npm run test
npm run build
```

## Prototype API

`POST /api/v1/airfares/search` calls SerpApi's `google_flights` engine, normalizes returned itineraries, and persists observations when Neon is configured.

`GET /api/v1/index/series` reads stored observations and returns a rebased index where the first observed daily average is `100.0`.

The backend deliberately does not include scraping yet. The future collector boundary belongs under `backend/app/services/collectors/`, with a common normalized observation shape shared by the SerpApi and Scrapy/Playwright implementations.
