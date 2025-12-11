import type { Metadata, Viewport } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import { ServiceWorkerInitializer } from "@/components/service-worker/ServiceWorkerInitializer";
import { AuthInitializer } from "@/components/auth/AuthInitializer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: true,
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  adjustFontFallback: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  interactiveWidget: "resizes-visual",
  themeColor: "#1e3a8a",
};

export const metadata: Metadata = {
  title: {
    default: "Patrulha Aérea Civil - Excelência em Serviço Humanitário",
    template: "%s | Patrulha Aérea Civil",
  },
  description:
    "Organização civil especializada em operações aéreas de resgate, busca e proteção civil.",
  keywords: [
    "patrulha aérea civil",
    "resgate aéreo",
    "proteção civil",
    "serviço humanitário",
    "busca e salvamento",
  ],
  authors: [
    { name: "Patrulha Aérea Civil", url: "https://patrulhaaereacivil.org.br" },
  ],
  creator: "Patrulha Aérea Civil",
  publisher: "Patrulha Aérea Civil",
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL("https://patrulhaaereacivil.org.br"),
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    title: "Patrulha Aérea Civil - Excelência em Serviço Humanitário",
    description:
      "Organização civil especializada em operações aéreas de resgate, busca e proteção civil.",
    siteName: "Patrulha Aérea Civil",
    images: [
      {
        url: "/images/site/hero-bg.webp",
        width: 1200,
        height: 630,
        alt: "Patrulha Aérea Civil",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Patrulha Aérea Civil - Excelência em Serviço Humanitário",
    description:
      "Organização civil especializada em operações aéreas de resgate, busca e proteção civil",
    images: ["/images/site/hero-bg.webp"],
    creator: "@patrulhaaereacivil",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${roboto.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        {/* PWA meta tags */}
        <meta name="application-name" content="Patrulha Aérea Civil" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta
          name="apple-mobile-web-app-title"
          content="Patrulha Aérea Civil"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#1e3a8a" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="font-sans antialiased bg-background text-foreground min-h-screen min-w-[320px]">
        {/* Skip to content link para acessibilidade */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-navy focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Pular para conteúdo principal
        </a>

        {/* Inicializadores */}
        <ServiceWorkerInitializer />
        <AuthInitializer />

        <div className="flex flex-col min-h-screen">
          <main
            id="main-content"
            className="flex-grow w-full overflow-x-hidden focus:outline-none"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>

        {/* Feedback para JavaScript desabilitado */}
        <noscript>
          <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-4">
            <div className="max-w-md text-center">
              <h2 className="text-2xl font-bold text-navy mb-4">
                JavaScript Necessário
              </h2>
              <p className="text-gray-700 mb-4">
                Este site requer JavaScript para funcionar corretamente. Por
                favor, habilite o JavaScript em seu navegador.
              </p>
            </div>
          </div>
        </noscript>
      </body>
    </html>
  );
}
