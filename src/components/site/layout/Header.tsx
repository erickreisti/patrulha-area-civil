"use client";

import { useState, useEffect } from "react";
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
import {
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaBars,
  FaUser,
  FaSignOutAlt,
  FaCog,
  FaChartBar,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { motion } from "framer-motion";
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
    icon: FaFacebook,
    href: "https://facebook.com/patrulhaaereacivil",
    label: "Facebook",
    hoverColor: "hover:bg-blue-600",
  },
  {
    icon: FaXTwitter,
    href: "https://twitter.com/patrulhaaereacivil",
    label: "X (Twitter)",
    hoverColor: "hover:bg-slate-900",
  },
  {
    icon: FaInstagram,
    href: "https://instagram.com/patrulhaaereacivil",
    label: "Instagram",
    hoverColor: "hover:bg-pink-600",
  },
  {
    icon: FaWhatsapp,
    href: "https://wa.me/5521999999999",
    label: "WhatsApp",
    hoverColor: "hover:bg-green-600",
  },
];

// 🎯 COMPONENTE DE LOADING
const LoadingSpinner = ({ size = "sm" }: { size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      <motion.div
        className="absolute inset-0 border-2 border-white/30 rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <motion.div
        className="absolute inset-0 border-2 border-transparent border-t-white rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-1 h-1 bg-white/50 rounded-full" />
      </div>
    </div>
  );
};

// 🎯 BOTÃO DE LOADING
const LoadingButton = () => {
  return (
    <Button
      className="bg-navy text-white font-medium px-4 sm:px-6 py-2.5 text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 font-roboto border-0 min-h-[44px] relative overflow-hidden cursor-not-allowed"
      disabled
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <div className="flex items-center justify-center gap-2 relative z-10">
        <LoadingSpinner size="sm" />
        <span className="text-white/90 hidden sm:inline">Carregando...</span>
      </div>
    </Button>
  );
};

const useScrollDetection = (threshold = 30) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return isScrolled;
};

