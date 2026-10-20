import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("@/lib/api", () => ({ api }));
vi.mock("next/navigation", () => ({ useRouter: () => router, useSearchParams: () => new URLSearchParams() }));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn(), error: vi.fn() } }));
// Google sign-in loads a third-party script and the bear is a Rive canvas: both out of scope here.
vi.mock("@/components/auth/GoogleButton", () => ({ default: () => null }));
vi.mock("@/components/site/kofi-bear", () => ({
  KofiBear: (props: { handsUp?: boolean }) => <div data-testid="bear" data-hands-up={String(!!props.handsUp)} />,
}));

import { LoginCard, RegisterCard, slugifyUsername } from "@/components/site/auth-card";
import { useAuthStore } from "@/store/auth";

beforeEach(() => {
  api.get.mockReset();
  api.post.mockReset();
  router.push.mockReset();
  useAuthStore.setState({ user: null, isAuthenticated: false });
});

describe("Connexion", () => {
  it("validates the fields before calling the API", async () => {
    render(<LoginCard />);
    await userEvent.click(screen.getByRole("button", { name: "Se connecter" }));
    expect(await screen.findByText("Email invalide")).toBeInTheDocument();
    expect(screen.getByText("Mot de passe requis")).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it("signs in and opens the dashboard", async () => {
    api.post.mockResolvedValueOnce({ data: { access_token: "a", refresh_token: "r" } });
    api.get.mockResolvedValueOnce({ data: { id: "u1", email: "prof@exemple.bj" } });
    render(<LoginCard />);
    await userEvent.type(screen.getByLabelText("Adresse email"), "prof@exemple.bj");
    await userEvent.type(screen.getByLabelText("Mot de passe"), "secret");
    await userEvent.click(screen.getByRole("button", { name: "Se connecter" }));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/dashboard"));
    expect(api.post).toHaveBeenCalledWith("/auth/login", { email: "prof@exemple.bj", password: "secret" });
  });

  it("offers to resend the verification email for an unverified account", async () => {
    api.post.mockRejectedValueOnce({ response: { data: { detail: { code: "EMAIL_NOT_VERIFIED", message: "Email non vérifié" } } } });
    render(<LoginCard />);
    await userEvent.type(screen.getByLabelText("Adresse email"), "prof@exemple.bj");
    await userEvent.type(screen.getByLabelText("Mot de passe"), "secret");
    await userEvent.click(screen.getByRole("button", { name: "Se connecter" }));
    expect(await screen.findByRole("button", { name: /Renvoyer l'email de vérification/ })).toBeInTheDocument();
  });

  it("shows and hides the password; the bear covers his eyes while it is typed", async () => {
    render(<LoginCard />);
    const password = screen.getByLabelText("Mot de passe");
    expect(password).toHaveAttribute("type", "password");
    await userEvent.click(screen.getByRole("button", { name: "Afficher le mot de passe" }));
    expect(password).toHaveAttribute("type", "text");
    await userEvent.click(password);
    expect(screen.getByTestId("bear")).toHaveAttribute("data-hands-up", "true");
  });

  it("credits the mascot (CC BY 4.0)", () => {
    render(<LoginCard />);
    expect(screen.getByRole("link", { name: /par JcToon/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "CC BY 4.0" })).toBeInTheDocument();
  });
});

describe("Inscription", () => {
  it("builds usernames without accents or spaces", () => {
    expect(slugifyUsername("Rémi Adjovi")).toBe("remi_adjovi");
    expect(slugifyUsername("  Élise--N'Da ")).toBe("elise--n_da");
  });

  it("fills the username from the full name", async () => {
    render(<RegisterCard />);
    await userEvent.type(screen.getByLabelText("Nom complet"), "Rémi Adjovi");
    expect(screen.getByLabelText("Nom d’utilisateur")).toHaveValue("remi_adjovi");
  });

  it("creates the account and asks to check the mailbox", async () => {
    api.post.mockResolvedValueOnce({ data: { id: "u2" } });
    render(<RegisterCard />);
    await userEvent.type(screen.getByLabelText("Nom complet"), "Rémi Adjovi");
    await userEvent.type(screen.getByLabelText("Adresse email"), "remi@exemple.bj");
    await userEvent.type(screen.getByLabelText("Mot de passe"), "motdepasse1");
    await userEvent.click(screen.getByRole("button", { name: "Créer mon compte" }));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/auth/check-email?email=remi%40exemple.bj"));
    expect(api.post).toHaveBeenCalledWith("/auth/register", { full_name: "Rémi Adjovi", username: "remi_adjovi", email: "remi@exemple.bj", password: "motdepasse1" });
  });

  it("refuses a password shorter than 8 characters", async () => {
    render(<RegisterCard />);
    await userEvent.type(screen.getByLabelText("Nom complet"), "Rémi Adjovi");
    await userEvent.type(screen.getByLabelText("Adresse email"), "remi@exemple.bj");
    await userEvent.type(screen.getByLabelText("Mot de passe"), "court");
    await userEvent.click(screen.getByRole("button", { name: "Créer mon compte" }));
    expect(await screen.findByText("Minimum 8 caractères")).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });
});
