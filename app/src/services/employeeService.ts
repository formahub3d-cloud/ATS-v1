/**
 * Service layer lato dipendente (PWA): oggi incapsula i dati mock, domani chiamerà
 * l'API REST. Le pagine importano queste funzioni invece del file mock.
 */
import {
  dashboardData,
  upcomingShift,
  notifications,
  jobCards,
  calendarDays,
  rankLevels,
  pointsHistory,
  payBreakdown,
  payHistory,
  courses,
} from '@/components/employee/mockData'
import type {
  EmployeeNotification,
  JobCard,
  CalendarDay,
  RankLevelInfo,
  PointsEntry,
  PayBreakdownItem,
  Course,
} from '@/types/domain'
import type { SwipeCardData } from '@/components/employee/GlassSwipeCard'
import { simulate } from './simulate'

// ---- Tipi dati pagine area Dipendente (UI specifica, non condivisi col dominio) ----

type CalendarPageDayStatus = 'available' | 'unavailable' | 'none' | 'assigned'

export interface CalendarPageDay {
  day: number
  status: CalendarPageDayStatus
  isToday?: boolean
  isHoliday?: boolean
  holidayPremium?: number
  hasShift?: boolean
  isWeekend?: boolean
  shiftCode?: string
}

export interface CalendarPageMonth {
  name: string
  year: number
  days: CalendarPageDay[][]
}

export interface RankPageLevel {
  name: string
  color: string
  glow: string
  minPoints: number
  benefits: string[]
}

export interface RankPagePointsEntry {
  id: string
  label: string
  points: number
  date: string
  type: 'earned' | 'spent' | 'bonus'
}

export interface RankPageCourse {
  name: string
  progress: number
  totalHours: number
  status: 'completed' | 'in-progress' | 'not-started'
  certificate?: string
}

export interface RankPagePayRow {
  zone: string
  base: string
  rankBonus: string
  total: string
  premiumDays: string
}

export function getDashboard(): Promise<typeof dashboardData> {
  return simulate(dashboardData)
}

export function getUpcomingShift(): Promise<typeof upcomingShift> {
  return simulate(upcomingShift)
}

export function getNotifications(): Promise<EmployeeNotification[]> {
  return simulate([...notifications])
}

export function getJobCards(): Promise<JobCard[]> {
  return simulate([...jobCards])
}

export function getCalendar(): Promise<CalendarDay[][]> {
  return simulate(calendarDays)
}

export function getRankLevels(): Promise<RankLevelInfo[]> {
  return simulate([...rankLevels])
}

export function getPointsHistory(): Promise<PointsEntry[]> {
  return simulate([...pointsHistory])
}

export function getPayBreakdown(): Promise<PayBreakdownItem[]> {
  return simulate([...payBreakdown])
}

export function getPayHistory(): Promise<typeof payHistory> {
  return simulate([...payHistory])
}

export function getCourses(): Promise<Course[]> {
  return simulate([...courses])
}

// ---- EmployeeCalendar: generazione mesi (dati, non presentazione) ----

function generateMonth(year: number, month: number, offset = 0): CalendarPageMonth {
  const date = new Date(year, month + offset, 1)
  const monthNames = [
    'Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
    'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'
  ]
  const name = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const startDay = (date.getDay() + 6) % 7

  const assignedDays = month === 4 ? [12, 13] : []
  const availablePattern = month === 4
    ? [2,3,4,5,6,9,10,15,16,17,18,19,20,22,23,26,27,28,29,30]
    : Array.from({ length: daysInMonth }, (_, i) => i + 1).filter((d) => d % 3 !== 0)
  const unavailablePattern = month === 4
    ? [7,8,11,14,21,24,31]
    : Array.from({ length: daysInMonth }, (_, i) => i + 1).filter((d) => d % 3 === 0)
  const holidays = month === 4 ? [1] : month === 3 ? [25] : []

  const weeks: CalendarPageDay[][] = []
  let week: CalendarPageDay[] = []
  for (let i = 0; i < startDay; i++) week.push({ day: 0, status: 'none' })

  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = (startDay + d - 1) % 7
    const isWeekend = dayOfWeek >= 5
    const day: CalendarPageDay = {
      day: d,
      status: 'none',
      isToday: offset === 0 && d === 13,
      isWeekend,
    }
    if (holidays.includes(d)) { day.isHoliday = true; day.holidayPremium = 100 }
    if (assignedDays.includes(d)) { day.hasShift = true; day.status = 'assigned'; day.shiftCode = d === 12 ? 'RIST-BN-0012' : 'HOTEL-BN-0003' }
    else if (availablePattern.includes(d)) day.status = 'available'
    else if (unavailablePattern.includes(d)) day.status = 'unavailable'
    week.push(day)
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push({ day: 0, status: 'none' })
    weeks.push(week)
  }
  return { name, year: date.getFullYear(), days: weeks }
}

