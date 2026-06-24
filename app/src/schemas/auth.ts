import { z } from 'zod'

/**
 * Schemi di validazione zod per i form di autenticazione/onboarding.
 *
 * Centralizzati qui per essere riusabili (e, in futuro, condivisi col backend in
 * `packages/shared`). Le regex sono volutamente lenienti ma significative: meglio
 * bloccare un'email malformata o una P.IVA non a 11 cifre che accettare "campo non vuoto".
 */

// ─── Campi riutilizzabili ────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PIVA_RE = /^(IT)?\d{11}$/i // P.IVA italiana: 11 cifre (prefisso IT opzionale)
const CF_RE = /^[A-Za-z0-9]{16}$/ // Codice fiscale: 16 alfanumerici
const PHONE_RE = /^[+]?[\d\s().-]{6,20}$/
const IBAN_RE = /^IT\d{2}[A-Za-z0-9]{10,30}$/i

export const emailSchema = z.string().trim().regex(EMAIL_RE, 'Email non valida')
export const pivaSchema = z.string().trim().regex(PIVA_RE, 'P.IVA non valida (11 cifre)')
export const cfSchema = z.string().trim().regex(CF_RE, 'Codice fiscale non valido (16 caratteri)')
export const phoneSchema = z.string().trim().regex(PHONE_RE, 'Numero di telefono non valido')
export const ibanSchema = z.string().trim().regex(IBAN_RE, 'IBAN non valido')
export const requiredString = (msg = 'Campo obbligatorio') => z.string().trim().min(1, msg)

// ─── Login (predisposto: oggi l'accesso è passwordless/demo) ──────
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'La password deve avere almeno 8 caratteri'),
})
export type LoginInput = z.infer<typeof loginSchema>

// ─── Onboarding Struttura: schema per step ───────────────────────
export const structureStepSchemas: Record<number, z.ZodTypeAny> = {
  1: z.object({
    ragioneSociale: requiredString('Ragione sociale obbligatoria'),
    piva: pivaSchema,
    referenteNome: requiredString('Nome referente obbligatorio'),
    referenteEmail: emailSchema,
  }),
  2: z.object({
    tipoStruttura: requiredString('Seleziona il tipo di struttura'),
    zona: requiredString('Seleziona la zona'),
  }),
  4: z.object({
    ruoliCercati: z.array(z.string()).min(1, 'Seleziona almeno un ruolo'),
  }),
  5: z.object({
    tagValori: z.array(z.string()).min(1, 'Seleziona almeno un valore'),
  }),
  7: z
    .object({
      metodoPagamento: z.string(),
      cardNumber: z.string().optional(),
      cardExpiry: z.string().optional(),
      cardCvc: z.string().optional(),
      cardHolder: z.string().optional(),
      iban: z.string().optional(),
      sepaHolder: z.string().optional(),
    })
    .refine(
      (d) =>
        d.metodoPagamento === 'carta'
          ? !!(d.cardNumber && d.cardExpiry && d.cardCvc && d.cardHolder)
          : !!(d.iban && d.sepaHolder),
      { message: 'Completa i dati di pagamento' }
    ),
  8: z.object({
    accettatoContratto: z.literal(true, { message: 'Devi accettare il contratto' }),
  }),
}

// ─── Onboarding Dipendente: schema per step ──────────────────────
export const employeeStepSchemas: Record<number, z.ZodTypeAny> = {
  1: z.object({
    nome: requiredString('Nome obbligatorio'),
    cognome: requiredString('Cognome obbligatorio'),
    dataNascita: requiredString('Data di nascita obbligatoria'),
    email: emailSchema,
    cf: cfSchema,
  }),
  5: z.object({
    ruoloPrincipale: requiredString('Seleziona il ruolo principale'),
    zonaLavoro: requiredString('Seleziona la zona di lavoro'),
    tagValori: z.array(z.string()).min(1, 'Seleziona almeno un valore'),
  }),
  7: z.object({
    slotColloquio: requiredString('Seleziona uno slot per il colloquio'),
  }),
}

/**
 * Valida un singolo step rispetto ai dati raccolti. Ritorna `success` e gli eventuali
 * messaggi di errore per campo (`fieldErrors`), pronti da mostrare nell'UI.
 */
export function validateStep(
  schemas: Record<number, z.ZodTypeAny>,
  step: number,
  data: Record<string, unknown>
): { success: boolean; fieldErrors: Record<string, string> } {
  const schema = schemas[step]
  if (!schema) return { success: true, fieldErrors: {} }
  const result = schema.safeParse(data)
  if (result.success) return { success: true, fieldErrors: {} }
  const fieldErrors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !fieldErrors[key]) fieldErrors[key] = issue.message
  }
  return { success: false, fieldErrors }
}
