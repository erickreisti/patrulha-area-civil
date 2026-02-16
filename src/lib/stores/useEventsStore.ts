import { create } from "zustand";
import { createBrowserClient } from "@supabase/ssr";
import { EventType } from "@/lib/schemas/events";

// Cliente Supabase para o Browser
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface EventsState {
  events: EventType[];
  loading: boolean;
  filter: string;
  setFilter: (filter: string) => void;
  fetchEvents: () => Promise<void>;
  // Nova função para iniciar o Realtime
  subscribeToEvents: () => () => void;
}

export const useEventsStore = create<EventsState>((set, get) => ({
  events: [],
  loading: false,
  filter: "all",

  setFilter: (filter) => set({ filter }),

  fetchEvents: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("start_date", { ascending: true });

    if (!error && data) {
      set({ events: data as EventType[] });
    }
    set({ loading: false });
  },

  // --- LÓGICA DE TEMPO REAL ---
  subscribeToEvents: () => {
    console.log("🔌 Conectando ao Realtime de Eventos...");

    const channel = supabase
      .channel("events-realtime") // Nome do canal (pode ser qualquer um)
      .on(
        "postgres_changes", // O tipo de evento (mudança no banco)
        { event: "*", schema: "public", table: "events" }, // Onde ouvir
        (payload) => {
          console.log("⚡ Mudança detectada no banco:", payload.eventType);
          // Se mudou algo, recarrega a lista
          get().fetchEvents();
        },
      )
      .subscribe();

    // Retorna a função para desligar a escuta quando sair da página
    return () => {
      console.log("🔌 Desconectando Realtime...");
      supabase.removeChannel(channel);
    };
  },
}));
