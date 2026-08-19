# USMLEApp — End-to-End Connectivity Audit (v1)

Audit date: 2026-08-12
Scope: full-stack connectivity (frontend service → API client → Express route → Prisma → DB), mock-vs-real data usage, demo isolation, per-role portal coverage, auth flows, seed data.

---

## 1. Project Snapshot

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + TypeScript + React Query + react-router (`src/`) |
| Backend | Node.js + Express (`backend/src/server.js`) |
| DB / ORM | MariaDB/MySQL 8 via Prisma (`@prisma/adapter-mariadb`, `mysql2`) — NOT PostgreSQL |
| API base | `VITE_API_URL ?? 'http://127.0.0.1:5000/api'` (`src/lib/apiClient.ts`) |
| Build | `tsc -b && vite build` |
| Lint | `oxlint` |
| Scripts | `dev` (concurrent client+backend), `dev:client`, `dev:backend`, `start`, `prisma:seed`, `prisma:migrate` |

Roles (6): `SUPER_ADMIN`, `ADMIN`, `REVIEWER`, `HOSPITAL`, `DOCTOR`, `STUDENT`
(Role definitions: `src/roles/roles.ts`; permission constants: `src/permissions/permissions.ts`.)

Request flow: Page → `@/lib/queries.ts` / query hooks / `*Service.ts` → `src/lib/apiClient.ts` (JWT, refresh, 15 s timeout, `PUBLIC_PATHS` allowlist) → Express `apiRouter` (mounted under `/api`) → route controller → `prisma.*` → MariaDB.

---

## 2. Backend Route Mount Map

Defined in `backend/src/routes/index.js`:

```
/api/health          health.routes.js
/api/auth            auth.routes.js
/api/users           user/user.routes.js
/api/applications    application.routes.js
/api/documents       document.routes.js
/api/payments        payment.routes.js
/api/notifications   notification.routes.js
/api/calendar-events calendar.routes.js
/api/dashboard       dashboard.routes.js
/api/admin/demo      admin-demo.routes.js
/api/programs        program.routes.js
/api/devmode         devmode.routes.js
/api/hospitals       hospital.routes.js
/api/invitations     invitation.routes.js
```

---

## 3. Endpoint Map (verified per route file)

### Auth — `backend/src/routes/auth/auth.routes.js`
| Method | Path | Notes |
|---|---|---|
| POST | `/auth/login` | |
| POST | `/auth/register` | student self-register |
| POST | `/auth/register/partner` | |
| POST | `/auth/register/hospital` | requires valid hospital registration code |
| POST | `/auth/register/doctor` | requires org code |
| POST | `/auth/register/reviewer` | requires invitation code |
| GET | `/auth/hospital-code/lookup?code=` | |
| POST | `/auth/refresh` | |
| POST | `/auth/logout` | |
| POST | `/auth/verify-email/request` | |
| POST | `/auth/verify-email` | |
| POST | `/auth/forgot-password` | |
| POST | `/auth/reset-password` | |
| GET | `/auth/me` | |

### Users — `backend/src/routes/user/user.routes.js` (all behind `authenticate`)
| Method | Path | Access |
|---|---|---|
| GET | `/users/me` | any |
| PATCH | `/users/me` | any (zod `updateProfileSchema`) |
| PUT | `/users/me` | any (same schema) |
| PATCH | `/users/me/password` | any |
| POST | `/users/me/avatar` | multer memory upload (5 MB, mime allowlist) |
| DELETE | `/users/me/avatar` | any |
| DELETE | `/users/me` | deactivate account |
| GET | `/users/students` | SUPER_ADMIN/ADMIN, `isDemo == req.user.isDemo` |
| GET | `/users/reviewers` | SUPER_ADMIN/ADMIN, `isDemo` filter |
| GET | `/users/hospitals` | SUPER_ADMIN/ADMIN, `isDemo` filter |
| POST | `/users/:id/reactivate` | SUPER_ADMIN/ADMIN |

