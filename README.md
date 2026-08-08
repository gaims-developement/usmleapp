# IMG Prep (USMLEApp)

A web platform that helps Indian/International Medical Graduates (IMGs) find verified
U.S. clinical elective rotations, prepare for the USMLE, get mentorship, and
manage their residency application journey — all in one place.

It's a role-based platform with six distinct portals: **Super Admin**,
**Admin**, **Reviewer**, **Hospital**, **Doctor/Mentor**, and **Student**.
Each role gets its own dashboard, navigation, and set of permissions.

---

## Tech stack

| Layer | Tech |
| --- | --- |
| Frontend | React 19 + TypeScript, Vite, React Router 7, Tailwind CSS 4, TanStack Query, Framer Motion |
| Backend | Node.js + Express 5 |
| Database | MySQL 8, via Prisma ORM |
| Auth | JWT access tokens + rotating opaque refresh tokens, bcrypt password hashing |
| File uploads | Multer + Cloudinary |
| Validation | Zod |
| Linting | oxlint |

The frontend and backend live in the **same repo** and are started together
with a single `npm run dev` (via `concurrently`).

---

## Project structure

```text
USMLEApp/
├── src/                     # Frontend (React + Vite)
│   ├── pages/                # Route-level pages, grouped by role:
│   │   ├── super-admin/       #   Super Admin dashboard pages
│   │   ├── admin/              #   Admin dashboard pages
│   │   ├── reviewer/           #   Reviewer dashboard pages
│   │   ├── hospital/            #   Hospital dashboard pages
│   │   ├── doctor/              #   Doctor/Mentor dashboard pages
│   │   └── *.tsx                 #   Public + student-facing pages (landing, login, browse electives, apply, etc.)
│   ├── mocks/                # Mock/demo data used by most dashboard pages (see below)
│   ├── mock/                 # Mock demo user accounts + credentials (see below)
│   ├── data/                 # Static site content (landing page copy, legal text)
│   ├── services/             # API-calling services (auth, students, hospitals, etc.)
│   ├── lib/                  # apiClient, utils
│   ├── auth/                 # AuthContext (React context for the logged-in user/session)
│   ├── guards/                # Route guards (RequireAuth, RequireRole, RequireOnboarding, ...)
│   ├── roles/                 # Role definitions (SUPER_ADMIN, ADMIN, REVIEWER, HOSPITAL, DOCTOR, STUDENT)
│   ├── permissions/            # Permission constants + access checks (RBAC)
│   ├── types/                  # Shared TypeScript types (rbac.ts, etc.)
│   ├── components/             # Shared UI + layout components
│   └── router.tsx              # All app routes, wired to guards + layouts
├── backend/
│   ├── src/
│   │   ├── app.js / server.js  # Express app + entrypoint
│   │   ├── routes/             # Express routes (auth, applications, documents, payments, ...)
│   │   ├── services/            # Business logic (auth, tokens, password hashing, cloudinary)
│   │   ├── middleware/           # auth, role guard, validation, error handling, upload
│   │   └── config/, db/, utils/
│   └── README.md               # Backend-specific docs (auth endpoints, token model, seed accounts)
├── prisma/
│   ├── schema.prisma           # Full DB schema (users, roles, applications, programs, evaluations, payments, etc.)
│   ├── migrations/              # Prisma migration history
│   └── seed.ts / seed.mjs       # Seeds roles, permissions, and demo accounts into the DB
├── migration.sql, migration_auth.sql   # Raw SQL equivalents of the Prisma migrations
├── .env.example                 # Template for environment variables
└── package.json                 # Single package.json for both frontend and backend
```

---

## What's real vs. what's mocked

This app is mid-build, so **not everything is wired to the database yet**:

- **Authentication is fully real.** Login, signup, partner registration,
  refresh tokens, logout, email verification, and password reset all hit the
  Express API in `backend/`, which talks to MySQL via Prisma. See
  [`backend/README.md`](./backend/README.md) for the full endpoint list.
- **Almost everything else in the dashboards is mock data** imported directly
  from `src/mocks/` and `src/mock/` (applications, students, hospitals,
  doctors, reviewers, programs, evaluations, payments, announcements, support
  tickets, analytics, etc). These pages don't hit the backend — they render
  straight from in-memory TypeScript objects/arrays, so you can explore every
  role's UI without needing real data in the database.

