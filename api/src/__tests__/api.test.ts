import { describe, it, expect, afterAll } from 'vitest'
import { buildServer } from '../server.js'
import { hashPassword, verifyPassword } from '../utils/password.js'

// Test che NON richiedono MongoDB: util password + validazione/guardie delle rotte.
const app = buildServer()
await app.ready()
afterAll(() => app.close())

describe('password util', () => {
  it('hash e verifica corretti', async () => {
    const hash = await hashPassword('password123')
    expect(hash).not.toBe('password123')
    expect(await verifyPassword('password123', hash)).toBe(true)
    expect(await verifyPassword('sbagliata', hash)).toBe(false)
  })
})

describe('GET /api/v1/health', () => {
  it('risponde ok', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/health' })
    expect(res.statusCode).toBe(200)
    expect(res.json().status).toBe('ok')
  })
})

describe('validazione auth (senza DB)', () => {
  it('register rifiuta input non valido con 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: { email: 'non-email', password: '123', role: 'ADMIN' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('login rifiuta input non valido con 400', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'x', password: '' },
    })
    expect(res.statusCode).toBe(400)
  })

  it('refresh con token non valido → 401', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      payload: { refreshToken: 'token-finto-non-valido' },
    })
    expect(res.statusCode).toBe(401)
  })
})

describe('RBAC', () => {
  it('GET /employees senza token → 401', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/employees' })
    expect(res.statusCode).toBe(401)
  })

  it('token EMPLOYEE su rotta ADMIN → 403', async () => {
    const token = app.jwt.sign({ sub: 'u1', role: 'EMPLOYEE', type: 'access' })
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/employees',
      headers: { authorization: `Bearer ${token}` },
    })
    expect(res.statusCode).toBe(403)
  })
})
