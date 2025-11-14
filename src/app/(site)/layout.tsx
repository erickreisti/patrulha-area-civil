// src/app/(site)/layout.tsx - ESSENCIAL!
import { Header } from "@/components/site/layout/Header";
import { Footer } from "@/components/site/layout/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-32">{children}</main>
      <Footer />
    </div>
  );
}
