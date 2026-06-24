import { buildServer } from './server.js'
import { connectDb } from './db.js'
import { env, assertProductionSecrets } from './env.js'

async function start() {
  assertProductionSecrets()
  await connectDb()
  const app = buildServer()
  await app.listen({ port: env.PORT, host: '0.0.0.0' })
  app.log.info(`ATS API in ascolto su :${env.PORT} (${env.NODE_ENV})`)
}

start().catch((err) => {
  console.error('Avvio API fallito:', err)
  process.exit(1)
})
