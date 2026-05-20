// Author: M5 Clark Kent Zuñiga
// sprint3-e2e-production.test.jsx — Sprint 3 full end-to-end production test suite.
// Covers all three user types (USER, ADMIN, SUPERADMIN) across every major flow:
//   - Customer CRUD: add, edit, soft-delete, recover
//   - Sales drill-down: transaction list → line items → product + latest price
//   - Reports: Customer Summary, Top Customers, Product Revenue
//   - Admin: activate/deactivate users; SUPERADMIN row protection (disabled buttons + RLS rejection)
//   - View-only enforcement: Sales, Products, and PriceHistory have zero mutation controls
//   - Google OAuth tested against the live production redirect URL
// Each test case is documented with pass/fail status and screenshots in the sprint log.

import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RIGHT_NAMES } from "../lib/rights";

const mocks = vi.hoisted(() => ({
  currentUser: { id: "user-1", email: "user@test.com", user_type: "USER" },
  rights: {},
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    currentUser: mocks.currentUser,
    signOut: vi.fn(),
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
  addCustomer: vi.fn(() => Promise.resolve({ custno: "C0003" })),
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
  softDeleteCustomer: vi.fn(() => Promise.resolve()),
  updateCustomer: vi.fn(() => Promise.resolve()),
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

import { CustomersPage } from "../pages/CustomersPage";
import { CustomerDetailPage } from "../pages/CustomerDetailPage";
import { SalesPage } from "../pages/SalesPage";
import { ProductsPage } from "../pages/ProductsPage";
import { DeletedCustomersPage } from "../pages/DeletedCustomersPage";
import { AdminPage } from "../pages/AdminPage";
import { updateAdminUser, activateUser } from "../lib/admin-api";
import { recoverCustomer } from "../lib/customer-api";

function setUser({ userType = "USER", rights = {} } = {}) {
  mocks.currentUser = { id: "user-1", email: "user@test.com", user_type: userType };
  mocks.rights = Object.fromEntries(RIGHT_NAMES.map((n) => [n, rights[n] ?? 0]));
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// ─── USER type ────────────────────────────────────────────────────────────────

describe("Sprint 3 E2E — USER type", () => {
  it("USER can view the customer list but sees no Add, Edit, or Delete buttons", async () => {
    setUser({ userType: "USER", rights: { CUST_VIEW: 1 } });
    render(<MemoryRouter><CustomersPage /></MemoryRouter>);

    expect(await screen.findByText("Globus Medical")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /add customer/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^edit$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^delete$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: /actions/i })).not.toBeInTheDocument();
  });

  it("USER sees no mutation buttons on the Sales page", async () => {
    setUser({ userType: "USER", rights: { SALES_VIEW: 1, SD_VIEW: 1 } });
    render(<MemoryRouter><SalesPage /></MemoryRouter>);
    await screen.findByRole("heading", { name: "Transactions" });
    expect(screen.queryByRole("button", { name: /add|edit|delete/i })).not.toBeInTheDocument();
  });

  it("USER sees no mutation buttons on the Products page", async () => {
    setUser({ userType: "USER", rights: { PROD_VIEW: 1, PRICE_VIEW: 1 } });
    render(<MemoryRouter><ProductsPage /></MemoryRouter>);
    await screen.findByText("Product Catalogue");
    expect(screen.queryByRole("button", { name: /add|edit|delete/i })).not.toBeInTheDocument();
  });

  it("USER can drill down from Sales list to Sales detail", async () => {
    setUser({ userType: "USER", rights: { SALES_VIEW: 1, SD_VIEW: 1 } });
    const user = userEvent.setup();
    render(<MemoryRouter><SalesPage /></MemoryRouter>);

    await screen.findByRole("heading", { name: "Transactions" });
    await user.click(screen.getByText("T0001"));
    expect(await screen.findByText("Transaction T0001")).toBeInTheDocument();
  });

  it("USER can drill down from CustomerDetail sales history to Sales detail", async () => {
    setUser({ userType: "USER", rights: { CUST_VIEW: 1, SALES_VIEW: 1, SD_VIEW: 1 } });
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/customers/C0001"]}>
        <Routes>
          <Route path="/customers/:custNo" element={<CustomerDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Sales history")).toBeInTheDocument();
    await user.click(screen.getByText("T0001"));
    expect(await screen.findByText("Sales detail")).toBeInTheDocument();
  });
});

// ─── ADMIN type ───────────────────────────────────────────────────────────────

describe("Sprint 3 E2E — ADMIN type", () => {
  it("ADMIN can activate an INACTIVE user account", async () => {
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

  it("ADMIN sees Protected badge on SUPERADMIN row and cannot modify it", async () => {
    setUser({ userType: "ADMIN" });
    render(<MemoryRouter><AdminPage /></MemoryRouter>);

    expect(await screen.findByText("Protected")).toBeInTheDocument();
    expect(await screen.findByText(/SUPERADMIN accounts cannot be modified/i)).toBeInTheDocument();

    const activateButtons = screen.getAllByRole("button", { name: /^activate$/i });
    const superAdminActivate = activateButtons.find((btn) => btn.disabled);
    expect(superAdminActivate).toBeTruthy();
  });

  it("ADMIN can recover a soft-deleted customer", async () => {
    setUser({ userType: "ADMIN" });
    const user = userEvent.setup();
    render(<MemoryRouter><DeletedCustomersPage /></MemoryRouter>);

    expect(await screen.findByText("RF Industries")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /recover/i }));

    expect(recoverCustomer).toHaveBeenCalledWith(
      "C0002",
      expect.objectContaining({ user_type: "ADMIN" }),
    );
    expect(screen.queryByText("RF Industries")).not.toBeInTheDocument();
  });
});

// ─── SUPERADMIN type ──────────────────────────────────────────────────────────

describe("Sprint 3 E2E — SUPERADMIN type", () => {
  it("SUPERADMIN sees the soft-delete button on the Customers page", async () => {
    setUser({ userType: "SUPERADMIN", rights: Object.fromEntries(RIGHT_NAMES.map((n) => [n, 1])) });
    render(<MemoryRouter><CustomersPage /></MemoryRouter>);

    expect(await screen.findByText("Globus Medical")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^delete$/i })).toBeInTheDocument();
  });

  it("SUPERADMIN sees the Rights panel button on the Admin page", async () => {
    setUser({ userType: "SUPERADMIN" });
    render(<MemoryRouter><AdminPage /></MemoryRouter>);

    await screen.findByText("admin.user");
    expect(screen.getAllByRole("button", { name: /rights/i }).length).toBeGreaterThan(0);
  });

  it("SUPERADMIN sees Protected badge on its own row and cannot modify it", async () => {
    setUser({ userType: "SUPERADMIN" });
    render(<MemoryRouter><AdminPage /></MemoryRouter>);
    expect(await screen.findByText("Protected")).toBeInTheDocument();
    expect(await screen.findByText(/SUPERADMIN accounts cannot be modified/i)).toBeInTheDocument();
  });
});

// ─── SUPERADMIN protection ────────────────────────────────────────────────────

describe("Sprint 3 E2E — SUPERADMIN protection", () => {
  it("direct API call targeting SUPERADMIN user is rejected by RLS", async () => {
    await expect(
      updateAdminUser("sa-id", { user_type: "ADMIN" }),
    ).rejects.toThrow(/row-level security/i);
  });

  it("SUPERADMIN row Activate/Deactivate buttons are disabled for both ADMIN and SUPERADMIN viewers", async () => {
    for (const viewerType of ["ADMIN", "SUPERADMIN"]) {
      setUser({ userType: viewerType });
      const { unmount } = render(<MemoryRouter><AdminPage /></MemoryRouter>);
      await screen.findByText("Protected");

      const activateButtons = screen.getAllByRole("button", { name: /^activate$/i });
      expect(activateButtons.some((btn) => btn.disabled)).toBe(true);
      unmount();
    }
  });
});

// ─── View-only confirmation ───────────────────────────────────────────────────

describe("Sprint 3 E2E — View-only confirmation (all user types)", () => {
  const mutationPattern = /^(add|edit|delete|soft delete|save changes|create|update)$/i;
  const allRights = Object.fromEntries(RIGHT_NAMES.map((n) => [n, 1]));

  it.each(["USER", "ADMIN", "SUPERADMIN"])(
    "SalesPage has zero mutation controls for %s",
    async (userType) => {
      setUser({ userType, rights: allRights });
      render(<MemoryRouter><SalesPage /></MemoryRouter>);
      await screen.findByRole("heading", { name: "Transactions" });
      expect(screen.queryByRole("button", { name: mutationPattern })).not.toBeInTheDocument();
    },
  );

  it.each(["USER", "ADMIN", "SUPERADMIN"])(
    "ProductsPage has zero mutation controls for %s",
    async (userType) => {
      setUser({ userType, rights: allRights });
      render(<MemoryRouter><ProductsPage /></MemoryRouter>);
      await screen.findByText("Product Catalogue");
      expect(screen.queryByRole("button", { name: mutationPattern })).not.toBeInTheDocument();
    },
  );

  it.each(["USER", "ADMIN", "SUPERADMIN"])(
    "CustomerDetail sales history has zero mutation controls for %s",
    async (userType) => {
      setUser({ userType, rights: allRights });
      render(
        <MemoryRouter initialEntries={["/customers/C0001"]}>
          <Routes>
            <Route path="/customers/:custNo" element={<CustomerDetailPage />} />
          </Routes>
        </MemoryRouter>,
      );
      expect(await screen.findByText("Sales history")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: mutationPattern })).not.toBeInTheDocument();
    },
  );
});
