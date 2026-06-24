import { describe, it, expect } from 'vitest'
import { getDashboard, getNotifications, getJobSwipeCards } from './employeeService'
import { getEmployees, getStructures, getHourlyRate } from './adminService'

describe('employeeService', () => {
  it('getDashboard restituisce i dati', async () => {
    const data = await getDashboard()
    expect(data).toBeTruthy()
    expect(typeof data.shiftsThisMonth).toBe('number')
  })
  it('getNotifications restituisce una lista', async () => {
    const list = await getNotifications()
    expect(Array.isArray(list)).toBe(true)
    expect(list.length).toBeGreaterThan(0)
  })
  it('getJobSwipeCards restituisce copie indipendenti', async () => {
    const a = await getJobSwipeCards()
    const b = await getJobSwipeCards()
    expect(a[0]).not.toBe(b[0]) // copia difensiva, non lo stesso riferimento
  })
})

describe('adminService', () => {
  it('getEmployees e getStructures restituiscono liste non vuote', async () => {
    expect((await getEmployees()).length).toBeGreaterThan(0)
    expect((await getStructures()).length).toBeGreaterThan(0)
  })
  it('getHourlyRate calcola tariffa zona*ruolo con fallback', () => {
    expect(getHourlyRate('Centro', 'Cameriere')).toBeGreaterThan(0)
    // zona sconosciuta → fallback (non lancia, ritorna numero)
    expect(getHourlyRate('ZonaInesistente', 'Cameriere')).toBeGreaterThan(0)
  })
})
