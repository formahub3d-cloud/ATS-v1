import type { EmployeeProfile } from '@/components/structure/EmployeeSwipeCard'
import type { MatchState } from '@/components/structure/MatchStatus'
import type { Invoice } from '@/components/structure/InvoiceCard'
import type { Shift } from '@/components/structure/ShiftCard'

/* ───────────── employee profiles for swipe ───────────── */

export const employeeProfiles: EmployeeProfile[] = [
  {
    id: 'p1',
    code: 'ATS-D-0047',
    firstName: 'Giulia',
    role: 'Cameriere',
    matchScore: 94,
    tags: ['Veloce', 'Sorriso', 'Team-player', 'Flex'],
    distance: 3.2,
    rank: 'Senior',
    experience: '4',
    venues: ['Hotel', 'Ristorante'],
    rating: 4.7,
    payRate: 15.00,
  },
  {
    id: 'p2',
    code: 'ATS-D-0012',
    firstName: 'Luca',
    role: 'Chef de Partie',
    matchScore: 88,
    tags: ['Creativo', 'Pulito', 'Organizzato', 'Leader'],
    distance: 5.1,
    rank: 'Elite',
    experience: '6',
    venues: ['Ristorante', 'Banqueting'],
    rating: 4.9,
    payRate: 18.50,
  },
  {
    id: 'p3',
    code: 'ATS-D-0089',
    firstName: 'Sofia',
    role: 'Barman',
    matchScore: 91,
    tags: ['Cocktail', 'Veloce', 'Customer-care'],
    distance: 1.8,
    rank: 'Affidabile',
    experience: '3',
    venues: ['Bar', 'Lounge'],
    rating: 4.5,
    payRate: 16.00,
  },
  {
    id: 'p4',
    code: 'ATS-D-0156',
    firstName: 'Marco',
    role: 'Cameriere',
    matchScore: 87,
    tags: ['Esperto', 'Puntuale', 'Gentile'],
    distance: 7.4,
    rank: 'Senior',
    experience: '5',
    venues: ['Ristorante', 'Hotel', 'Eventi'],
    rating: 4.6,
    payRate: 15.50,
  },
  {
    id: 'p5',
    code: 'ATS-D-0023',
    firstName: 'Elena',
    role: 'Barista',
    matchScore: 82,
    tags: ['Caffe-specialty', 'Mattiniera', 'Precisa'],
    distance: 4.5,
    rank: 'Affidabile',
    experience: '3',
    venues: ['Caffe', 'Hotel'],
    rating: 4.4,
    payRate: 14.00,
  },
  {
    id: 'p6',
    code: 'ATS-D-0078',
    firstName: 'Andrea',
    role: 'Receptionist',
    matchScore: 79,
    tags: ['Multilingue', 'Organizzato', 'Calmo'],
    distance: 2.3,
    rank: 'Rookie',
    experience: '1',
    venues: ['Hotel'],
    rating: 4.1,
    payRate: 13.50,
  },
  {
    id: 'p7',
    code: 'ATS-D-0091',
    firstName: 'Chiara',
    role: 'Cameriere',
    matchScore: 96,
    tags: ['Esperta', 'Veloce', 'Team-leader', 'Adattabile'],
    distance: 3.8,
    rank: 'Elite',
    experience: '7',
    venues: ['Ristorante', 'Hotel', 'Banqueting'],
    rating: 4.9,
    payRate: 17.00,
  },
  {
    id: 'p8',
    code: 'ATS-D-0034',
    firstName: 'Matteo',
    role: 'Barman',
    matchScore: 85,
    tags: ['Mixology', 'Creativo', 'Sociabile'],
    distance: 6.2,
    rank: 'Senior',
    experience: '4',
    venues: ['Lounge', 'Ristorante'],
    rating: 4.6,
    payRate: 16.50,
  },
]

/* ───────────── matches ───────────── */

