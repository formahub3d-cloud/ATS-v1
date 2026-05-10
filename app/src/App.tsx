import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RoleProvider } from './context/RoleContext'
import { ToastProvider } from './components/ui/ToastSystem'
import Layout from './components/Layout'
import Home from './pages/Home'
import Auth from './pages/Auth'
import PWAUpdatePrompt from './components/PWAUpdatePrompt'
import CommandPalette from './components/admin/CommandPalette'
import { useNotificationsToast } from './hooks/useNotificationsToast'

// Le landing dedicate + pagine "completamento landing" sono lazy: il
// visitatore della homepage non ha bisogno di scaricarle subito.
const LandingStructures = lazy(() => import('./pages/LandingStructures'))
const LandingWorkers    = lazy(() => import('./pages/LandingWorkers'))
const About             = lazy(() => import('./pages/About'))
const FAQ               = lazy(() => import('./pages/FAQ'))
const Contacts          = lazy(() => import('./pages/Contacts'))
const Privacy           = lazy(() => import('./pages/legal/Privacy'))
const Terms             = lazy(() => import('./pages/legal/Terms'))
const Cookie            = lazy(() => import('./pages/legal/Cookie'))
const NotFound          = lazy(() => import('./pages/NotFound'))

// Lazy load di tutte le pagine "interne" (post-auth) per ridurre il bundle
// iniziale. Home + Auth restano eager perché sono i primi entry point.
const AdminDashboard   = lazy(() => import('./pages/AdminDashboard'))
const AdminStructures  = lazy(() => import('./pages/AdminStructures'))
const AdminEmployees   = lazy(() => import('./pages/AdminEmployees'))
const AdminShifts      = lazy(() => import('./pages/AdminShifts'))
const AdminCalendar    = lazy(() => import('./pages/AdminCalendar'))
const AdminChat        = lazy(() => import('./pages/AdminChat'))
const AdminMessages    = lazy(() => import('./pages/AdminMessages'))
const AdminPayroll     = lazy(() => import('./pages/AdminPayroll'))
const AdminInvoices    = lazy(() => import('./pages/AdminInvoices'))
const AdminLeaderboard = lazy(() => import('./pages/AdminLeaderboard'))
const AdminAudit       = lazy(() => import('./pages/AdminAudit'))
const AdminSettings    = lazy(() => import('./pages/AdminSettings'))
const StructurePortal  = lazy(() => import('./pages/StructurePortal'))
const StructureMatching = lazy(() => import('./pages/StructureMatching'))
const StructureHistory = lazy(() => import('./pages/StructureHistory'))
const StructureChat    = lazy(() => import('./pages/StructureChat'))
const EmployeeDashboard = lazy(() => import('./pages/EmployeeDashboard'))
const EmployeeCalendar = lazy(() => import('./pages/EmployeeCalendar'))
const EmployeeMatching = lazy(() => import('./pages/EmployeeMatching'))
const EmployeeCheckin  = lazy(() => import('./pages/EmployeeCheckin'))
const EmployeeChat     = lazy(() => import('./pages/EmployeeChat'))
const EmployeeDocuments = lazy(() => import('./pages/EmployeeDocuments'))
const EmployeeRank     = lazy(() => import('./pages/EmployeeRank'))

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-sky-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

// Hook che subscribe a notifications/INSERT e dispara toast — deve vivere
// dentro ToastProvider per accedere a useToast(). Wrapper minimo dedicato.
function GlobalRealtimeListeners() {
  useNotificationsToast()
  return null
}

export default function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <ToastProvider>
          <Layout>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/strutture" element={<LandingStructures />} />
                <Route path="/lavoratori" element={<LandingWorkers />} />
                <Route path="/chi-siamo" element={<About />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contatti" element={<Contacts />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/termini" element={<Terms />} />
                <Route path="/cookie" element={<Cookie />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/structures" element={<AdminStructures />} />
                <Route path="/admin/employees" element={<AdminEmployees />} />
                <Route path="/admin/shifts" element={<AdminShifts />} />
                <Route path="/admin/calendar" element={<AdminCalendar />} />
                <Route path="/admin/chat" element={<AdminChat />} />
                <Route path="/admin/messages" element={<AdminMessages />} />
                <Route path="/admin/payroll" element={<AdminPayroll />} />
                <Route path="/admin/invoices" element={<AdminInvoices />} />
                <Route path="/admin/leaderboard" element={<AdminLeaderboard />} />
                <Route path="/admin/audit" element={<AdminAudit />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/structure" element={<StructurePortal />} />
                <Route path="/structure/matching" element={<StructureMatching />} />
                <Route path="/structure/history" element={<StructureHistory />} />
                <Route path="/structure/chat" element={<StructureChat />} />
                <Route path="/employee" element={<EmployeeDashboard />} />
                <Route path="/employee/calendar" element={<EmployeeCalendar />} />
                <Route path="/employee/matching" element={<EmployeeMatching />} />
                <Route path="/employee/checkin" element={<EmployeeCheckin />} />
                <Route path="/employee/chat" element={<EmployeeChat />} />
                <Route path="/employee/documents" element={<EmployeeDocuments />} />
                <Route path="/employee/rank" element={<EmployeeRank />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
          <CommandPalette />
          <PWAUpdatePrompt />
          <GlobalRealtimeListeners />
        </ToastProvider>
      </RoleProvider>
    </AuthProvider>
  )
}
