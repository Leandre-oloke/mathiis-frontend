import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import "katex/dist/katex.min.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Mathiis - Générateur d'épreuves intelligent",
  description: "Créez des épreuves académiques professionnelles grâce à l'intelligence artificielle",
  keywords: ["épreuve", "examen", "IA", "génération", "éducation"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-slate-50 font-sans">
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
