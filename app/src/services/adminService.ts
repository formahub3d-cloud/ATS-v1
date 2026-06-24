/**
 * Service layer lato admin: oggi incapsula i dati mock, domani chiamerà l'API REST
 * (`/api/v1/...`). Le pagine importano queste funzioni invece dei file mock, così il
 * passaggio a dati reali non toccherà i componenti.
 */
import {
  mockEmployees,
  mockStructures,
  mockShifts,
  mockActiveShifts,
  mockNotifications,
  getHourlyRate as computeHourlyRate,
} from '@/data/mockAdmin'
import type {
  Employee,
  Structure,
  Shift,
  ActiveShift,
  AdminNotification,
} from '@/types/domain'
import { simulate } from './simulate'

export function getEmployees(): Promise<Employee[]> {
  return simulate([...mockEmployees])
}

export function getStructures(): Promise<Structure[]> {
  return simulate([...mockStructures])
}

export function getShifts(): Promise<Shift[]> {
  return simulate([...mockShifts])
}

export function getActiveShifts(): Promise<ActiveShift[]> {
  return simulate([...mockActiveShifts])
}

export function getAdminNotifications(): Promise<AdminNotification[]> {
  return simulate([...mockNotifications])
}

/**
 * Tariffa oraria di supporto (NON sostituisce il calcolo paga validato dal consulente).
 * La logica resta nel modulo dati finché non esisterà il motore paghe in `api/`.
 */
export function getHourlyRate(zone: string, role: string, rankBonus = 0): number {
  return computeHourlyRate(zone, role, rankBonus)
}