export function getCalendarMonths(): Promise<CalendarPageMonth[]> {
  return simulate([
    generateMonth(2026, 4, -1),
    generateMonth(2026, 4, 0),
    generateMonth(2026, 4, 1),
  ])
}

// ---- EmployeeMatching: card swipe (dati con foto strutture) ----

const jobSwipeCards: SwipeCardData[] = [
  {
    id: '1', code: 'RIST-BN-0047', type: 'Ristorante', zone: 'Centro', role: 'Cameriere',
    schedule: 'Mar-Ven 18:00-23:30', pay: '€12,00/h', matchScore: 95,
    requirements: ['Attestato HACCP', 'Esperienza ristorazione'],
    tags: ['Paga veloce', 'Team giovane'], hasNavetta: true, photo: '/structure-1.jpg',
  },
  {
    id: '2', code: 'HOTEL-BN-0003', type: 'Hotel 4*', zone: 'Centro', role: 'Receptionist',
    schedule: 'Sab-Dom 08:00-16:00', pay: '€12,50/h', matchScore: 88,
    requirements: ['Inglese B2', 'Esperienza alberghiera'],
    tags: ['Lavoro continuativo', 'Inserimento rapido'], hasNavetta: false, photo: '/structure-2.jpg',
  },
  {
    id: '3', code: 'BAR-BN-0011', type: 'Bar', zone: 'Periferia', role: 'Barista',
    schedule: 'Ven-Sab 22:00-04:00', pay: '€14,00/h', matchScore: 75,
    requirements: ['Latte art', 'Resistenza ritmi notturni'],
    tags: ['Notturno', 'Mance elevate'], hasNavetta: true, photo: '/structure-3.jpg',
  },
  {
    id: '4', code: 'EVEN-BN-0020', type: 'Location Eventi', zone: 'Eventi', role: 'Event Staff',
    schedule: 'Dom 14:00-22:00', pay: '€15,00/h', matchScore: 82,
    requirements: ['Resistenza ritmi intensi', 'Vestito nero'],
    tags: ['Paga elevata', 'Occasionale'], hasNavetta: false, photo: '/structure-4.jpg',
  },
  {
    id: '5', code: 'SPAS-BN-0008', type: 'SPA & Wellness', zone: 'Resort', role: 'SPA Staff',
    schedule: 'Mer-Ven 10:00-18:00', pay: '€11,50/h', matchScore: 70,
    requirements: ['Attestato massaggio'],
    tags: ['Ambiente rilassante', 'Sconti benessere'], hasNavetta: true, photo: '/structure-5.jpg',
  },
  {
    id: '6', code: 'CLOC-BN-0013', type: 'Circolo Sportivo', zone: 'Periferia', role: 'Aiuto Cucina',
    schedule: 'Mar-Sab 17:00-23:00', pay: '€10,50/h', matchScore: 65,
    requirements: ['Velocità e resistenza'],
    tags: ['Cucina a vista', 'Sportivo'], hasNavetta: false, photo: '/structure-6.jpg',
  },
  {
    id: '7', code: 'BOUT-BN-0025', type: 'Boutique Hotel', zone: 'Centro Storico', role: 'Concierge',
    schedule: 'Lun-Ven 15:00-23:00', pay: '€13,00/h', matchScore: 90,
    requirements: ['Inglese fluente', 'Conoscenza città'],
    tags: ['Lusso', 'Propina elevata'], hasNavetta: true, photo: '/structure-7.jpg',
  },
  {
    id: '8', code: 'RIST-BN-0052', type: 'Trattoria', zone: 'Industriale', role: 'Aiuto Sala',
    schedule: 'Lun-Sab 11:30-15:00', pay: '€9,50/h', matchScore: 60,
    requirements: ['Disponibilità immediata'],
    tags: ['Orario pranzo', 'Fuori orario'], hasNavetta: false, photo: '/structure-8.jpg',
  },
]

export function getJobSwipeCards(): Promise<SwipeCardData[]> {
  return simulate(jobSwipeCards.map((c) => ({ ...c })))
}

