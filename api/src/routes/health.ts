import type { FastifyPluginAsync } from 'fastify'
import mongoose from 'mongoose'

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
    return {
      status: 'ok',
      db: states[mongoose.connection.readyState] ?? 'unknown',
      uptime: process.uptime(),
    }
  })
}
