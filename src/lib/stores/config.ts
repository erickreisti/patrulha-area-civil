// lib/stores/config.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UPLOAD_CONFIGS, type UploadType } from "@/lib/config/upload";
import { SERVICE_WORKER_CONFIG } from "@/lib/config/service-worker";

interface ConfigState {
  // Configurações de upload
  uploadConfigs: typeof UPLOAD_CONFIGS;

  // Configurações de Service Worker
  serviceWorkerEnabled: boolean;
  serviceWorkerVersion: string;

  // Configurações de UI
  darkMode: boolean;
  language: "pt" | "en";
  notificationsEnabled: boolean;
  soundsEnabled: boolean;

  // Métodos
  toggleDarkMode: () => void;
  toggleNotifications: () => void;
  toggleSounds: () => void;
  setLanguage: (lang: "pt" | "en") => void;
  toggleServiceWorker: (enabled: boolean) => void;

  // Utilitários
  getUploadConfig: (
    type: UploadType
  ) => (typeof UPLOAD_CONFIGS)[keyof typeof UPLOAD_CONFIGS];
  isUploadAllowed: (
    file: File,
    type: UploadType
  ) => { allowed: boolean; reason?: string };
}

// Função auxiliar para verificar tipo MIME sem usar 'any'
const isMimeTypeAllowed = (
  fileType: string,
  allowedTypes: readonly string[]
): boolean => {
  // Converter para array de strings e usar type guard
  const allowedTypesArray = allowedTypes as unknown as string[];
  return allowedTypesArray.includes(fileType);
};

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      uploadConfigs: UPLOAD_CONFIGS,
      serviceWorkerEnabled: SERVICE_WORKER_CONFIG.enabled,
      serviceWorkerVersion: SERVICE_WORKER_CONFIG.version,
      darkMode: false,
      language: "pt",
      notificationsEnabled: true,
      soundsEnabled: true,

      // Métodos
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      toggleNotifications: () =>
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
      toggleSounds: () =>
        set((state) => ({ soundsEnabled: !state.soundsEnabled })),
      setLanguage: (lang) => set({ language: lang }),
      toggleServiceWorker: (enabled) => set({ serviceWorkerEnabled: enabled }),

      // Utilitários
      getUploadConfig: (type) => get().uploadConfigs[type],

      isUploadAllowed: (file, type) => {
        const config = get().uploadConfigs[type];

        // Verificar tamanho
        if (file.size > config.maxSize) {
          return {
            allowed: false,
            reason: `Arquivo muito grande. Máximo: ${
              config.maxSize / 1024 / 1024
            }MB`,
          };
        }

        // Verificar tipo MIME usando a função auxiliar
        if (!isMimeTypeAllowed(file.type, config.allowedTypes)) {
          return {
            allowed: false,
            reason: `Tipo de arquivo não permitido. Tipos permitidos: ${config.allowedTypes.join(
              ", "
            )}`,
          };
        }

        // Converter allowedExtensions para array de strings
        const allowedExtensionsArray = [
          ...config.allowedExtensions,
        ] as string[];
        const fileExt = file.name.split(".").pop()?.toLowerCase();

        if (fileExt && !allowedExtensionsArray.includes(`.${fileExt}`)) {
          return {
            allowed: false,
            reason: `Extensão não permitida. Extensões permitidas: ${allowedExtensionsArray.join(
              ", "
            )}`,
          };
        }

        return { allowed: true };
      },
    }),
    {
      name: "config-storage",
      partialize: (state) => ({
        darkMode: state.darkMode,
        language: state.language,
        notificationsEnabled: state.notificationsEnabled,
        soundsEnabled: state.soundsEnabled,
      }),
    }
  )
);
