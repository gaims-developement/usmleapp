# USMLE App Backend

Express API backend for the USMLE App. Authentication is fully implemented
against the MySQL database via Prisma; all other domain endpoints are
scaffolded and will be added incrementally.

## Stack

- Node.js
- Express
- MySQL 8
- Prisma ORM
- JWT access tokens + opaque rotating refresh tokens (SHA-256 hashed in DB)
- bcrypt password hashing
- Zod validation
- Cloudinary
- Multer
- dotenv

## Commands

```bash
# Apply the auth schema changes, then seed demo accounts
npx prisma db push          # or run migration_auth.sql against MySQL
npx prisma generate
npm run prisma:seed

npm run dev:backend         # watch mode
npm run start:backend       # production-style start
```

The migration SQL for the auth tables (`RefreshToken`,
`EmailVerificationToken`, `PasswordResetToken`) is in `migration_auth.sql`.

## Structure

```text
backend/src
  app.js
  server.js
  config/
  db/
  middleware/
  routes/
  services/
  utils/
prisma/schema.prisma
```

## Environment

See `.env.example`. Required auth-related variables:

- `JWT_SECRET` / `JWT_EXPIRES_IN` — access token signing + lifetime
- `JWT_REFRESH_SECRET` / `JWT_REFRESH_EXPIRES_IN` — refresh token lifetime
- `EMAIL_VERIFICATION_EXPIRES_IN` — email verification link lifetime
- `PASSWORD_RESET_EXPIRES_IN` — password reset link lifetime
- `APP_URL` — base URL used to build verification / reset links

## Auth endpoints

All under `/api/auth`.

| Method | Path                     | Auth | Description                                      |
| ------ | ------------------------ | ---- | ------------------------------------------------ |
| POST   | `/login`                 | —    | Email + password → `{ user, accessToken, refreshToken }` |
| POST   | `/register`              | —    | Student registration (STUDENT role + profile)    |
| POST   | `/register/partner`      | —    | Partner registration (HOSPITAL/DOCTOR/REVIEWER), pending review |
| POST   | `/refresh`               | —    | Rotate a refresh token → new access + refresh tokens |
| POST   | `/logout`                | —    | Revoke a refresh token                           |
| GET    | `/me`                    | ✓    | Current authenticated user                       |
| POST   | `/verify-email/request`  | —    | Request an email verification link               |
| POST   | `/verify-email`          | —    | Verify an email using a one-time token           |
| POST   | `/forgot-password`       | —    | Request a password reset link                    |
| POST   | `/reset-password`        | —    | Set a new password using a one-time token        |

### Token model

- **Access tokens** are JWTs signed with `JWT_SECRET`, carrying `{ sub, role }`
  and short-lived (`JWT_EXPIRES_IN`).
- **Refresh tokens** are opaque 48-byte random strings; only their SHA-256 hash
  is stored in `RefreshToken`. They are rotated on every `/refresh` (the old
  token is revoked and linked to the new one) and revoked on `/logout` and on
  password reset.
- Email verification and password reset use one-time opaque tokens stored as
  hashes in `EmailVerificationToken` / `PasswordResetToken`.

### Email verification & forgot password (structure only)

No mailer is wired yet. For development, the endpoints return the generated
token and its URL (`verifyUrl` / `resetUrl`) directly in the response so the
flow can be exercised. Swap these for a real email delivery call later.

### Role-based access

`authenticate` (`middleware/auth.middleware.js`) verifies the access token and
loads the user from the database, attaching `req.user` with the current role.
`requireRoles(...roles)` (`middleware/role.middleware.js`) then gates routes,
e.g. `requireRoles('SUPER_ADMIN', 'ADMIN')`.

### Seed accounts

`npm run prisma:seed` creates role/permission rows plus demo users (password
`Admin@123`) for every role: `admin@imgprep.com` (SUPER_ADMIN),
`ops@imgprep.com` (ADMIN), `student@imgprep.com`, `reviewer@imgprep.com`,
`hospital@imgprep.com`, `doctor@imgprep.com`.
