import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { RoleProvider } from './context/RoleContext'
import { ToastProvider } from './components/ui/ToastSystem'
import RoleGuard from './components/RoleGuard'
import ErrorBoundary from './components/ErrorBoundary'
import ScrollToTop from './components/ScrollToTop'
import PageLoader from './components/PageLoader'
import Layout from './components/Layout'

// Code splitting: ogni rotta è un chunk separato, caricato on-demand.
const Home = lazy(() => import('./pages/Home'))
const Auth = lazy(() => import('./pages/Auth'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminStructures = lazy(() => import('./pages/AdminStructures'))
const AdminEmployees = lazy(() => import('./pages/AdminEmployees'))
const AdminShifts = lazy(() => import('./pages/AdminShifts'))
const AdminSettings = lazy(() => import('./pages/AdminSettings'))
const StructurePortal = lazy(() => import('./pages/StructurePortal'))
const StructureMatching = lazy(() => import('./pages/StructureMatching'))
const StructureHistory = lazy(() => import('./pages/StructureHistory'))
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard'))
const EmployeeCalendar = lazy(() => import('./pages/EmployeeCalendar'))
const EmployeeMatching = lazy(() => import('./pages/EmployeeMatching'))
const EmployeeCheckin = lazy(() => import('./pages/EmployeeCheckin'))
const EmployeeRank = lazy(() => import('./pages/EmployeeRank'))

export default function App() {
  return (
    <ErrorBoundary>
      <RoleProvider>
        <ToastProvider>
          <ScrollToTop />
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />

                {/* Area Admin */}
                <Route path="/admin" element={<RoleGuard allow="admin"><AdminDashboard /></RoleGuard>} />
                <Route path="/admin/structures" element={<RoleGuard allow="admin"><AdminStructures /></RoleGuard>} />
                <Route path="/admin/employees" element={<RoleGuard allow="admin"><AdminEmployees /></RoleGuard>} />
                <Route path="/admin/shifts" element={<RoleGuard allow="admin"><AdminShifts /></RoleGuard>} />
                <Route path="/admin/settings" element={<RoleGuard allow="admin"><AdminSettings /></RoleGuard>} />

                {/* Area Struttura */}
                <Route path="/structure" element={<RoleGuard allow="structure"><StructurePortal /></RoleGuard>} />
                <Route path="/structure/matching" element={<RoleGuard allow="structure"><StructureMatching /></RoleGuard>} />
                <Route path="/structure/history" element={<RoleGuard allow="structure"><StructureHistory /></RoleGuard>} />

                {/* Area Dipendente */}
                <Route path="/employee" element={<RoleGuard allow="employee"><EmployeeDashboard /></RoleGuard>} />
                <Route path="/employee/calendar" element={<RoleGuard allow="employee"><EmployeeCalendar /></RoleGuard>} />
                <Route path="/employee/matching" element={<RoleGuard allow="employee"><EmployeeMatching /></RoleGuard>} />
                <Route path="/employee/checkin" element={<RoleGuard allow="employee"><EmployeeCheckin /></RoleGuard>} />
                <Route path="/employee/rank" element={<RoleGuard allow="employee"><EmployeeRank /></RoleGuard>} />

                {/* Fallback 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </ToastProvider>
      </RoleProvider>
    </ErrorBoundary>
  )
}
