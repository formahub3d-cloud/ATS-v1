/**
 * Simula una chiamata di rete restituendo un valore dopo un breve ritardo.
 * È il punto unico da sostituire con `fetch`/client API reale in Fase 0:
 * le pagine e gli hook non cambieranno, perché dipendono solo dalla firma async.
 */
export function simulate<T>(value: T, delayMs = 300): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), delayMs)
  })
}
