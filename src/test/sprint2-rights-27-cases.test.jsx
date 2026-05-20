import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { RIGHT_NAMES } from "../lib/rights";

const USER_TYPES = ["USER", "ADMIN", "SUPERADMIN"];

const mocks = vi.hoisted(() => ({
  currentUser: {
    id: "user-1",
    email: "user@test.com",
    user_type: "USER",
  },
  rights: {},
  customers: [
    {
      custno: "C0001",
      custname: "Globus Medical",
      address: "2560 Gen Armistead Ave",
      payterm: "30D",
      record_status: "ACTIVE",
      updated_at: "2026-05-17",
    },
    {
      custno: "C0002",
      custname: "RF Industries",
      address: "7610 Miramar Rd",
      payterm: "45D",
      record_status: "INACTIVE",
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
  getCustomers: vi.fn((userType = "USER") =>
    Promise.resolve(
      userType === "USER"
        ? mocks.customers.filter((customer) => customer.record_status === "ACTIVE")
        : mocks.customers,
    ),
  ),
  recoverCustomer: vi.fn(),
  softDeleteCustomer: vi.fn(),
  updateCustomer: vi.fn(),
}));

import { CustomersPage } from "../pages/CustomersPage";

function setRights({ userType = "USER", enabledRight = null } = {}) {
  mocks.currentUser = {
    ...mocks.currentUser,
    user_type: userType,
  };
  mocks.rights = Object.fromEntries(
    RIGHT_NAMES.map((rightName) => [rightName, rightName === enabledRight ? 1 : 0]),
  );
}

function renderCustomers({ userType, enabledRight }) {
  setRights({ userType, enabledRight });
  return render(
    <MemoryRouter>
      <CustomersPage />
    </MemoryRouter>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("Sprint 2 M5 27-case customer rights matrix", () => {
  const matrixCases = USER_TYPES.flatMap((userType) =>
    RIGHT_NAMES.map((enabledRight) => ({ userType, enabledRight })),
  );

  it("documents the required 3 user types x 9 rights cases", () => {
    expect(matrixCases).toHaveLength(27);
  });

  it.each(matrixCases)(
    "$userType with only $enabledRight enabled renders the expected customer controls",
    async ({ userType, enabledRight }) => {
      renderCustomers({ userType, enabledRight });

      expect(await screen.findByText("Globus Medical")).toBeInTheDocument();

      const isAdminType = userType === "ADMIN" || userType === "SUPERADMIN";
      const canAdd = isAdminType || enabledRight === "CUST_ADD";
      const canEdit = isAdminType || enabledRight === "CUST_EDIT";
      const canDelete = userType === "SUPERADMIN" && enabledRight === "CUST_DEL";
      const showStamp = userType === "ADMIN" || userType === "SUPERADMIN";
      const showActions = canEdit || canDelete;

      expect(
        Boolean(screen.queryByRole("button", { name: /add customer/i })),
      ).toBe(canAdd);
      expect(screen.queryAllByRole("button", { name: /^edit$/i }).length > 0).toBe(canEdit);
      expect(screen.queryAllByRole("button", { name: /^delete$/i }).length > 0).toBe(canDelete);
      expect(Boolean(screen.queryByRole("columnheader", { name: /stamp/i }))).toBe(showStamp);
      expect(Boolean(screen.queryByRole("columnheader", { name: /actions/i }))).toBe(showActions);
    },
  );
});
