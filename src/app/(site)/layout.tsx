// src/app/(site)/layout.tsx

"use client";

import { Header } from "@/components/site/layout/Header";
import { Footer } from "@/components/site/layout/Footer";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <Header />
      <main className="flex-1 w-full">
        <div className="w-full max-w-none">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