// ---- EmployeeRank: dati pagina (distinti dai getter basati su mockData) ----

const rankPageLevels: RankPageLevel[] = [
  { name: 'Rookie', color: '#94A3B8', glow: 'rgba(148,163,184,0.2)', minPoints: 0, benefits: ['Accesso base', 'Tariffa standard'] },
  { name: 'Affidabile', color: '#5BB8F5', glow: 'rgba(91,184,245,0.3)', minPoints: 500, benefits: ['Pool turni', 'Accesso preferenze'] },
  { name: 'Senior', color: '#3AA3E8', glow: 'rgba(58,163,232,0.3)', minPoints: 1200, benefits: ['Pool reperibili', '+€1/h bonus'] },
  { name: 'Elite', color: '#1EC99A', glow: 'rgba(30,201,154,0.3)', minPoints: 2000, benefits: ['Turni premium', '+€2/h bonus'] },
  { name: 'Ambassador', color: '#F5B800', glow: 'rgba(245,184,0,0.3)', minPoints: 3500, benefits: ['Tutti i benefit', '+€3/h bonus'] },
]

const rankPagePoints: RankPagePointsEntry[] = [
  { id: '1', label: 'Turno completato · RIST-BN-0012', points: 120, date: '13 Mag', type: 'earned' },
  { id: '2', label: 'Recensione 5 stelle', points: 50, date: '12 Mag', type: 'bonus' },
  { id: '3', label: 'Puntualità bonus', points: 25, date: '12 Mag', type: 'bonus' },
  { id: '4', label: 'Corso HACCP completato', points: 200, date: '10 Mag', type: 'earned' },
  { id: '5', label: 'Navetta confermata', points: -5, date: '10 Mag', type: 'spent' },
  { id: '6', label: 'Turno completato · HOTEL-BN-0003', points: 120, date: '8 Mag', type: 'earned' },
  { id: '7', label: 'Mancia condivisa', points: 15, date: '8 Mag', type: 'bonus' },
  { id: '8', label: 'Turno completato · BAR-BN-0011', points: 100, date: '5 Mag', type: 'earned' },
  { id: '9', label: 'Assenza non giustificata', points: -100, date: '3 Mag', type: 'spent' },
  { id: '10', label: 'Turno completato · EVEN-BN-0020', points: 150, date: '1 Mag', type: 'earned' },
]

const rankPageCourses: RankPageCourse[] = [
  { name: 'HACCP - Sicurezza alimentare', progress: 100, totalHours: 8, status: 'completed', certificate: 'HACCP-2025-0012' },
  { name: 'Crisi e conflitti in sala', progress: 65, totalHours: 6, status: 'in-progress' },
  { name: 'Sommelier base - Vini italiani', progress: 0, totalHours: 12, status: 'not-started' },
  { name: 'Inglese per hospitality B2', progress: 30, totalHours: 20, status: 'in-progress' },
  { name: 'Gestione delle emergenze', progress: 100, totalHours: 4, status: 'completed', certificate: 'EMRG-2025-0047' },
]

const rankPagePay: RankPagePayRow[] = [
  { zone: 'Centro', base: '€15,00/h', rankBonus: '+€1,00/h', total: '€16,00/h', premiumDays: 'Festivi +50%' },
  { zone: 'Periferia', base: '€13,00/h', rankBonus: '+€1,00/h', total: '€14,00/h', premiumDays: 'Festivi +50%' },
  { zone: 'Industriale', base: '€12,00/h', rankBonus: '+€1,00/h', total: '€13,00/h', premiumDays: 'Festivi +50%' },
  { zone: 'Eventi', base: '€16,00/h', rankBonus: '+€1,00/h', total: '€17,00/h', premiumDays: 'Sempre +50%' },
  { zone: 'Resort', base: '€14,00/h', rankBonus: '+€1,00/h', total: '€15,00/h', premiumDays: 'Festivi +100%' },
]

export function getRankPageLevels(): Promise<RankPageLevel[]> {
  return simulate(rankPageLevels.map((l) => ({ ...l, benefits: [...l.benefits] })))
}

export function getRankPagePoints(): Promise<RankPagePointsEntry[]> {
  return simulate(rankPagePoints.map((p) => ({ ...p })))
}

export function getRankPageCourses(): Promise<RankPageCourse[]> {
  return simulate(rankPageCourses.map((c) => ({ ...c })))
}

export function getRankPagePay(): Promise<RankPagePayRow[]> {
  return simulate(rankPagePay.map((r) => ({ ...r })))
}
