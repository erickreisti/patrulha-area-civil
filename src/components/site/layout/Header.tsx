// src/components/site/layout/Header.tsx

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

const TopBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    const debouncedScroll = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(handleScroll, 10);
    };

    window.addEventListener("scroll", debouncedScroll);
    return () => {
      window.removeEventListener("scroll", debouncedScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={cn(
        "bg-navy py-1.5 xs:py-2 transition-all duration-300",
        scrolled ? "shadow-md" : ""
      )}
      role="complementary"
      aria-label="Barra superior"
    >
      <div className="container mx-auto px-3 xs:px-4 sm:px-6">
        <div className="flex justify-between items-center text-white text-xs xs:text-sm">
          <div className="flex md:hidden items-center gap-1.5 xs:gap-2">
            <Image
              src="/images/logos/flag-br.webp"
              alt="Bandeira do Brasil"
              width={20}
              height={14}
              className="rounded-sm w-auto h-auto min-w-[20px]"
              priority
            />
            <span className="text-slate-200 font-medium truncate text-[10px] xs:text-xs">
              Brasil
            </span>
          </div>

          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <Image
              src="/images/logos/flag-br.webp"
              alt="Bandeira do Brasil"
              width={22}
              height={15}
              className="rounded-sm w-auto h-auto"
              priority
            />
            <span className="text-slate-200 font-medium font-roboto text-xs lg:text-sm xl:text-base">
              República Federativa do Brasil
            </span>
          </div>

          <div
            className="flex gap-1 xs:gap-1.5 sm:gap-2"
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
                    "w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8",
                    "bg-white/10 rounded-full flex items-center justify-center text-white",
                    "no-underline transition-all duration-300 border border-white/20",
                    social.hoverColor,
                    "hover:border-transparent hover:scale-110 hover:shadow-lg",
                    "touch-optimize active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
                  )}
                  aria-label={social.label}
                  role="listitem"
                >
                  <IconComponent className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Logo = () => {
  return (
    <Link
      href="/"
      className="flex items-center group transition-all duration-300 gap-1.5 xs:gap-2 md:gap-3 lg:gap-4"
      aria-label="Página inicial da Patrulha Aérea Civil"
      role="banner"
    >
      <div className="relative w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 transition-all duration-300 flex-shrink-0">
        <Image
          src="/images/logos/logo.webp"
          alt="Patrulha Aérea Civil"
          width={48}
          height={48}
          className="object-contain drop-shadow-md transition-all duration-300 group-hover:scale-105 w-full h-full"
          priority
        />
      </div>

      <div className="text-left transition-all duration-300 min-w-0 flex-1">
        <h1 className="font-bebas bg-gradient-to-r from-navy to-navy-700 bg-clip-text text-transparent tracking-wider uppercase leading-tight transition-all duration-300 text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl truncate">
          PATRULHA AÉREA CIVIL
        </h1>
        <p className="text-slate-600 leading-tight mt-0.5 font-roboto transition-all duration-300 text-[9px] xs:text-[10px] sm:text-xs md:text-sm truncate">
          COMANDO OPERACIONAL NO ESTADO DO RIO DE JANEIRO
        </p>
      </div>
    </Link>
  );
};

const NavigationItem = ({
  item,
  isActive,
  onClick,
}: {
  item: (typeof NAVIGATION)[0];
  isActive: boolean;
  onClick?: () => void;
}) => (
  <li className="relative" role="none">
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "no-underline text-slate-700 font-medium py-1.5 xs:py-2 px-1 transition-all duration-300",
        "uppercase tracking-wider font-roboto relative group/navlink w-fit",
        isActive
          ? "text-navy font-semibold"
          : "text-slate-600 hover:text-navy hover:font-semibold",
        "touch-optimize active:scale-95",
        "text-xs xs:text-sm sm:text-base"
      )}
      aria-current={isActive ? "page" : undefined}
      role="menuitem"
    >
      <span className="relative z-10 transition-colors duration-300">
        {item.name}
      </span>
      <div
        className={cn(
          "absolute -bottom-1 left-0 w-0 h-0.5 bg-navy transition-all duration-300",
          isActive ? "w-full" : "group-hover/navlink:w-full"
        )}
        aria-hidden="true"
      />
    </Link>
  </li>
);

const DesktopNavigation = ({ pathname }: { pathname: string }) => (
  <nav
    className="flex items-center transition-all duration-300"
    aria-label="Navegação principal"
    role="navigation"
  >
    <ul
      className="flex list-none gap-1.5 xs:gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 m-0 p-0 transition-all duration-300 flex-wrap justify-center"
      role="menubar"
    >
      {NAVIGATION.map((item) => (
        <NavigationItem
          key={item.name}
          item={item}
          isActive={pathname.startsWith(item.href)}
        />
      ))}
    </ul>
  </nav>
);