### Applications — `backend/src/routes/application.routes.js` (777 lines, 8 routes)
| Method | Path | Notes |
|---|---|---|
| GET | `/applications` | role-branched: STUDENT (own), HOSPITAL (`program.hospitalId` + `isDemo` match), REVIEWER (`reviewerId`), ADMIN/SUPER_ADMIN (`studentProfile.user.isDemo == req.user.isDemo`), DOCTOR |
| GET | `/applications/:id` | |
| POST | `/applications` | creates Application **+ Payment** (UNDER_VERIFICATION; AWAITING_PAYMENT for RAZORPAY/STRIPE w/o transactionId, PAYMENT_SUBMITTED with transactionId) |
| PATCH | `/applications/:id/withdraw` | |
| PATCH | `/applications/:id/decide` | |
| PATCH | `/applications/:id/assign-reviewer` | |
| PATCH | `/applications/:id/documents/:docName` | document verify + note (used by reviewer) |
| PATCH | `/applications/:id/reviewer-decision` | start/save draft/approve/reject/request changes/forward |

### Documents — `backend/src/routes/document.routes.js`
| Method | Path | Notes |
|---|---|---|
| GET | `/documents` | default checklist + per-student status |
| POST | `/documents/:id` | upload-by-name; **no real file upload** (stores `fileName` string) |
| DELETE | `/documents/:id` | |

### Payments — `backend/src/routes/payment.routes.js`
| Method | Path | Notes |
|---|---|---|
| GET | `/payments` | student: own; admin: `isDemo` filtered |
| POST | `/payments` | student creates record (no gateway) |

### Notifications — `backend/src/routes/notification.routes.js`
| Method | Path |
|---|---|
| GET | `/notifications` |
| GET | `/notifications/unread-count` |
| PATCH | `/notifications/:id/read` |
| POST | `/notifications/read-all` |

### Calendar — `backend/src/routes/calendar.routes.js`
GET `/calendar-events` — current user's events only.

### Dashboard — `backend/src/routes/dashboard.routes.js`
GET `/dashboard/stats` — real stats for students; zeros for all other roles.

### Admin Demo — `backend/src/routes/admin-demo.routes.js` (SUPER_ADMIN/ADMIN)
| Method | Path | Notes |
|---|---|---|
| GET | `/admin/demo/demo-status` | counts demo vs real (applications/documents/payments/notifications/events) via `prisma.platformSetting` |
| POST | `/admin/demo/demo-action` | `enable` / `disable` / `delete` (delete runs a 24-step transaction clearing all demo-related rows) |

### Programs — `backend/src/routes/program.routes.js` (public browse)
| Method | Path | Notes |
|---|---|---|
| GET | `/programs` | ACTIVE status only |
| GET | `/programs/:id` | |
| — | `mapProgram` | returns `rating: null`, `teachingType: null`, `highlights: []` — honest placeholders; fields not yet tracked in DB |

### Devmode — `backend/src/routes/devmode.routes.js`
GET `/devmode/status` → `{ enabled: env.ENABLE_DEVMODE }`.

### Hospitals — `backend/src/routes/hospital.routes.js` (all `requireRoles('HOSPITAL')`)
`/hospitals/me` (GET, PATCH), `/hospitals/me/organization` (GET, PATCH), `/hospitals/me/code/regenerate` (POST),
`/hospitals/me/programs` (GET, POST), `/hospitals/me/programs/:id` (GET, PATCH), `/hospitals/me/programs/:id/status` (PATCH),
`/hospitals/me/doctors` (GET, POST), `/hospitals/me/students` (GET),
`/hospitals/me/applications` (GET), `/hospitals/me/applications/:id` (GET), `.../decide` (PATCH), `.../schedule` (PATCH), `.../notes` (PATCH),
`/hospitals/me/announcements` (GET, POST, PATCH /:id, DELETE /:id), `/hospitals/me/calendar-events` (GET),
`/hospitals/me/departments` (GET, POST, DELETE /:id).

