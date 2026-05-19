import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useRights } from "../hooks/useRights";
import { useHeartbeat } from "../hooks/useHeartbeat";

const navLinks = [
  { to: "/customers", label: "Customers" },
  { to: "/sales", label: "Sales" },
  { to: "/products", label: "Products" },
  { to: "/reports/customer-summary", label: "Customer Summary", right: "PRICE_VIEW" },
  { to: "/reports/top-customers", label: "Top Customers", right: "PRICE_VIEW" },
  { to: "/reports/product-revenue", label: "Product Revenue", right: "PRICE_VIEW" },
  { to: "/admin", label: "Admin" },
  { to: "/deleted-customers", label: "Deleted Customers" },
];

export function AppShell() {
  const { currentUser, signOut } = useAuth();
  const { hasRight, userType } = useRights();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  useHeartbeat();
  const isAdminUser = userType === "ADMIN" || userType === "SUPERADMIN";
  const visibleNavLinks = navLinks.filter((link) => {
    if (link.to === "/customers") return isAdminUser || hasRight("CUST_VIEW");
    if (link.to === "/sales") return isAdminUser || hasRight("SALES_VIEW");
    if (link.to === "/products") return isAdminUser || hasRight("PROD_VIEW");
    if (link.right) return isAdminUser || hasRight(link.right);
    if (link.to === "/admin") return isAdminUser || hasRight("ADM_USER");
    if (link.to === "/deleted-customers") return isAdminUser;
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
            {visibleNavLinks.length === 0 ? (
              <p className="rounded-2xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
                No pages available. Contact your administrator.
              </p>
            ) : visibleNavLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsSidebarOpen(false)}
                className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  location.pathname === link.to || location.pathname.startsWith(link.to + "/")
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
          {visibleNavLinks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="rounded-full bg-amber-100 p-5">
                <svg className="h-10 w-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h2 className="mt-6 text-xl font-semibold text-slate-900">No permissions assigned</h2>
              <p className="mt-2 max-w-sm text-sm text-slate-500">
                Your account doesn't have access to any pages yet. Please wait for your administrator to grant you the necessary permissions, or reach out to them directly.
              </p>
              <p className="mt-6 rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                Signed in as {currentUser?.email}
              </p>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