const TopBar = () => {
  return (
    <div className="bg-navy py-2">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center text-white text-sm">
          {/* Bandeira - visível apenas em desktop */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="relative w-6 h-4">
              <Image
                src="/images/logos/flag-br.webp"
                alt="Bandeira do Brasil"
                width={24}
                height={16}
                className="object-cover rounded-sm w-full h-full"
                priority
              />
            </div>
            <span className="text-slate-200 font-medium font-roboto">
              República Federativa do Brasil
            </span>
          </div>

          {/* Texto alternativo para mobile */}
          <div className="sm:hidden text-slate-200 text-xs font-medium">
            Brasil
          </div>

          <div className="flex gap-1 sm:gap-2">
            {SOCIAL_ICONS.map((social) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "w-7 h-7 sm:w-8 sm:h-8 bg-white/10 rounded-full flex items-center justify-center text-white no-underline transition-all duration-300 border border-white/20",
                    social.hoverColor,
                    "hover:border-transparent hover:scale-110 hover:shadow-lg"
                  )}
                  aria-label={social.label}
                >
                  <IconComponent className="w-3 h-3 sm:w-3 sm:h-3" />
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
    <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
      <div className="relative w-10 h-10 sm:w-14 sm:h-14">
        <Image
          src="/images/logos/logo.webp"
          alt="Patrulha Aérea Civil"
          width={56}
          height={56}
          className="object-contain drop-shadow-md w-full h-full"
          priority
        />
      </div>
      <div className="text-left">
        <h1 className="font-bebas text-lg sm:text-xl bg-gradient-to-r from-navy to-navy-700 bg-clip-text text-transparent tracking-wider uppercase leading-tight">
          PATRULHA AÉREA CIVIL
        </h1>
        <p className="text-slate-600 text-xs leading-tight mt-0.5 font-roboto">
          Serviço Humanitário
        </p>
      </div>
    </Link>
  );
};

const DesktopLogo = () => {
  return (
    <Link href="/" className="flex items-center gap-3 sm:gap-4 group">
      <div className="relative w-12 h-12 sm:w-16 sm:h-16 transition-all duration-300 group-hover:scale-105">
        <Image
          src="/images/logos/logo.webp"
          alt="Patrulha Aérea Civil"
          width={64}
          height={64}
          className="object-contain drop-shadow-md w-full h-full"
          priority
        />
      </div>
      <div className="text-left">
        <h1 className="font-bebas text-xl sm:text-2xl bg-gradient-to-r from-navy to-navy-700 bg-clip-text text-transparent tracking-wider uppercase leading-tight transition-all duration-300 group-hover:scale-105">
          PATRULHA AÉREA CIVIL
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-tight mt-1 font-roboto">
          COMANDO OPERACIONAL NO ESTADO DO RIO DE JANEIRO
        </p>
      </div>
    </Link>
  );
};

const NavigationItem = ({
  item,
  isActive,
}: {
  item: (typeof NAVIGATION)[0];
  isActive: boolean;
}) => (
  <li className="relative">
    <Link
      href={item.href}
      className={cn(
        "no-underline text-slate-700 font-medium py-2 px-1 transition-all duration-300 uppercase tracking-wider font-roboto relative group/navlink text-sm w-fit",
        isActive
          ? "text-navy font-semibold"
          : "text-slate-600 hover:text-navy hover:font-semibold"
      )}
    >
      <span className="relative z-10 transition-colors duration-300">
        {item.name}
      </span>
      <div
        className={cn(
          "absolute -bottom-1 left-0 w-0 h-0.5 bg-navy transition-all duration-300",
          isActive ? "w-full" : "group-hover/navlink:w-full"
        )}
      />
    </Link>
  </li>
);

const DesktopNavigation = ({ pathname }: { pathname: string }) => (
  <nav className="flex items-center">
    <ul className="flex list-none gap-4 lg:gap-6 xl:gap-8 m-0 p-0">
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

// 🎯 USER MENU COM DROPDOWN DO SHADCN
const UserMenuButton = () => {
  const { user, profile, isAdmin, loading, clearAuth } = useAuthStore();
  const pathname = usePathname();
  const isOnProfilePage = pathname === "/perfil";

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      clearAuth();
      localStorage.removeItem("supabase.auth.token");
      window.location.href = "/";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  if (loading) {
    return <LoadingButton />;
  }

  if (!user) {
    return (
      <Button
        className="bg-navy hover:bg-navy-700 text-white font-medium px-4 sm:px-6 py-2.5 text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg font-roboto border-0 group/button relative overflow-hidden shadow-md min-h-[44px]"
        asChild
      >
        <Link href="/login">
          <span className="relative z-10">Área do Agente</span>
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
          className="bg-navy hover:bg-navy-700 text-white font-medium px-4 sm:px-6 py-2.5 text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg font-roboto border-0 group/button relative overflow-hidden shadow-md min-h-[44px]"
        >
          <span className="relative z-10">Meu Perfil</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" sideOffset={8}>
        {/* Header do Dropdown */}
        <DropdownMenuLabel className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-navy/20 flex-shrink-0">
              <AvatarImage
                src={profile?.avatar_url || ""}
                alt={`Avatar de ${profile?.full_name || "Agente"}`}
              />
              <AvatarFallback className="bg-navy text-white">
                <FaUser className="w-5 h-5" />
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
                {profile?.graduacao || "Agente"} {isAdmin ? "• Admin" : ""}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuGroup className="p-2">
          {/* Perfil */}
          {!isOnProfilePage && (
            <DropdownMenuItem asChild>
              <Link href="/perfil" className="cursor-pointer">
                <FaUser className="w-4 h-4 mr-2 text-blue-600" />
                <span>Ver Meu Perfil</span>
              </Link>
            </DropdownMenuItem>
          )}

          {/* Dashboard (apenas admin) */}
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard" className="cursor-pointer">
                <FaChartBar className="w-4 h-4 mr-2 text-purple-600" />
                <span>Ir ao Dashboard</span>
              </Link>
            </DropdownMenuItem>
          )}

          {/* Configurações */}
          <DropdownMenuItem asChild>
            <Link
              href={isAdmin ? "/admin/configuracoes" : "/configuracoes"}
              className="cursor-pointer"
            >
              <FaCog className="w-4 h-4 mr-2 text-blue-600" />
              <span>Configurações</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuGroup className="p-2">
          <DropdownMenuItem
            onClick={handleSignOut}
            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <FaSignOutAlt className="w-4 h-4 mr-2" />
            <span>Sair do Sistema</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Resto do código do Header permanece igual...
const MobileMenu = ({
  isOpen,
  onClose,
  pathname,
}: {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
}) => {
  const { user, profile, isAdmin, clearAuth } = useAuthStore();
  const isOnProfilePage = pathname === "/perfil";

  const handleSignOut = async () => {
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
  };

  if (!isOpen) return null;

  return (
    <div className="xl:hidden bg-white border-t border-slate-200 shadow-lg animate-slide-down">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex flex-col space-y-3">
          {NAVIGATION.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 border-l-4 font-roboto",
                pathname.startsWith(item.href)
                  ? "bg-navy/10 text-navy border-navy shadow-md"
                  : "text-slate-700 hover:bg-slate-50 border-transparent hover:border-slate-300"
              )}
              onClick={onClose}
            >
              {item.name}
            </Link>
          ))}

          {user ? (
            <>
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-lg">
                  <Avatar className="w-8 h-8 border-2 border-navy/20 flex-shrink-0">
                    <AvatarImage
                      src={profile?.avatar_url || ""}
                      alt={`Avatar de ${profile?.full_name || "Agente"}`}
                    />
                    <AvatarFallback className="bg-navy text-white text-xs">
                      <FaUser className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {profile?.full_name || "Agente PAC"}
                    </p>
                    <p className="text-xs text-slate-600">
                      {profile?.graduacao || "Agente"}{" "}
                      {isAdmin ? "• Admin" : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* 🔵 AZUL - Meu Perfil */}
              {!isOnProfilePage && (
                <Link
                  href="/perfil"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                  onClick={onClose}
                >
                  <FaUser className="w-4 h-4" />
                  Ver Meu Perfil
                </Link>
              )}

              {/* 🟣 ROXO - Dashboard SOMENTE para Admin */}
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="px-4 py-3 rounded-lg text-base font-medium bg-purple-50 text-purple-600 border-l-4 border-purple-600"
                  onClick={onClose}
                >
                  Ir ao Dashboard
                </Link>
              )}

              {/* 🔵 AZUL - Configurações */}
              <Link
                href={isAdmin ? "/admin/configuracoes" : "/configuracoes"}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                onClick={onClose}
              >
                <FaCog className="w-4 h-4" />
                Configurações
              </Link>

              {/* 🔴 VERMELHO - Logout */}
              <button
                onClick={() => {
                  handleSignOut();
                  onClose();
                }}
                className="px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 text-left border-l-4 border-red-600"
              >
                Sair do Sistema
              </button>
            </>
          ) : (
            <div className="pt-4 border-t border-slate-200">
              <Button
                className="w-full bg-navy hover:bg-navy-700 text-white font-medium py-3 text-sm uppercase tracking-wider font-roboto border-0 group/button relative overflow-hidden shadow-md transition-all duration-300"
                asChild
              >
                <Link href="/login" onClick={onClose}>
                  <span className="relative z-10">Área do Agente</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000" />
                </Link>
              </Button>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200">
            <div className="flex justify-center gap-3">
              {SOCIAL_ICONS.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-700 no-underline transition-all duration-300 hover:shadow-lg",
                      social.hoverColor,
                      "hover:text-white hover:scale-110"
                    )}
                    aria-label={social.label}
                    onClick={onClose}
                  >
                    <IconComponent className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isScrolled = useScrollDetection();
  const pathname = usePathname();
  const { initializeAuth } = useAuthStore();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Inicializar auth quando o Header montar
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <header
      className={cn(
        "bg-white fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled ? "shadow-lg border-slate-200" : "shadow-sm border-slate-100"
      )}
    >
      <TopBar />

      <div className="bg-white transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Mobile Header */}
          <div className="xl:hidden flex items-center justify-between w-full py-3">
            <Logo />
            <div className="flex items-center gap-2">
              <UserMenuButton />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="text-slate-700 hover:bg-slate-100 w-10 h-10 transition-all duration-300 hover:scale-110"
                aria-label="Alternar menu"
              >
                <FaBars className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden xl:flex items-center justify-between w-full py-4">
            <DesktopLogo />
            <DesktopNavigation pathname={pathname} />
            <UserMenuButton />
          </div>
        </div>
      </div>

      <MobileMenu isOpen={isMenuOpen} onClose={closeMenu} pathname={pathname} />
    </header>
  );
}
