import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  CLIENT_URL: z.string().url().default('http://127.0.0.1:5173'),
  APP_URL: z.string().url().default('http://127.0.0.1:5173'),
  // Comma-separated allowlist of origins allowed to call the API.
  // Defaults to CLIENT_URL when unset, preserving current behavior.
  CORS_ALLOWED_ORIGINS: z
    .string()
    .optional()
    .default('')
    .transform(value => {
      if (!value || !value.trim()) return []
      return value
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean)
    }),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  EMAIL_VERIFICATION_EXPIRES_IN: z.string().default('24h'),
  PASSWORD_RESET_EXPIRES_IN: z.string().default('1h'),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  ENABLE_DEMO_DATA: z
    .string()
    .optional()
    .default('true')
    .transform(value => value.toLowerCase() === 'true'),
  ENABLE_DEVMODE: z
    .string()
    .optional()
    .default('false')
    .transform(value => value.toLowerCase() === 'true'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment configuration')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

if (parsed.data.JWT_SECRET === parsed.data.JWT_REFRESH_SECRET) {
  console.error('JWT_SECRET and JWT_REFRESH_SECRET must be different secrets')
  process.exit(1)
}

// When CORS_ALLOWED_ORIGINS is empty, fall back to the single CLIENT_URL.
// This keeps existing deployments working without any configuration change.
const allowedOrigins = new Set(
  parsed.data.CORS_ALLOWED_ORIGINS.length > 0 ? parsed.data.CORS_ALLOWED_ORIGINS : [parsed.data.CLIENT_URL],
)

export const env = parsed.data
export { allowedOrigins }
