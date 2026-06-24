import bcrypt from 'bcryptjs'

/**
 * Hashing password con bcrypt (pure-JS, nessuna dipendenza nativa da compilare).
 * In futuro valutabile argon2; l'interfaccia resta la stessa.
 */
const ROUNDS = 12

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS)
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}
