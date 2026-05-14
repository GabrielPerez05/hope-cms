import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signInWithOAuth: vi.fn(),
  signOut: vi.fn(),
  exchangeCodeForSession: vi.fn(),
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  from: vi.fn(),
}));

vi.mock("../lib/supabase", () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      signUp: mocks.signUp,
      signInWithPassword: mocks.signInWithPassword,
      signInWithOAuth: mocks.signInWithOAuth,
      signOut: mocks.signOut,
      exchangeCodeForSession: mocks.exchangeCodeForSession,
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
    },
    from: mocks.from,
  },
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mocks.navigate };
});

import App from "../App";
import { AuthProvider } from "../contexts/AuthContext";
import { UserRightsProvider } from "../contexts/UserRightsContext";
import { useAuth } from "../hooks/useAuth";
import { useRights } from "../hooks/useRights";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { AuthCallbackPage } from "../pages/AuthCallbackPage";

function createQuery(result) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
  };
}

function mockUserProfile(profile = null) {
  mocks.from.mockImplementation((table) => {
    if (table === "user") {
      return createQuery({ data: profile, error: null });
    }

    if (table === "user_rights") {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({
          data: [
            { right_name: "CUST_VIEW", right_value: 1 },
            { right_name: "CUST_ADD", right_value: 0 },
            { right_name: "CUST_EDIT", right_value: 1 },
            { right_name: "CUST_DEL", right_value: 0 },
            { right_name: "SALES_VIEW", right_value: 1 },
            { right_name: "SD_VIEW", right_value: 1 },
            { right_name: "PROD_VIEW", right_value: 1 },
            { right_name: "PRICE_VIEW", right_value: 1 },
            { right_name: "ADM_USER", right_value: 0 },
          ],
          error: null,
        }),
      };
    }

    return createQuery({ data: null, error: null });
  });
}

function renderWithAuth(ui) {
  return render(
    <MemoryRouter>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSession.mockResolvedValue({ data: { session: null } });
  mocks.onAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  });
  mocks.signOut.mockResolvedValue({});
  mockUserProfile(null);
});

describe("Sprint 1 authentication", () => {
  it("starts the Google OAuth PKCE flow from the login page", async () => {
    mocks.signInWithOAuth.mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();

    renderWithAuth(<LoginPage />);
    await user.click(
      await screen.findByRole("button", { name: /sign in with google/i }),
    );

    expect(mocks.signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: "google",
        options: expect.objectContaining({
          redirectTo: expect.stringContaining("/auth/callback"),
        }),
      }),
    );
  });

  it("handles email verification signups without leaving the form silent", async () => {
    mocks.signUp.mockResolvedValue({
      data: { user: { id: "new-user" }, session: null },
      error: null,
    });
    const user = userEvent.setup();

    renderWithAuth(<RegisterPage />);
    await user.type(await screen.findByLabelText(/first name/i), "Juan");
    await user.type(await screen.findByLabelText(/last name/i), "Dela Cruz");
    await user.type(await screen.findByLabelText(/username/i), "juan.dc");
    await user.type(await screen.findByLabelText(/email/i), "juan@test.com");
    await user.type(await screen.findByLabelText(/password/i), "password123");
    await user.click(
      await screen.findByRole("button", { name: /create account/i }),
    );

    expect(await screen.findByText(/check your email/i)).toBeInTheDocument();
  });

  it("persists an active email login session through AuthProvider state", async () => {
    mockUserProfile({
      userId: "active-user",
      username: "active.user",
      user_type: "USER",
      record_status: "ACTIVE",
    });
    mocks.signInWithPassword.mockResolvedValue({
      data: { session: { user: { id: "active-user", email: "active@test.com" } } },
      error: null,
    });

    function LoginProbe() {
      const { currentUser, signIn } = useAuth();
      return (
        <button onClick={() => signIn("active@test.com", "password123")}>
          {currentUser?.username || "login"}
        </button>
      );
    }

    const user = userEvent.setup();
    renderWithAuth(<LoginProbe />);
    await user.click(await screen.findByRole("button", { name: "login" }));

    expect(await screen.findByRole("button", { name: "active.user" })).toBeInTheDocument();
  });

  it("blocks inactive email login sessions and signs the user out", async () => {
    mockUserProfile({
      userId: "inactive-user",
      username: "inactive.user",
      user_type: "USER",
      record_status: "INACTIVE",
    });
    mocks.signInWithPassword.mockResolvedValue({
      data: {
        session: { user: { id: "inactive-user", email: "inactive@test.com" } },
      },
      error: null,
    });

    function LoginProbe() {
      const { currentUser, error, signIn } = useAuth();
      return (
        <div>
          <button onClick={() => signIn("inactive@test.com", "password123")}>
            {currentUser?.username || "login"}
          </button>
          <span>{error}</span>
        </div>
      );
    }

    const user = userEvent.setup();
    renderWithAuth(<LoginProbe />);
    await user.click(await screen.findByRole("button", { name: "login" }));

    expect(await screen.findByText(/pending activation/i)).toBeInTheDocument();
    expect(mocks.signOut).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "login" })).toBeInTheDocument();
  });
});

