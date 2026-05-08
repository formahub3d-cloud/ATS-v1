// ---- Mock data for all Employee PWA pages ----

export const EMPLOYEE_NAME = 'Marco';
export const EMPLOYEE_CODE = 'ATS-D-0047';

// ---- Dashboard ----
export const dashboardData = {
  payThisMonth: 384.0,
  shiftsThisMonth: 24,
  presenceRate: 94,
  ratingsCount: 12,
  rankPoints: 1240,
  nextLevelPoints: 2000,
  rankProgress: 62,
  currentRank: 'Senior' as const,
  unreadNotifications: 3,
};

export const upcomingShift = {
  code: 'RIST-BN-0012',
  role: 'Cameriere',
  time: '08:00 \u2014 16:00',
  date: 'Marted\xEC 13 Maggio',
  addressHint: 'Indirizzo sbloccato 2h prima',
  navettaAvailable: true,
};

export interface Notification {
  id: string;
  icon: 'bell' | 'truck' | 'check-circle' | 'credit-card' | 'alert-triangle';
  iconColor: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

export const notifications: Notification[] = [
  {
    id: '1',
    icon: 'bell',
    iconColor: '#5BB8F5',
    title: 'Nuovo turno proposto',
    description: 'RIST-BN-0047 \u00B7 Cameriere \u00B7 Sab 10/05 \u00B7 \u20AC8/h',
    time: '2h fa',
    unread: true,
  },
  {
    id: '2',
    icon: 'truck',
    iconColor: '#5BB8F5',
    title: 'Navetta domani',
    description: 'Partenza 07:30 \u00B7 Conferma entro oggi',
    time: '5h fa',
    unread: true,
  },
  {
    id: '3',
    icon: 'check-circle',
    iconColor: '#1EC99A',
    title: 'Check-in confermato',
    description: 'RIST-BN-0012 \u00B7 08:03 \u00B7 GPS ok',
    time: 'Ieri',
    unread: true,
  },
  {
    id: '4',
    icon: 'credit-card',
    iconColor: '#1EC99A',
    title: 'Paga aggiornata',
    description: '+\u20AC64,00 \u00B7 Turno completato',
    time: 'Ieri',
    unread: false,
  },
];

export const shiftProposal = {
  code: 'RIST-BN-0047',
  role: 'Cameriere',
  date: 'Sab 10 Maggio',
  time: '18:00 \u2014 23:00',
  pay: '\u20AC8/h',
  responseDeadline: '47h',
};

// ---- Calendar ----
export interface CalendarDay {
  day: number;
  status: 'available' | 'unavailable' | 'none' | 'assigned';
  isToday?: boolean;
  isHoliday?: boolean;
  holidayPremium?: number; // percentage
  hasShift?: boolean;
  isWeekend?: boolean;
}

function generateCalendarDays(): CalendarDay[][] {
  const weeks: CalendarDay[][] = [];
  const daysInMonth = 31;
  const startDay = 3; // May 2026 starts on Thursday (0=Sun, 3=Thu)

  let currentWeek: CalendarDay[] = [];
  // Fill empty days at start
  for (let i = 0; i < startDay; i++) {
    currentWeek.push({ day: 0, status: 'none' });
  }

  const holidays = [1, 25]; // May 1, May 25
  const assignedDays = [12, 13];
  const availablePattern = [2, 3, 4, 5, 6, 9, 10, 15, 16, 17, 18, 19, 20, 22, 23, 26, 27, 28, 29, 30];
  const unavailablePattern = [7, 8, 11, 14, 21, 24, 31];

  for (let d = 1; d <= daysInMonth; d++) {
    const isWeekend = (startDay + d - 1) % 7 >= 5;
    const day: CalendarDay = {
      day: d,
      status: 'none',
      isToday: d === 13,
      isWeekend,
    };

    if (holidays.includes(d)) {
      day.isHoliday = true;
      day.holidayPremium = d === 1 ? 100 : 50;
    }
    if (assignedDays.includes(d)) {
      day.hasShift = true;
      day.status = 'assigned';
    } else if (availablePattern.includes(d)) {
      day.status = 'available';
    } else if (unavailablePattern.includes(d)) {
      day.status = 'unavailable';
    }

    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ day: 0, status: 'none' });
    }
    weeks.push(currentWeek);
  }
  return weeks;
}

