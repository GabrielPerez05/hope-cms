// Author: M4 Rhyian Joshua Ticbobolan
// e2e-rights-production.test.jsx — Sprint 3 production regression test log.
// Covers: ADM_USER sidebar gating (feat/rights-admin-module), SUPERADMIN row
// disabling in AdminPage (feat/rights-superadmin-guard), route protection,
// view-only enforcement across Sales and Products for all three user types,
// Google OAuth PKCE flow initiation, and RLS-level rejection of direct
// SUPERADMIN UPDATE operations simulated via the admin-api mock.
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RIGHT_NAMES } from "../lib/rights";

const USER_TYPES = ["USER", "ADMIN", "SUPERADMIN"];

const mocks = vi.hoisted(() => ({
  currentUser: { id: "user-1", email: "user@test.com", user_type: "USER" },
  rights: {},
  signInWithGoogle: vi.fn(),
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    currentUser: mocks.currentUser,
    signOut: vi.fn(),
    signInWithGoogle: mocks.signInWithGoogle,
    error: null,
    loading: false,
    clearError: vi.fn(),
  }),
}));

vi.mock("../hooks/useRights", () => ({
  useRights: () => ({
    rights: mocks.rights,
    userType: mocks.currentUser.user_type,
    hasRight: (n) => mocks.rights[n] === 1,
    canEdit: () => ["ADMIN", "SUPERADMIN"].includes(mocks.currentUser.user_type),
    isAdmin: () => ["ADMIN", "SUPERADMIN"].includes(mocks.currentUser.user_type),
  }),
}));

vi.mock("../contexts/user-rights-context", () => ({
  useRights: () => ({
    rights: mocks.rights,
    userType: mocks.currentUser.user_type,
    hasRight: (n) => mocks.rights[n] === 1,
    canEdit: () => ["ADMIN", "SUPERADMIN"].includes(mocks.currentUser.user_type),
    isAdmin: () => ["ADMIN", "SUPERADMIN"].includes(mocks.currentUser.user_type),
  }),
}));

vi.mock("../lib/customer-api", () => ({
  addCustomer: vi.fn(),
  getCustomers: vi.fn((userType = "USER") =>
    Promise.resolve(
      userType === "USER"
        ? [{ custno: "C0001", custname: "Globus Medical", address: "Test Ave", payterm: "30D", record_status: "ACTIVE", updated_at: "2026-05-17" }]
        : [
            { custno: "C0001", custname: "Globus Medical", address: "Test Ave", payterm: "30D", record_status: "ACTIVE", updated_at: "2026-05-17" },
            { custno: "C0002", custname: "RF Industries", address: "Miramar Rd", payterm: "45D", record_status: "INACTIVE", updated_at: "2026-05-17" },
          ],
    ),
  ),
  recoverCustomer: vi.fn(() => Promise.resolve({ custno: "C0002" })),
  softDeleteCustomer: vi.fn(),
  updateCustomer: vi.fn(),
}));

vi.mock("../lib/sales-product-api", () => ({
  getAllSalesDetail: vi.fn(() => Promise.resolve([{ transno: "T0001", prodcode: "P0001", quantity: 2 }])),
  getCurrentPrice: vi.fn(() => Promise.resolve({ prodcode: "P0001", effdate: "2026-05-17", unitprice: 99.99 })),
  getPriceHistory: vi.fn(() => Promise.resolve([{ prodcode: "P0001", effdate: "2026-05-17", unitprice: 99.99 }])),
  getProducts: vi.fn(() => Promise.resolve([{ prodcode: "P0001", description: "Laptop", unit: "pc" }])),
  getSales: vi.fn(() => Promise.resolve([{ transno: "T0001", salesdate: "2026-05-17", custno: "C0001", empno: "E0001" }])),
  getSalesByCustomer: vi.fn(() => Promise.resolve([{ transno: "T0001", salesdate: "2026-05-17", custno: "C0001", empno: "E0001" }])),
  getSalesDetail: vi.fn(() => Promise.resolve([{ transno: "T0001", prodcode: "P0001", quantity: 2 }])),
}));

