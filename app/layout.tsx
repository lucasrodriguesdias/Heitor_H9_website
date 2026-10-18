import type { Metadata } from "next";
import { assetPath, INSTAGRAM_URL, SITE_URL } from "@/config/site";
import "./globals.css";

const TITLE = "H9 | Heitor — O Camisa 9 das Peladas";
const DESCRIPTION =
  "Conheça Heitor, o H9. De Belo Horizonte e do Complexo do IAPI para os gramados, uma história de futebol, fé, disciplina e muita resenha.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "H9 — Heitor",
    images: [
      {
        url: `${SITE_URL}assets/desktop/01_hero_desktop.png`,
        width: 1672,
        height: 941,
        alt: "Heitor, o H9, segurando uma bola em um estádio",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [`${SITE_URL}assets/desktop/01_hero_desktop.png`],
  },
  robots: { index: true, follow: true },
  icons: {
    icon: assetPath("/favicon.svg"),
    shortcut: assetPath("/favicon.svg"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script type="application/ld+json">
          {JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "H9 — Heitor",
              url: SITE_URL,
              inLanguage: "pt-BR",
              description: DESCRIPTION,
            },
            {
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Heitor",
              alternateName: "H9",
              url: SITE_URL,
              sameAs: [INSTAGRAM_URL],
              description:
                "Atleta de Belo Horizonte conhecido como H9, apaixonado por futebol, disciplina e evolução esportiva.",
            },
          ])}
        </script>
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
