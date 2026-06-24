import 'dotenv/config'
import { z } from 'zod'

/**
 * Configurazione d'ambiente validata con zod. I segreti NON hanno default reali:
 * in produzione devono essere forniti (Railway). In sviluppo/test si usano default
 * espliciti e palesemente non sicuri, così l'app parte ma non si rischia di andare
 * online con segreti deboli (vedi check in `assertProductionSecrets`).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(8080),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/ats'),
  JWT_ACCESS_SECRET: z.string().default('dev-access-secret-not-for-production'),
  JWT_REFRESH_SECRET: z.string().default('dev-refresh-secret-not-for-production'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
})

export type Env = z.infer<typeof envSchema>

export const env: Env = envSchema.parse(process.env)

/** In produzione i segreti di default sono vietati: meglio fallire all'avvio. */
export function assertProductionSecrets(e: Env = env): void {
  if (e.NODE_ENV !== 'production') return
  const weak =
    e.JWT_ACCESS_SECRET.startsWith('dev-') ||
    e.JWT_REFRESH_SECRET.startsWith('dev-') ||
    e.JWT_ACCESS_SECRET.length < 32 ||
    e.JWT_REFRESH_SECRET.length < 32
  if (weak) {
    throw new Error(
      'Segreti JWT non validi in produzione: imposta JWT_ACCESS_SECRET/JWT_REFRESH_SECRET (>=32 char).'
    )
  }
}
