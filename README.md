# Bayan Burd Eternity

B2B **customer technology portal** — not a basic online shop.

The platform connects the full lifecycle:

**Client → Order → Product → Asset → Installation / Deployment → Issue → Comments → Service History**

After purchase, customers continue to manage hardware, websites, software, licenses, warranty, support, and GitHub-style issues in one place.

## Tech stack

| Layer | Stack |
| --- | --- |
| Frontend | Next.js (App Router), TypeScript, React, Tailwind CSS, TanStack Query, React Hook Form, Zod, Framer Motion, Lucide |
| Backend | Node.js, Express, TypeScript, MongoDB, Mongoose |
| Auth | JWT access token + httpOnly refresh token, bcrypt |
| Files | Cloudflare R2 compatible API, local `uploads/` fallback |
| Email | Provider-agnostic SMTP via environment variables |

Monorepo:

```
apps/web          Next.js frontend
apps/api          Express API
packages/types    Shared enums, Mongolian labels
packages/validation  Shared Zod schemas
```

## Local setup

### 1. Prerequisites

- Node.js 20+
- MongoDB 7 (local or Docker)

### 2. Start MongoDB

```bash
docker compose up -d
```

Or use a local MongoDB at `mongodb://127.0.0.1:27017/bayan_burd_eternity`.

### 3. Install dependencies

From the repository root:

```bash
npm install
```

### 4. Environment variables

Copy `.env.example` values:

- `apps/api/.env` — already includes development defaults
- `apps/web/.env.local` — `NEXT_PUBLIC_API_URL=http://localhost:4000`

Never commit production secrets. Do not hardcode credentials in application source.

Key API variables:

```
MONGODB_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
FRONTEND_URL=
STORAGE_DRIVER=local
STORAGE_ENDPOINT=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

### 5. Seed data

```bash
npm run seed
```

This creates clients, products, assets, installations, and sample issues `#BE-000104`–`#BE-000107`.

### 6. Run backend

```bash
npm run dev:api
```

API: http://localhost:4000  
Health: http://localhost:4000/api/health

### 7. Run frontend

```bash
npm run dev:web
```

Web: http://localhost:3000

## Development accounts

**Development only.** Passwords are not hardcoded in production application logic; they exist only in the seed script and this README.

| Role | Email | Password |
| --- | --- | --- |
| Super admin | `admin@eternity.mn` | `DevPass123!` |
| Engineer | `engineer@eternity.mn` | `DevPass123!` |
| Client (ABC ХХК) | `client@example.mn` | `DevPass123!` |

## What is included

### Public

- Enterprise landing page (Mongolian)
- Product catalog with filters
- Product / software detail pages
- Quotation request
- Cart + B2B checkout (invoice / bank transfer / manual verification)
- Auth: login, register, forgot/reset password

### Client portal (`/dashboard`)

- KPI summary, assets, devices, systems
- Orders, installations, warranty
- GitHub-style issues (create only against owned assets)
- Service history, documents, notifications, profile

### Admin (`/admin`)

- Sales: orders, products, categories, quotations (convert to order)
- Clients with full lifecycle tabs
- Asset management, installations (complete → warranty/support start)
- Issue list + Kanban (drag-and-drop status), assignment, internal notes
- Service history, users, audit logs, settings

## Production build

```bash
npm run build
```

Run API with `npm run start -w @bbe/api` (after `tsc`) and web with `npm run start -w @bbe/web`.

## Deployment

1. Provision MongoDB.
2. Set production `JWT_SECRET` / `JWT_REFRESH_SECRET`.
3. Set `FRONTEND_URL` and CORS origin to the public web URL.
4. Set `STORAGE_DRIVER=r2` and Cloudflare R2 credentials for uploads.
5. Configure SMTP for transactional email.
6. Deploy `apps/api` as a Node service (port 4000 or `PORT`).
7. Deploy `apps/web` to a Node/Next host or container. Set `NEXT_PUBLIC_API_URL` to the public API URL.
8. Do **not** run the seed script against production unless you intend to reset data.

QPay can be added later through the existing payment method abstraction (`BANK_TRANSFER` / `INVOICE` / `MANUAL`).

## Security

- Role-based access on the API (CLIENT cannot access admin or other companies’ data)
- Ownership checks on assets and issues
- Helmet, CORS, rate limiting, Zod validation
- Upload MIME + size limits
- Refresh tokens stored hashed
- Admin mutations write audit logs
