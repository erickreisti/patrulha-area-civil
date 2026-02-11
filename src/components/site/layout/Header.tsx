"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/cn";
import {
  RiFacebookFill,
  RiInstagramLine,
  RiWhatsappLine,
  RiMenuLine,
  RiUserLine,
  RiLogoutBoxRLine,
  RiBarChartLine,
  RiTwitterXLine,
  RiCloseLine,
} from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/stores/useAuthStore";

// --- DADOS ---
const NAVIGATION = [
  { name: "MISSÃO", href: "/sobre" },
  { name: "SERVIÇOS", href: "/servicos" },
  { name: "ATIVIDADES", href: "/atividades" },
  { name: "NOTÍCIAS", href: "/noticias" },
  { name: "GALERIA", href: "/galeria" },
  { name: "CONTATO", href: "/contato" },
];

const SOCIAL_ICONS = [
  {
    icon: RiFacebookFill,
    href: "https://facebook.com/patrulhaaereacivil",
    label: "Facebook",
    hoverColor: "hover:bg-blue-600",
  },
  {
    icon: RiTwitterXLine,
    href: "https://twitter.com/patrulhaaereacivil",
    label: "X (Twitter)",
    hoverColor: "hover:bg-slate-900",
  },
  {
    icon: RiInstagramLine,
    href: "https://instagram.com/patrulhaaereacivil",
    label: "Instagram",
    hoverColor: "hover:bg-pink-600",
  },
  {
    icon: RiWhatsappLine,
    href: "https://wa.me/5521999999999",
    label: "WhatsApp",
    hoverColor: "hover:bg-green-600",
  },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  id?: string;
}

// --- SUB-COMPONENTES ---

