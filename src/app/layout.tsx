// src/app/layout.tsx - ATUALIZADO COM TOAST PROVIDER
import type { Metadata, Viewport } from "next";
import { Inter, Roboto } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
    "emergências",
    "aviação civil",
    "resgate humanitário",
    "operações aéreas",
    "PAC Brasil",
  ],
  authors: [
    {
      name: "Patrulha Aérea Civil",
      url: "https://patrulhaaereacivil.org.br",
    },
  ],
  creator: "Patrulha Aérea Civil",
  publisher: "Patrulha Aérea Civil",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://patrulhaaereacivil.org.br"),
  icons: {
    icon: [{ url: "/icon.png", sizes: "32x32", type: "image/png" }],
    apple: "/apple-icon.png",
  },
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
    <html lang="pt-BR" className="scroll-smooth">
      <body
        className={`${inter.variable} ${roboto.variable} font-sans antialiased bg-bg-primary text-charcoal`}
        suppressHydrationWarning
      >
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