export const calendarDays = generateCalendarDays();
export const italianHolidays2026 = [
  { date: '01/05', name: 'Festa dei Lavoratori', premium: 100 },
  { date: '25/04', name: 'Liberazione', premium: 50 },
  { date: '02/06', name: 'Festa della Repubblica', premium: 50 },
  { date: '15/08', name: 'Ferragosto', premium: 100 },
  { date: '01/11', name: 'Tutti i Santi', premium: 50 },
  { date: '08/12', name: 'Immacolata', premium: 50 },
  { date: '25/12', name: 'Natale', premium: 100 },
  { date: '26/12', name: 'Santo Stefano', premium: 100 },
];

// ---- Matching ----
export interface JobCard {
  id: string;
  code: string;
  type: string;
  zone: string;
  role: string;
  schedule: string;
  pay: string;
  matchScore: number;
  requirements: string[];
  tags: string[];
  hasNavetta?: boolean;
  photos: string[];
}

export const jobCards: JobCard[] = [
  {
    id: '1',
    code: 'RIST-BN-0047',
    type: 'Ristorante',
    zone: 'Zona Centro',
    role: 'Chef de Partie',
    schedule: 'Sab\u2013Dom \u00B7 06:00\u201314:00',
    pay: '\u20AC8/h',
    matchScore: 94,
    requirements: ['HACCP \u2713', 'Fine dining'],
    tags: ['Puntualit\xE0', 'Professionalit\xE0'],
    hasNavetta: true,
    photos: ['Sala principale', 'Cucina', 'Giardino estivo', 'Bar'],
  },
  {
    id: '2',
    code: 'HOTEL-BN-0018',
    type: 'Hotel 4*',
    zone: 'Zona Fiera',
    role: 'Receptionist',
    schedule: 'Lun\u2013Ven \u00B7 14:00\u201322:00',
    pay: '\u20AC9/h',
    matchScore: 87,
    requirements: ['Inglese B2', 'PMS'],
    tags: ['Accoglienza', 'Multilingue'],
    photos: ['Hall', 'Reception', 'Lounge'],
  },
  {
    id: '3',
    code: 'RIST-BN-0062',
    type: 'Ristorante Pizzeria',
    zone: 'Zona San Francesco',
    role: 'Cameriere',
    schedule: 'Ven\u2013Dom \u00B7 18:00\u201323:00',
    pay: '\u20AC7.5/h',
    matchScore: 79,
    requirements: ['Esperienza sala'],
    tags: ['Team work', 'Velocit\xE0'],
    photos: ['Sala', 'Forno a legna'],
  },
  {
    id: '4',
    code: 'BAR-BN-0031',
    type: 'Bar Lounge',
    zone: 'Zona Centro Storico',
    role: 'Barman',
    schedule: 'Gio\u2013Sab \u00B7 20:00\u20132:00',
    pay: '\u20AC8.5/h',
    matchScore: 71,
    requirements: ['Mixology base'],
    tags: ['Creativit\xE0', 'Notturno'],
    photos: ['Bancone', 'Cocktail area'],
  },
  {
    id: '5',
    code: 'HOTEL-BN-0055',
    type: 'Resort 5*',
    zone: 'Zona Mare',
    role: 'Barista',
    schedule: 'Tutti i giorni \u00B7 06:00\u201312:00',
    pay: '\u20AC8/h',
    matchScore: 68,
    requirements: ['Caffetteria', 'Colazioni'],
    tags: ['Mattina', 'Precisione'],
    photos: ['Pool bar', 'Terrazza'],
  },
];

// ---- Check-in ----
export const checkInShift = {
  code: 'RIST-BN-0012',
  role: 'Cameriere',
  time: '08:00 \u2014 16:00',
  date: 'Luned\xEC 12 Maggio 2026',
  checkInTime: '08:03',
  checkOutTime: '16:00',
  gpsDistance: 45,
  hourlyPay: 8.0,
  totalHours: 7.57,
  shiftPay: 64.0,
};

