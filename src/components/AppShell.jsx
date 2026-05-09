import { useState } from "react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

          <div className="flex items-center gap-3 text-sm text-slate-700 lg:hidden">
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm transition hover:border-slate-300"
            >
              Menu
            </button>
          </div>

          <div className="hidden items-center gap-3 text-sm text-slate-700 lg:flex">
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
        <aside
          className={`fixed inset-x-0 top-20 z-20 transition-all duration-300 lg:static lg:translate-x-0 ${
            isSidebarOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="lg:sticky lg:top-24 lg:w-64 lg:rounded-3xl lg:border lg:border-slate-200 lg:bg-white lg:p-4 lg:shadow-sm">
            <div className="flex items-center justify-between bg-white p-4 shadow-sm lg:bg-transparent lg:p-0">
              <p className="mb-0 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                CMS navigation
              </p>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-200 lg:hidden"
              >
                Close
              </button>
            </div>
            <div className="space-y-2 p-4 lg:p-0">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsSidebarOpen(false)}
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
            <div className="mt-6 hidden rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 lg:block">
              <p className="font-semibold">Signed in as</p>
              <p className="mt-1 truncate text-slate-600">
                {currentUser?.username || currentUser?.email || "Unknown user"}
              </p>
            </div>
            <div className="mt-4 hidden lg:block">
              <button
                onClick={signOut}
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:ml-72">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Workspace</p>
              <h1 className="text-2xl font-semibold text-slate-900">Content management</h1>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                {currentUser?.user_type || "USER"}
              </span>
              <span className="text-sm text-slate-500">
                {currentUser?.email}
              </span>
            </div>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
