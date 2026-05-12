import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../hooks/useAuth";

vi.mock("../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

function renderProtectedRoute(authState) {
  useAuth.mockReturnValue(authState);

  return render(
    <MemoryRouter initialEntries={["/customers"]}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/customers" element={<p>Protected customers</p>} />
        </Route>
        <Route path="/login" element={<p>Login route</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute login guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows an authentication check while auth state is loading", () => {
    renderProtectedRoute({ currentUser: null, loading: true });

    expect(
      screen.getByText("Checking authentication..."),
    ).toBeInTheDocument();
  });

  it("redirects unauthenticated visitors to login", () => {
    renderProtectedRoute({ currentUser: null, loading: false });

    expect(screen.getByText("Login route")).toBeInTheDocument();
    expect(screen.queryByText("Protected customers")).not.toBeInTheDocument();
  });

  it("renders protected content for an authenticated user", () => {
    renderProtectedRoute({
      currentUser: { id: "user-1", email: "team@hope.test" },
      loading: false,
    });

    expect(screen.getByText("Protected customers")).toBeInTheDocument();
    expect(screen.queryByText("Login route")).not.toBeInTheDocument();
  });
});
