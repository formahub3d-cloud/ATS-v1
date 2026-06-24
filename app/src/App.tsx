import { Routes, Route } from 'react-router-dom'
import { RoleProvider } from './context/RoleContext'
import { ToastProvider } from './components/ui/ToastSystem'
import RoleGuard from './components/RoleGuard'
import Layout from './components/Layout'
import Home from './pages/Home'
import Auth from './pages/Auth'
import NotFound from './pages/NotFound'
import AdminDashboard from './pages/AdminDashboard'
import AdminStructures from './pages/AdminStructures'
import AdminEmployees from './pages/AdminEmployees'
import AdminShifts from './pages/AdminShifts'
import AdminSettings from './pages/AdminSettings'
import StructurePortal from './pages/StructurePortal'
import StructureMatching from './pages/StructureMatching'
import StructureHistory from './pages/StructureHistory'
import EmployeeDashboard from './pages/EmployeeDashboard'
import EmployeeCalendar from './pages/EmployeeCalendar'
import EmployeeMatching from './pages/EmployeeMatching'
import EmployeeCheckin from './pages/EmployeeCheckin'
import EmployeeRank from './pages/EmployeeRank'

export default function App() {
  return (
    <RoleProvider>
      <ToastProvider>
        <Layout>
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
        </Layout>
      </ToastProvider>
    </RoleProvider>
  )
}
