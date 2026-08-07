import { env } from './config/env.js'
import { app } from './app.js'
import { logger } from './utils/logger.js'
import { prisma } from './db/prisma.js'

const server = app.listen(env.PORT, () => {
  logger.info(`API server running on port ${env.PORT}`)
})

async function shutdown(signal) {
  logger.info(`${signal} received. Shutting down API server...`)
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))

process.on('unhandledRejection', error => {
  logger.error('Unhandled promise rejection', error)
  server.close(() => process.exit(1))
})

process.on('uncaughtException', error => {
  logger.error('Uncaught exception', error)
  process.exit(1)
})