export const mutualMatches: MatchState[] = [
  { id: 'mm1', employeeCode: 'ATS-D-0047', employeeName: 'Giulia', role: 'Cameriere', matchScore: 94, phase: 'mutual' },
  { id: 'mm2', employeeCode: 'ATS-D-0012', employeeName: 'Luca', role: 'Chef de Partie', matchScore: 88, phase: 'assigned', shiftDate: '14/05' },
  { id: 'mm3', employeeCode: 'ATS-D-0089', employeeName: 'Sofia', role: 'Barman', matchScore: 91, phase: 'mutual' },
  { id: 'mm4', employeeCode: 'ATS-D-0156', employeeName: 'Marco', role: 'Cameriere', matchScore: 87, phase: 'assigned', shiftDate: '15/05' },
]

export const likedEmployees: MatchState[] = [
  { id: 'le1', employeeCode: 'ATS-D-0091', employeeName: 'Chiara', role: 'Cameriere', matchScore: 96, phase: 'liked' },
  { id: 'le2', employeeCode: 'ATS-D-0034', employeeName: 'Matteo', role: 'Barman', matchScore: 85, phase: 'liked' },
]

export const passedEmployees: MatchState[] = [
  { id: 'pe1', employeeCode: 'ATS-D-0078', employeeName: 'Andrea', role: 'Receptionist', matchScore: 79, phase: 'completed' },
]

/* ───────────── invoices ───────────── */

export const invoices: Invoice[] = [
  {
    id: 'f1',
    number: 'FAT-2026-0047',
    period: 'Maggio 2026',
    amount: 3456.00,
    hours: 192,
    status: 'paid',
    dueDate: '05/06/2026',
    issueDate: '01/06/2026',
    turns: [
      { date: '10/05', employeeCode: 'ATS-D-0047', role: 'Cameriere', hours: 8, amount: 120.00 },
      { date: '08/05', employeeCode: 'ATS-D-0012', role: 'Chef de Partie', hours: 8, amount: 136.00 },
      { date: '03/05', employeeCode: 'ATS-D-0089', role: 'Barman', hours: 8, amount: 128.00 },
      { date: '01/05', employeeCode: 'ATS-D-0047', role: 'Cameriere', hours: 8, amount: 180.00 },
    ],
  },
  {
    id: 'f2',
    number: 'FAT-2026-0031',
    period: 'Aprile 2026',
    amount: 2880.00,
    hours: 160,
    status: 'paid',
    dueDate: '05/05/2026',
    issueDate: '01/05/2026',
    turns: [
      { date: '28/04', employeeCode: 'ATS-D-0156', role: 'Cameriere', hours: 8, amount: 120.00 },
      { date: '25/04', employeeCode: 'ATS-D-0047', role: 'Cameriere', hours: 8, amount: 160.00 },
      { date: '20/04', employeeCode: 'ATS-D-0012', role: 'Chef de Partie', hours: 8, amount: 136.00 },
      { date: '15/04', employeeCode: 'ATS-D-0089', role: 'Barman', hours: 8, amount: 128.00 },
    ],
  },
  {
    id: 'f3',
    number: 'FAT-2026-0012',
    period: 'Marzo 2026',
    amount: 2400.00,
    hours: 128,
    status: 'paid',
    dueDate: '05/04/2026',
    issueDate: '01/04/2026',
    turns: [
      { date: '28/03', employeeCode: 'ATS-D-0047', role: 'Cameriere', hours: 8, amount: 120.00 },
      { date: '22/03', employeeCode: 'ATS-D-0012', role: 'Chef de Partie', hours: 8, amount: 136.00 },
      { date: '15/03', employeeCode: 'ATS-D-0089', role: 'Barman', hours: 8, amount: 128.00 },
    ],
  },
]

/* ───────────── shift history ───────────── */

