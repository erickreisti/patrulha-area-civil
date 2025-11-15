// src/components/site/layout/Header.tsx - VERSÃO OTIMIZADA
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  FaArrowLeft,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { useAuth } from "@/hooks/useAuth"; // ✅ USANDO HOOK UNIFICADO

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
    hoverColor: "hover:bg-black hover:text-white",
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
          <div className="flex items-center gap-3">
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
            <span className="text-blue-100 font-medium font-roboto">
              República Federativa do Brasil
            </span>
          </div>

          <div className="flex gap-2">
            {SOCIAL_ICONS.map((social) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white no-underline transition-all duration-300 border border-white/20",
                    social.hoverColor,
                    "hover:border-transparent hover:scale-110 hover:shadow-lg"
                  )}
                  aria-label={social.label}
                >
                  <IconComponent className="w-3 h-3" />
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
    <Link href="/" className="flex items-center gap-3 sm:gap-4 group">
      <div className="relative w-14 h-14 sm:w-16 sm:h-16">
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
        <h1 className="font-bebas text-xl sm:text-2xl bg-gradient-to-r from-navy-light to-navy bg-clip-text text-transparent tracking-wider uppercase leading-tight">
          PATRULHA AÉREA CIVIL
        </h1>
        <p className="text-gray-600 text-xs sm:text-sm leading-tight mt-1 font-roboto">
          Serviço Humanitário
        </p>
      </div>
    </Link>
  );
};

const DesktopLogo = () => {
  return (
    <Link href="/" className="flex items-center gap-4 group">
      <div className="relative w-16 h-16 transition-all duration-300 group-hover:scale-105">
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
        <h1 className="font-bebas text-2xl bg-gradient-to-r from-navy-light to-navy bg-clip-text text-transparent tracking-wider uppercase leading-tight transition-all duration-300 group-hover:scale-105">
          PATRULHA AÉREA CIVIL
        </h1>
        <p className="text-gray-600 text-sm leading-tight mt-1 font-roboto">
          Serviço Humanitário de Excelência
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
        "no-underline text-gray-800 font-medium py-2 px-1 transition-all duration-300 uppercase tracking-wider font-roboto relative group/navlink text-sm w-fit",
        isActive
          ? "text-navy-light font-semibold"
          : "text-gray-700 hover:text-navy-light hover:font-semibold"
      )}
    >
      <span className="relative z-10 transition-colors duration-300">
        {item.name}
      </span>
      <div
        className={cn(
          "absolute -bottom-1 left-0 w-0 h-0.5 bg-navy-light transition-all duration-300",
          isActive ? "w-full" : "group-hover/navlink:w-full"
        )}
      />
    </Link>
  </li>
);

