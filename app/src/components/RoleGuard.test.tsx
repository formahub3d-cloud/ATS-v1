import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import RoleGuard from './RoleGuard'
import { RoleProvider } from '@/context/RoleContext'

function renderAt(initialRole: string) {
  localStorage.setItem('ats_active_role', initialRole)
  return render(
    <RoleProvider>
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <RoleGuard allow="admin">
                <div>AREA ADMIN</div>
              </RoleGuard>
            }
          />
          <Route path="/employee" element={<div>HOME DIPENDENTE</div>} />
        </Routes>
      </MemoryRouter>
    </RoleProvider>
  )
}

describe('RoleGuard', () => {
  beforeEach(() => localStorage.clear())

  it('mostra il contenuto se il ruolo è autorizzato', () => {
    renderAt('admin')
    expect(screen.getByText('AREA ADMIN')).toBeInTheDocument()
  })

  it('reindirizza alla home del ruolo se non autorizzato', () => {
    renderAt('employee')
    expect(screen.queryByText('AREA ADMIN')).not.toBeInTheDocument()
    expect(screen.getByText('HOME DIPENDENTE')).toBeInTheDocument()
  })
})
