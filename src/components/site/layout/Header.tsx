"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";

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

// 🎯 INTERFACES COMPLETAS
interface UserProfile {
  id: string;
  matricula: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  graduacao?: string;
  validade_certificacao?: string;
  tipo_sanguineo?: string;
  status: boolean;
  role: string;
  created_at: string;
  updated_at: string;
}

interface AuthUser {
  id: string;
  email: string;
}

// 🎯 HOOK DE AUTENTICAÇÃO CORRIGIDO
const useHeaderAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);

        // SEMPRE buscar do banco primeiro
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error("❌ Erro ao buscar usuário:", authError);
          setLoading(false);
          return;
        }

        if (authUser && authUser.email) {
          const userData: AuthUser = {
            id: authUser.id,
            email: authUser.email,
          };
          setUser(userData);

          // Buscar profile ATUALIZADO do banco
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .single();

          if (profileError) {
            console.error("❌ Erro ao buscar perfil:", profileError);
            setLoading(false);
            return;
          }

          if (profileData) {
            setProfile(profileData);
            // Atualizar localStorage com dados mais recentes
            localStorage.setItem("pac_user_data", JSON.stringify(profileData));
          }
        } else {
          // Limpar dados se não há usuário autenticado
          setUser(null);
          setProfile(null);
          localStorage.removeItem("pac_user_data");
        }
      } catch (err) {
        console.error("❌ Erro inesperado:", err);
        // Em caso de erro, tentar usar cache local como fallback
        try {
          const localData = localStorage.getItem("pac_user_data");
          if (localData) {
            const profileData = JSON.parse(localData) as UserProfile;
            setProfile(profileData);
            setUser({ id: profileData.id, email: profileData.email });
          }
        } catch (cacheError) {
          console.error("❌ Erro no cache local:", cacheError);
          localStorage.removeItem("pac_user_data");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user && session.user.email) {
        const userData: AuthUser = {
          id: session.user.id,
          email: session.user.email,
        };

        // Buscar perfil atualizado
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          setUser(userData);
          localStorage.setItem("pac_user_data", JSON.stringify(profileData));
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        localStorage.removeItem("pac_user_data");
        localStorage.removeItem("supabase.auth.token");
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem("pac_user_data");
      localStorage.removeItem("supabase.auth.token");
      setUser(null);
      setProfile(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const isAdmin = profile?.role?.toLowerCase().trim() === "admin";

  return {
    user,
    profile,
    loading,
    signOut,
    isAdmin,
  };
};

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
      className="bg-navy text-white font-medium px-6 py-2.5 text-sm uppercase tracking-wider transition-all duration-300 font-roboto border-0 min-h-[44px] relative overflow-hidden cursor-not-allowed"
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
      <div className="flex items-center justify-center gap-3 relative z-10">
        <LoadingSpinner size="sm" />
        <span className="text-white/90">Carregando...</span>
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
            <span className="text-slate-200 font-medium font-roboto">
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
        <h1 className="font-bebas text-xl sm:text-2xl bg-gradient-to-r from-navy to-navy-700 bg-clip-text text-transparent tracking-wider uppercase leading-tight">
          PATRULHA AÉREA CIVIL
        </h1>
        <p className="text-slate-600 text-xs sm:text-sm leading-tight mt-1 font-roboto">
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
        <h1 className="font-bebas text-2xl bg-gradient-to-r from-navy to-navy-700 bg-clip-text text-transparent tracking-wider uppercase leading-tight transition-all duration-300 group-hover:scale-105">
          PATRULHA AÉREA CIVIL
        </h1>
        <p className="text-slate-600 text-sm leading-tight mt-1 font-roboto">
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

// 🎯 BOTÃO DO USUÁRIO CORRIGIDO - MOSTRA "MEU PERFIL"
// 🎯 BOTÃO DO USUÁRIO COM AVATAR REAL
const UserMenuButton = () => {
  const { user, profile, loading, signOut, isAdmin } = useHeaderAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();

  const isOnProfilePage = pathname === "/perfil";

  if (loading) {
    return <LoadingButton />;
  }

  if (!user) {
    return (
      <Button
        className="bg-navy hover:bg-navy-700 text-white font-medium px-6 py-2.5 text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg font-roboto border-0 group/button relative overflow-hidden shadow-md min-h-[44px]"
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
    <div className="relative">
      <Button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="bg-navy hover:bg-navy-700 text-white font-medium px-6 py-2.5 text-sm uppercase tracking-wider transition-all duration-300 hover:shadow-lg font-roboto border-0 group/button relative overflow-hidden shadow-md min-h-[44px] flex items-center gap-2"
      >
        {/* 🎯 AVATAR REAL DO AGENTE */}
        {profile?.avatar_url ? (
          <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-white/50 flex-shrink-0">
            <Image
              src={profile.avatar_url}
              alt={`Avatar de ${profile.full_name || "Agente"}`}
              width={24}
              height={24}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback para ícone se a imagem não carregar
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML =
                    '<FaUser className="w-4 h-4 text-white" />';
                }
              }}
            />
          </div>
        ) : (
          <FaUser className="w-4 h-4 flex-shrink-0" />
        )}

        <span className="relative z-10">Meu Perfil</span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/button:translate-x-[100%] transition-transform duration-1000" />
      </Button>

      {isDropdownOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-50 animate-scale-in">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              {/* 🎯 AVATAR NO DROPDOWN TAMBÉM */}
              {profile?.avatar_url ? (
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-navy/20 flex-shrink-0">
                  <Image
                    src={profile.avatar_url}
                    alt={`Avatar de ${profile.full_name || "Agente"}`}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback para ícone se a imagem não carregar
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML =
                          '<div class="w-10 h-10 bg-navy rounded-full flex items-center justify-center"><FaUser class="w-5 h-5 text-white" /></div>';
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-10 h-10 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                  <FaUser className="w-5 h-5 text-white" />
                </div>
              )}
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
          </div>

          <div className="p-2 space-y-1">
            {/* 🔵 AZUL - Ações do Perfil */}
            {!isOnProfilePage && (
              <Link
                href="/perfil"
                className="flex items-center gap-3 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-transparent hover:border-blue-200"
                onClick={() => setIsDropdownOpen(false)}
              >
                <FaUser className="w-4 h-4" />
                Ver Meu Perfil
              </Link>
            )}

            {/* 🟣 ROXO - Dashboard SOMENTE para Admin */}
            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-3 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-md transition-colors border border-transparent hover:border-purple-200"
                onClick={() => setIsDropdownOpen(false)}
              >
                <FaChartBar className="w-4 h-4" />
                Ir ao Dashboard
              </Link>
            )}

            {/* 🔵 AZUL - Configurações */}
            <Link
              href={isAdmin ? "/admin/configuracoes" : "/configuracoes"}
              className="flex items-center gap-3 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-transparent hover:border-blue-200"
              onClick={() => setIsDropdownOpen(false)}
            >
              <FaCog className="w-4 h-4" />
              Configurações
            </Link>
          </div>

          <div className="p-2 border-t border-slate-200">
            {/* 🔴 VERMELHO - Logout */}
            <button
              onClick={signOut}
              className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors w-full border border-transparent hover:border-red-200"
            >
              <FaSignOutAlt className="w-4 h-4" />
              Sair do Sistema
            </button>
          </div>
        </div>
      )}

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
  const { user, profile, signOut, isAdmin } = useHeaderAuth();
  const isOnProfilePage = pathname === "/perfil";

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
                  {profile?.avatar_url ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-navy/20 flex-shrink-0">
                      <Image
                        src={profile.avatar_url}
                        alt={`Avatar de ${profile.full_name || "Agente"}`}
                        width={32}
                        height={32}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.innerHTML =
                              '<div class="w-8 h-8 bg-navy rounded-full flex items-center justify-center"><FaUser class="w-4 h-4 text-white" /></div>';
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-navy rounded-full flex items-center justify-center flex-shrink-0">
                      <FaUser className="w-4 h-4 text-white" />
                    </div>
                  )}
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
                  signOut();
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

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

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
          <div className="xl:hidden flex items-center justify-between w-full py-3">
            <Logo />
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
