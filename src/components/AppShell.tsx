import { NavLink, Outlet } from 'react-router-dom'
import {
  ArchiveRestore,
  Boxes,
  LogOut,
  ReceiptText,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const navItems = [
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/sales', label: 'Sales', icon: ReceiptText },
  { to: '/products', label: 'Products', icon: Boxes },
  { to: '/admin', label: 'Admin', icon: ShieldCheck },
  { to: '/deleted-customers', label: 'Deleted Customers', icon: ArchiveRestore },
]

export function AppShell() {
  const { currentUser, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-[#f4f6f5] text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-emerald-800 text-sm font-bold text-white">
              HI
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                Hope, Inc.
              </p>
              <h1 className="text-lg font-semibold leading-tight sm:text-xl">
                Customer Management System
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-2 py-2">
            <div className="hidden text-right text-sm sm:block">
              <p className="font-medium leading-tight">
                {currentUser?.username || currentUser?.email || 'CMS User'}
              </p>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">
                {currentUser?.user_type || 'USER'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut aria-hidden="true" size={17} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[248px_1fr] lg:px-8">
        <aside className="h-max rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-3 hidden border-b border-slate-200 px-2 pb-3 lg:block">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Modules
            </p>
          </div>
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100',
                  ].join(' ')
                }
              >
                <Icon aria-hidden="true" size={17} />
                {item.label}
              </NavLink>
              )
            })}
          </nav>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
