"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export function EventsRealtimeListener() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  useEffect(() => {
    // Inscreve no canal para ouvir mudanças na tabela 'events'
    const channel = supabase
      .channel("admin-events-refresh")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => {
          // Quando houver mudança, força o Next.js a recarregar os dados do servidor
          console.log("🔄 Atualizando lista de admin...");
          router.refresh();
        },
      )
      .subscribe();

    // Limpeza ao sair
    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, supabase]);

  // Esse componente é invisível, não renderiza nada na tela
  return null;
}
