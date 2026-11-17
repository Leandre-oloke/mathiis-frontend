import type { Metadata } from "next";
import { DemoPage } from "@/components/site/accueil/demo-page";

export const metadata: Metadata = {
  title: "Démo | Mathiis",
  description: "Essayez le générateur d’épreuves Mathiis sans inscription : choisissez la matière, la classe et les notions, puis découvrez un exemple d’épreuve avec son corrigé.",
};

export default function Page() {
  return <DemoPage />;
}
