"use client";

import Link from "next/link";
import Image from "next/image";
import {
  RiFacebookFill,
  RiInstagramLine,
  RiWhatsappLine,
  RiMailLine,
  RiPhoneLine,
  RiMapPinLine,
  RiTwitterXLine,
  RiArrowRightSLine,
} from "react-icons/ri";
import { motion, Variants } from "framer-motion";
import { IconType } from "react-icons";
import { cn } from "@/lib/utils/cn";

// --- DADOS ---

const SOCIAL_LINKS = [
  {
    icon: RiFacebookFill,
    url: "https://facebook.com/patrulhaaereacivil",
    label: "Facebook",
    hoverClass: "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]",
  },
  {
    icon: RiTwitterXLine,
    url: "https://twitter.com/patrulhaaereacivil",
    label: "Twitter",
    hoverClass: "hover:bg-black hover:text-white hover:border-black",
  },
  {
    icon: RiInstagramLine,
    url: "https://instagram.com/patrulhaaereacivil",
    label: "Instagram",
    hoverClass: "hover:bg-[#E4405F] hover:text-white hover:border-[#E4405F]",
  },
  {
    icon: RiWhatsappLine,
    url: "https://wa.me/5521981853463",
    label: "WhatsApp",
    hoverClass: "hover:bg-[#25D366] hover:text-white hover:border-[#25D366]",
  },
];

const NAVIGATION_LINKS = [
  { href: "/sobre", label: "Sobre Nós" },
  { href: "/servicos", label: "Serviços Operacionais" },
  { href: "/eventos", label: "Eventos e Reuniões" },
  { href: "/noticias", label: "Notícias & Avisos" },
  { href: "/galeria", label: "Galeria e Multimídia" },
  { href: "/contato", label: "Fale Conosco" },
];

const LEGAL_LINKS = [
  { href: "/legislacao", label: "Legislação" },
  { href: "/privacidade", label: "Privacidade" },
  { href: "/termos", label: "Termos de Uso" },
];

// --- VARIANTES DE ANIMAÇÃO ---

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

// --- SUB-COMPONENTES ---

const BrandSection = () => {
  return (
    <motion.div
      variants={itemVariants}
      className="col-span-1 lg:col-span-2 pr-0 lg:pr-12"
    >
      <Link
        href="/"
        className="flex items-center gap-4 mb-6 group w-fit"
        aria-label="Ir para página inicial"
      >
        {/* SOLUÇÃO DEFINITIVA: Container com tamanho fixo + Fill */}
        <div className="relative w-16 h-16 transition-transform duration-300 group-hover:scale-105">
          <Image
            src="/images/logos/logo.webp"
            alt="Brasão Patrulha Aérea Civil"
            fill
            sizes="64px"
            className="object-contain drop-shadow-lg"
          />
        </div>
        <div className="flex flex-col">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">
            Patrulha Aérea <span className="text-pac-primary">Civil</span>
          </h2>
          <p className="text-[10px] sm:text-xs font-bold text-pac-primary/80 uppercase tracking-[0.15em]">
            Comando Operacional RJ
          </p>
        </div>
      </Link>

      <p className="text-slate-600 text-sm leading-relaxed mb-8 max-w-md font-medium">
        Organização civil dedicada ao serviço aéreo humanitário, resgate e apoio
        às comunidades. Atuamos com honra e disciplina para garantir a segurança
        e o bem-estar da população brasileira.
      </p>

      <div className="flex gap-3">
        {SOCIAL_LINKS.map((social, index) => (
          <a
            key={index}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-500 border border-slate-200 transition-all duration-300 shadow-sm",
              social.hoverClass,
              "hover:-translate-y-1 hover:shadow-md",
            )}
            title={social.label}
          >
            <social.icon className="w-5 h-5 transition-colors" />
          </a>
        ))}
      </div>
    </motion.div>
  );
};

const NavigationSection = () => {
  return (
    <motion.div variants={itemVariants} className="col-span-1">
      <h3 className="text-slate-900 font-bold uppercase tracking-wider text-sm mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-pac-primary" />
        Navegação
      </h3>
      <ul className="space-y-3">
        {NAVIGATION_LINKS.map((link) => (
          <li key={link.href} className="w-fit">
            <Link
              href={link.href}
              className="group relative flex items-center text-sm font-medium text-slate-600 hover:text-pac-primary transition-colors duration-300"
            >
              <span className="relative z-10 flex items-center">
                <RiArrowRightSLine className="w-4 h-4 mr-2 text-slate-400 group-hover:text-pac-primary group-hover:translate-x-1 transition-all" />
                {link.label}
              </span>
              <span className="absolute left-6 bottom-0 h-[1.5px] w-0 bg-pac-primary transition-all duration-300 group-hover:w-[calc(100%-1.5rem)]" />
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

const ContactSection = () => {
  return (
    <motion.div variants={itemVariants} className="col-span-1">
      <h3 className="text-slate-900 font-bold uppercase tracking-wider text-sm mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-pac-primary" />
        Contato
      </h3>

      <ul className="space-y-4 mb-8">
        <ContactItem
          icon={RiMailLine}
          text="contato@patrulhaaereacivil.org.br"
        />
        <ContactItem icon={RiPhoneLine} text="(21) 98185-3463" />
        <ContactItem icon={RiMapPinLine} text="Rio de Janeiro, Brasil" />
      </ul>
    </motion.div>
  );
};

const ContactItem = ({
  icon: Icon,
  text,
}: {
  icon: IconType;
  text: string;
}) => (
  <li className="flex items-start gap-3 text-slate-600 group">
    <div className="w-8 h-8 rounded bg-pac-primary/5 flex items-center justify-center shrink-0 group-hover:bg-pac-primary transition-colors border border-pac-primary/10 group-hover:border-pac-primary">
      <Icon className="w-4 h-4 text-pac-primary group-hover:text-white transition-colors" />
    </div>
    <span className="text-sm pt-1.5 font-medium group-hover:text-slate-900 transition-colors">
      {text}
    </span>
  </li>
);

const BottomFooter = () => {
  return (
    <div className="border-t border-slate-200 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-3">
        {/* SOLUÇÃO DEFINITIVA: Container relativo com tamanho fixo + Fill */}
        <div className="relative w-6 h-4 shadow-sm">
          <Image
            src="/images/logos/flag-br.webp"
            alt="Brasil"
            fill
            sizes="24px"
            className="object-contain opacity-90"
          />
        </div>
        <p className="text-slate-500 text-xs font-medium">
          © {new Date().getFullYear()} Patrulha Aérea Civil. Todos os direitos
          reservados.
        </p>
      </div>

      <div className="flex gap-6">
        {LEGAL_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs font-medium text-slate-500 hover:text-pac-primary transition-colors relative group"
          >
            <span className="relative z-10">{link.label}</span>
            <span className="absolute left-0 -bottom-0.5 w-0 h-[1px] bg-pac-primary transition-all duration-300 group-hover:w-full" />
          </Link>
        ))}
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---

export function Footer() {
  return (
    <footer className="bg-white text-slate-600 relative overflow-hidden border-t border-slate-100">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-10">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <BrandSection />
          <NavigationSection />
          <ContactSection />
        </motion.div>

        <BottomFooter />
      </div>
    </footer>
  );
}