const LoadingButton = () => {
  return (
    <Button
      className="bg-navy hover:bg-navy-700 text-white font-medium px-3 xs:px-4 py-2 text-xs xs:text-sm uppercase tracking-wider transition-all duration-300 font-roboto border-0 min-h-[36px] xs:min-h-[40px] sm:min-h-[44px] relative overflow-hidden cursor-not-allowed shadow-md"
      disabled
      aria-label="Carregando..."
      aria-busy="true"
    >
      <div className="flex items-center justify-center gap-1.5 xs:gap-2 relative z-10">
        <div className="animate-spin rounded-full h-3 xs:h-4 w-3 xs:w-4 border-2 border-white border-t-transparent" />
        <span className="text-white font-medium text-[10px] xs:text-xs sm:text-sm">
          Carregando...
        </span>
      </div>
    </Button>
  );
};

const IdentificationButton = () => {
  const { user, profile, isAdmin, isLoading, logout } = useAuthStore();
  const pathname = usePathname();
  const isOnProfilePage = pathname === "/perfil";

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }, [logout]);

  // Mostrar botão de loading APENAS durante os primeiros 2 segundos
  // para evitar que fique "carregando" permanentemente
  if (isLoading) {
    return <LoadingButton />;
  }

  // Se o usuário estiver logado, mostrar dropdown com "Identificação"
  if (user && profile) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="bg-navy hover:bg-navy-700 text-white font-medium px-3 xs:px-4 py-1.5 xs:py-2.5 text-xs xs:text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg font-roboto border-0 group/button relative overflow-hidden shadow-md min-h-[36px] xs:min-h-[40px] sm:min-h-[44px] touch-optimize active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Menu do usuário"
            role="button"
          >
            <span className="relative z-10 text-white text-[10px] xs:text-xs sm:text-sm truncate">
              IDENTIFICAÇÃO
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 xs:w-60 sm:w-64 max-w-[90vw]"
          align="end"
          sideOffset={6}
          collisionPadding={12}
          role="menu"
        >
          <DropdownMenuLabel className="p-3 xs:p-4 border-b border-slate-200">
            <div className="flex items-center gap-2 xs:gap-3">
              <Avatar className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 border-2 border-navy/20 flex-shrink-0">
                <AvatarImage
                  src={profile?.avatar_url || ""}
                  alt={`Avatar de ${profile?.full_name || "Agente"}`}
                  className="object-cover object-center"
                  sizes="40px"
                />
                <AvatarFallback className="bg-navy text-white text-xs">
                  <RiUserLine className="w-4 h-4 xs:w-5 xs:h-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs xs:text-sm font-semibold text-slate-800 truncate">
                  {profile?.full_name || "Agente PAC"}
                </p>
                <p className="text-[10px] xs:text-xs text-slate-600 truncate">
                  {profile?.matricula
                    ? `Matrícula: ${profile.matricula}`
                    : user.email}
                </p>
                <p className="text-[10px] xs:text-xs text-navy font-medium capitalize truncate">
                  {profile?.graduacao || "Agente"} {isAdmin ? "• Admin" : ""}
                </p>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuGroup className="p-1.5 xs:p-2" role="group">
            {!isOnProfilePage && (
              <DropdownMenuItem asChild role="menuitem">
                <Link
                  href="/perfil"
                  className="cursor-pointer text-xs xs:text-sm focus:outline-none focus:bg-slate-100 py-2"
                >
                  <RiUserLine className="w-3.5 h-3.5 xs:w-4 xs:h-4 mr-2 text-blue-600 flex-shrink-0" />
                  <span className="truncate">Ver Meu Perfil</span>
                </Link>
              </DropdownMenuItem>
            )}

            {isAdmin && (
              <DropdownMenuItem asChild role="menuitem">
                <Link
                  href="/admin/dashboard"
                  className="cursor-pointer text-xs xs:text-sm focus:outline-none focus:bg-slate-100 py-2"
                >
                  <RiBarChartLine className="w-3.5 h-3.5 xs:w-4 xs:h-4 mr-2 text-purple-600 flex-shrink-0" />
                  <span className="truncate">Ir ao Dashboard</span>
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup className="p-1.5 xs:p-2" role="group">
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 text-xs xs:text-sm focus:outline-none py-2"
              role="menuitem"
            >
              <RiLogoutBoxRLine className="w-3.5 h-3.5 xs:w-4 xs:h-4 mr-2 flex-shrink-0" />
              <span className="truncate">Sair do Sistema</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Se não estiver logado, mostrar botão normal de login
  return (
    <Button
      className="bg-navy hover:bg-navy-700 text-white font-medium px-3 xs:px-4 py-1.5 xs:py-2.5 text-xs xs:text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg font-roboto border-0 group/button relative overflow-hidden shadow-md min-h-[36px] xs:min-h-[40px] sm:min-h-[44px] touch-optimize active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
      asChild
    >
      <Link href="/login" aria-label="Fazer login" role="button">
        <span className="relative z-10 text-white text-[10px] xs:text-xs sm:text-sm truncate">
          IDENTIFICAÇÃO
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000" />
      </Link>
    </Button>
  );
};

const MobileMenu = ({
  isOpen,
  onClose,
  pathname,
  id = "mobile-menu",
}: MobileMenuProps) => {
  const { user, profile, isAdmin, logout } = useAuthStore();
  const isOnProfilePage = pathname === "/perfil";

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
      onClose();
      window.location.href = "/";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }, [logout, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 xl:hidden"
            aria-hidden="true"
            role="presentation"
          />

          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 right-0 w-full bg-white z-50 xl:hidden overflow-y-auto shadow-xl"
            style={{ maxHeight: "100vh" }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            id={id}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-3 xs:p-4 border-b border-slate-200 bg-white">
                <h2 className="text-lg xs:text-xl font-semibold text-navy">
                  Menu
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 xs:p-2 rounded-lg hover:bg-slate-100 transition-colors touch-optimize focus:outline-none focus:ring-2 focus:ring-navy/50"
                  aria-label="Fechar menu"
                  type="button"
                >
                  <RiCloseLine className="w-5 h-5 xs:w-6 xs:h-6 text-slate-700" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 xs:p-4">
                <h3 className="text-xs xs:text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 xs:mb-3 px-2">
                  Navegação
                </h3>
                <nav className="space-y-1" role="navigation">
                  {NAVIGATION.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center px-2 xs:px-3 py-2 xs:py-3 text-xs xs:text-sm font-medium rounded-md transition-colors duration-200",
                        "focus:outline-none focus:ring-2 focus:ring-navy/50",
                        pathname.startsWith(item.href)
                          ? "bg-navy/10 text-navy border-r-2 border-navy"
                          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      )}
                      role="menuitem"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                {user ? (
                  <div className="border-t border-slate-200 pt-4 xs:pt-6 mt-4 xs:mt-6">
                    <div className="flex items-center gap-2 xs:gap-3 px-2 xs:px-3 py-2 xs:py-3 bg-slate-50 rounded-lg mb-2 xs:mb-3">
                      <Avatar className="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 border-2 border-navy/20 flex-shrink-0">
                        <AvatarImage
                          src={profile?.avatar_url || ""}
                          alt={`Avatar de ${profile?.full_name || "Agente"}`}
                          className="object-cover object-center"
                          sizes="40px"
                        />
                        <AvatarFallback className="bg-navy text-white text-xs">
                          <RiUserLine className="w-4 h-4 xs:w-5 xs:h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs xs:text-sm font-semibold text-slate-800 truncate">
                          {profile?.full_name || "Agente PAC"}
                        </p>
                        <p className="text-[10px] xs:text-xs text-slate-600 truncate">
                          {profile?.matricula
                            ? `Matrícula: ${profile.matricula}`
                            : user.email}
                        </p>
                        <p className="text-[10px] xs:text-xs text-navy font-medium capitalize">
                          {profile?.graduacao || "Agente"}{" "}
                          {isAdmin ? "• Admin" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {!isOnProfilePage && (
                        <Link
                          href="/perfil"
                          className="flex items-center px-2 xs:px-3 py-2 xs:py-3 text-xs xs:text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-navy/50"
                          onClick={onClose}
                          role="menuitem"
                        >
                          <RiUserLine className="w-3.5 h-3.5 xs:w-4 xs:h-4 mr-2 xs:mr-3 text-blue-600 flex-shrink-0" />
                          Ver Meu Perfil
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center px-2 xs:px-3 py-2 xs:py-3 text-xs xs:text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-navy/50"
                          onClick={onClose}
                          role="menuitem"
                        >
                          <RiBarChartLine className="w-3.5 h-3.5 xs:w-4 xs:h-4 mr-2 xs:mr-3 text-purple-600 flex-shrink-0" />
                          Ir ao Dashboard
                        </Link>
                      )}

                      <button
                        onClick={handleSignOut}
                        className="flex items-center w-full px-2 xs:px-3 py-2 xs:py-3 text-xs xs:text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 text-left focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        role="menuitem"
                        type="button"
                      >
                        <RiLogoutBoxRLine className="w-3.5 h-3.5 xs:w-4 xs:h-4 mr-2 xs:mr-3 flex-shrink-0" />
                        Sair do Sistema
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-slate-200 pt-4 xs:pt-6 mt-4 xs:mt-6">
                    <Button
                      className="w-full bg-navy hover:bg-navy-700 text-white font-medium py-2 xs:py-3 text-xs xs:text-sm uppercase tracking-wider font-roboto border-0 group/button relative overflow-hidden shadow-md transition-all duration-300 touch-optimize focus:outline-none focus:ring-2 focus:ring-white/50"
                      asChild
                    >
                      <Link href="/login" onClick={onClose} role="button">
                        <span className="relative z-10 text-xs xs:text-sm">
                          IDENTIFICAÇÃO
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000" />
                      </Link>
                    </Button>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-4 xs:pt-6 mt-4 xs:mt-6">
                  <h3 className="text-xs xs:text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2 xs:mb-3 px-2">
                    Redes Sociais
                  </h3>
                  <div
                    className="flex justify-center gap-1.5 xs:gap-2 px-2"
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
                            "w-7 h-7 xs:w-8 xs:h-8 sm:w-9 sm:h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 no-underline transition-all duration-300 hover:shadow-lg",
                            "focus:outline-none focus:ring-2 focus:ring-navy/50",
                            social.hoverColor,
                            "hover:text-white hover:scale-110 touch-optimize"
                          )}
                          aria-label={social.label}
                          onClick={onClose}
                          role="listitem"
                        >
                          <IconComponent className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 p-3 xs:p-4 bg-slate-50">
                <div className="text-center text-[10px] xs:text-xs text-slate-500">
                  <p>© {new Date().getFullYear()} Patrulha Aérea Civil</p>
                  <p className="mt-0.5 xs:mt-1">Todos os direitos reservados</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const pathname = usePathname();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { initialize } = useAuthStore();

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  // Inicializar auth store no mount do componente
  useEffect(() => {
    const initAuth = async () => {
      try {
        await initialize();
      } catch (error) {
        console.error("Erro ao inicializar autenticação:", error);
      } finally {
        setInitLoading(false);
      }
    };

    initAuth();
  }, [initialize]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const debouncedScroll = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(handleScroll, 10);
    };

    window.addEventListener("scroll", debouncedScroll);
    return () => {
      window.removeEventListener("scroll", debouncedScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Se ainda estiver carregando a inicialização, mostrar versão simplificada
  if (initLoading) {
    return (
      <header
        className={cn(
          "bg-white sticky top-0 left-0 right-0 z-50 min-h-[80px] xs:min-h-[85px] md:min-h-[90px] lg:min-h-[100px] xl:min-h-[120px] shadow-sm"
        )}
        role="banner"
        aria-label="Cabeçalho principal"
      >
        <TopBar />
        <div className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-3 xs:px-4 sm:px-6">
            <div className="flex items-center justify-between w-full py-2 xs:py-3">
              <Logo />
              <LoadingButton />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        "bg-white sticky top-0 left-0 right-0 z-50 min-h-[80px] xs:min-h-[85px] md:min-h-[90px] lg:min-h-[100px] xl:min-h-[120px] transition-all duration-300",
        scrolled ? "shadow-lg" : "shadow-sm"
      )}
      role="banner"
      aria-label="Cabeçalho principal"
    >
      <TopBar />

      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-3 xs:px-4 sm:px-6">
          <div className="flex md:hidden items-center justify-between w-full py-2 xs:py-3">
            <Logo />
            <div className="flex items-center gap-1.5 xs:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="text-slate-700 hover:bg-slate-100 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 transition-all duration-300 hover:scale-110 touch-optimize focus:outline-none focus:ring-2 focus:ring-navy/50"
                aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                role="button"
              >
                <RiMenuLine className="h-4 w-4 xs:h-5 xs:w-5" />
              </Button>
            </div>
          </div>

          <div className="hidden md:flex xl:hidden items-center justify-between w-full py-2.5 xs:py-3">
            <Logo />
            <div className="flex items-center gap-2 xs:gap-3">
              <IdentificationButton />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="text-slate-700 hover:bg-slate-100 w-9 h-9 xs:w-10 xs:h-10 transition-all duration-300 hover:scale-110 touch-optimize focus:outline-none focus:ring-2 focus:ring-navy/50"
                aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                role="button"
              >
                <RiMenuLine className="h-4 w-4 xs:h-5 xs:w-5" />
              </Button>
            </div>
          </div>

          <div className="hidden xl:flex items-center justify-between w-full py-3 xs:py-4">
            <Logo />
            <DesktopNavigation pathname={pathname} />
            <IdentificationButton />
          </div>
        </div>
      </div>

      <MobileMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        pathname={pathname}
        id="mobile-menu"
      />
    </header>
  );
}
