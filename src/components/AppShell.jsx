import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useRights } from "../hooks/useRights";

const navLinks = [
  { to: "/customers", label: "Customers" },
  { to: "/sales", label: "Sales" },
  { to: "/products", label: "Products" },
  { to: "/admin", label: "Admin" },
  { to: "/deleted-customers", label: "Deleted Customers" },
];

export function AppShell() {
  const { currentUser, signOut } = useAuth();
  const { hasRight, userType } = useRights();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isAdminUser = userType === "ADMIN" || userType === "SUPERADMIN";
  const visibleNavLinks = navLinks.filter((link) => {
    if (link.to === "/admin") {
      return isAdminUser || hasRight("ADM_USER");
    }

    if (link.to === "/deleted-customers") {
      return isAdminUser;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-white to-emerald-50 text-slate-900">
      <div className="border-b border-emerald-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">Hope CMS</p>
            <p className="text-sm text-emerald-600">
              A polished emerald workspace for customer and sales management.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
            <span className="rounded-full bg-emerald-100 px-3 py-2 font-medium text-emerald-800">
              {currentUser?.username || currentUser?.email || "Signed in"}
            </span>
            <button
              onClick={signOut}
              className="rounded-2xl bg-emerald-700 px-3 py-2 text-white transition hover:bg-emerald-800"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <aside className="w-full rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-sm lg:w-80">
          <div className="flex items-center justify-between gap-4 p-4 lg:block">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Navigation
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Jump between sales, customers, and product workflows.
              </p>
            </div>
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 lg:hidden"
            >
              Menu
            </button>
          </div>

          <div
            className={`${isSidebarOpen ? "block" : "hidden"} space-y-2 px-4 lg:block lg:px-0`}
          >
            {visibleNavLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsSidebarOpen(false)}
                className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  location.pathname === link.to
                    ? "bg-emerald-700 text-white"
                    : "text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
            <p className="font-semibold">Signed in as</p>
            <p className="mt-1 truncate text-sm">{currentUser?.email}</p>
          </div>

        </aside>

        <main className="flex-1 rounded-[2rem] border border-emerald-100 bg-white p-6 shadow-sm lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
