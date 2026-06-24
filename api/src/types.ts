/**
 * Enum di dominio condivisi (allineati a docs/02-MODELLO-DATI.md).
 * Tenere in inglese per codice/DB; le label italiane vivono nel frontend.
 */
export const ROLES = ['ADMIN', 'STRUCTURE', 'EMPLOYEE'] as const
export type Role = (typeof ROLES)[number]

export const USER_STATUS = ['ACTIVE', 'PENDING', 'SUSPENDED'] as const
export type UserStatus = (typeof USER_STATUS)[number]

export const EMPLOYEE_STATUS = ['ACTIVE', 'PENDING', 'SUSPENDED', 'REVIEW'] as const
export type EmployeeStatus = (typeof EMPLOYEE_STATUS)[number]

export const STRUCTURE_TYPE = ['RESTAURANT', 'HOTEL', 'BAR', 'SPA', 'LOCATION', 'RESORT'] as const
export type StructureType = (typeof STRUCTURE_TYPE)[number]

export const SHIFT_STATUS = [
  'TO_ASSIGN',
  'SCHEDULED',
  'IN_PROGRESS',
  'DONE',
  'NO_SHOW',
  'CANCELLED',
] as const
export type ShiftStatus = (typeof SHIFT_STATUS)[number]

export const CONTRACT_TYPE = ['EXTRA', 'INTERMITTENT', 'OCCASIONAL'] as const
export type ContractType = (typeof CONTRACT_TYPE)[number]

export const SERVICE_TYPE = ['CATERING', 'STAFF_ONLY'] as const
export type ServiceType = (typeof SERVICE_TYPE)[number]

/** Payload del JWT (access + refresh). */
export interface JwtPayload {
  sub: string // userId
  role: Role
  type: 'access' | 'refresh'
}
