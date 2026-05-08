import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/customers" replace />} />
          <Route
            path="/customers"
            element={
              <PlaceholderPage
                title="Customers"
                description="Customer list, add, edit, soft removal, recovery, and sales history begin here in Sprint 2."
              />
            }
          />
          <Route
            path="/sales"
            element={
              <PlaceholderPage
                title="Sales"
                description="Read-only transaction history and sales detail drill-down are wired in Sprint 2."
              />
            }
          />
          <Route
            path="/products"
            element={
              <PlaceholderPage
                title="Products"
                description="Read-only catalogue and current price views are wired in Sprint 2."
              />
            }
          />
          <Route
            path="/admin"
            element={
              <PlaceholderPage
                title="Admin"
                description="Account activation and SUPERADMIN protection are delivered in Sprint 3."
              />
            }
          />
          <Route
            path="/deleted-customers"
            element={
              <PlaceholderPage
                title="Deleted Customers"
                description="ADMIN and SUPERADMIN recovery panel is implemented in Sprint 2."
              />
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App