### Invitations — `backend/src/routes/invitation.routes.js` (SUPER_ADMIN/ADMIN)
GET `/invitations/reviewer`, POST `/invitations/reviewer`, DELETE `/invitations/reviewer/:id`
(mint/deactivate via `org.service.js` `mintReviewerCode` / `deactivateReviewerCode`).

---

## 4. Frontend Service ↔ Backend Connectivity Matrix

Source of truth: `src/services/*.ts` (grep of `apiGet/apiPost/apiPatch/apiPut/apiDelete` + manual read).

### authService.ts — 100% REAL
Login, register (student), register/partner, register/hospital, register/doctor, register/reviewer, refresh, logout, hospital-code lookup, verify-email (request + confirm), forgot/reset password.

### userService.ts — 100% REAL
`GET /users/me`, `PATCH /users/me`.

### hospitalService.ts — 100% REAL (types only from `@/mocks/hospital/*`)
All `/hospitals/me/*` calls + `/notifications`, `/notifications/read-all`, `/notifications/:id/read`.
Imports from `@/mocks/hospital/*` are **type-only** (`import type`), no runtime mock data.

### reviewerService.ts — PARTIAL
- REAL: `GET /applications`, `PATCH /applications/:id/reviewer-decision` (startReview, saveDraft, approve, reject, requestChanges, forwardToHospital, decide), `PATCH /applications/:id/documents/:docName` (setDocumentVerification, setDocumentNote).
- MOCK: reviewer profile, conversations, messages, message templates, notifications.

### studentService.ts — PARTIAL
- REAL: `GET /notifications`, `POST /notifications/read-all`, `PATCH /notifications/:id/read`, `updateProfile → PATCH /users/me`.
- MOCK: study resources, announcements, settings (in-memory), `addStudentNotification` (in-memory).

### adminService.ts — PARTIAL
- REAL: `GET /applications` (fetchAdminApplications, fetchRecentApplications), `GET /payments`, `GET /users/hospitals`, `GET /users/reviewers`, `GET /users/students`, `PATCH /applications/:id/assign-reviewer`.
- MOCK / localStorage: dashboard KPIs, analytics, uptime/activity, users, doctors, programs, documents, announcements, CMS pages, audit logs, support tickets, role summaries, platform settings, ops KPIs, notifications, reports.
- UNBACKED (no backend endpoint): `forwardApplication` (creates local notification only), `toggleFlagApplication` (local `app.flagged` flip).

### doctorService.ts — 100% MOCK
No `apiClient` calls at all. Students, attendance, progress, logbook, evaluations, certificates, letters, schedule, conversations, messages, profile, notifications — all from `@/mocks/doctor/*` + localStorage (admin-created students).

### partnerService.ts — 100% MOCK
`partnerHospitals`/`partnerDoctors`/`partnerReviewers` from `@/mocks/partners/*`; in-memory approval requests; own register flows. (Backend `POST /auth/register/partner` exists but this service never calls it.)

---

## 5. Demo Isolation Audit

Verified `isDemo` enforcement (backend):
- `GET /applications` — ADMIN branch: `studentProfile.user.isDemo == req.user.isDemo`; HOSPITAL branch: `program.hospitalId === hospitalProfile.id` AND `studentProfile.user.isDemo === req.user.isDemo`.
- `GET /users/students`, `/users/reviewers`, `/users/hospitals` — `isDemo: req.user.isDemo`.
- `GET /payments` (admin) — `isDemo` filter.
- `GET /admin/demo/demo-status` + `/demo-action` — full demo record counts + delete transaction (27 tables).

Frontend demo surface:
- `src/hooks/useDevMode.ts` — calls `/devmode/status`; fails closed (page hidden if endpoint unreachable).
- `src/pages/devmode-page.tsx` — dev login only when `ENABLE_DEVMODE=true`; reads `DEMO_LOGIN_BY_ROLE` from `src/mock/users.ts`.
- `src/pages/admin/demo-data.tsx` — calls `GET /admin/demo/demo-status` (matches backend). ✓

