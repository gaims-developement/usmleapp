import { config as loadEnv } from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
loadEnv({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env') })
import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const url = new URL(process.env.DATABASE_URL)
const config = {
  host: url.hostname,
  port: Number(url.port) || 3306,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: decodeURIComponent(url.pathname.replace(/^\//, '')),
  allowPublicKeyRetrieval: true,
}

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(config) })

const docs = await prisma.studentDocument.findMany({
  orderBy: { updatedAt: 'desc' },
  take: 8,
  select: {
    id: true,
    studentProfileId: true,
    name: true,
    fileName: true,
    mimeType: true,
    fileSize: true,
    storageProvider: true,
    storagePath: true,
    version: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  },
})

console.log(JSON.stringify(docs, null, 2))
await prisma.$disconnect()