export const shiftHistory: Shift[] = [
  { id: 'h1', date: '2026-05-10', dayNum: '10', month: 'MAG', role: 'Cameriere', timeStart: '08:00', timeEnd: '16:00', employeeCode: 'ATS-D-0047', status: 'completed', structureCode: 'RIST-BN-0012' },
  { id: 'h2', date: '2026-05-08', dayNum: '08', month: 'MAG', role: 'Chef de Partie', timeStart: '10:00', timeEnd: '18:00', employeeCode: 'ATS-D-0012', status: 'completed', structureCode: 'RIST-BN-0012' },
  { id: 'h3', date: '2026-05-03', dayNum: '03', month: 'MAG', role: 'Barman', timeStart: '18:00', timeEnd: '02:00', employeeCode: 'ATS-D-0089', status: 'completed', structureCode: 'RIST-BN-0012' },
  { id: 'h4', date: '2026-05-01', dayNum: '01', month: 'MAG', role: 'Cameriere', timeStart: '08:00', timeEnd: '16:00', employeeCode: 'ATS-D-0047', status: 'completed', structureCode: 'RIST-BN-0012' },
  { id: 'h5', date: '2026-04-28', dayNum: '28', month: 'APR', role: 'Cameriere', timeStart: '08:00', timeEnd: '16:00', employeeCode: 'ATS-D-0156', status: 'completed', structureCode: 'RIST-BN-0012' },
  { id: 'h6', date: '2026-04-25', dayNum: '25', month: 'APR', role: 'Cameriere', timeStart: '08:00', timeEnd: '16:00', employeeCode: 'ATS-D-0047', status: 'completed', structureCode: 'RIST-BN-0012' },
  { id: 'h7', date: '2026-04-20', dayNum: '20', month: 'APR', role: 'Chef de Partie', timeStart: '10:00', timeEnd: '18:00', employeeCode: 'ATS-D-0012', status: 'completed', structureCode: 'RIST-BN-0012' },
  { id: 'h8', date: '2026-04-15', dayNum: '15', month: 'APR', role: 'Barman', timeStart: '18:00', timeEnd: '02:00', employeeCode: 'ATS-D-0089', status: 'completed', structureCode: 'RIST-BN-0012' },
]

/* ───────────── payments ───────────── */

export interface Payment {
  id: string
  date: string
  amount: number
  method: string
  status: 'charged' | 'failed' | 'pending'
  invoiceRef: string
}

export const payments: Payment[] = [
  { id: 'pay1', date: '05/06/2026', amount: 3456.00, method: 'Carta ••••4242', status: 'charged', invoiceRef: 'FAT-2026-0047' },
  { id: 'pay2', date: '05/05/2026', amount: 2880.00, method: 'Carta ••••4242', status: 'charged', invoiceRef: 'FAT-2026-0031' },
  { id: 'pay3', date: '05/04/2026', amount: 2400.00, method: 'Carta ••••4242', status: 'charged', invoiceRef: 'FAT-2026-0012' },
]

/* ───────────── ratings given ───────────── */

export interface RatingRecord {
  id: string
  date: string
  employeeCode: string
  role: string
  scores: number[]
  average: number
}

export const ratingsGiven: RatingRecord[] = [
  { id: 'rg1', date: '11/05/2026', employeeCode: 'ATS-D-0047', role: 'Cameriere', scores: [5, 5, 4, 5, 4], average: 4.6 },
  { id: 'rg2', date: '09/05/2026', employeeCode: 'ATS-D-0012', role: 'Chef de Partie', scores: [5, 4, 5, 4, 5], average: 4.6 },
  { id: 'rg3', date: '04/05/2026', employeeCode: 'ATS-D-0089', role: 'Barman', scores: [4, 5, 4, 5, 4], average: 4.4 },
  { id: 'rg4', date: '02/05/2026', employeeCode: 'ATS-D-0047', role: 'Cameriere', scores: [5, 5, 5, 4, 5], average: 4.8 },
  { id: 'rg5', date: '29/04/2026', employeeCode: 'ATS-D-0156', role: 'Cameriere', scores: [4, 4, 4, 3, 4], average: 3.8 },
  { id: 'rg6', date: '26/04/2026', employeeCode: 'ATS-D-0047', role: 'Cameriere', scores: [5, 5, 4, 5, 5], average: 4.8 },
]

export const ratingBreakdown = [
  { tag: 'Puntualita', value: 4.5 },
  { tag: 'Professionalita', value: 4.7 },
  { tag: 'Pulizia', value: 4.3 },
  { tag: 'Velocita', value: 4.1 },
  { tag: 'Attitudine', value: 4.6 },
]
