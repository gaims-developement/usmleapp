import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { env } from '../config/env.js'

const globalForPrisma = globalThis

function safeDecode(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function buildAdapterConfig() {
  const url = new URL(env.DATABASE_URL)
  const config = {
    host: url.hostname,
    port: Number(url.port) || 3306,
    user: safeDecode(url.username),
    password: safeDecode(url.password),
    database: safeDecode(url.pathname.replace(/^\//, '')),
  }

  if (url.searchParams.get('ssl') === 'true') {
    const dbDir = path.dirname(fileURLToPath(import.meta.url))
    const caCertPath = path.resolve(dbDir, '..', '..', '..', 'aiven-ca.pem')
    config.ssl = { ca: readFileSync(caCertPath, 'utf8'), rejectUnauthorized: true }
  }

  return config
}

const adapter = new PrismaMariaDb(buildAdapterConfig())

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