---

## 6. Seed Data & Demo Credentials Audit — CRITICAL FINDING

### What `prisma/seed.ts` creates (80 lines)
5 demo users, all `isDemo: true`, password `DemoPass@2024!`:
- `student@demo.com`, `hospital@demo.com`, `admin@demo.com`, `reviewer@demo.com`, `doctor@demo.com`

Missing from seed:
- **No `roleId`** on any user → `serializeUser` in `backend/src/services/auth.service.js` falls back to `role: user.role?.name ?? 'STUDENT'` → every seeded account authenticates as **STUDENT**.
- **No profiles** (no StudentProfile/HospitalProfile/DoctorProfile/ReviewerProfile rows) → hospital/reviewer/doctor feature guards that read `hospitalProfileId`/`reviewerProfileId`/`doctorProfileId` have nothing to act on.
- **No role records at all.** The init migration `prisma/migrations/*/migration.sql` contains **no INSERT statements** — the `Role`, `Permission`, `RolePermission` tables are empty on a fresh DB. Consequences: `registerStudent` throws ROLE_NOT_FOUND (500); demo users default to STUDENT; role-gated routes (`requireRoles`) can never be satisfied by any account.
- `prisma/seed.mjs` is a 7-line stub (no-op).

### Devmode page credentials do NOT match the seed — `src/mock/users.ts` `DEMO_LOGIN_BY_ROLE`
| Role | Devmode page expects | Seed actually creates |
|---|---|---|
| SUPER_ADMIN | `admin@imgprep.com` / `Admin@123` | — (not seeded) |
| ADMIN | `ops@imgprep.com` / `Admin@123` | `admin@demo.com` / `DemoPass@2024!` |
| REVIEWER | `reviewer@imgprep.com` / `Admin@123` | `reviewer@demo.com` / `DemoPass@2024!` |
| HOSPITAL | `hospital@imgprep.com` / `Admin@123` | `hospital@demo.com` / `DemoPass@2024!` |
| DOCTOR | `doctor@imgprep.com` / `Admin@123` | `doctor@demo.com` / `DemoPass@2024!` |
| STUDENT | `student@imgprep.com` / `Admin@123` | `student@demo.com` / `DemoPass@2024!` |

