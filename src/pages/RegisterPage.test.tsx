import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RegisterPage } from './RegisterPage'

const authMocks = vi.hoisted(() => ({
  signUp: vi.fn(),
  signInWithGoogle: vi.fn(),
}))

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    signUp: authMocks.signUp,
    signInWithGoogle: authMocks.signInWithGoogle,
  }),
}))

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders required registration fields and Google option', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /register with google/i })).toBeInTheDocument()
  })

  it('submits email registration metadata', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText(/first name/i), 'Hope')
    await user.type(screen.getByLabelText(/last name/i), 'Staff')
    await user.type(screen.getByLabelText(/username/i), 'hopestaff')
    await user.type(screen.getByLabelText(/email/i), 'staff@hope.test')
    await user.type(screen.getByLabelText(/password/i), 'secret123')
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(authMocks.signUp).toHaveBeenCalledWith('staff@hope.test', 'secret123', {
      first_name: 'Hope',
      last_name: 'Staff',
      username: 'hopestaff',
    })
  })

  it('starts Google registration flow', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /register with google/i }))

    expect(authMocks.signInWithGoogle).toHaveBeenCalledTimes(1)
  })
})