describe("Sprint 1 callback and route protection", () => {
  it("exchanges OAuth callback codes and redirects to customers", async () => {
    mockUserProfile({
      userId: "oauth-user",
      username: "oauth.user",
      user_type: "USER",
      record_status: "ACTIVE",
    });
    mocks.exchangeCodeForSession.mockResolvedValue({
      data: { session: { user: { id: "oauth-user", email: "oauth@test.com" } } },
      error: null,
    });
    window.history.pushState({}, "", "/auth/callback?code=abc123");

    renderWithAuth(<AuthCallbackPage />);

    await waitFor(() => {
      expect(mocks.exchangeCodeForSession).toHaveBeenCalledWith("abc123");
      expect(mocks.navigate).toHaveBeenCalledWith("/customers", { replace: true });
    });
  });

  it("redirects inactive OAuth callback sessions to login with an error", async () => {
    mockUserProfile({
      userId: "inactive-oauth-user",
      username: "inactive.oauth",
      user_type: "USER",
      record_status: "INACTIVE",
    });
    mocks.exchangeCodeForSession.mockResolvedValue({
      data: {
        session: {
          user: { id: "inactive-oauth-user", email: "inactive-oauth@test.com" },
        },
      },
      error: null,
    });
    window.history.pushState({}, "", "/auth/callback?code=inactive123");

    renderWithAuth(<AuthCallbackPage />);

    await waitFor(() => {
      expect(mocks.signOut).toHaveBeenCalled();
      expect(mocks.navigate).toHaveBeenCalledWith(
        expect.stringContaining("/login?error="),
        { replace: true },
      );
    });
  });

  it("redirects unauthenticated users away from protected routes", async () => {
    render(
      <MemoryRouter initialEntries={["/customers"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByText(/access your account/i)).toBeInTheDocument();
  });

  it("exposes loaded rights to protected components", async () => {
    mockUserProfile({
      userId: "rights-user",
      username: "rights.user",
      user_type: "USER",
      record_status: "ACTIVE",
    });
    mocks.getSession.mockResolvedValue({
      data: { session: { user: { id: "rights-user", email: "rights@test.com" } } },
    });

    function RightsProbe() {
      const { hasRight, canEdit, isAdmin } = useRights();
      return (
        <div>
          <span>{hasRight("CUST_VIEW") ? "can-view" : "cannot-view"}</span>
          <span>{canEdit() ? "can-edit" : "cannot-edit"}</span>
          <span>{isAdmin() ? "admin" : "not-admin"}</span>
        </div>
      );
    }

    render(
      <MemoryRouter>
        <AuthProvider>
          <UserRightsProvider>
            <Routes>
              <Route path="/" element={<RightsProbe />} />
            </Routes>
          </UserRightsProvider>
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(await screen.findByText("can-view")).toBeInTheDocument();
    expect(await screen.findByText("can-edit")).toBeInTheDocument();
    expect(await screen.findByText("not-admin")).toBeInTheDocument();
  });
});
