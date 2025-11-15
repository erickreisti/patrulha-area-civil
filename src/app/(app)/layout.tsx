// src/app/(app)/layout.tsx
import { Header } from "@/components/site/layout/Header";
import { Footer } from "@/components/site/layout/Footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
