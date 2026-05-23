import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RoleProvider } from './context/RoleContext'
import { ToastProvider } from './components/ui/ToastSystem'
import Layout from './components/Layout'
import Home from './pages/Home'
import Auth from './pages/Auth'
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
import StructuresLive from './pages/admin/StructuresLive'

export default function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <ToastProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/structures" element={<AdminStructures />} />
              <Route path="/admin/structures-live" element={<StructuresLive />} />
              <Route path="/admin/employees" element={<AdminEmployees />} />
              <Route path="/admin/shifts" element={<AdminShifts />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/structure" element={<StructurePortal />} />
              <Route path="/structure/matching" element={<StructureMatching />} />
              <Route path="/structure/history" element={<StructureHistory />} />
              <Route path="/employee" element={<EmployeeDashboard />} />
              <Route path="/employee/calendar" element={<EmployeeCalendar />} />
              <Route path="/employee/matching" element={<EmployeeMatching />} />
              <Route path="/employee/checkin" element={<EmployeeCheckin />} />
              <Route path="/employee/rank" element={<EmployeeRank />} />
            </Routes>
          </Layout>
        </ToastProvider>
      </RoleProvider>
    </AuthProvider>
  )
}
