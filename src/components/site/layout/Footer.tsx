// src/components/site/layout/Footer.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  RiFacebookFill,
  RiInstagramLine,
  RiWhatsappLine,
  RiMailLine,
  RiPhoneLine,
  RiMapPinLine,
  RiAlertLine,
  RiTwitterXLine,
  RiCopyrightLine,
  RiShieldCheckLine,
} from "react-icons/ri";
import { motion } from "framer-motion";
import { IconType } from "react-icons";
import { useRef } from "react";
import { cn } from "@/lib/utils/cn";

const SOCIAL_LINKS = [
  {
    icon: RiFacebookFill,
    url: "https://facebook.com/patrulhaaereacivil",
    color: "hover:bg-blue-600",
    label: "Facebook",
  },
  {
    icon: RiTwitterXLine,
    url: "https://twitter.com/patrulhaaereacivil",
    color: "hover:bg-black",
    label: "Twitter",
  },
  {
    icon: RiInstagramLine,
    url: "https://instagram.com/patrulhaaereacivil",
    color: "hover:bg-pink-600",
    label: "Instagram",
  },
  {
    icon: RiWhatsappLine,
    url: "https://wa.me/5521999999999",
    color: "hover:bg-green-600",
    label: "WhatsApp",
  },
];

const NAVIGATION_LINKS = [
  { href: "/sobre", label: "SOBRE NÓS" },
  { href: "/servicos", label: "SERVIÇOS" },
  { href: "/atividades", label: "ATIVIDADES" },
  { href: "/noticias", label: "NOTÍCIAS" },
  { href: "/galeria", label: "GALERIA" },
  { href: "/contato", label: "CONTATO" },
];

const LEGAL_LINKS = [
  { href: "/legislacao", label: "Legislação", icon: RiShieldCheckLine },
  { href: "/privacidade", label: "Privacidade", icon: RiShieldCheckLine },
  { href: "/termos", label: "Termos de Uso", icon: RiCopyrightLine },
];

const BrandSection = () => {
  const ref = useRef(null);

  return (
    <motion.div
      ref={ref}
      className="col-span-1 md:col-span-2 lg:col-span-2"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <Link
        href="/"
        className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4 group"
        aria-label="Página inicial da Patrulha Aérea Civil"
      >
        <motion.div
          className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src="/images/logos/logo.webp"
            alt="Patrulha Aérea Civil"
            width={56}
            height={56}
            className="object-contain group-hover:scale-105 transition-transform duration-300"
            style={{ width: "auto", height: "auto" }}
            sizes="(max-width: 640px) 40px, (max-width: 768px) 48px, 56px"
          />
        </motion.div>
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 font-bebas tracking-wide truncate">
            Patrulha Aérea Civil
          </h2>
          <p className="text-navy font-roboto font-medium text-xs sm:text-sm truncate">
            COMANDO OPERACIONAL NO ESTADO DO RIO DE JANEIRO
          </p>
        </div>
      </Link>
      <motion.p
        className="text-slate-700 max-w-md font-roboto leading-relaxed text-xs sm:text-sm mt-2"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
      >
        Organização civil dedicada ao serviço aéreo humanitário, resgate e apoio
        às comunidades em situações de emergência. Comprometidos com a segurança
        e o bem-estar da população.
      </motion.p>
      <SocialLinks />
    </motion.div>
  );
};

const SocialLinks = () => {
  const ref = useRef(null);

  return (
    <motion.div
      ref={ref}
      className="mt-4 sm:mt-6 flex space-x-2 sm:space-x-3"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      viewport={{ once: true }}
    >
      {SOCIAL_LINKS.map((social, index) => (
        <motion.a
          key={index}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "text-slate-700 transition-all duration-300 hover:scale-110",
            "bg-slate-100 rounded-full p-1.5 sm:p-2 border border-slate-200",
            social.color,
            "hover:text-white",
            "touch-optimize active:scale-95 focus:outline-none focus:ring-2 focus:ring-navy/50"
          )}
          title={social.label}
          aria-label={social.label}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
          viewport={{ once: true }}
        >
          <social.icon className="w-3 h-3 sm:w-4 sm:h-4" />
        </motion.a>
      ))}
    </motion.div>
  );
};

