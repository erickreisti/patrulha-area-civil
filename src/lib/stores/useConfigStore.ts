import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConfigState {
  // UI
  darkMode: boolean;
  language: "pt" | "en";
  sidebarCollapsed: boolean;

  // Notifications
  notificationsEnabled: boolean;
  soundsEnabled: boolean;

  // Data
  itemsPerPage: number;
  autoRefresh: boolean;

  // Actions
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setLanguage: (lang: "pt" | "en") => void;
  toggleNotifications: () => void;
  toggleSounds: () => void;
  setItemsPerPage: (count: number) => void;
  toggleAutoRefresh: () => void;
  reset: () => void;
}

const initialState = {
  darkMode: false,
  language: "pt" as const,
  sidebarCollapsed: false,
  notificationsEnabled: true,
  soundsEnabled: true,
  itemsPerPage: 50,
  autoRefresh: true,
};

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      ...initialState,

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setLanguage: (language) => set({ language }),

      toggleNotifications: () =>
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),

      toggleSounds: () =>
        set((state) => ({ soundsEnabled: !state.soundsEnabled })),

      setItemsPerPage: (itemsPerPage) => {
        if ([10, 25, 50, 100].includes(itemsPerPage)) {
          set({ itemsPerPage });
        }
      },

      toggleAutoRefresh: () =>
        set((state) => ({ autoRefresh: !state.autoRefresh })),

      reset: () => set(initialState),
    }),
    {
      name: "config-storage",
      partialize: (state) => ({
        darkMode: state.darkMode,
        language: state.language,
        sidebarCollapsed: state.sidebarCollapsed,
        notificationsEnabled: state.notificationsEnabled,
        soundsEnabled: state.soundsEnabled,
        itemsPerPage: state.itemsPerPage,
        autoRefresh: state.autoRefresh,
      }),
    }
  )
);
