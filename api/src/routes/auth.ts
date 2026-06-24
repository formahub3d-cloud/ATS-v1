import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { ROLES, type JwtPayload } from '../types.js'
import { registerUser, authenticate, AuthError } from '../services/authService.js'
import { UserModel } from '../models/index.js'
import { env } from '../env.js'
import { requireAuth } from '../auth/guards.js'

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Almeno 8 caratteri'),
})

const registerSchema = credentialsSchema.extend({
  role: z.enum(ROLES),
})

const refreshSchema = z.object({ refreshToken: z.string().min(10) })

export const authRoutes: FastifyPluginAsync = async (app) => {
  const signTokens = (sub: string, role: JwtPayload['role']) => ({
    accessToken: app.jwt.sign({ sub, role, type: 'access' }, { expiresIn: env.JWT_ACCESS_TTL }),
    refreshToken: app.jwt.sign({ sub, role, type: 'refresh' }, { expiresIn: env.JWT_REFRESH_TTL }),
  })

  app.post('/register', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Dati non validi', issues: parsed.error.issues })
    }
    try {
      const user = await registerUser(parsed.data)
      const tokens = signTokens(user.id, user.role)
      return reply.code(201).send({ user: user.toJSON(), ...tokens })
    } catch (err) {
      if (err instanceof AuthError) return reply.code(409).send({ error: err.message })
      throw err
    }
  })

  app.post('/login', async (request, reply) => {
    const parsed = credentialsSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Dati non validi', issues: parsed.error.issues })
    }
    try {
      const user = await authenticate(parsed.data.email, parsed.data.password)
      const tokens = signTokens(user.id, user.role)
      return reply.send({ user: user.toJSON(), ...tokens })
    } catch (err) {
      if (err instanceof AuthError) return reply.code(401).send({ error: err.message })
      throw err
    }
  })

  app.post('/refresh', async (request, reply) => {
    const parsed = refreshSchema.safeParse(request.body)
    if (!parsed.success) return reply.code(400).send({ error: 'Dati non validi' })
    try {
      const payload = app.jwt.verify<JwtPayload>(parsed.data.refreshToken)
      if (payload.type !== 'refresh') return reply.code(401).send({ error: 'Token non valido' })
      const tokens = signTokens(payload.sub, payload.role)
      return reply.send(tokens)
    } catch {
      return reply.code(401).send({ error: 'Refresh token scaduto o non valido' })
    }
  })

  app.get('/me', { preHandler: requireAuth }, async (request, reply) => {
    const user = await UserModel.findById(request.user.sub)
    if (!user) return reply.code(404).send({ error: 'Utente non trovato' })
    return reply.send({ user: user.toJSON() })
  })
}
