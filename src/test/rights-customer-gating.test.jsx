import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const mocks = vi.hoisted(() => ({
  currentUser: {
    id: "user-1",
    email: "user@test.com",
    user_type: "USER",
  },
  rights: {
    CUST_ADD: 0,
    CUST_EDIT: 0,
    CUST_DEL: 0,
  },
  customers: [
    {
      custno: "C0001",
      custname: "Globus Medical",
      address: "Audubon CA",
      payterm: "30D",
      record_status: "ACTIVE",
      updated_at: "2026-05-17",
    },
  ],
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
  getCustomers: vi.fn(() => Promise.resolve(mocks.customers)),
  softDeleteCustomer: vi.fn(),
  updateCustomer: vi.fn(),
}));

import { CustomersPage } from "../pages/CustomersPage";

function renderCustomersPage({
  rights = {},
  userType = "USER",
  customers = mocks.customers,
} = {}) {
  mocks.currentUser = {
    ...mocks.currentUser,
    user_type: userType,
  };
  mocks.rights = {
    CUST_ADD: 0,
    CUST_EDIT: 0,
    CUST_DEL: 0,
    ...rights,
  };
  mocks.customers = customers;

  return render(
    <MemoryRouter>
      <CustomersPage />
    </MemoryRouter>,
  );
}

describe("customer rights gating", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the Add Customer button only when CUST_ADD is enabled", async () => {
    renderCustomersPage();

    expect(await screen.findByText("Globus Medical")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /add customer/i }),
    ).not.toBeInTheDocument();

    renderCustomersPage({ rights: { CUST_ADD: 1 } });

    expect(
      await screen.findByRole("button", { name: /add customer/i }),
    ).toBeInTheDocument();
  });

  it("renders row Edit actions only when CUST_EDIT is enabled", async () => {
    renderCustomersPage();

    expect(await screen.findByText("Globus Medical")).toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: /actions/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /edit/i }),
    ).not.toBeInTheDocument();

    renderCustomersPage({ rights: { CUST_EDIT: 1 } });

    expect(
      await screen.findByRole("columnheader", { name: /actions/i }),
    ).toBeInTheDocument();
    expect(await screen.findByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  it("renders Delete only for SUPERADMIN users with CUST_DEL enabled", async () => {
    renderCustomersPage({ rights: { CUST_DEL: 1 }, userType: "ADMIN" });

    expect(await screen.findByText("Globus Medical")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /delete/i }),
    ).not.toBeInTheDocument();

    renderCustomersPage({ rights: { CUST_DEL: 1 }, userType: "SUPERADMIN" });

    expect(
      await screen.findByRole("button", { name: /delete/i }),
    ).toBeInTheDocument();
  });

  it("shows the Stamp column only for ADMIN and SUPERADMIN users", async () => {
    renderCustomersPage({ userType: "USER" });

    expect(await screen.findByText("Globus Medical")).toBeInTheDocument();
    expect(
      screen.queryByRole("columnheader", { name: /stamp/i }),
    ).not.toBeInTheDocument();

    renderCustomersPage({ userType: "ADMIN" });

    expect(
      await screen.findByRole("columnheader", { name: /stamp/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("2026-05-17")).toBeInTheDocument();
  });

  it("does not render action buttons for Sales/Product/Price History style view-only rights", async () => {
    renderCustomersPage({
      rights: {
        SALES_VIEW: 1,
        PROD_VIEW: 1,
        PRICE_VIEW: 1,
      },
    });

    const row = await screen.findByRole("row", { name: /c0001/i });
    expect(
      screen.queryByRole("columnheader", { name: /actions/i }),
    ).not.toBeInTheDocument();
    expect(within(row).queryByRole("button")).not.toBeInTheDocument();
  });
});