// ---- Rank ----
export interface RankLevelInfo {
  level: number;
  name: string;
  color: string;
  description: string;
  threshold: number;
  achieved: boolean;
  current: boolean;
}

export const rankLevels: RankLevelInfo[] = [
  { level: 1, name: 'Rookie', color: '#94A3B8', description: 'Appena entrato nel network', threshold: 0, achieved: true, current: false },
  { level: 2, name: 'Affidabile', color: '#5BB8F5', description: 'Storico regolare, nessun no-show', threshold: 500, achieved: true, current: false },
  { level: 3, name: 'Senior', color: '#3AA3E8', description: 'Profilo consolidato, turni premium', threshold: 1500, achieved: true, current: true },
  { level: 4, name: 'Elite', color: '#1EC99A', description: 'I migliori del network, maggiorazione paga', threshold: 3000, achieved: false, current: false },
  { level: 5, name: 'Ambassador', color: '#F5B800', description: 'Gestisce team, compenso extra', threshold: 5000, achieved: false, current: false },
];

export interface PointsEntry {
  id: string;
  icon: string;
  action: string;
  detail: string;
  points: number;
  date: string;
  runningTotal: number;
}

export const pointsHistory: PointsEntry[] = [
  { id: '1', icon: 'check-circle', action: 'Turno completato', detail: 'RIST-BN-0012', points: 10, date: '12 Mag', runningTotal: 1240 },
  { id: '2', icon: 'alert-triangle', action: 'Mancata risposta notifica', detail: 'RIST-BN-0047', points: -20, date: '10 Mag', runningTotal: 1230 },
  { id: '3', icon: 'star', action: 'Valutazione positiva struttura', detail: 'RIST-BN-0012', points: 3, date: '8 Mag', runningTotal: 1233 },
  { id: '4', icon: 'check-circle', action: 'Turno festivo completato', detail: 'HOTEL-BN-0018', points: 20, date: '1 Mag', runningTotal: 1253 },
  { id: '5', icon: 'clock', action: 'Risposta rapida < 2h', detail: 'Sistema ATS', points: 5, date: '28 Apr', runningTotal: 1258 },
  { id: '6', icon: 'graduation-cap', action: 'Corso HACCP completato', detail: 'Formazione ATS', points: 50, date: '15 Apr', runningTotal: 1308 },
];

export interface PayBreakdownItem {
  label: string;
  hours?: string;
  amount: number;
  color?: string;
}

export const payBreakdown: PayBreakdownItem[] = [
  { label: 'Ore ordinarie', hours: '32h', amount: 256.0, color: '#5BB8F5' },
  { label: 'Maggiorazione festivo', hours: '8h', amount: 64.0, color: '#F5B800' },
  { label: 'Maggiorazione notturna', hours: '4h', amount: 32.0, color: '#3AA3E8' },
  { label: 'Rimborso navetta', hours: '4 tratte', amount: 16.0, color: '#1EC99A' },
  { label: 'Rate corso HACCP', amount: -8.0, color: '#F04545' },
];

export const payHistory = [
  { month: 'Aprile 2026', hours: '28h', amount: 320.0, paid: true },
  { month: 'Marzo 2026', hours: '24h', amount: 276.0, paid: true },
  { month: 'Febbraio 2026', hours: '20h', amount: 230.0, paid: true },
];

export interface Course {
  id: string;
  name: string;
  validUntil?: string;
  status: 'completed' | 'in-progress' | 'available';
  progress?: number;
}

export const courses: Course[] = [
  { id: '1', name: 'HACCP', validUntil: '12/2026', status: 'completed' },
  { id: '2', name: 'Sicurezza sul lavoro', validUntil: '03/2027', status: 'completed' },
  { id: '3', name: 'Wine & Somm', status: 'in-progress', progress: 60 },
  { id: '4', name: 'Gestione conflitti', status: 'available' },
];