const TopBar = () => (
  <div
    className="bg-pac-primary w-full py-2 text-white relative z-40"
    role="complementary"
    aria-label="Barra superior institucional"
  >
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center gap-2">
        {/* Identificação Brasil */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Image
            src="/images/logos/flag-br.webp"
            alt="Bandeira do Brasil"
            width={24}
            height={16}
            className="rounded-[2px] shadow-sm w-auto h-3 lg:h-4 flex-shrink-0"
            style={{ width: "auto", height: "auto" }}
            priority
          />
          <span className="text-[9px] xs:text-[10px] sm:text-xs font-bold tracking-widest uppercase opacity-90 truncate">
            República Federativa do Brasil
          </span>
        </div>

        {/* Redes Sociais */}
        <div
          className="flex gap-2 flex-shrink-0"
          role="list"
          aria-label="Redes sociais"
        >
          {SOCIAL_ICONS.map((social) => {
            const IconComponent = social.icon;
            return (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "w-5 h-5 flex items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300",
                  social.hoverColor,
                  "hover:scale-110 hover:shadow-md border border-white/10 hover:border-transparent",
                )}
                aria-label={social.label}
              >
                <IconComponent className="w-2.5 h-2.5" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  </div>
);

const Logo = () => (
  <Link
    href="/"
    className="flex items-center gap-2 xs:gap-3 lg:gap-4 group py-1 min-w-0"
    aria-label="Ir para página inicial"
  >
    {/* LOGO */}
    <div className="relative h-14 xs:h-20 lg:h-28 w-auto aspect-[3/4] transition-all duration-300 group-hover:scale-105 drop-shadow-lg filter flex-shrink-0">
      <Image
        src="/images/logos/logo.webp"
        alt="Brasão da Patrulha Aérea Civil"
        width={0}
        height={0}
        sizes="(max-width: 425px) 60px, (max-width: 1024px) 100px, 120px"
        className="object-contain"
        style={{ width: "auto", height: "100%" }}
        priority
      />
    </div>

    {/* TEXTO */}
    <div className="flex flex-col justify-center border-l-2 border-slate-100 pl-2 xs:pl-4 min-w-0">
      <h1
        className="font-black text-pac-primary-light tracking-tighter leading-none uppercase transition-colors group-hover:text-pac-primary-soft whitespace-nowrap
        text-sm         /* Mobile */
        xs:text-lg      /* Tablet */
        lg:text-xl      /* Desktop */
        xl:text-2xl     /* Telas grandes */
      "
      >
        Patrulha Aérea Civil
      </h1>

      <p
        className="font-bold text-slate-500 uppercase leading-tight mt-0.5 xs:mt-1 whitespace-nowrap
        text-[8px] tracking-normal
        xs:text-[10px] xs:tracking-[0.1em]
        lg:text-[11px] lg:tracking-[0.15em]
      "
      >
        Comando Operacional no Rio de Janeiro
      </p>
    </div>
  </Link>
);

const NavigationItem = ({
  item,
  isActive,
  onClick,
}: {
  item: (typeof NAVIGATION)[0];
  isActive: boolean;
  onClick?: () => void;
}) => (
  <li className="relative h-full flex items-center">
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "text-xs xl:text-sm font-bold uppercase tracking-wider py-2 px-2 xl:px-3 relative transition-colors duration-300",
        isActive ? "text-pac-primary" : "text-slate-600 hover:text-pac-primary",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {item.name}
      <span
        className={cn(
          "absolute bottom-0 left-0 h-0.5 bg-pac-primary transition-all duration-300 rounded-full",
          isActive ? "w-full" : "w-0 hover:w-full",
        )}
      />
    </Link>
  </li>
);

const LoadingButton = () => (
  <Button
    className="bg-slate-100 text-slate-400 font-medium px-4 py-2 h-10 rounded-full text-xs uppercase tracking-wide cursor-wait"
    disabled
  >
    <div className="animate-spin rounded-full h-3 w-3 border-2 border-slate-300 border-t-transparent mr-2" />
    Carregando...
  </Button>
);

const IdentificationButton = () => {
  const { user, profile, isAdmin, isLoading, logout } = useAuthStore();
  const pathname = usePathname();
  const isOnProfilePage = pathname === "/perfil";

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Erro logout:", error);
    }
  }, [logout]);

  if (isLoading) return <LoadingButton />;

  if (user && profile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="rounded-full border-slate-200 pl-1 pr-4 py-1 h-10 xl:h-11 hover:bg-slate-50 hover:border-pac-primary/30 transition-all shadow-sm group"
          >
            <Avatar className="h-7 w-7 xl:h-8 xl:w-8 border border-slate-200 mr-2 group-hover:scale-105 transition-transform">
              <AvatarImage
                src={profile.avatar_url || ""}
                className="object-cover"
              />
              <AvatarFallback className="bg-pac-primary text-white text-[10px]">
                {profile.full_name?.substring(0, 2).toUpperCase() || "AG"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start text-left">
              <span className="text-[9px] xl:text-[10px] font-bold text-slate-400 uppercase leading-none mb-0.5">
                Olá, Agente
              </span>
              <span className="text-[11px] xl:text-xs font-bold text-pac-primary leading-none truncate max-w-[80px] xl:max-w-[100px]">
                {profile.full_name?.split(" ")[0]}
              </span>
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-60 p-2" align="end">
          <DropdownMenuLabel className="font-normal p-3 bg-slate-50 rounded-md mb-2">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-bold text-slate-800 leading-none">
                {profile.full_name}
              </p>
              <p className="text-xs text-slate-500 leading-none">
                {profile.matricula || user.email}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuGroup>
            {!isOnProfilePage && (
              <DropdownMenuItem
                onClick={() => (window.location.href = "/perfil")}
                className="cursor-pointer font-medium text-slate-600"
              >
                <RiUserLine className="mr-2 h-4 w-4" /> Meu Perfil
              </DropdownMenuItem>
            )}
            {isAdmin && (
              <DropdownMenuItem
                onClick={() => (window.location.href = "/admin/dashboard")}
                className="cursor-pointer font-medium text-purple-600 focus:text-purple-700 focus:bg-purple-50"
              >
                <RiBarChartLine className="mr-2 h-4 w-4" /> Dashboard
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleSignOut}
            className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 font-medium"
          >
            <RiLogoutBoxRLine className="mr-2 h-4 w-4" /> Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      className="rounded-full bg-pac-primary hover:bg-pac-primary-dark text-white font-bold text-xs uppercase tracking-wider px-5 xl:px-6 h-10 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
      asChild
    >
      <Link href="/login">Identificação</Link>
    </Button>
  );
};

const MobileMenu = ({
  isOpen,
  onClose,
  pathname,
  id = "mobile-menu",
}: MobileMenuProps) => {
  const { user, logout } = useAuthStore();

  const handleSignOut = async () => {
    await logout();
    onClose();
    window.location.href = "/";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 min-[1400px]:hidden"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-white z-[60] min-[1400px]:hidden shadow-2xl flex flex-col"
            id={id}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <span className="font-black text-slate-800 text-lg uppercase">
                Menu
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-slate-100"
              >
                <RiCloseLine className="w-6 h-6 text-slate-500" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <nav className="flex flex-col space-y-2">
                {NAVIGATION.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center p-3 rounded-xl text-sm font-bold uppercase tracking-wide transition-colors",
                      pathname.startsWith(item.href)
                        ? "bg-pac-primary/10 text-pac-primary"
                        : "text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50">
              {user ? (
                <div className="flex flex-col gap-3">
                  <Link href="/perfil" onClick={onClose}>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-slate-200 bg-white hover:bg-white hover:border-pac-primary text-slate-700"
                    >
                      <RiUserLine className="mr-2 h-4 w-4" /> Meu Perfil
                    </Button>
                  </Link>
                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <RiLogoutBoxRLine className="mr-2 h-4 w-4" /> Sair
                  </Button>
                </div>
              ) : (
                <Link href="/login" onClick={onClose}>
                  <Button className="w-full bg-pac-primary hover:bg-pac-primary-dark text-white font-bold uppercase rounded-xl h-12 shadow-md">
                    Identificação
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- COMPONENTE PRINCIPAL ---

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [initialize]);

  return (
    <>
      <TopBar />

      <header
        className={cn(
          "bg-white sticky top-0 left-0 right-0 z-50 w-full border-b border-gray-100",
          "transition-shadow duration-300 ease-in-out",
          scrolled ? "shadow-md" : "shadow-sm",
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 xs:h-28 lg:h-32 gap-3 lg:gap-6">
            {/* Logo */}
            <div className="flex-shrink-0 min-w-0">
              <Logo />
            </div>

            {/* Desktop Nav - Breakpoint 1400px Arbitrário */}
            <div className="hidden min-[1400px]:flex items-center gap-4 lg:gap-6 h-full flex-shrink-0">
              <nav className="h-full">
                <ul className="flex gap-4 lg:gap-6 h-full items-center">
                  {NAVIGATION.map((item) => (
                    <NavigationItem
                      key={item.name}
                      item={item}
                      isActive={pathname.startsWith(item.href)}
                    />
                  ))}
                </ul>
              </nav>
              <div className="pl-4 lg:pl-6 border-l border-gray-200 h-8 flex items-center">
                <IdentificationButton />
              </div>
            </div>

            {/* Mobile/Tablet Toggle (Até 1400px) */}
            <div className="min-[1400px]:hidden flex items-center gap-2 xs:gap-4 flex-shrink-0">
              <div className="hidden md:block">
                <IdentificationButton />
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(true)}
                className="text-slate-800 hover:bg-slate-100 rounded-full w-9 h-9 xs:w-12 xs:h-12 flex-shrink-0"
              >
                <RiMenuLine className="w-5 h-5 xs:w-8 xs:h-8" />
              </Button>
            </div>
          </div>
        </div>

        <MobileMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          pathname={pathname}
        />
      </header>
    </>
  );
}
