import type { Metadata } from "next";
import { LoginCard } from "@/components/site/auth-card";

export const metadata: Metadata = { title: "Connexion — Mathiis", description: "Connectez-vous à Mathiis pour créer et corriger vos épreuves." };

export default function LoginPage() {
  return <LoginCard />;
}
