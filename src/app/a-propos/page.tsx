import type { Metadata } from "next";
import { AboutPage } from "@/components/site/about-page";

export const metadata: Metadata = {
  title: "Mathiis",
  description: "Mathiis, le générateur d'épreuves par IA au service des enseignants et des élèves au Bénin.",
};

export default function Page() {
  return <AboutPage />;
}
