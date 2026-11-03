import type { Metadata } from "next";
import { HomePage } from "@/components/site/home-page";
import VisitTracker from "@/components/VisitTracker";

export const metadata: Metadata = {
  title: "Mathiis",
  description: "Créez, corrigez et exportez vos épreuves académiques avec Mathiis. Une plateforme d’intelligence artificielle au service des enseignants et des élèves au Bénin.",
};

export default function Page() {
  return (
    <>
      <VisitTracker />
      <HomePage />
    </>
  );
}
