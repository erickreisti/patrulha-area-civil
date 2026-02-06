import { Header } from "@/components/site/layout/Header";
import { Footer } from "@/components/site/layout/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Server Component (sem "use client") para melhor SEO
    <div className="flex flex-col min-h-screen bg-slate-50 relative overflow-x-hidden">
      {/* Header Fixo/Sticky */}
      <Header />

      {/* Conteúdo Principal */}

      <main className="flex-1 w-full flex flex-col relative">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