As backend endpoints for a given domain (e.g. applications, programs,
documents) get built out, the corresponding pages should be migrated from
`src/mocks/...` to `src/services/...`. `src/services/` already has some
API-backed services (`adminService`, `doctorService`, `hospitalService`,
`partnerService`, `reviewerService`, `studentService`, `userService`,
`sessionService`) — check whether the endpoint you need already exists before
adding a new mock.

### Where the mock data lives

| File / folder | Covers |
| --- | --- |
| `src/mock/users.ts` | Demo login accounts (see [Demo accounts](#demo-accounts-mock-logins) below) |
| `src/mocks/applications.ts`, `src/mocks/documents.ts`, `src/mocks/electives.ts`, `src/mocks/announcements.ts`, `src/mocks/study-resources.ts` | Shared/general demo data |
| `src/mocks/admin/*` | Admin dashboard: students, operations, people, content, settings |
| `src/mocks/reviewer/*` | Reviewer dashboard: applications, students, messages, notifications, profile |
| `src/mocks/hospital/*` | Hospital dashboard: applications, programs, doctors, students, calendar, announcements, notifications, profile |
| `src/mocks/doctor/*` | Doctor dashboard: students, evaluations, logbook, letters, certificates, schedule, messages, notifications, profile |
| `src/mocks/partners/*` | Partner directories: hospitals, doctors, reviewers |
| `src/data/site.ts` | Public landing page content (product name, tagline, features, FAQ) |
| `src/data/legal.ts` | Terms & privacy page copy |

---

## Getting started

### Prerequisites

- **Node.js** v22+ (repo was built/tested on Node 22)
- **MySQL 8** running locally (or accessible via `DATABASE_URL`)
- npm (comes with Node)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example env file and fill in your local values:

```bash
cp .env.example .env
```

Key variables in `.env`:

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend port (default `5000`) |
| `CLIENT_URL` / `CORS_ALLOWED_ORIGINS` | Allowed frontend origins for CORS |
| `APP_URL` | Base URL used to build email verification / reset links |
| `VITE_API_URL` | Base API URL the frontend calls (default `http://127.0.0.1:5000/api`) |
| `DATABASE_URL` | MySQL connection string, e.g. `mysql://user:pass@localhost:3306/usmle_app` |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | Access token secret + lifetime |
| `JWT_REFRESH_SECRET` / `JWT_REFRESH_EXPIRES_IN` | Refresh token secret + lifetime (must differ from `JWT_SECRET`) |
| `EMAIL_VERIFICATION_EXPIRES_IN`, `PASSWORD_RESET_EXPIRES_IN` | Token lifetimes for those flows |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | File upload storage (optional locally unless testing uploads) |
| `ENABLE_DEMO_DATA` | Toggles demo/seed-related behavior |

> **Never commit your `.env`.** It's already git-ignored — only `.env.example`
> should be committed. Use strong random values for `JWT_SECRET` and
> `JWT_REFRESH_SECRET` even locally.

### 3. Set up the database

Create the MySQL database referenced by `DATABASE_URL`, then apply the schema
and seed demo accounts:

```bash
npx prisma generate
npx prisma migrate dev     # applies all Prisma migrations
npm run prisma:seed        # seeds roles, permissions, and demo users
```

(Alternatively, `migration.sql` and `migration_auth.sql` at the repo root
contain the raw SQL if you need to apply schema changes without the Prisma CLI.)

### 4. Run the app

```bash
npm run dev
```

This runs **both** the Vite dev server and the Express backend concurrently:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

Other useful scripts:

```bash
npm run dev # starts both frontend and backend since it contains a npm script to do so
npm run dev:client       # frontend only
npm run dev:backend      # backend only (watch mode)
npm run start:backend    # backend, production-style (no watch)
npm run build            # type-check + production frontend build
npm run preview          # preview the production build
npm run lint              # oxlint
npm run prisma:migrate    # create/apply a new Prisma migration
npm run prisma:seed       # re-run the DB seed
```

---

## Deployment

The app is split into two deployments:

### Backend (Railway)

Deploy this repository to Railway as the backend service. `railway.toml` in the
repo root makes the service run the Express API (`node backend/src/server.js`)
with `/api/health` as the health check, and runs `npx prisma generate` during
the build.

Required Railway environment variables:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | Your Aiven **MySQL** connection string (`mysql://…`) — the Prisma provider is `mysql` |
| `JWT_SECRET` | Random string ≥ 32 chars |
| `JWT_REFRESH_SECRET` | Random string ≥ 32 chars, different from `JWT_SECRET` |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://<your-netlify-site>.netlify.app` |
| `CORS_ALLOWED_ORIGINS` | `https://<your-netlify-site>.netlify.app` |
| `APP_URL` | `https://<your-netlify-site>.netlify.app` |
| `ENABLE_DEVMODE` | `false` |

> **Important:** the Prisma schema (`prisma/schema.prisma`) declares
> `provider = "mysql"`. The database on Aiven must therefore be a **MySQL**
> service. A PostgreSQL service will not work with this schema.

### Frontend (Netlify)

`netlify.toml` sets the build command (`npm run build`) and publish directory
(`dist`). Set one environment variable in the Netlify dashboard and rebuild:

| Variable | Value |
| --- | --- |
| `VITE_API_URL` | `https://<railway-backend-domain>.up.railway.app/api` |

Without `VITE_API_URL` the frontend falls back to `http://127.0.0.1:5000/api`,
which only works in local development and produces 404/"Request failed" errors
in production.

### Expected request flow

```
Registration page
  → Netlify frontend (built with VITE_API_URL=https://<railway>.up.railway.app/api)
  → POST https://<railway>.up.railway.app/api/auth/register
  → Express backend (Railway)
  → Prisma → MySQL (Aiven)
  → account created
```

---

## Demo accounts (mock logins)

The seed script creates one demo account per role, all sharing the password
below. These are real accounts in the database (auth is live), so you can log
in with any of them once you've seeded the DB:

| Role | Email | Password |
| --- | --- | --- |
| Super Admin | `admin@imgprep.com` | `Admin@123` |
| Admin | `ops@imgprep.com` | `Admin@123` |
| Reviewer | `reviewer@imgprep.com` | `Admin@123` |
| Hospital | `hospital@imgprep.com` | `Admin@123` |
| Doctor / Mentor | `doctor@imgprep.com` | `Admin@123` |
| Student | `student@imgprep.com` | `Admin@123` |

(These same credentials are also mirrored in `src/mock/users.ts` for
reference/UI use, e.g. quick-login buttons.)

---

## Roles & permissions (RBAC)

Roles, their permissions, and which roles can manage which other roles are
defined in `src/roles/roles.ts`, with the permission constants in
`src/permissions/permissions.ts`. Route-level access control is enforced by
guards in `src/guards/` (`RequireAuth`, `RequireRole`, `RequireOnboarding`,
`RequireStudent`, `RoleDashboardRoute`), which are wired up in
`src/router.tsx`.

- **Super Admin** — full platform control: users, roles, hospitals, doctors,
  reviewers, programs, payments, CMS, audit logs, support, settings.
- **Admin** — manages users, hospitals, doctors, students, applications,
  announcements, and analytics (subset of Super Admin's power).
- **Reviewer** — reviews assigned applications, verifies documents, approves/
  rejects.
- **Hospital** — manages its profile and elective programs, reviews/accepts
  applications, views assigned students.
- **Doctor / Mentor** — views assigned students, submits evaluations, issues
  certificates, manages logbooks and letters of recommendation.
- **Student** — browses electives, applies, uploads documents, tracks
  applications, plans study schedule.

---

## Database schema

The full data model lives in [`prisma/schema.prisma`](./prisma/schema.prisma).
It covers, among others: `User`/`Role`/`Permission` (RBAC + auth), student
profiles & documents, hospital/doctor/reviewer profiles, `Program`s and
`Application`s (with reviews, documents, languages), `Rotation`s,
`Evaluation`s, `LogbookEntry`, `LetterOfRecommendation`, `Certificate`,
`Announcement`s, messaging (`Conversation`/`Message`), `Notification`,
`SupportTicket`, `CmsPage`, `Payment`, `CalendarEvent`, `PartnerRegistration`,
and `AuditLog`.

---

## Backend details

See [`backend/README.md`](./backend/README.md) for backend-specific
documentation: the full list of auth endpoints, the access/refresh token
model, and how role-based route guarding works on the API side.

---

## Notes for contributors

- The repo currently mixes real API calls (`src/services/`) with mock data
  (`src/mocks/`, `src/mock/`). When building out a new backend endpoint,
  check whether a mock already models the shape of data you need in
  `src/mocks/` — it's a good reference for the expected UI data shape, and
  the page should be updated to call the new service instead of the mock
  once the endpoint is live.
- Email delivery isn't wired up yet — in development, email
  verification/password reset endpoints return the token/URL directly in the
  API response instead of sending an email (see `backend/README.md`).
- Cloudinary credentials are optional unless you're testing file upload
  flows locally.