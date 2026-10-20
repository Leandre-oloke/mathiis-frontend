import type { Metadata } from "next";
import { RegisterCard } from "@/components/site/auth-card";

export const metadata: Metadata = { title: "Créer un compte — Mathiis", description: "Créez votre compte Mathiis gratuitement." };

export default function RegisterPage() {
  return <RegisterCard />;
}
