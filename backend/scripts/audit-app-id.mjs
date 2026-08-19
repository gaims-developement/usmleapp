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

const ids = [
  'cmpsurra000mo4ugdy0b2v4r',
  'cmspsurra000mo4ugdy0b2v4r',
]

for (const id of ids) {
  const app = await prisma.application.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      reviewerProfileId: true,
      programId: true,
      studentProfileId: true,
      startDate: true,
      durationWeeks: true,
      createdAt: true,
      program: {
        select: {
          title: true,
          specialty: true,
          duration: true,
          fee: true,
          hospital: { select: { name: true, city: true, state: true } },
        },
      },
    },
  })
  console.log(`\n=== ${id} ===`)
  console.log(JSON.stringify(app, null, 2))
}

await prisma.$disconnect()
