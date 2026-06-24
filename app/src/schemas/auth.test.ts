import { describe, it, expect } from 'vitest'
import {
  loginSchema,
  emailSchema,
  pivaSchema,
  cfSchema,
  ibanSchema,
  structureStepSchemas,
  employeeStepSchemas,
  validateStep,
} from './auth'

describe('campi base', () => {
  it('email valida/invalida', () => {
    expect(emailSchema.safeParse('mario@ats.it').success).toBe(true)
    expect(emailSchema.safeParse('non-una-email').success).toBe(false)
  })
  it('P.IVA: 11 cifre (con prefisso IT opzionale)', () => {
    expect(pivaSchema.safeParse('01234567890').success).toBe(true)
    expect(pivaSchema.safeParse('IT01234567890').success).toBe(true)
    expect(pivaSchema.safeParse('123').success).toBe(false)
  })
  it('codice fiscale: 16 caratteri', () => {
    expect(cfSchema.safeParse('RSSMRA80A01F839X').success).toBe(true)
    expect(cfSchema.safeParse('TROPPOCORTO').success).toBe(false)
  })
  it('IBAN italiano', () => {
    expect(ibanSchema.safeParse('IT60X0542811101000000123456').success).toBe(true)
    expect(ibanSchema.safeParse('DE89370400440532013000').success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('accetta credenziali valide', () => {
    expect(loginSchema.safeParse({ email: 'a@b.it', password: 'password1' }).success).toBe(true)
  })
  it('rifiuta password troppo corta', () => {
    expect(loginSchema.safeParse({ email: 'a@b.it', password: '123' }).success).toBe(false)
  })
})

describe('onboarding struttura - step 1', () => {
  it('accetta dati validi', () => {
    const r = structureStepSchemas[1].safeParse({
      ragioneSociale: 'Ristorante Test',
      piva: '01234567890',
      referenteNome: 'Mario Rossi',
      referenteEmail: 'mario@test.it',
    })
    expect(r.success).toBe(true)
  })
  it('rifiuta P.IVA non valida', () => {
    const r = structureStepSchemas[1].safeParse({
      ragioneSociale: 'X',
      piva: 'abc',
      referenteNome: 'Mario',
      referenteEmail: 'mario@test.it',
    })
    expect(r.success).toBe(false)
  })
})

describe('onboarding dipendente - step 1', () => {
  it('rifiuta CF non valido', () => {
    const r = employeeStepSchemas[1].safeParse({
      nome: 'Luca',
      cognome: 'Bianchi',
      dataNascita: '1990-01-01',
      email: 'luca@test.it',
      cf: 'CORTO',
    })
    expect(r.success).toBe(false)
  })
})

describe('validateStep', () => {
  it('ritorna fieldErrors per campi non validi', () => {
    const { success, fieldErrors } = validateStep(structureStepSchemas, 1, {
      ragioneSociale: '',
      piva: 'xx',
      referenteNome: '',
      referenteEmail: 'bad',
    })
    expect(success).toBe(false)
    expect(Object.keys(fieldErrors).length).toBeGreaterThan(0)
    expect(fieldErrors.referenteEmail).toBeDefined()
  })
  it('step senza schema è sempre valido', () => {
    expect(validateStep(structureStepSchemas, 99, {}).success).toBe(true)
  })
})
