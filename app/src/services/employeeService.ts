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
import { simulate } from './simulate'

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