const DesktopNavigation = ({ pathname }: { pathname: string }) => (
  <nav className="flex items-center">
    <ul className="flex list-none gap-8 m-0 p-0">
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

// ✅ COMPONENTE USER MENU OTIMIZADO - USANDO HOOK UNIFICADO
const UserMenuButton = () => {
  const { user, profile, loading, signOut, isAdmin } = useAuth(); // ✅ Hook unificado
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();

  // Verifica se está na página de perfil
  const isOnProfilePage = pathname === "/agent/perfil";
  // Verifica se está no dashboard admin
  const isOnAdminDashboard = pathname === "/admin/dashboard";

  if (loading) {
    return (
      <Button
        className="bg-navy-light hover:bg-navy text-white font-medium px-6 py-2.5 text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg font-roboto border-0 min-h-[44px] opacity-50"
        disabled
      >
        Carregando...
      </Button>
    );
  }

  if (!user) {
    return (
      <Button
        className="bg-navy-light hover:bg-navy text-white font-medium px-6 py-2.5 text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg font-roboto border-0 group/button relative overflow-hidden shadow-md min-h-[44px]"
        asChild
      >
        <Link href="/login">
          <span className="relative z-10">Área do Agente</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000" />
        </Link>
      </Button>
    );
  }

  // Usuário logado - mostrar menu dropdown
  return (
    <div className="relative">
      <Button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="bg-navy-light hover:bg-navy text-white font-medium px-6 py-2.5 text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg font-roboto border-0 group/button relative overflow-hidden shadow-md min-h-[44px] flex items-center gap-2"
      >
        <FaUser className="w-4 h-4" />
        <span className="relative z-10">{profile?.graduacao || "Agente"}</span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000" />
      </Button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50 animate-scale-in">
          {/* Header do Dropdown */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-navy-light rounded-full flex items-center justify-center">
                <FaUser className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {profile?.full_name || "Agente PAC"}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {profile?.matricula
                    ? `Matrícula: ${profile.matricula}`
                    : user.email}
                </p>
                <p className="text-xs text-navy-light font-medium capitalize">
                  {isAdmin ? "Administrador" : "Agente"}
                </p>
              </div>
            </div>
          </div>

          {/* Links do Dropdown */}
          <div className="p-2">
            {/* Opção "Voltar ao Perfil" - aparece apenas se NÃO estiver na página de perfil */}
            {!isOnProfilePage && (
              <Link
                href="/agent/perfil" // SEMPRE vai para o perfil
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <FaArrowLeft className="w-4 h-4 text-navy-light" />
                Voltar ao Perfil
              </Link>
            )}

            {/* Para admin: Painel Admin (sempre visível) */}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <FaChartBar className="w-4 h-4 text-navy-light" />
                Painel Admin
              </Link>
            )}

            {/* Para agente: Meu Perfil (apenas se não estiver mostrando "Voltar ao Perfil") */}
            {!isAdmin && isOnProfilePage && (
              <Link
                href="/agent/perfil"
                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                onClick={() => setIsDropdownOpen(false)}
              >
                <FaUser className="w-4 h-4 text-navy-light" />
                Meu Perfil
              </Link>
            )}

            <Link
              href={isAdmin ? "/admin/configuracoes" : "/agent/configuracoes"}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              onClick={() => setIsDropdownOpen(false)}
            >
              <FaCog className="w-4 h-4 text-navy-light" />
              Configurações
            </Link>
          </div>

          {/* Footer do Dropdown */}
          <div className="p-2 border-t border-gray-200">
            <button
              onClick={signOut}
              className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors w-full"
            >
              <FaSignOutAlt className="w-4 h-4" />
              Sair do Sistema
            </button>
          </div>
        </div>
      )}

      {/* Overlay para fechar o dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
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
  const { user, profile, signOut, isAdmin } = useAuth(); // ✅ Hook unificado
  const isOnProfilePage = pathname === "/agent/perfil";

  if (!isOpen) return null;

  return (
    <div className="xl:hidden bg-white border-t border-gray-200 shadow-lg animate-slide-down">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex flex-col space-y-3">
          {NAVIGATION.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 border-l-4 font-roboto",
                pathname.startsWith(item.href)
                  ? "bg-navy-light/10 text-navy border-navy shadow-md"
                  : "text-gray-700 hover:bg-gray-50 border-transparent hover:border-gray-300"
              )}
              onClick={onClose}
            >
              {item.name}
            </Link>
          ))}

          {/* Seção do usuário logado no mobile */}
          {user ? (
            <>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-navy-light rounded-full flex items-center justify-center">
                    <FaUser className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {profile?.full_name || "Agente PAC"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {isAdmin ? "Administrador" : "Agente"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Opção "Voltar ao Perfil" no mobile - SEMPRE vai para /agent/perfil */}
              {!isOnProfilePage && (
                <Link
                  href="/agent/perfil"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium bg-navy-light/10 text-navy border-l-4 border-navy"
                  onClick={onClose}
                >
                  <FaArrowLeft className="w-4 h-4" />
                  Voltar ao Perfil
                </Link>
              )}

              {/* Para admin: Painel Admin */}
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="px-4 py-3 rounded-lg text-base font-medium bg-navy-light/10 text-navy border-l-4 border-navy"
                  onClick={onClose}
                >
                  Painel Administrativo
                </Link>
              )}

              {/* Para agente: Meu Perfil (apenas se não estiver mostrando "Voltar ao Perfil") */}
              {!isAdmin && isOnProfilePage && (
                <Link
                  href="/agent/perfil"
                  className="px-4 py-3 rounded-lg text-base font-medium bg-navy-light/10 text-navy border-l-4 border-navy"
                  onClick={onClose}
                >
                  Meu Perfil
                </Link>
              )}

              <button
                onClick={() => {
                  signOut();
                  onClose();
                }}
                className="px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 text-left border-l-4 border-transparent"
              >
                Sair do Sistema
              </button>
            </>
          ) : (
            <div className="pt-4 border-t border-gray-200">
              <Button
                className="w-full bg-navy-light hover:bg-navy text-white font-medium py-3 text-sm uppercase tracking-wider font-roboto border-0 group/button relative overflow-hidden shadow-md transition-all duration-300"
                asChild
              >
                <Link href="/login" onClick={onClose}>
                  <span className="relative z-10">Área do Agente</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000" />
                </Link>
              </Button>
            </div>
          )}

          <div className="pt-4 border-t border-gray-200">
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
                      "w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 no-underline transition-all duration-300 hover:shadow-lg",
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

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header
      className={cn(
        "bg-white fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled ? "shadow-lg border-gray-200" : "shadow-sm border-gray-100"
      )}
    >
      <TopBar />

      <div className="bg-white transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="xl:hidden flex items-center justify-between w-full py-3">
            <Logo />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              className="text-gray-800 hover:bg-gray-100 w-10 h-10 transition-all duration-300 hover:scale-110"
              aria-label="Alternar menu"
            >
              <FaBars className="h-5 w-5" />
            </Button>
          </div>

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
