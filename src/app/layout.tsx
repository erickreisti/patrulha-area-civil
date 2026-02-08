import type { Metadata, Viewport } from "next";
import { Inter, Roboto } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

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
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.json",
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
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        {/* Componente de Notificações Global */}
        <Toaster richColors position="top-right" closeButton />

        <main className="min-h-screen flex flex-col">{children}</main>
      </body>
    </html>
  );
}
