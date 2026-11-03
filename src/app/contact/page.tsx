import type { Metadata } from "next";
import { ContactPage } from "@/components/site/contact-page";

export const metadata: Metadata = {
  title: "Mathiis",
  description: "Une question, un bug à signaler, une suggestion ? Contactez l'équipe Mathiis.",
};

export default function Page() {
  return <ContactPage />;
}