Net effect: `/devmode` login always returns 401 against a seeded DB (emails don't exist), and any account that does log in gets STUDENT role.

No `demo-credentials` mock file exists; `src/pages/login-page.tsx` has no mock imports (production login is fully real).

---

## 7. Auth Flow Coverage

- Login/logout/refresh: real (authService + `AuthContext` + `apiClient` PUBLIC_PATHS + refresh-token retry).
- Registration: student/hospital/doctor/reviewer pages → real `authService`. **partner-register-page → mock `partnerService` (never hits `/auth/register/partner`)**.
- Email verification + forgot/reset password: real (routes exist; links built from `APP_URL`; Cloudinary env slots present but empty).
- Session persistence: `localStorage` key `imgprep.session` (`src/services/sessionService.ts`).
- Role gating (frontend): `RequireAuth`, `RequireRole`, `RequireStudent`, `RequireOnboarding`, `RoleDashboardRoute`, `Can` (permission) in `src/guards/`. `RoleDashboardRoute` renders full student dashboard; all staff roles get `RolePlaceholderPage`.
- Backend gating: `authenticate` (JWT) + `requireRoles(...)` + zod `validate`.

---

## 8. Per-Page Data Source Summary

| Portal / Area | Wired to backend | Mock / local |
|---|---|---|
| Student electives browse/details, apply, applications, tracker, documents, payments, notifications | Real (`/programs`, `/applications`, `/documents`, `/payments`, `/notifications`, `/users/me`) | |
| Student announcements, study resources, planner, settings, onboarding | | Mock (`@/mocks/student/*`, in-memory) |
| Hospital full portal (org, programs, doctors, students, applications, announcements, calendar, departments) | Real (`/hospitals/me/*`, `/notifications`) | |
| Reviewer applications, review/decision actions, document verification | Real (`/applications`, `/reviewer-decision`, `/documents/:name`) | |
| Reviewer profile, messages, templates, notifications | | Mock |
| Admin applications, payments, hospitals/reviewers/students, assign-reviewer | Real | |
| Admin KPIs, analytics, doctors, programs, documents, announcements, CMS, audit logs, support, settings, reports, forward/flag | | Mock / localStorage |
| Doctor portal (all pages) | | 100% mock |
| Partner portal (all pages) | | 100% mock |
| Super-admin pages (users, roles, CMS, audit-logs, settings, support, etc.) | | Mock / localStorage (adminService) |
| Dev-mode login, demo-data admin page | Real (`/devmode/status`, `/admin/demo/*`) | |

---

## 9. Notable Findings / Gaps

1. **Roles never seeded** — `Role`/`Permission` tables empty after migrate+seed; student registration 500s (ROLE_NOT_FOUND); all logins default to STUDENT. Highest-priority fix.
2. **Devmode credentials mismatch** — frontend expects `@imgprep.com` / `Admin@123`, seed creates `@demo.com` / `DemoPass@2024!`; `/devmode` login broken end-to-end.
3. **Demo accounts have no roleId/profiles** — cannot exercise HOSPITAL/REVIEWER/DOCTOR/ADMIN flows even after fixing credentials.
4. **No payment gateway** — `Payment` rows are self-created (UNDER_VERIFICATION); RAZORPAY/STRIPE methods create AWAITING_PAYMENT without real transactions.
5. **Doctor + Partner portals fully mock** — no backend surface for evaluations, logbooks, LoRs, certificates, scheduling, partnerships.
6. **Admin forward/flag features unbacked** — no matching Express endpoints; mutation is local-only.
7. **Program listing returns placeholders** (`rating: null`, `teachingType: null`, `highlights: []`) — honest, but frontend cards show empty fields.
8. **No real file upload** — documents store `fileName` strings; only avatars use multer+Cloudinary (env unset).
9. **Dashboard stats** — real for students only; staff roles get zero-filled payloads.
10. **`seed.mjs` is a stub** — `npm run prisma:seed` runs `prisma/seed.ts` via ts-node (`package.json` `prisma.seed`), so the stub is inert but misleading.

---

## 10. Build & Verification

- `npm run build` (`tsc -b && vite build`) — **passes clean**. 2456 modules; dist: `index-*.js` 1874.8 kB (gzip 417.9 kB), `index-*.css` 72.9 kB.
- `oxlint` configured as lint script.
- No automated test suite present.

---

## Appendix: Key Files Reviewed

- `backend/src/routes/index.js` (+ all `*.routes.js` listed in §3)
- `backend/src/middleware/{auth,role,upload,validate}.middleware.js`
- `backend/src/services/{auth,user,org}.service.js`, `backend/src/config/env.js`
- `src/services/{auth,user,hospital,reviewer,student,admin,doctor,partner}Service.ts`
- `src/lib/apiClient.ts`, `src/auth/AuthContext.tsx`, `src/services/sessionService.ts`
- `src/lib/queries.ts` (121 lines, healthy), `src/lib/dashboardQueries.ts`
- `src/router.tsx` (561 lines, single `createBrowserRouter`)
- `src/guards/{RequireAuth,RequireRole,RequireStudent,RequireOnboarding,RoleDashboardRoute,Can}.tsx`
- `src/roles/roles.ts`, `src/permissions/permissions.ts`, `src/mock/users.ts`, `src/hooks/useDevMode.ts`
- `prisma/schema.prisma` (49 models), `prisma/seed.ts`, `prisma/seed.mjs`, `prisma/migrations/**/migration.sql`
- `package.json`, `.env.example`, `netlify.toml`, `railway.toml`
