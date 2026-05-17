import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RIGHT_NAMES } from "../lib/rights";

const USER_TYPES = ["USER", "ADMIN", "SUPERADMIN"];

const mocks = vi.hoisted(() => ({
  currentUser: {
    id: "user-1",
    email: "user@test.com",
    user_type: "USER",
  },
  rights: {},
  activeCustomers: [
    {
      custno: "C0001",
      custname: "Globus Medical",
      address: "2560 Gen Armistead Ave",
      payterm: "30D",
      record_status: "ACTIVE",
      updated_at: "2026-05-17",
    },
  ],
  deletedCustomers: [
    {
      custno: "C0002",
      custname: "RF Industries",
      address: "7610 Miramar Rd",
      payterm: "45D",
      record_status: "INACTIVE",
      updated_at: "2026-05-17",
    },
  ],
  sales: [
    {
      transno: "T0001",
      salesdate: "2026-05-17",
      custno: "C0001",
      empno: "E0001",
    },
  ],
  salesDetail: [{ transno: "T0001", prodcode: "P0001", quantity: 2 }],
  products: [{ prodcode: "P0001", description: "Laptop", unit: "pc" }],
  prices: [{ prodcode: "P0001", effdate: "2026-05-17", unitprice: 99.99 }],
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({ currentUser: mocks.currentUser }),
}));

vi.mock("../contexts/user-rights-context", () => ({
  useRights: () => ({
    rights: mocks.rights,
    userType: mocks.currentUser.user_type,
    hasRight: (rightName) => mocks.rights[rightName] === 1,
  }),
}));

vi.mock("../lib/customer-api", () => ({
  addCustomer: vi.fn(),
  getCustomers: vi.fn((userType = "USER") =>
    Promise.resolve(
      userType === "USER"
        ? mocks.activeCustomers
        : [...mocks.activeCustomers, ...mocks.deletedCustomers],
    ),
  ),
  recoverCustomer: vi.fn(() => Promise.resolve({ custno: "C0002" })),
  softDeleteCustomer: vi.fn(),
  updateCustomer: vi.fn(),
}));

vi.mock("../lib/sales-product-api", () => ({
  getAllSalesDetail: vi.fn(() => Promise.resolve(mocks.salesDetail)),
  getCurrentPrice: vi.fn(() => Promise.resolve(mocks.prices[0])),
  getPriceHistory: vi.fn(() => Promise.resolve(mocks.prices)),
  getProducts: vi.fn(() => Promise.resolve(mocks.products)),
  getSales: vi.fn(() => Promise.resolve(mocks.sales)),
  getSalesByCustomer: vi.fn(() => Promise.resolve(mocks.sales)),
  getSalesDetail: vi.fn(() => Promise.resolve(mocks.salesDetail)),
}));

import { CustomerDetailPage } from "../pages/CustomerDetailPage";
import { DeletedCustomersPage } from "../pages/DeletedCustomersPage";
import { ProductsPage } from "../pages/ProductsPage";
import { SalesPage } from "../pages/SalesPage";
import { AdminOnlyRoute } from "../App";
import { recoverCustomer } from "../lib/customer-api";

function setRights({ userType = "USER" } = {}) {
  mocks.currentUser = {
    ...mocks.currentUser,
    user_type: userType,
  };
  mocks.rights = Object.fromEntries(RIGHT_NAMES.map((rightName) => [rightName, 1]));
}

function renderWithRoute(element, path = "/") {
  return render(<MemoryRouter initialEntries={[path]}>{element}</MemoryRouter>);
}

function expectNoMutationButtons() {
  const mutationButtonNames =
    /add|edit|delete|soft delete|save changes|recover|create|update/i;
  expect(
    screen.queryByRole("button", { name: mutationButtonNames }),
  ).not.toBeInTheDocument();
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Sprint 2 M5 view-only enforcement gate", () => {
  it.each(USER_TYPES)(
    "renders Sales and Sales Detail without mutation buttons for %s",
    async (userType) => {
      setRights({ userType });
      const user = userEvent.setup();
      renderWithRoute(<SalesPage />);

      expect(
        await screen.findByRole("heading", { name: "Transactions" }),
      ).toBeInTheDocument();
      expectNoMutationButtons();

      await user.click(screen.getByText("T0001"));
      expect(await screen.findByText("Transaction T0001")).toBeInTheDocument();
      expectNoMutationButtons();
    },
  );

  it.each(USER_TYPES)(
    "renders Product and Price History data without mutation buttons for %s",
    async (userType) => {
      setRights({ userType });
      renderWithRoute(<ProductsPage />);

      expect(await screen.findByText("Product Catalogue")).toBeInTheDocument();
      expect(screen.getByText("Current Price")).toBeInTheDocument();
      expectNoMutationButtons();
    },
  );

  it.each(USER_TYPES)(
    "renders customer Sales Detail without mutation buttons for %s",
    async (userType) => {
      setRights({ userType });
      const user = userEvent.setup();
      render(
        <MemoryRouter initialEntries={["/customers/C0001"]}>
          <Routes>
            <Route path="/customers/:custNo" element={<CustomerDetailPage />} />
          </Routes>
        </MemoryRouter>,
      );

      expect(await screen.findByText("Sales history")).toBeInTheDocument();
      expectNoMutationButtons();

      await user.click(screen.getByText("T0001"));
      expect(await screen.findByText("Sales detail")).toBeInTheDocument();
      expectNoMutationButtons();
    },
  );
});

describe("Sprint 2 M5 deleted customer recovery", () => {
  it("redirects USER away from the Deleted Customers route", async () => {
    setRights({ userType: "USER" });
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
          <Route path="/customers" element={<CustomersRouteProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole("heading", { name: /customers/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /deleted customers/i }),
    ).not.toBeInTheDocument();
  });

  it("allows ADMIN to recover a soft-deleted customer", async () => {
    setRights({ userType: "ADMIN" });
    const user = userEvent.setup();
    renderWithRoute(<DeletedCustomersPage />);

    expect(await screen.findByText("RF Industries")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /recover/i }));

    expect(recoverCustomer).toHaveBeenCalledWith("C0002");
    expect(screen.queryByText("RF Industries")).not.toBeInTheDocument();
  });
});

function CustomersRouteProbe() {
  return <h1>Customers</h1>;
}
