import Fastify, { type FastifyInstance } from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { env } from './env.js'
import { authRoutes } from './routes/auth.js'
import { healthRoutes } from './routes/health.js'
import { employeeRoutes } from './routes/employees.js'

/**
 * Costruisce l'app Fastify SENZA connettersi al DB (la connessione avviene in index.ts).
 * Così i test possono usare `app.inject()` sulle rotte che non toccano MongoDB.
 *
 * Nota: per l'MVP access e refresh sono firmati dalla stessa istanza @fastify/jwt
 * (JWT_ACCESS_SECRET). I due segreti separati in env sono predisposti per passare in
 * futuro a istanze namespaced distinte.
 */
export function buildServer(): FastifyInstance {
  const app = Fastify({
    logger: env.NODE_ENV !== 'test',
  })

  app.register(cors, { origin: env.CORS_ORIGIN, credentials: true })
  app.register(jwt, { secret: env.JWT_ACCESS_SECRET })

  // API versionata
  app.register(healthRoutes, { prefix: '/api/v1' })
  app.register(authRoutes, { prefix: '/api/v1/auth' })
  app.register(employeeRoutes, { prefix: '/api/v1/employees' })

  return app
}
