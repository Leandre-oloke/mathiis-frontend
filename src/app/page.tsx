import type { Metadata } from "next";
import { HomePage } from "@/components/site/home-page";

export const metadata: Metadata = {
  title: "Mathiis — L’IA qui donne forme à vos épreuves",
  description: "Créez, corrigez et exportez vos épreuves académiques avec Mathiis. Une plateforme d’intelligence artificielle au service des enseignants et des élèves au Bénin.",
};

export default function Page() {
  return <HomePage />;
}
