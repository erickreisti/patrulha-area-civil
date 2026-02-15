import { create } from "zustand";
import { getEvents } from "@/app/actions/events/get-events";
// Importamos o tipo EventType que é inferido do Zod no arquivo de schemas
import { type EventType } from "@/lib/schemas/events";

// Cria um tipo auxiliar para o filtro (pode ser 'all' ou uma das categorias do banco)
export type FilterType = "all" | EventType["category"];

interface EventsStore {
  // Lista completa de eventos (cache)
  events: EventType[];
  // Lista filtrada que será exibida na tela
  filteredEvents: EventType[];
  // Filtro atual selecionado
  filter: FilterType;
  // Estado de carregamento
  loading: boolean;

  // Actions
  fetchEvents: () => Promise<void>;
  setFilter: (category: FilterType) => void;
}

export const useEventsStore = create<EventsStore>((set, get) => ({
  events: [],
  filteredEvents: [],
  filter: "all",
  loading: true, // Começa como true para exibir o Skeleton na montagem inicial

  fetchEvents: async () => {
    set({ loading: true });

    // Chama a Server Action
    const res = await getEvents();

    if (res.success && res.data) {
      // Pega o filtro que está ativo no momento (caso o usuário tenha mudado antes de carregar)
      const currentFilter = get().filter;

      // Aplica a lógica de filtro nos dados novos
      const filtered =
        currentFilter === "all"
          ? res.data
          : res.data.filter((e) => e.category === currentFilter);

      set({
        events: res.data,
        filteredEvents: filtered,
        loading: false,
      });
    } else {
      // Em caso de erro, remove o loading para não travar a tela
      set({ loading: false });
    }
  },

  setFilter: (category: FilterType) => {
    const { events } = get();

    // Atualiza o estado do filtro visual
    set({ filter: category });

    // Atualiza a lista filtrada baseada na lista completa (cache)
    if (category === "all") {
      set({ filteredEvents: events });
    } else {
      set({
        filteredEvents: events.filter((ev) => ev.category === category),
      });
    }
  },
}));
