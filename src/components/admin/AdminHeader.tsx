"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { RiMenuLine, RiShareBoxLine } from "react-icons/ri";

// ✅ Imports corrigidos (apontando para a pasta criada acima)
import { SearchComponent } from "./shared/SearchComponent";
import { NotificationsDropdown } from "./shared/NotificationsDropdown";
import { UserProfileDropdown } from "./shared/UserProfileDropdown";

import LogoHeader from "./LogoHeader";
import { NavItem } from "./NavItem";
import { adminNavigation } from "@/config/admin-navigation";

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md shadow-sm lg:pl-64 transition-all duration-300">
      <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Lado Esquerdo: Mobile Trigger & Mobile Logo */}
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-slate-600 hover:text-sky-700 hover:bg-sky-50"
                aria-label="Abrir menu"
              >
                <RiMenuLine className="h-6 w-6" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-72 p-0 bg-white border-r border-slate-200"
            >
              <VisuallyHidden>
                <SheetTitle>Menu de Navegação</SheetTitle>
                <SheetDescription>
                  Navegue pelas opções do sistema
                </SheetDescription>
              </VisuallyHidden>

              <div className="flex h-20 items-center justify-center border-b border-slate-100">
                <LogoHeader compact />
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4">
                <nav className="space-y-1">
                  {adminNavigation.map((item) => (
                    <NavItem key={item.href} item={item} />
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Centro: Busca */}
        <div className="flex-1 max-w-xl mx-4 lg:mx-8 hidden sm:block">
          <SearchComponent />
        </div>

        {/* Lado Direito: Ações */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Botão Ver Site (Desktop) */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="hidden md:flex text-slate-500 hover:text-sky-700 hover:bg-sky-50 gap-2"
          >
            <Link href="/" target="_blank" rel="noopener noreferrer">
              <RiShareBoxLine className="h-4 w-4" />
              <span className="font-medium">Site</span>
            </Link>
          </Button>

          {/* Divisor */}
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Notificações */}
          <NotificationsDropdown />

          {/* Perfil */}
          <UserProfileDropdown />
        </div>
      </div>
    </header>
  );
}
