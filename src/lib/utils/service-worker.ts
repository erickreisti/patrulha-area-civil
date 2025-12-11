import { SERVICE_WORKER_CONFIG } from "@/lib/config/service-worker";

class ServiceWorkerManager {
  private static instance: ServiceWorkerManager;
  private isUnregistering = false;

  private constructor() {}

  static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager();
    }
    return ServiceWorkerManager.instance;
  }

  /**
   * Remove todos os Service Workers registrados
   */
  async unregisterAll(): Promise<{ success: boolean; count: number }> {
    if (this.isUnregistering || !("serviceWorker" in navigator)) {
      return { success: false, count: 0 };
    }

    this.isUnregistering = true;

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      let unregisteredCount = 0;

      for (const registration of registrations) {
        const unregistered = await registration.unregister();
        if (unregistered) {
          unregisteredCount++;
          console.log(`Service Worker desregistrado: ${registration.scope}`);
        }
      }

      // Limpar caches
      await this.clearCaches();

      console.log(`Total de Service Workers removidos: ${unregisteredCount}`);

      return { success: true, count: unregisteredCount };
    } catch (error) {
      console.error("Erro ao remover Service Workers:", error);
      return { success: false, count: 0 };
    } finally {
      this.isUnregistering = false;
    }
  }

  /**
   * Limpa todos os caches do Service Worker
   */
  private async clearCaches(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      const deletePromises = cacheNames.map((cacheName) =>
        caches.delete(cacheName)
      );
      await Promise.all(deletePromises);
      console.log("Caches limpos com sucesso");
    } catch (error) {
      console.error("Erro ao limpar caches:", error);
    }
  }

  /**
   * Verifica se há Service Workers registrados
   */
  async hasRegisteredWorkers(): Promise<boolean> {
    if (!("serviceWorker" in navigator)) return false;

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      return registrations.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Configura o Service Worker (se habilitado)
   */
  async setup(): Promise<void> {
    const { enabled } = SERVICE_WORKER_CONFIG;

    if (!enabled) {
      // Garantir que não há Service Workers
      await this.unregisterAll();
      return;
    }

    // Aqui você pode implementar a lógica para registrar um novo Service Worker
    // se desejar manter habilitado no futuro
    console.log("Service Worker está desabilitado na configuração");
  }

  /**
   * Inicializa o gerenciador
   */
  async initialize(): Promise<void> {
    // Sempre remove Service Workers por enquanto
    await this.unregisterAll();

    // Adiciona listener para prevenir novo registro
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        console.log(
          "Service Worker controller changed - preventing new registration"
        );
        this.unregisterAll();
      });

      // Também monitorar novos registros - removendo o parâmetro não usado
      navigator.serviceWorker.addEventListener("register", () => {
        console.log("Novo Service Worker registrado - removendo");
        this.unregisterAll();
      });
    }
  }
}

export const serviceWorkerManager = ServiceWorkerManager.getInstance();
