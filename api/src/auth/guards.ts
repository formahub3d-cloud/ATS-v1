import type { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify'
import type { Role, JwtPayload } from '../types.js'

// Tipizza request.user (popolato da @fastify/jwt dopo jwtVerify).
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload
    user: JwtPayload
  }
}

/** preHandler: richiede un access token valido. */
export const requireAuth: preHandlerHookHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    await request.jwtVerify()
    if (request.user.type !== 'access') {
      return reply.code(401).send({ error: 'Token non valido (atteso access token)' })
    }
  } catch {
    return reply.code(401).send({ error: 'Non autenticato' })
  }
}

/** preHandler factory: richiede un access token valido E uno dei ruoli indicati (RBAC). */
export function requireRole(...roles: Role[]): preHandlerHookHandler {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify()
    } catch {
      return reply.code(401).send({ error: 'Non autenticato' })
    }
    if (request.user.type !== 'access') {
      return reply.code(401).send({ error: 'Token non valido (atteso access token)' })
    }
    if (!roles.includes(request.user.role)) {
      return reply.code(403).send({ error: 'Permessi insufficienti' })
    }
  }
}
