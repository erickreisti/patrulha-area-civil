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
import { cn } from "@/lib/utils";
import { debounce } from "@/lib/debounce";
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
  RiSearchLine,
} from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";

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

const TopBar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = debounce(() => {
      setScrolled(window.scrollY > 10);
    }, 10);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "bg-navy py-2 transition-all duration-300",
        scrolled ? "shadow-md" : ""
      )}
      role="complementary"
      aria-label="Barra superior"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center text-white text-sm">
          <div className="flex md:hidden items-center gap-2">
            <Image
              src="/images/logos/flag-br.webp"
              alt="Bandeira do Brasil"
              width={24}
              height={16}
              className="rounded-sm"
              style={{ width: "auto", height: "auto" }}
              priority
            />
            <span className="text-slate-200 text-xs font-medium truncate max-w-[120px] xs:max-w-none">
              Brasil
            </span>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Image
              src="/images/logos/flag-br.webp"
              alt="Bandeira do Brasil"
              width={24}
              height={16}
              className="rounded-sm"
              style={{ width: "auto", height: "auto" }}
              priority
            />
            <span className="text-slate-200 font-medium font-roboto text-sm lg:text-base">
              República Federativa do Brasil
            </span>
          </div>
          <div
            className="flex gap-1 sm:gap-2"
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
                    "w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8",
                    "bg-white/10 rounded-full flex items-center justify-center text-white",
                    "no-underline transition-all duration-300 border border-white/20",
                    social.hoverColor,
                    "hover:border-transparent hover:scale-110 hover:shadow-lg",
                    "touch-optimize active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
                  )}
                  aria-label={social.label}
                  role="listitem"
                >
                  <IconComponent className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
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
      className="flex items-center group transition-all duration-300 gap-2 md:gap-3 lg:gap-4"
      aria-label="Página inicial da Patrulha Aérea Civil"
      role="banner"
    >
      <div className="relative w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 transition-all duration-300 flex-shrink-0">
        <Image
          src="/images/logos/logo.webp"
          alt="Patrulha Aérea Civil"
          width={56}
          height={56}
          className="object-contain drop-shadow-md transition-all duration-300 group-hover:scale-105"
          style={{ width: "auto", height: "auto" }}
          priority
        />
      </div>
      <div className="text-left transition-all duration-300 min-w-0">
        <h1 className="font-bebas bg-gradient-to-r from-navy to-navy-700 bg-clip-text text-transparent tracking-wider uppercase leading-tight transition-all duration-300 text-lg sm:text-xl md:text-2xl lg:text-3xl truncate">
          PATRULHA AÉREA CIVIL
        </h1>
        <p className="text-slate-600 leading-tight mt-0.5 font-roboto transition-all duration-300 text-xs md:text-sm truncate">
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
        "no-underline text-slate-700 font-medium py-2 px-1 transition-all duration-300",
        "uppercase tracking-wider font-roboto relative group/navlink text-sm w-fit",
        isActive
          ? "text-navy font-semibold"
          : "text-slate-600 hover:text-navy hover:font-semibold",
        "touch-optimize active:scale-95"
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
      className="flex list-none gap-3 lg:gap-4 xl:gap-6 m-0 p-0 transition-all duration-300"
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
      className="bg-navy hover:bg-navy-700 text-white font-medium px-4 py-2.5 text-sm uppercase tracking-wider transition-all duration-300 font-roboto border-0 min-h-[44px] relative overflow-hidden cursor-not-allowed shadow-md"
      disabled
      aria-label="Carregando..."
      aria-busy="true"
    >
      <div className="flex items-center justify-center gap-2 relative z-10">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
        <span className="text-white font-medium text-xs sm:text-sm">
          Carregando...
        </span>
      </div>
    </Button>
  );
};

