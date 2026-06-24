/**
 * Tipi di dominio centralizzati del frontend ATS.
 *
 * Oggi sono derivati dalla forma dei dati mock; quando arriverà l'API (Fase 0),
 * questi tipi diventeranno il contratto condiviso (idealmente in `packages/shared`,
 * importato anche dal backend). Le pagine devono importare i tipi da qui, NON dai
 * file mock in `src/data` o `src/components/**`.
 */
import type {
  mockEmployees,
  mockStructures,
  mockShifts,
  mockActiveShifts,
  mockNotifications,
  mockAlerts,
  mockWeeklyDays,
  mockReperibili,
  mockPenalties,
  revenueData,
  roleDistribution,
  zoneRates,
} from '@/data/mockAdmin'

// ─── Admin / dominio gestionale ──────────────────────────────────
export type Employee = (typeof mockEmployees)[number]
export type Structure = (typeof mockStructures)[number]
export type Shift = (typeof mockShifts)[number]
export type ActiveShift = (typeof mockActiveShifts)[number]
export type AdminNotification = (typeof mockNotifications)[number]
export type AdminAlert = (typeof mockAlerts)[number]
export type WeeklyDay = (typeof mockWeeklyDays)[number]
export type Reperibile = (typeof mockReperibili)[number]
export type Penalty = (typeof mockPenalties)[number]
export type RevenuePoint = (typeof revenueData)[number]
export type RoleDistributionSlice = (typeof roleDistribution)[number]
export type ZoneRate = (typeof zoneRates)[number]
export type ZoneName = ZoneRate['zone']

// ─── Dipendente (PWA) ────────────────────────────────────────────
export type {
  Notification as EmployeeNotification,
  CalendarDay,
  JobCard,
  RankLevelInfo,
  PointsEntry,
  PayBreakdownItem,
  Course,
} from '@/components/employee/mockData'

// ─── Ruoli applicativi ───────────────────────────────────────────
export type { UserRole } from '@/context/RoleContext'
