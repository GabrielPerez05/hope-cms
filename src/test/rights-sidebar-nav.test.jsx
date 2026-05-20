import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const mocks = vi.hoisted(() => ({
  currentUser: {
    email: "user@test.com",
  },
  rights: {
    ADM_USER: 0,
  },
  userType: "USER",
  signOut: vi.fn(),
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    currentUser: mocks.currentUser,
    signOut: mocks.signOut,
  }),
}));

vi.mock("../hooks/useRights", () => ({
  useRights: () => ({
    rights: mocks.rights,
    userType: mocks.userType,
    hasRight: (rightName) => mocks.rights[rightName] === 1,
  }),
}));

import { AppShell } from "../components/AppShell";

function renderAppShell({ rights = {}, userType = "USER" } = {}) {
  mocks.rights = {
    CUST_VIEW: 1,
    SALES_VIEW: 1,
    PROD_VIEW: 1,
    ADM_USER: 0,
    ...rights,
  };
  mocks.userType = userType;

  return render(
    <MemoryRouter initialEntries={["/customers"]}>
      <AppShell />
    </MemoryRouter>,
  );
}

describe("sidebar rights gating", () => {
  it("keeps standard workflow links visible for non-admin users", () => {
    renderAppShell();

    expect(screen.getByRole("link", { name: /customers/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sales/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /products/i })).toBeInTheDocument();
  });

  it("hides Admin and Deleted Customers from non-admin users without admin rights", () => {
    renderAppShell();

    expect(screen.queryByRole("link", { name: /^admin$/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /deleted customers/i }),
    ).not.toBeInTheDocument();
  });

  it("shows Admin and Deleted Customers for ADMIN users", () => {
    renderAppShell({ userType: "ADMIN" });

    expect(screen.getByRole("link", { name: /^admin$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /deleted customers/i }),
    ).toBeInTheDocument();
  });

  it("shows Admin and Deleted Customers for SUPERADMIN users", () => {
    renderAppShell({ userType: "SUPERADMIN" });

    expect(screen.getByRole("link", { name: /^admin$/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /deleted customers/i }),
    ).toBeInTheDocument();
  });

  it("allows ADM_USER rights to reveal Admin without revealing Deleted Customers", () => {
    renderAppShell({ rights: { ADM_USER: 1 } });

    expect(screen.getByRole("link", { name: /^admin$/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /deleted customers/i }),
    ).not.toBeInTheDocument();
  });
});