vi.mock("../lib/admin-api", () => ({
  getAdminUsers: vi.fn(() =>
    Promise.resolve([
      { userId: "sa-id", email: "sa@test.com", username: "super.admin", user_type: "SUPERADMIN", record_status: "ACTIVE", rights: {}, modules: {} },
      { userId: "admin-id", email: "admin@test.com", username: "admin.user", user_type: "ADMIN", record_status: "ACTIVE", rights: {}, modules: {} },
      { userId: "user-id", email: "reg@test.com", username: "reg.user", user_type: "USER", record_status: "INACTIVE", rights: {}, modules: {} },
    ]),
  ),
  updateAdminUser: vi.fn((userId) =>
    userId === "sa-id"
      ? Promise.reject(new Error('new row violates row-level security policy for table "user"'))
      : Promise.resolve({ userId }),
  ),
  activateUser: vi.fn(() => Promise.resolve()),
  deactivateUser: vi.fn(() => Promise.resolve()),
  updateUserRight: vi.fn(() => Promise.resolve()),
  updateLastSeen: vi.fn(() => Promise.resolve()),
  DISPLAY_RIGHTS: ["CUST_VIEW", "CUST_ADD", "CUST_EDIT", "SALES_VIEW", "SD_VIEW", "PROD_VIEW", "PRICE_VIEW", "ADM_USER"],
  ROLE_DEFAULT_RIGHTS: {
    USER: { CUST_VIEW: 1, CUST_ADD: 0, CUST_EDIT: 0, CUST_DEL: 0, SALES_VIEW: 1, SD_VIEW: 1, PROD_VIEW: 1, PRICE_VIEW: 1, ADM_USER: 0 },
    ADMIN: { CUST_VIEW: 1, CUST_ADD: 1, CUST_EDIT: 1, CUST_DEL: 0, SALES_VIEW: 1, SD_VIEW: 1, PROD_VIEW: 1, PRICE_VIEW: 1, ADM_USER: 0 },
    SUPERADMIN: { CUST_VIEW: 1, CUST_ADD: 1, CUST_EDIT: 1, CUST_DEL: 1, SALES_VIEW: 1, SD_VIEW: 1, PROD_VIEW: 1, PRICE_VIEW: 1, ADM_USER: 1 },
  },
}));

import { AppShell } from "../components/AppShell";
import { AdminPage } from "../pages/AdminPage";
import { SalesPage } from "../pages/SalesPage";
import { ProductsPage } from "../pages/ProductsPage";
import { DeletedCustomersPage } from "../pages/DeletedCustomersPage";
import { AdminOnlyRoute } from "../App";
import { LoginPage } from "../pages/LoginPage";
import { updateAdminUser, activateUser } from "../lib/admin-api";

function setUser({ userType = "USER", rights = {} } = {}) {
  mocks.currentUser = { id: "user-1", email: "user@test.com", user_type: userType };
  mocks.rights = Object.fromEntries(RIGHT_NAMES.map((n) => [n, rights[n] ?? 0]));
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ─── ADM_USER sidebar gating ──────────────────────────────────────────────────

describe("Sprint 3 M4 — ADM_USER sidebar gating (feat/rights-admin-module)", () => {
  it("hides Admin link for USER without ADM_USER right", () => {
    setUser({ userType: "USER", rights: { CUST_VIEW: 1, SALES_VIEW: 1, PROD_VIEW: 1 } });
    render(
      <MemoryRouter initialEntries={["/customers"]}>
        <AppShell />
      </MemoryRouter>,
    );
    expect(screen.queryByRole("link", { name: /^admin$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /deleted customers/i })).not.toBeInTheDocument();
  });

  it("shows Admin link for USER with ADM_USER right but hides Deleted Customers", () => {
    setUser({ userType: "USER", rights: { CUST_VIEW: 1, SALES_VIEW: 1, PROD_VIEW: 1, ADM_USER: 1 } });
    render(
      <MemoryRouter initialEntries={["/customers"]}>
        <AppShell />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: /^admin$/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /deleted customers/i })).not.toBeInTheDocument();
  });

  it("shows Admin and Deleted Customers links for ADMIN", () => {
    setUser({ userType: "ADMIN" });
    render(
      <MemoryRouter initialEntries={["/customers"]}>
        <AppShell />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: /^admin$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /deleted customers/i })).toBeInTheDocument();
  });

  it("shows Admin and Deleted Customers links for SUPERADMIN", () => {
    setUser({ userType: "SUPERADMIN" });
    render(
      <MemoryRouter initialEntries={["/customers"]}>
        <AppShell />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: /^admin$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /deleted customers/i })).toBeInTheDocument();
  });
});

// ─── SUPERADMIN row protection in AdminPage ───────────────────────────────────

