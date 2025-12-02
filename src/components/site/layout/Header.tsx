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
  RiFacebookFill,
  RiInstagramLine,
  RiWhatsappLine,
  RiMenuLine,
  RiUserLine,
  RiLogoutBoxRLine,
  RiBarChartLine,
  RiTwitterXLine,
} from "react-icons/ri";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
import { Spinner } from "@/components/ui/spinner";

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
  return (
    <div className="bg-navy py-2">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center text-white text-sm">
          <div className="flex md:hidden items-center gap-2">
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
            <span className="text-slate-200 text-xs font-medium">Brasil</span>
          </div>

          <div className="hidden md:flex items-center gap-3">
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
    <Link
      href="/"
      className="flex items-center group transition-all duration-300 gap-2 md:gap-3 lg:gap-4"
    >
      <div className="relative w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 transition-all duration-300">
        <Image
          src="/images/logos/logo.webp"
          alt="Patrulha Aérea Civil"
          width={56}
          height={56}
          className="object-contain drop-shadow-md w-full h-full transition-all duration-300"
          priority
        />
      </div>
      <div className="text-left transition-all duration-300">
        <h1 className="font-bebas bg-gradient-to-r from-navy to-navy-700 bg-clip-text text-transparent tracking-wider uppercase leading-tight transition-all duration-300 text-xl sm:text-2xl">
          PATRULHA AÉREA CIVIL
        </h1>
        <p className="text-slate-600 leading-tight mt-0.5 font-roboto transition-all duration-300 text-xs">
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
  <nav className="flex items-center transition-all duration-300">
    <ul className="flex list-none gap-4 lg:gap-6 xl:gap-8 m-0 p-0 transition-all duration-300">
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
      className="bg-navy hover:bg-navy-700 text-white font-medium px-4 py-2.5 text-sm uppercase tracking-wider transition-all duration-300 font-roboto border-0 min-h-[44px] relative overflow-hidden cursor-not-allowed shadow-md group/loading"
      disabled
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <div className="flex items-center justify-center gap-2 relative z-10">
        <Spinner className="w-4 h-4 text-white" />
        <span className="text-white font-medium">Carregando...</span>
      </div>
    </Button>
  );
};

const IdentificationButton = () => {
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
        className="bg-navy hover:bg-navy-700 text-white font-medium px-4 py-2.5 text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg font-roboto border-0 group/button relative overflow-hidden shadow-md min-h-[44px]"
        asChild
      >
        <Link href="/login">
          <span className="relative z-10 text-white">Identificação</span>
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
          className="bg-navy hover:bg-navy-700 text-white font-medium px-4 py-2.5 text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg font-roboto border-0 group/button relative overflow-hidden shadow-md min-h-[44px]"
        >
          <span className="relative z-10 text-white">Identificação</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" sideOffset={8}>
        <DropdownMenuLabel className="p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border-2 border-navy/20 flex-shrink-0">
              <AvatarImage
                src={profile?.avatar_url || ""}
                alt={`Avatar de ${profile?.full_name || "Agente"}`}
                className="object-cover object-center"
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
                {profile?.graduacao || "Agente"} {isAdmin ? "• Admin" : ""}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuGroup className="p-2">
          {!isOnProfilePage && (
            <DropdownMenuItem asChild>
              <Link href="/perfil" className="cursor-pointer">
                <RiUserLine className="w-4 h-4 mr-2 text-blue-600" />
                <span>Ver Meu Perfil</span>
              </Link>
            </DropdownMenuItem>
          )}

          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/admin/dashboard" className="cursor-pointer">
                <RiBarChartLine className="w-4 h-4 mr-2 text-purple-600" />
                <span>Ir ao Dashboard</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup className="p-2">
          <DropdownMenuItem
            onClick={handleSignOut}
            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
          >
            <RiLogoutBoxRLine className="w-4 h-4 mr-2" />
            <span>Sair do Sistema</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

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
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
            Navegação
          </h3>
          <nav className="space-y-1">
            {NAVIGATION.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                  pathname.startsWith(item.href)
                    ? "bg-navy/10 text-navy border-r-2 border-navy"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                )}
                onClick={onClose}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {user ? (
          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center gap-3 px-3 py-3 bg-slate-50 rounded-lg mb-3">
              <Avatar className="w-10 h-10 border-2 border-navy/20 flex-shrink-0">
                <AvatarImage
                  src={profile?.avatar_url || ""}
                  alt={`Avatar de ${profile?.full_name || "Agente"}`}
                  className="object-cover object-center"
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
                  {profile?.graduacao || "Agente"} {isAdmin ? "• Admin" : ""}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              {!isOnProfilePage && (
                <Link
                  href="/perfil"
                  className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors duration-200"
                  onClick={onClose}
                >
                  <RiUserLine className="w-4 h-4 mr-3 text-blue-600" />
                  Ver Meu Perfil
                </Link>
              )}

              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors duration-200"
                  onClick={onClose}
                >
                  <RiBarChartLine className="w-4 h-4 mr-3 text-purple-600" />
                  Ir ao Dashboard
                </Link>
              )}

              <button
                onClick={() => {
                  handleSignOut();
                  onClose();
                }}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 text-left"
              >
                <RiLogoutBoxRLine className="w-4 h-4 mr-3" />
                Sair do Sistema
              </button>
            </div>
          </div>
        ) : (
          <div className="border-t border-slate-200 pt-4">
            <Button
              className="w-full bg-navy hover:bg-navy-700 text-white font-medium py-2.5 text-sm uppercase tracking-wider font-roboto border-0 group/button relative overflow-hidden shadow-md transition-all duration-300"
              asChild
            >
              <Link href="/login" onClick={onClose}>
                <span className="relative z-10">Identificação</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000" />
              </Link>
            </Button>
          </div>
        )}

        <div className="border-t border-slate-200 pt-4 mt-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 px-2">
            Redes Sociais
          </h3>
          <div className="flex justify-center gap-2">
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
      </div>
    </div>
  );
};

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { initializeAuth } = useAuthStore();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <header className="bg-white fixed top-0 left-0 right-0 z-50 h-[90px] md:h-[100px] lg:h-[120px] shadow-sm">
      <TopBar />

      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="md:hidden flex items-center justify-between w-full py-3">
            <Logo />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="text-slate-700 hover:bg-slate-100 w-10 h-10 transition-all duration-300 hover:scale-110"
              aria-label="Alternar menu"
            >
              <RiMenuLine className="h-5 w-5" />
            </Button>
          </div>

          <div className="hidden md:flex xl:hidden items-center justify-between w-full py-3">
            <Logo />
            <div className="flex items-center gap-2">
              <IdentificationButton />
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                className="text-slate-700 hover:bg-slate-100 w-10 h-10 transition-all duration-300 hover:scale-110"
                aria-label="Alternar menu"
              >
                <RiMenuLine className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="hidden xl:flex items-center justify-between w-full py-4">
            <Logo />
            <DesktopNavigation pathname={pathname} />
            <IdentificationButton />
          </div>
        </div>
      </div>

      <MobileMenu isOpen={isMenuOpen} onClose={closeMenu} pathname={pathname} />
    </header>
  );
}
