/**
 * Service layer lato Struttura: oggi incapsula i dati mock, domani chiamerà
 * l'API REST. Le pagine importano queste funzioni invece di definire gli array inline.
 */
import {
  Calendar, CreditCard, Star, HeartHandshake,
  CheckCircle, UserCheck, MessageSquare,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { GlassShift } from '@/components/structure/GlassShiftCard'
import type { MatchState } from '@/components/structure/MatchStatus'
import type { GlassEmployeeProfile } from '@/components/structure/GlassSwipeCard'
import type { GlassInvoice } from '@/components/structure/GlassInvoiceCard'
import { simulate } from './simulate'

/* ─────────────── tipi dati struttura ─────────────── */

export interface StructureNotification {
  id: string
  icon: LucideIcon
  color: string
  title: string
  desc: string
  time: string
  unread: boolean
}

export interface PendingRating {
  id: string
  employeeCode: string
  employeeAvatar: string
  date: string
  role: string
}

export interface StructureKpi {
  label: string
  value: string
  delta: string
  icon: LucideIcon
  positive: boolean
}

export interface StructurePayment {
  id: string
  date: string
  amount: number
  method: string
  status: 'charged' | 'failed' | 'pending'
  invoice: string
}

export interface StructureShiftHistory {
  id: string
  date: string
  dayNum: string
  month: string
  role: string
  timeStart: string
  timeEnd: string
  employeeCode: string
  status: 'completed' | 'confirmed' | 'pending' | 'noshow'
  structureCode: string
  amount: number
}

export interface StructureRatingGiven {
  id: string
  employeeCode: string
  employeeName: string
  role: string
  average: number
  punctuality: number
  professionalism: number
  cleanliness: number
  speed: number
  attitude: number
  date: string
  comment: string
}

export interface StructureRatingBreakdown {
  stars: number
  count: number
}

/* ─────────────── avatar lookup (interno ai dati mock) ─────────────── */

const portalAvatarMap: Record<string, string> = {
  'ATS-D-0047': '/avatar-employee-1.jpg',
  'ATS-D-0012': '/avatar-employee-2.jpg',
  'ATS-D-0089': '/avatar-employee-3.jpg',
  'ATS-D-0156': '/avatar-employee-4.jpg',
  'ATS-D-0023': '/avatar-employee-5.jpg',
  'ATS-D-0078': '/avatar-employee-6.jpg',
  'ATS-D-0091': '/avatar-employee-7.jpg',
  'ATS-D-0034': '/avatar-employee-8.jpg',
}

const matchingAvatarMap: Record<string, string> = {
  'p1': '/avatar-employee-1.jpg',
  'p2': '/avatar-employee-2.jpg',
  'p3': '/avatar-employee-3.jpg',
  'p4': '/avatar-employee-4.jpg',
  'p5': '/avatar-employee-5.jpg',
  'p6': '/avatar-employee-6.jpg',
  'p7': '/avatar-employee-7.jpg',
  'p8': '/avatar-employee-8.jpg',
}

/* ─────────────── StructurePortal ─────────────── */

const shifts: GlassShift[] = [
  { id: '1', date: '2026-05-13', dayNum: '13', month: 'MAG', role: 'Cameriere', timeStart: '08:00', timeEnd: '16:00', employeeCode: 'ATS-D-0047', employeeAvatar: portalAvatarMap['ATS-D-0047'], status: 'confirmed', structureCode: 'RIST-BN-0012', zone: 'Centro', note: 'Servizio sala principale, 80 coperti' },
  { id: '2', date: '2026-05-14', dayNum: '14', month: 'MAG', role: 'Chef de Partie', timeStart: '10:00', timeEnd: '18:00', status: 'pending', structureCode: 'RIST-BN-0012', zone: 'Centro' },
  { id: '3', date: '2026-05-15', dayNum: '15', month: 'MAG', role: 'Barman', timeStart: '18:00', timeEnd: '02:00', employeeCode: 'ATS-D-0023', employeeAvatar: portalAvatarMap['ATS-D-0023'], status: 'confirmed', structureCode: 'RIST-BN-0012', zone: 'Centro' },
]

const matches: MatchState[] = [
  { id: 'm1', employeeCode: 'ATS-D-0047', employeeName: 'Giulia', role: 'Cameriere', matchScore: 94, phase: 'mutual' },
  { id: 'm2', employeeCode: 'ATS-D-0089', employeeName: 'Sofia', role: 'Barman', matchScore: 91, phase: 'assigned', shiftDate: '15/05' },
  { id: 'm3', employeeCode: 'ATS-D-0012', employeeName: 'Luca', role: 'Chef de Partie', matchScore: 88, phase: 'mutual' },
]

const notifications: StructureNotification[] = [
  { id: 'n1', icon: CheckCircle, color: '#1EC99A', title: 'Check-in confermato', desc: 'ATS-D-0047 — 08:03', time: 'Ieri', unread: false },
  { id: 'n2', icon: UserCheck, color: '#5BB8F5', title: 'Nuovo match', desc: 'ATS-D-0156 — Cameriere, 91% compatibilita', time: '2 giorni fa', unread: true },
  { id: 'n3', icon: CreditCard, color: '#1EC99A', title: 'Pagamento addebitato', desc: '€120,00 — Turno 10/05', time: '3 giorni fa', unread: false },
  { id: 'n4', icon: MessageSquare, color: '#3AA3E8', title: 'Messaggio da ATS', desc: 'Confermato turno del 14/05', time: '4 giorni fa', unread: true },
]

const pendingRatings: PendingRating[] = [
  { id: 'r1', employeeCode: 'ATS-D-0047', employeeAvatar: portalAvatarMap['ATS-D-0047'], date: '10/05/2026', role: 'Cameriere' },
  { id: 'r2', employeeCode: 'ATS-D-0012', employeeAvatar: portalAvatarMap['ATS-D-0012'], date: '08/05/2026', role: 'Chef de Partie' },
]

const kpiData: StructureKpi[] = [
  { label: 'Turni mese', value: '24', delta: '+3 vs mese scorso', icon: Calendar, positive: true },
  { label: 'Spesa totale', value: '€3.456', delta: '-12% vs mese scorso', icon: CreditCard, positive: true },
  { label: 'Rating medio', value: '4.2', delta: 'su 5.0 stelle', icon: Star, positive: true },
  { label: 'Match attivi', value: '7', delta: '2 in attesa', icon: HeartHandshake, positive: true },
]

export function getStructureShifts(): Promise<GlassShift[]> {
  return simulate([...shifts])
}

export function getStructureMatches(): Promise<MatchState[]> {
  return simulate([...matches])
}

export function getStructureNotifications(): Promise<StructureNotification[]> {
  return simulate([...notifications])
}

export function getPendingRatings(): Promise<PendingRating[]> {
  return simulate([...pendingRatings])
}

export function getStructureKpis(): Promise<StructureKpi[]> {
  return simulate([...kpiData])
}

/* ─────────────── StructureMatching ─────────────── */

const allProfiles: GlassEmployeeProfile[] = [
  { id: 'p1', code: 'ATS-D-0047', firstName: 'Giulia', role: 'Cameriere', matchScore: 94, tags: ['Veloce', 'Sorriso', 'Team-player', 'Flex'], distance: 3.2, rank: 'Senior', experience: '4', venues: ['Hotel', 'Ristorante'], rating: 4.7, payRate: 15.00, avatar: matchingAvatarMap['p1'] },
  { id: 'p2', code: 'ATS-D-0012', firstName: 'Luca', role: 'Chef de Partie', matchScore: 88, tags: ['Creativo', 'Pulito', 'Organizzato', 'Leader'], distance: 5.1, rank: 'Elite', experience: '6', venues: ['Ristorante', 'Banqueting'], rating: 4.9, payRate: 18.50, avatar: matchingAvatarMap['p2'] },
  { id: 'p3', code: 'ATS-D-0089', firstName: 'Sofia', role: 'Barman', matchScore: 91, tags: ['Cocktail', 'Veloce', 'Customer-care'], distance: 1.8, rank: 'Affidabile', experience: '3', venues: ['Bar', 'Lounge'], rating: 4.5, payRate: 16.00, avatar: matchingAvatarMap['p3'] },
  { id: 'p4', code: 'ATS-D-0156', firstName: 'Marco', role: 'Cameriere', matchScore: 87, tags: ['Esperto', 'Puntuale', 'Gentile'], distance: 7.4, rank: 'Senior', experience: '5', venues: ['Ristorante', 'Hotel', 'Eventi'], rating: 4.6, payRate: 15.50, avatar: matchingAvatarMap['p4'] },
  { id: 'p5', code: 'ATS-D-0023', firstName: 'Elena', role: 'Barista', matchScore: 82, tags: ['Caffe-specialty', 'Mattiniera', 'Precisa'], distance: 4.5, rank: 'Affidabile', experience: '3', venues: ['Caffe', 'Hotel'], rating: 4.4, payRate: 14.00, avatar: matchingAvatarMap['p5'] },
  { id: 'p6', code: 'ATS-D-0078', firstName: 'Andrea', role: 'Receptionist', matchScore: 79, tags: ['Multilingue', 'Organizzato', 'Calmo'], distance: 2.3, rank: 'Rookie', experience: '1', venues: ['Hotel'], rating: 4.1, payRate: 13.50, avatar: matchingAvatarMap['p6'] },
  { id: 'p7', code: 'ATS-D-0091', firstName: 'Chiara', role: 'Cameriere', matchScore: 96, tags: ['Esperta', 'Veloce', 'Team-leader', 'Adattabile'], distance: 3.8, rank: 'Elite', experience: '7', venues: ['Ristorante', 'Hotel', 'Banqueting'], rating: 4.9, payRate: 17.00, avatar: matchingAvatarMap['p7'] },
  { id: 'p8', code: 'ATS-D-0034', firstName: 'Matteo', role: 'Barman', matchScore: 85, tags: ['Mixology', 'Creativo', 'Sociabile'], distance: 6.2, rank: 'Senior', experience: '4', venues: ['Lounge', 'Ristorante'], rating: 4.6, payRate: 16.50, avatar: matchingAvatarMap['p8'] },
]

const mutualMatches: MatchState[] = [
  { id: 'mm1', employeeCode: 'ATS-D-0047', employeeName: 'Giulia', role: 'Cameriere', matchScore: 94, phase: 'mutual' },
  { id: 'mm2', employeeCode: 'ATS-D-0012', employeeName: 'Luca', role: 'Chef de Partie', matchScore: 88, phase: 'assigned', shiftDate: '14/05' },
  { id: 'mm3', employeeCode: 'ATS-D-0089', employeeName: 'Sofia', role: 'Barman', matchScore: 91, phase: 'mutual' },
  { id: 'mm4', employeeCode: 'ATS-D-0156', employeeName: 'Marco', role: 'Cameriere', matchScore: 87, phase: 'assigned', shiftDate: '15/05' },
]

const likedEmployees: MatchState[] = [
  { id: 'le1', employeeCode: 'ATS-D-0091', employeeName: 'Chiara', role: 'Cameriere', matchScore: 96, phase: 'liked' },
  { id: 'le2', employeeCode: 'ATS-D-0034', employeeName: 'Matteo', role: 'Barman', matchScore: 85, phase: 'liked' },
]

const passedEmployees: MatchState[] = [
  { id: 'pe1', employeeCode: 'ATS-D-0078', employeeName: 'Andrea', role: 'Receptionist', matchScore: 79, phase: 'completed' },
]

export function getStructureProfiles(): Promise<GlassEmployeeProfile[]> {
  return simulate([...allProfiles])
}

export function getMutualMatches(): Promise<MatchState[]> {
  return simulate([...mutualMatches])
}

export function getLikedEmployees(): Promise<MatchState[]> {
  return simulate([...likedEmployees])
}

export function getPassedEmployees(): Promise<MatchState[]> {
  return simulate([...passedEmployees])
}

/* ─────────────── StructureHistory ─────────────── */

const invoices: GlassInvoice[] = [
  {
    id: 'f1',
    number: 'F-2025-0042',
    period: '1-30 Apr 2025',
    amount: 1200.00,
    hours: 96,
    status: 'paid',
    dueDate: '20/05/2025',
    issueDate: '01/05/2025',
    turns: [
      { date: '10/04', employeeCode: 'ATS-D-0047', role: 'Cameriere', hours: 8, amount: 120.00 },
      { date: '08/04', employeeCode: 'ATS-D-0012', role: 'Chef de Partie', hours: 8, amount: 136.00 },
    ],
  },
  {
    id: 'f2',
    number: 'F-2025-0038',
    period: '1-31 Mar 2025',
    amount: 960.00,
    hours: 80,
    status: 'paid',
    dueDate: '20/04/2025',
    issueDate: '01/04/2025',
    turns: [
      { date: '28/03', employeeCode: 'ATS-D-0047', role: 'Cameriere', hours: 8, amount: 120.00 },
      { date: '22/03', employeeCode: 'ATS-D-0012', role: 'Chef de Partie', hours: 8, amount: 136.00 },
    ],
  },
  {
    id: 'f3',
    number: 'F-2025-0031',
    period: '1-28 Feb 2025',
    amount: 1440.00,
    hours: 120,
    status: 'paid',
    dueDate: '20/03/2025',
    issueDate: '01/03/2025',
    turns: [
      { date: '15/02', employeeCode: 'ATS-D-0089', role: 'Barman', hours: 8, amount: 128.00 },
      { date: '10/02', employeeCode: 'ATS-D-0047', role: 'Cameriere', hours: 8, amount: 120.00 },
    ],
  },
  {
    id: 'f4',
    number: 'F-2025-0025',
    period: '1-31 Gen 2025',
    amount: 720.00,
    hours: 48,
    status: 'pending',
    dueDate: '20/02/2025',
    issueDate: '01/02/2025',
    turns: [
      { date: '20/01', employeeCode: 'ATS-D-0156', role: 'Cameriere', hours: 8, amount: 120.00 },
    ],
  },
]

const payments: StructurePayment[] = [
  { id: 'p1', date: '15/05/2025', amount: 1200.00, method: 'Stripe SEPA', status: 'charged', invoice: 'F-2025-0042' },
  { id: 'p2', date: '15/04/2025', amount: 960.00, method: 'Stripe SEPA', status: 'charged', invoice: 'F-2025-0038' },
  { id: 'p3', date: '15/03/2025', amount: 1440.00, method: 'Stripe SEPA', status: 'charged', invoice: 'F-2025-0031' },
  { id: 'p4', date: '15/02/2025', amount: 720.00, method: 'Carta', status: 'pending', invoice: 'F-2025-0025' },
]

const shiftHistory: StructureShiftHistory[] = [
  { id: 'h1', date: '2026-05-10', dayNum: '10', month: 'MAG', role: 'Cameriere', timeStart: '08:00', timeEnd: '16:00', employeeCode: 'ATS-D-0047', status: 'completed', structureCode: 'RIST-BN-0012', amount: 120 },
  { id: 'h2', date: '2026-05-08', dayNum: '08', month: 'MAG', role: 'Chef de Partie', timeStart: '10:00', timeEnd: '18:00', employeeCode: 'ATS-D-0012', status: 'completed', structureCode: 'RIST-BN-0012', amount: 136 },
  { id: 'h3', date: '2026-05-03', dayNum: '03', month: 'MAG', role: 'Barman', timeStart: '18:00', timeEnd: '02:00', employeeCode: 'ATS-D-0089', status: 'completed', structureCode: 'RIST-BN-0012', amount: 128 },
  { id: 'h4', date: '2026-05-01', dayNum: '01', month: 'MAG', role: 'Cameriere', timeStart: '08:00', timeEnd: '16:00', employeeCode: 'ATS-D-0047', status: 'completed', structureCode: 'RIST-BN-0012', amount: 180 },
  { id: 'h5', date: '2026-04-28', dayNum: '28', month: 'APR', role: 'Cameriere', timeStart: '08:00', timeEnd: '16:00', employeeCode: 'ATS-D-0156', status: 'completed', structureCode: 'RIST-BN-0012', amount: 120 },
  { id: 'h6', date: '2026-04-25', dayNum: '25', month: 'APR', role: 'Cameriere', timeStart: '08:00', timeEnd: '16:00', employeeCode: 'ATS-D-0047', status: 'completed', structureCode: 'RIST-BN-0012', amount: 160 },
]

const ratingsGiven: StructureRatingGiven[] = [
  { id: 'rg1', employeeCode: 'ATS-D-0047', employeeName: 'Giulia', role: 'Cameriere', average: 4.5, punctuality: 5, professionalism: 4, cleanliness: 5, speed: 4, attitude: 5, date: '10/05/2026', comment: 'Ottima prestazione, molto veloce e gentile.' },
  { id: 'rg2', employeeCode: 'ATS-D-0012', employeeName: 'Luca', role: 'Chef de Partie', average: 4.8, punctuality: 5, professionalism: 5, cleanliness: 5, speed: 4, attitude: 5, date: '08/05/2026', comment: 'Chef eccellente, organizza il lavoro in modo impeccabile.' },
  { id: 'rg3', employeeCode: 'ATS-D-0089', employeeName: 'Sofia', role: 'Barman', average: 4.2, punctuality: 4, professionalism: 4, cleanliness: 4, speed: 5, attitude: 4, date: '03/05/2026', comment: 'Brava con i cocktail, ha gestito bene la serata.' },
]

const ratingBreakdown: StructureRatingBreakdown[] = [
  { stars: 5, count: 12 },
  { stars: 4, count: 5 },
  { stars: 3, count: 2 },
  { stars: 2, count: 1 },
  { stars: 1, count: 0 },
]

export function getStructureInvoices(): Promise<GlassInvoice[]> {
  return simulate([...invoices])
}

export function getStructurePayments(): Promise<StructurePayment[]> {
  return simulate([...payments])
}

export function getStructureShiftHistory(): Promise<StructureShiftHistory[]> {
  return simulate([...shiftHistory])
}

export function getRatingsGiven(): Promise<StructureRatingGiven[]> {
  return simulate([...ratingsGiven])
}

export function getRatingBreakdown(): Promise<StructureRatingBreakdown[]> {
  return simulate([...ratingBreakdown])
}
