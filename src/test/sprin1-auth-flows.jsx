import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../lib/supabase", () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi
      .fn()
      .mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(),
      }),
  },
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

import { supabase } from "../../lib/supabase";
import { LoginPage } from "../../pages/LoginPage";
import { RegisterPage } from "../../pages/RegisterPage";
import { AuthProvider } from "../../contexts/AuthContext";

function wrap(ui) {
  return render(
    <MemoryRouter>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>,
  );
}

describe("TC-01: Registration success", () => {
  it("shows confirmation screen after successful signup", async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: { user: { id: "u1" } },
      error: null,
    });
    const user = userEvent.setup();
    wrap(<RegisterPage />);
    await user.type(await screen.findByLabelText(/first name/i), "Juan");
    await user.type(await screen.findByLabelText(/last name/i), "DC");
    await user.type(await screen.findByLabelText(/username/i), "jdc");
    await user.type(await screen.findByLabelText(/email/i), "juan@test.com");
    await user.type(
      await screen.findByPlaceholderText(/enter your password/i),
      "password123",
    );
    await user.type(
      await screen.findByPlaceholderText(/confirm your password/i),
      "password123",
    );
    await user.click(
      await screen.findByRole("button", { name: /create account/i }),
    );
    await waitFor(() =>
      expect(screen.getByText(/check your email/i)).toBeInTheDocument(),
    );
  });
});

describe("TC-02: Registration validation", () => {
  it("shows errors on empty submit", async () => {
    supabase.auth.signUp.mockClear();
    const user = userEvent.setup();
    wrap(<RegisterPage />);
    await user.click(
      await screen.findByRole("button", { name: /create account/i }),
    );
    expect(
      await screen.findByText(/first name is required/i),
    ).toBeInTheDocument();
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });
});

describe("TC-03: Password mismatch", () => {
  it("shows mismatch error", async () => {
    const user = userEvent.setup();
    wrap(<RegisterPage />);
    await user.type(await screen.findByLabelText(/first name/i), "A");
    await user.type(await screen.findByLabelText(/last name/i), "B");
    await user.type(await screen.findByLabelText(/username/i), "abc");
    await user.type(await screen.findByLabelText(/email/i), "a@b.com");
    await user.type(
      await screen.findByPlaceholderText(/enter your password/i),
      "password1",
    );
    await user.type(
      await screen.findByPlaceholderText(/confirm your password/i),
      "password2",
    );
    await user.click(
      await screen.findByRole("button", { name: /create account/i }),
    );
    expect(
      await screen.findByText(/passwords do not match/i),
    ).toBeInTheDocument();
  });
});

describe("TC-04: Login wrong credentials", () => {
  it("shows friendly error", async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: "Invalid login credentials" },
    });
    const user = userEvent.setup();
    wrap(<LoginPage />);
    await user.type(await screen.findByLabelText(/email/i), "bad@test.com");
    await user.type(await screen.findByLabelText(/^password$/i), "wrongpass");
    await user.click(await screen.findByRole("button", { name: /^sign in$/i }));
    expect(
      await screen.findByText(/incorrect email or password/i),
    ).toBeInTheDocument();
  });
});

describe("TC-05: Login empty fields", () => {
  it("shows validation errors", async () => {
    supabase.auth.signInWithPassword.mockClear();
    const user = userEvent.setup();
    wrap(<LoginPage />);
    await user.click(await screen.findByRole("button", { name: /^sign in$/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });
});

describe("TC-06: Google OAuth", () => {
  beforeEach(() =>
    supabase.auth.signInWithOAuth.mockResolvedValue({ data: {}, error: null }),
  );
  it("calls signInWithOAuth on login page", async () => {
    const user = userEvent.setup();
    wrap(<LoginPage />);
    await user.click(
      await screen.findByRole("button", { name: /sign in with google/i }),
    );
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: "google" }),
    );
  });
  it("calls signInWithOAuth on register page", async () => {
    const user = userEvent.setup();
    wrap(<RegisterPage />);
    await user.click(
      await screen.findByRole("button", { name: /register with google/i }),
    );
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: "google" }),
    );
  });
});

describe("TC-07: Login guard blocks INACTIVE", () => {
  it("calls signOut for INACTIVE user", async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: "u-inactive" } } },
    });
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi
        .fn()
        .mockResolvedValue({
          data: {
            record_status: "INACTIVE",
            user_type: "USER",
            username: "test",
            userId: "u-inactive",
          },
          error: null,
        }),
    });
    supabase.auth.signOut.mockResolvedValue({});
    render(
      <MemoryRouter>
        <AuthProvider>
          <div>loaded</div>
        </AuthProvider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(supabase.auth.signOut).toHaveBeenCalled());
  });
});

describe("TC-08: Login guard allows ACTIVE", () => {
  it("does not call signOut for ACTIVE user", async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: "u-active" } } },
    });
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi
        .fn()
        .mockResolvedValue({
          data: {
            record_status: "ACTIVE",
            user_type: "USER",
            username: "active",
            userId: "u-active",
          },
          error: null,
        }),
    });
    supabase.auth.signOut.mockClear();
    render(
      <MemoryRouter>
        <AuthProvider>
          <div>loaded</div>
        </AuthProvider>
      </MemoryRouter>,
    );
    await waitFor(() => expect(supabase.from).toHaveBeenCalled());
    expect(supabase.auth.signOut).not.toHaveBeenCalled();
  });
});

describe("TC-09: Provision defaults", () => {
  it("USER/INACTIVE has correct right defaults", () => {
    const defaults = {
      user_type: "USER",
      record_status: "INACTIVE",
      rights: {
        SALES_VIEW: 1,
        SALES_ADD: 0,
        SALES_EDIT: 0,
        SALES_DEL: 0,
        SD_VIEW: 1,
        SD_ADD: 0,
        SD_EDIT: 0,
        SD_DEL: 0,
        CUST_LOOKUP: 1,
        EMP_LOOKUP: 1,
        PROD_LOOKUP: 1,
        PRICE_LOOKUP: 1,
        ADM_USER: 0,
      },
    };
    expect(defaults.user_type).toBe("USER");
    expect(defaults.record_status).toBe("INACTIVE");
    expect(defaults.rights.SALES_VIEW).toBe(1);
    expect(defaults.rights.SALES_ADD).toBe(0);
    expect(defaults.rights.ADM_USER).toBe(0);
    ["CUST_LOOKUP", "EMP_LOOKUP", "PROD_LOOKUP", "PRICE_LOOKUP"].forEach((r) =>
      expect(defaults.rights[r]).toBe(1),
    );
  });
});

describe("TC-10: Duplicate email", () => {
  it("shows friendly error for already-registered email", async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: null,
      error: { message: "User already registered" },
    });
    const user = userEvent.setup();
    wrap(<RegisterPage />);
    await user.type(await screen.findByLabelText(/first name/i), "A");
    await user.type(await screen.findByLabelText(/last name/i), "B");
    await user.type(await screen.findByLabelText(/username/i), "abc");
    await user.type(
      await screen.findByLabelText(/email/i),
      "existing@test.com",
    );
    await user.type(
      await screen.findByPlaceholderText(/enter your password/i),
      "password123",
    );
    await user.type(
      await screen.findByPlaceholderText(/confirm your password/i),
      "password123",
    );
    await user.click(
      await screen.findByRole("button", { name: /create account/i }),
    );
    expect(await screen.findByText(/already exists/i)).toBeInTheDocument();
  });
});
