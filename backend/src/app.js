import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { env } from './config/env.js'
import { apiRouter } from './routes/index.js'
import { requestLogger } from './middleware/request-logger.middleware.js'
import { notFoundMiddleware } from './middleware/not-found.middleware.js'
import { errorMiddleware } from './middleware/error.middleware.js'

export const app = express()

app.disable('x-powered-by')

app.use(helmet())
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(requestLogger)

app.use('/api', apiRouter)

app.use(notFoundMiddleware)
app.use(errorMiddleware)
