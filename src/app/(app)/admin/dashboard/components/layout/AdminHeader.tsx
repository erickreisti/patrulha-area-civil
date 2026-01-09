"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";

// Ícones
import { RiMenuLine, RiHomeLine } from "react-icons/ri";

// Componentes compartilhados
import { SearchComponent } from "../shared/SearchComponent";
import { NotificationsDropdown } from "../shared/NotificationsDropdown";
import { UserProfileDropdown } from "../shared/UserProfileDropdown";

// Componentes mobile
import LogoHeader from "./LogoHeader";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 flex-shrink-0 border-b border-gray-200 bg-white shadow-lg lg:ml-64">
      {/* ADICIONEI lg:ml-64 aqui para alinhar com sidebar no desktop */}
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
                aria-label="Abrir menu de navegação"
              >
                <RiMenuLine className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 bg-white">
              {/* ... conteúdo do sheet ... */}
            </SheetContent>
          </Sheet>

          {/* Logo Desktop */}
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
          {/* Link para Site Público (Desktop) */}
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

          {/* Perfil do Usuário */}
          <div className="border-l border-gray-200 pl-4">
            <UserProfileDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
