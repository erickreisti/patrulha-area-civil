"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";

// Ícones
import { RiMenuLine, RiCloseLine, RiHomeLine } from "react-icons/ri";

// Componentes compartilhados
import { SearchComponent } from "../shared/SearchComponent";
import { NotificationsDropdown } from "../shared/NotificationsDropdown";
import { UserProfileDropdown } from "../shared/UserProfileDropdown";

// Componentes mobile
import { MobileSidebar } from "./MobileSidebar";
import LogoHeader from "./LogoHeader";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 flex-shrink-0 border-b border-gray-200 bg-white shadow-lg">
      {/* Container principal com altura aumentada */}
      <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
        {/* Menu Mobile e Logo */}
        <div className="flex items-center space-x-6">
          {/* Menu Mobile (Hambúrguer) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-gray-600 hover:text-navy hover:bg-gray-100 rounded-lg"
                aria-label="Abrir menu"
              >
                <RiMenuLine className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 bg-white">
              <div className="flex justify-end p-4">
                <button
                  type="button"
                  className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                  onClick={() => {
                    const openSheet = document.querySelector(
                      '[data-state="open"]'
                    ) as HTMLElement;
                    openSheet?.click();
                  }}
                  aria-label="Fechar menu"
                >
                  <RiCloseLine className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              <div className="px-6 pb-6">
                <LogoHeader className="mb-8" />
                <MobileSidebar />
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo Desktop - Container maior */}
          <div className="hidden lg:flex items-center">
            <LogoHeader compact />
          </div>
        </div>

        {/* Sistema de Busca */}
        <div className="flex-1 max-w-2xl mx-4">
          <SearchComponent />
        </div>

        {/* Ações e Perfil */}
        <div className="flex items-center space-x-4">
          {/* Link para Site Público */}
          <Button
            variant="outline"
            size="default"
            asChild
            className="text-gray-700 hover:text-navy border-gray-300 hover:border-navy hover:bg-navy/5 hidden sm:flex items-center gap-2 py-2 px-4 rounded-lg"
          >
            <Link href="/" target="_blank" rel="noopener noreferrer">
              <RiHomeLine className="h-5 w-5" />
              <span className="font-medium">Ver Site</span>
            </Link>
          </Button>

          {/* Notificações */}
          <div className="relative">
            <NotificationsDropdown />
          </div>

          {/* Perfil do Usuário - Container mais destacado */}
          <div className="border-l border-gray-200 pl-4">
            <UserProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
