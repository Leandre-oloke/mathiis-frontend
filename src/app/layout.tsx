import type { Metadata } from "next";
import Script from "next/script";
import { IBM_Plex_Mono, IBM_Plex_Sans, Libre_Baskerville, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { Providers } from "./providers";

// Fonts of the black-and-white identity, self-hosted by next/font and exposed as CSS variables.
const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-grotesk" });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-plex" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono" });
const baskerville = Libre_Baskerville({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-baskerville" });

export const metadata: Metadata = {
  title: "Mathiis",
  description: "Créez et corrigez des épreuves conformes au programme officiel grâce à l'intelligence artificielle, pour les enseignants et les élèves.",
  keywords: ["épreuve", "examen", "corrigé", "IA", "Bénin", "enseignants", "élèves"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`h-full antialiased ${grotesk.variable} ${plex.variable} ${plexMono.variable} ${baskerville.variable}`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground">
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
