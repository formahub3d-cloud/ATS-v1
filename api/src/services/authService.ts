import { UserModel, type UserDoc } from '../models/index.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import type { Role } from '../types.js'

export class AuthError extends Error {}

/** Registra un nuovo utente. Lancia AuthError se l'email è già usata. */
export async function registerUser(input: {
  email: string
  password: string
  role: Role
}): Promise<UserDoc> {
  const existing = await UserModel.findOne({ email: input.email.toLowerCase() })
  if (existing) throw new AuthError('Email già registrata')
  const passwordHash = await hashPassword(input.password)
  return UserModel.create({
    email: input.email.toLowerCase(),
    passwordHash,
    role: input.role,
    status: 'ACTIVE',
  })
}

/** Verifica le credenziali e ritorna l'utente, o lancia AuthError. */
export async function authenticate(email: string, password: string): Promise<UserDoc> {
  const user = await UserModel.findOne({ email: email.toLowerCase() })
  if (!user) throw new AuthError('Credenziali non valide')
  if (user.status === 'SUSPENDED') throw new AuthError('Account sospeso')
  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) throw new AuthError('Credenziali non valide')
  user.lastLoginAt = new Date()
  await user.save()
  return user
}
