import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navLinks = [
  { to: "/customers", label: "Customers" },
  { to: "/sales", label: "Sales" },
  { to: "/products", label: "Products" },
  { to: "/admin", label: "Admin" },
  { to: "/deleted-customers", label: "Deleted Customers" },
];

export function AppShell() {
  const { currentUser, signOut } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b bg-white/90 px-4 py-4 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold">Hope CMS</p>
            <p className="text-sm text-slate-500">
              Sales and customer management console
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-700">
            <span>
              {currentUser?.username || currentUser?.email || "Signed in"}
            </span>
            <button
              onClick={signOut}
              className="rounded-md bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
        <nav className="w-64 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            CMS navigation
          </p>
          <div className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                  location.pathname === link.to
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>

        <main className="flex-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
