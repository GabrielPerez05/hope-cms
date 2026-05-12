import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "./LoginPage";
import { useAuth } from "../hooks/useAuth";

vi.mock("../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

function renderLoginPage() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/customers" element={<p>Customers route</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("LoginPage auth flows", () => {
  const authState = {
    currentUser: null,
    signIn: vi.fn(),
    signInWithGoogle: vi.fn(),
    clearError: vi.fn(),
    error: "",
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue(authState);
  });

  it("submits valid email credentials and navigates after a successful login", async () => {
    const user = userEvent.setup();
    authState.signIn.mockResolvedValueOnce(true);

    renderLoginPage();

    await user.type(screen.getByLabelText(/email/i), "team@hope.test");
    await user.type(screen.getByLabelText(/password/i), "securepass");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(authState.clearError).toHaveBeenCalledTimes(1);
    expect(authState.signIn).toHaveBeenCalledWith(
      "team@hope.test",
      "securepass",
    );
    await waitFor(() => {
      expect(screen.getByText("Customers route")).toBeInTheDocument();
    });
  });

  it("shows validation feedback before calling email login", async () => {
    const user = userEvent.setup();

    renderLoginPage();

    await user.type(screen.getByLabelText(/email/i), "team@hope.test");
    await user.type(screen.getByLabelText(/password/i), "short");
    await user.click(screen.getByRole("button", { name: /^sign in$/i }));

    expect(
      screen.getByText("Password must be at least 8 characters."),
    ).toBeInTheDocument();
    expect(authState.signIn).not.toHaveBeenCalled();
  });

  it("starts the Google OAuth flow from the login screen", async () => {
    const user = userEvent.setup();

    renderLoginPage();

    await user.click(screen.getByRole("button", { name: /sign in with google/i }));

    expect(authState.signInWithGoogle).toHaveBeenCalledTimes(1);
  });
});