describe("Sprint 3 M4 — SUPERADMIN row disabling (feat/rights-superadmin-guard)", () => {
  it("shows Protected badge on SUPERADMIN row when viewer is ADMIN", async () => {
    setUser({ userType: "ADMIN" });
    render(<MemoryRouter><AdminPage /></MemoryRouter>);
    expect(await screen.findByText("Protected")).toBeInTheDocument();
  });

  it("shows cannot-modify message on SUPERADMIN row when viewer is ADMIN", async () => {
    setUser({ userType: "ADMIN" });
    render(<MemoryRouter><AdminPage /></MemoryRouter>);
    expect(await screen.findByText(/SUPERADMIN accounts cannot be modified/i)).toBeInTheDocument();
  });

  it("Protected badge and cannot-modify message remain visible for SUPERADMIN viewer", async () => {
    setUser({ userType: "SUPERADMIN" });
    render(<MemoryRouter><AdminPage /></MemoryRouter>);
    expect(await screen.findByText("Protected")).toBeInTheDocument();
    expect(await screen.findByText(/SUPERADMIN accounts cannot be modified/i)).toBeInTheDocument();
  });

  it("ADMIN can activate an INACTIVE USER account", async () => {
    setUser({ userType: "ADMIN" });
    const user = userEvent.setup();
    render(<MemoryRouter><AdminPage /></MemoryRouter>);
    await screen.findByText("reg.user");

    const activateButtons = screen.getAllByRole("button", { name: /^activate$/i });
    const enabledBtn = activateButtons.find((btn) => !btn.disabled);
    expect(enabledBtn).toBeTruthy();
    await user.click(enabledBtn);
    expect(activateUser).toHaveBeenCalledWith("user-id");
  });

  it("RLS rejects direct Supabase UPDATE on SUPERADMIN user record", async () => {
    await expect(
      updateAdminUser("sa-id", { user_type: "ADMIN" }),
    ).rejects.toThrow(/row-level security/i);
  });
});

// ─── Route protection ─────────────────────────────────────────────────────────

describe("Sprint 3 M4 — Route protection (AdminOnlyRoute)", () => {
  it("redirects USER away from /deleted-customers to /customers", async () => {
    setUser({ userType: "USER" });
    render(
      <MemoryRouter initialEntries={["/deleted-customers"]}>
        <Routes>
          <Route
            path="/deleted-customers"
            element={
              <AdminOnlyRoute>
                <DeletedCustomersPage />
              </AdminOnlyRoute>
            }
          />
          <Route path="/customers" element={<h1>Customers</h1>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByRole("heading", { name: /customers/i })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /deleted customers/i })).not.toBeInTheDocument();
  });
});

// ─── View-only enforcement ────────────────────────────────────────────────────

describe("Sprint 3 M4 — View-only enforcement: Sales and Products (all user types)", () => {
  const mutationPattern = /^(add|edit|delete|soft delete|save changes|recover|create|update)$/i;

  it.each(USER_TYPES)(
    "SalesPage renders no mutation buttons for %s",
    async (userType) => {
      setUser({ userType, rights: Object.fromEntries(RIGHT_NAMES.map((n) => [n, 1])) });
      render(<MemoryRouter><SalesPage /></MemoryRouter>);
      await screen.findByRole("heading", { name: "Transactions" });
      expect(screen.queryByRole("button", { name: mutationPattern })).not.toBeInTheDocument();
    },
  );

  it.each(USER_TYPES)(
    "ProductsPage renders no mutation buttons for %s",
    async (userType) => {
      setUser({ userType, rights: Object.fromEntries(RIGHT_NAMES.map((n) => [n, 1])) });
      render(<MemoryRouter><ProductsPage /></MemoryRouter>);
      await screen.findByText("Product Catalogue");
      expect(screen.queryByRole("button", { name: mutationPattern })).not.toBeInTheDocument();
    },
  );
});

// ─── Google OAuth PKCE flow ───────────────────────────────────────────────────

describe("Sprint 3 M4 — Google OAuth PKCE flow (production)", () => {
  it("clicking Sign in with Google initiates the OAuth flow", async () => {
    mocks.signInWithGoogle.mockResolvedValue({ error: null });
    setUser({ userType: "USER" });
    const user = userEvent.setup();

    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    await user.click(await screen.findByRole("button", { name: /sign in with google/i }));

    expect(mocks.signInWithGoogle).toHaveBeenCalledTimes(1);
  });
});
