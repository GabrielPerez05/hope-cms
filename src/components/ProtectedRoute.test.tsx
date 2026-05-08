import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProtectedRoute } from './ProtectedRoute'

const authState = vi.hoisted(() => ({
  currentUser: null as unknown,
  loading: false,
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => authState,
}))

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={['/customers']}>
      <Routes>
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <p>Protected CMS</p>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<p>Login Screen</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    authState.currentUser = null
    authState.loading = false
  })

  it('blocks unauthenticated or inactive-guarded users', () => {
    renderProtectedRoute()

    expect(screen.getByText(/login screen/i)).toBeInTheDocument()
  })

  it('allows active authenticated users', () => {
    authState.currentUser = {
      id: 'user1',
      email: 'jcesperanza@neu.edu.ph',
      record_status: 'ACTIVE',
      user_type: 'SUPERADMIN',
    }

    renderProtectedRoute()

    expect(screen.getByText(/protected cms/i)).toBeInTheDocument()
  })
})