const NavigationSection = () => {
  const ref = useRef(null);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <SectionTitle title="Navegação" />
      <ul className="space-y-1 sm:space-y-2">
        {NAVIGATION_LINKS.map((link, index) => (
          <motion.li
            key={link.href}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 + 0.3 }}
            viewport={{ once: true }}
          >
            <Link
              href={link.href}
              className="text-slate-700 text-xs sm:text-sm font-medium py-1 sm:py-1.5 transition-all duration-300 uppercase tracking-wider font-roboto hover:text-navy hover:font-semibold block relative group/navlink w-fit touch-optimize focus:outline-none focus:ring-2 focus:ring-navy/50"
            >
              <span className="relative z-10 transition-colors duration-300">
                {link.label}
              </span>
              <div className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-navy transition-all duration-300 group-hover/navlink:w-full" />
            </Link>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

const ContactSection = () => {
  const ref = useRef(null);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <SectionTitle title="Contato & Emergência" />
      <ContactInfo />
      <EmergencyButton />
    </motion.div>
  );
};

const SectionTitle = ({ title }: { title: string }) => {
  const ref = useRef(null);

  return (
    <motion.h3
      ref={ref}
      className="text-base sm:text-lg font-bold text-slate-800 mb-2 sm:mb-3 font-bebas tracking-wide border-b border-navy pb-1 sm:pb-2"
      initial={{ opacity: 0, y: -10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      {title}
    </motion.h3>
  );
};

const ContactInfo = () => {
  const ref = useRef(null);

  return (
    <ul
      ref={ref}
      className="space-y-1.5 sm:space-y-2 text-slate-700 font-roboto text-xs sm:text-sm"
    >
      <ContactItem
        icon={RiMailLine}
        text="contato@patrulhaaereacivil.org.br"
        index={0}
      />
      <ContactItem icon={RiPhoneLine} text="(21) 99999-9999" index={1} />
      <ContactItem
        icon={RiAlertLine}
        text="Emergência: 24/7"
        isEmergency
        index={2}
      />
      <ContactItem
        icon={RiMapPinLine}
        text="Rio de Janeiro, Brasil"
        index={3}
      />
    </ul>
  );
};

interface ContactItemProps {
  icon: IconType;
  text: string;
  isEmergency?: boolean;
  index: number;
}

const ContactItem = ({
  icon: Icon,
  text,
  isEmergency = false,
  index,
}: ContactItemProps) => (
  <motion.li
    className={`flex items-start space-x-1.5 sm:space-x-2 transition-colors duration-300 ${
      isEmergency ? "hover:text-alert" : "hover:text-navy"
    }`}
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 + 0.4 }}
    viewport={{ once: true }}
  >
    <Icon
      className={`w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 ${
        isEmergency ? "text-alert" : "text-navy"
      }`}
    />
    <span
      className={`text-xs sm:text-sm ${
        isEmergency ? "font-semibold text-alert" : "text-slate-700"
      }`}
    >
      {text}
    </span>
  </motion.li>
);

const EmergencyButton = () => {
  const ref = useRef(null);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      viewport={{ once: true }}
    >
      <Button
        className="w-full mt-2 sm:mt-3 bg-alert hover:bg-alert/90 text-white font-bold py-2 sm:py-2.5 transition-all duration-300 hover:scale-105 shadow font-roboto border-0 group/emergency relative overflow-hidden text-xs sm:text-sm touch-optimize active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
        asChild
      >
        <Link
          href="/contato"
          aria-label="Página de contato de emergência"
          className="focus:outline-none"
        >
          <span className="relative z-10 flex items-center justify-center">
            <RiAlertLine className="mr-1 sm:mr-2 w-3 h-3 sm:w-3.5 sm:h-3.5" />
            EMERGÊNCIA
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/emergency:translate-x-[100%] transition-transform duration-1000" />
        </Link>
      </Button>
    </motion.div>
  );
};

const BottomFooter = () => {
  const ref = useRef(null);

  return (
    <motion.div
      ref={ref}
      className="border-t border-slate-200 mt-4 sm:mt-6 pt-3 sm:pt-4 flex flex-col md:flex-row justify-between items-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3 md:mb-0">
        <div className="relative">
          <Image
            src="/images/logos/flag-br.webp"
            alt="Bandeira do Brasil"
            width={28}
            height={24}
            style={{ width: "auto", height: "auto" }}
          />
        </div>
        <p className="text-slate-700 text-xs font-roboto whitespace-nowrap">
          © {new Date().getFullYear()} Patrulha Aérea Civil. Todos os direitos
          reservados.
        </p>
      </div>

      <LegalLinks />
    </motion.div>
  );
};

const LegalLinks = () => {
  const ref = useRef(null);

  return (
    <motion.div
      ref={ref}
      className="flex flex-wrap justify-center gap-1 sm:gap-2 md:gap-3"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      viewport={{ once: true }}
    >
      {LEGAL_LINKS.map((link, index) => (
        <motion.div
          key={link.href}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 + 0.5 }}
          viewport={{ once: true }}
        >
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-slate-700 hover:text-navy hover:bg-navy/10 text-xs font-roboto transition-all duration-300 h-7 sm:h-8 px-2 sm:px-3 touch-optimize focus:outline-none focus:ring-2 focus:ring-navy/50"
          >
            <Link
              href={link.href}
              className="flex items-center gap-1 focus:outline-none"
            >
              {link.icon && <link.icon className="w-3 h-3" />}
              {link.label}
            </Link>
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
};

export function Footer() {
  const ref = useRef(null);

  return (
    <footer
      ref={ref}
      className="bg-white text-slate-700 border-t border-navy"
      role="contentinfo"
    >
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <BrandSection />
          <NavigationSection />
          <ContactSection />
        </motion.div>
        <BottomFooter />
      </div>

      {/* Accessibilidade - Skip to content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-navy focus:text-white focus:px-4 focus:py-2 focus:rounded"
      >
        Pular para conteúdo principal
      </a>
    </footer>
  );
}