const IdentificationButton = () => {
  const { user, profile, isAdmin, loading, clearAuth } = useAuthStore();
  const pathname = usePathname();
  const isOnProfilePage = pathname === "/perfil";

  const handleSignOut = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      clearAuth();
      localStorage.removeItem("supabase.auth.token");
      window.location.href = "/";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }, [clearAuth]);

  if (loading) {
    return <LoadingButton />;
  }

  if (!user) {
    return (
      <Button
        className="bg-navy hover:bg-navy-700 text-white font-medium px-4 py-2.5 text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg font-roboto border-0 group/button relative overflow-hidden shadow-md min-h-[44px] touch-optimize active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
        asChild
      >
        <Link href="/login" aria-label="Fazer login" role="button">
          <span className="relative z-10 text-white text-xs sm:text-sm">
            Identificação
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000" />
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="bg-navy hover:bg-navy-700 text-white font-medium px-4 py-2.5 text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg font-roboto border-0 group/button relative overflow-hidden shadow-md min-h-[44px] touch-optimize active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Menu do usuário"
          role="button"
        >
          <span className="relative z-10 text-white text-xs sm:text-sm">
            Identificação
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-64 max-w-[90vw]"
        align="end"
        sideOffset={8}
        collisionPadding={16}
        role="menu"
      >
        <DropdownMenuLabel className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-navy/20 flex-shrink-0">
              <AvatarImage
                src={profile?.avatar_url || ""}
                alt={`Avatar de ${profile?.full_name || "Agente"}`}
                className="object-cover object-center"
                sizes="40px"
              />
              <AvatarFallback className="bg-navy text-white">
                <RiUserLine className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {profile?.full_name || "Agente PAC"}
              </p>
              <p className="text-xs text-slate-600 truncate">
                {profile?.matricula
                  ? `Matrícula: ${profile.matricula}`
                  : user.email}
              </p>
              <p className="text-xs text-navy font-medium capitalize truncate">
                {profile?.graduacao || "Agente"} {isAdmin ? "• Admin" : ""}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuGroup className="p-2" role="group">
          {!isOnProfilePage && (
            <DropdownMenuItem asChild role="menuitem">
              <Link
                href="/perfil"
                className="cursor-pointer text-sm focus:outline-none focus:bg-slate-100"
              >
                <RiUserLine className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
                <span className="truncate">Ver Meu Perfil</span>
              </Link>
            </DropdownMenuItem>
          )}

          {isAdmin && (
            <DropdownMenuItem asChild role="menuitem">
              <Link
                href="/admin/dashboard"
                className="cursor-pointer text-sm focus:outline-none focus:bg-slate-100"
              >
                <RiBarChartLine className="w-4 h-4 mr-2 text-purple-600 flex-shrink-0" />
                <span className="truncate">Ir ao Dashboard</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup className="p-2" role="group">
          <DropdownMenuItem
            onClick={handleSignOut}
            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 text-sm focus:outline-none"
            role="menuitem"
          >
            <RiLogoutBoxRLine className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">Sair do Sistema</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  id?: string;
}

const MobileMenu = ({
  isOpen,
  onClose,
  pathname,
  id = "mobile-menu",
}: MobileMenuProps) => {
  const { user, profile, isAdmin, clearAuth } = useAuthStore();
  const isOnProfilePage = pathname === "/perfil";

  const handleSignOut = useCallback(async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      clearAuth();
      localStorage.removeItem("supabase.auth.token");
      onClose();
      window.location.href = "/";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  }, [clearAuth, onClose]);

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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            aria-hidden="true"
            role="presentation"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-50 lg:hidden overflow-y-auto shadow-xl"
            style={{ maxHeight: "100vh" }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navegação"
            id={id}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
                <Logo />
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors touch-optimize focus:outline-none focus:ring-2 focus:ring-navy/50"
                  aria-label="Fechar menu"
                  type="button"
                >
                  <RiCloseLine className="w-6 h-6 text-slate-700" />
                </button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto p-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                  Navegação
                </h3>
                <nav className="space-y-1" role="navigation">
                  {NAVIGATION.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors duration-200",
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

                {/* Search */}
                <div className="mt-6 px-2">
                  <div className="relative">
                    <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="search"
                      placeholder="Buscar..."
                      className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/50 focus:border-navy"
                      aria-label="Buscar no site"
                    />
                  </div>
                </div>

                {user ? (
                  <div className="border-t border-slate-200 pt-6 mt-6">
                    <div className="flex items-center gap-3 px-3 py-3 bg-slate-50 rounded-lg mb-3">
                      <Avatar className="w-10 h-10 border-2 border-navy/20 flex-shrink-0">
                        <AvatarImage
                          src={profile?.avatar_url || ""}
                          alt={`Avatar de ${profile?.full_name || "Agente"}`}
                          className="object-cover object-center"
                          sizes="40px"
                        />
                        <AvatarFallback className="bg-navy text-white">
                          <RiUserLine className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {profile?.full_name || "Agente PAC"}
                        </p>
                        <p className="text-xs text-slate-600 truncate">
                          {profile?.matricula
                            ? `Matrícula: ${profile.matricula}`
                            : user.email}
                        </p>
                        <p className="text-xs text-navy font-medium capitalize">
                          {profile?.graduacao || "Agente"}{" "}
                          {isAdmin ? "• Admin" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {!isOnProfilePage && (
                        <Link
                          href="/perfil"
                          className="flex items-center px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-navy/50"
                          onClick={onClose}
                          role="menuitem"
                        >
                          <RiUserLine className="w-4 h-4 mr-3 text-blue-600 flex-shrink-0" />
                          Ver Meu Perfil
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-navy/50"
                          onClick={onClose}
                          role="menuitem"
                        >
                          <RiBarChartLine className="w-4 h-4 mr-3 text-purple-600 flex-shrink-0" />
                          Ir ao Dashboard
                        </Link>
                      )}

                      <button
                        onClick={() => {
                          handleSignOut();
                        }}
                        className="flex items-center w-full px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 text-left focus:outline-none focus:ring-2 focus:ring-red-500/50"
                        role="menuitem"
                        type="button"
                      >
                        <RiLogoutBoxRLine className="w-4 h-4 mr-3 flex-shrink-0" />
                        Sair do Sistema
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-slate-200 pt-6 mt-6">
                    <Button
                      className="w-full bg-navy hover:bg-navy-700 text-white font-medium py-3 text-sm uppercase tracking-wider font-roboto border-0 group/button relative overflow-hidden shadow-md transition-all duration-300 touch-optimize focus:outline-none focus:ring-2 focus:ring-white/50"
                      asChild
                    >
                      <Link href="/login" onClick={onClose} role="button">
                        <span className="relative z-10">Identificação</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000" />
                      </Link>
                    </Button>
                  </div>
                )}

                {/* Social Links */}
                <div className="border-t border-slate-200 pt-6 mt-6">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
                    Redes Sociais
                  </h3>
                  <div
                    className="flex justify-center gap-2 px-2"
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
                            "w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 no-underline transition-all duration-300 hover:shadow-lg",
                            "focus:outline-none focus:ring-2 focus:ring-navy/50",
                            social.hoverColor,
                            "hover:text-white hover:scale-110 touch-optimize"
                          )}
                          aria-label={social.label}
                          onClick={onClose}
                          role="listitem"
                        >
                          <IconComponent className="w-4 h-4" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 p-4 bg-slate-50">
                <div className="text-center text-xs text-slate-500">
                  <p>© {new Date().getFullYear()} Patrulha Aérea Civil</p>
                  <p className="mt-1">Todos os direitos reservados</p>
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
  const pathname = usePathname();
  const { initializeAuth } = useAuthStore();

  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    const handleScroll = debounce(() => {
      setScrolled(window.scrollY > 20);
    }, 10);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "bg-white sticky top-0 left-0 right-0 z-50 min-h-[90px] md:min-h-[100px] lg:min-h-[120px] transition-all duration-300",
        scrolled ? "shadow-lg" : "shadow-sm"
      )}
      role="banner"
      aria-label="Cabeçalho principal"
    >
      <TopBar />

      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Mobile Header */}
          <div className="flex md:hidden items-center justify-between w-full py-3">
            <Logo />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="text-slate-700 hover:bg-slate-100 w-10 h-10 transition-all duration-300 hover:scale-110 touch-optimize focus:outline-none focus:ring-2 focus:ring-navy/50"
                aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                role="button"
              >
                <RiMenuLine className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Tablet Header */}
          <div className="hidden md:flex lg:hidden items-center justify-between w-full py-3">
            <Logo />
            <div className="flex items-center gap-3">
              <IdentificationButton />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="text-slate-700 hover:bg-slate-100 w-10 h-10 transition-all duration-300 hover:scale-110 touch-optimize focus:outline-none focus:ring-2 focus:ring-navy/50"
                aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                role="button"
              >
                <RiMenuLine className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between w-full py-4">
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
