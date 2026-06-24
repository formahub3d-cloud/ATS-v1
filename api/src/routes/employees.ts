import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { EmployeeModel } from '../models/index.js'
import { EMPLOYEE_STATUS } from '../types.js'
import { requireRole } from '../auth/guards.js'

const createEmployeeSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  fiscalCode: z.string().length(16),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  iban: z.string().optional(),
  zone: z.string().optional(),
  hasVehicle: z.boolean().optional(),
  roles: z.array(z.string()).optional(),
  status: z.enum(EMPLOYEE_STATUS).optional(),
})

/**
 * Esempio di risorsa protetta con RBAC (solo ADMIN). Mostra il pattern che le altre
 * entità (strutture, turni, ore, paga) seguiranno nelle fasi successive.
 */
export const employeeRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: requireRole('ADMIN') }, async () => {
    const employees = await EmployeeModel.find().sort({ createdAt: -1 }).limit(200)
    return { employees }
  })

  app.post('/', { preHandler: requireRole('ADMIN') }, async (request, reply) => {
    const parsed = createEmployeeSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Dati non validi', issues: parsed.error.issues })
    }
    const employee = await EmployeeModel.create(parsed.data)
    return reply.code(201).send({ employee })
  })

  app.get('/:id', { preHandler: requireRole('ADMIN') }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const employee = await EmployeeModel.findById(id)
    if (!employee) return reply.code(404).send({ error: 'Dipendente non trovato' })
    return { employee }
  })
}
