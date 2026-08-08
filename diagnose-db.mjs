import { createRequire } from 'module'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import 'dotenv/config'

const require = createRequire(import.meta.url)
const mariadb = require('mariadb')

const url = process.env.DATABASE_URL

const bigintSafe = (key, value) => (typeof value === 'bigint' ? value.toString() + 'n' : value)

function safeDecode(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function maskUrl(value) {
  if (!value) return null
  return value.replace(/\/\/[^:/@]+:[^@]+@/, '//***:***@')
}

function parseUrl(value) {
  const m = value.match(
    /^(mysql|mariadb):\/\/([^:/@]+):([^@]+)@([^:/?#]+)(?::(\d+))?([^?#]*)(?:\?([^#]*))?$/,
  )
  if (!m) return null
  return {
    protocol: m[1],
    username: m[2],
    hostname: m[4],
    port: m[5] || '3306',
    database: m[6] ? m[6].replace(/^\//, '') : null,
    query: m[7] || '',
  }
}

function buildConfig(value) {
  const u = new URL(value)
  const config = {
    host: u.hostname,
    port: Number(u.port) || 3306,
    user: safeDecode(u.username),
    password: safeDecode(u.password),
    database: safeDecode(u.pathname.replace(/^\//, '')),
  }
  if (u.searchParams.get('ssl') === 'true') {
    const scriptDir = path.dirname(fileURLToPath(import.meta.url))
    const caCertPath = path.resolve(scriptDir, 'aiven-ca.pem')
    config.ssl = { ca: readFileSync(caCertPath, 'utf8'), rejectUnauthorized: true }
  }
  return config
}

console.log('==========================================')
console.log('STEP 1: DATABASE_URL parse (masked)')
console.log('==========================================')
console.log('DATABASE_URL present:', Boolean(url))
if (!url) {
  console.log('NO DATABASE_URL SET. Export it before running.')
  process.exit(1)
}

const parsed = parseUrl(url)
if (!parsed) {
  console.log('PARSE FAILED for:', maskUrl(url))
  process.exit(1)
}
console.log('protocol:', parsed.protocol)
console.log('username:', parsed.username)
console.log('hostname:', parsed.hostname)
console.log('port:', parsed.port)
console.log('database:', parsed.database)
console.log('query params:', parsed.query)
const params = new URLSearchParams(parsed.query)
console.log('has ssl=true:', params.get('ssl') === 'true')
console.log('ssl value:', params.get('ssl'))
console.log('masked url:', maskUrl(url))

console.log('')
console.log('==========================================')
console.log('STEP 3-5: raw mariadb driver -> SELECT 1')
console.log('==========================================')
let conn
let rawOk = false
try {
  conn = await mariadb.createConnection(buildConfig(url))
  const rows = await conn.query('SELECT 1 AS ok')
  console.log('RAW mariadb SELECT 1: SUCCESS', JSON.stringify(rows, bigintSafe))
  rawOk = true
} catch (e) {
  console.log('RAW mariadb SELECT 1: FAILED')
  console.log('  error name:', e?.constructor?.name)
  console.log('  error code:', e?.code ?? e?.errno ?? '(none)')
  console.log('  error message:', e?.message ?? String(e))
} finally {
  if (conn) {
    try {
      await conn.end()
    } catch {}
  }
}

console.log('')
console.log('==========================================')
console.log('STEP 6-7: app Prisma client -> $queryRaw SELECT 1')
console.log('==========================================')
const { PrismaClient } = require('@prisma/client')
const { PrismaMariaDb } = require('@prisma/adapter-mariadb')

const adapter = new PrismaMariaDb(buildConfig(url))
const prisma = new PrismaClient({ adapter })
let prismaOk = false
try {
  const rows = await prisma.$queryRaw`SELECT 1 AS ok`
  console.log('PRISMA $queryRaw SELECT 1: SUCCESS', JSON.stringify(rows, bigintSafe))
  prismaOk = true
} catch (e) {
  console.log('PRISMA $queryRaw SELECT 1: FAILED')
  console.log('  error name:', e?.constructor?.name)
  console.log('  error code:', e?.code ?? e?.meta?.code ?? '(none)')
  console.log('  error message:', e?.message ?? String(e))
}

let dbName
if (prismaOk) {
  try {
    const rows = await prisma.$queryRaw`SELECT DATABASE() AS db`
    dbName = rows?.[0]?.db ?? '(unavailable)'
  } catch {
    dbName = '(could not read)'
  }
}
await prisma.$disconnect()

console.log('')
console.log('==========================================')
console.log('STEP 8: report + SELECT DATABASE()')
console.log('==========================================')
console.log(
  rawOk && prismaOk ? 'RESULT: C (both succeed)'
    : prismaOk ? 'RESULT: raw mariadb FAILED but Prisma succeeded (unexpected)'
    : rawOk ? 'RESULT: A (raw mariadb succeeds, Prisma fails)'
    : 'RESULT: B (both fail)',
)
if (prismaOk) {
  console.log('STEP 9: SELECT DATABASE() ->', dbName)
}
