"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { motion } from "framer-motion";

const SOCIAL_LINKS = [
  {
    icon: FaFacebook,
    url: "https://facebook.com/patrulhaaereacivil",
    color: "hover:bg-blue-600 hover:text-white",
  },
  {
    icon: FaInstagram,
    url: "https://instagram.com/patrulhaaereacivil",
    color: "hover:bg-pink-600 hover:text-white",
  },
  {
    icon: FaXTwitter,
    url: "https://twitter.com/patrulhaaereacivil",
    color: "hover:bg-black hover:text-white",
  },
  {
    icon: FaWhatsapp,
    url: "https://wa.me/5521999999999",
    color: "hover:bg-green-600 hover:text-white",
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
  { href: "/legislacao", label: "Legislação" },
  { href: "/privacidade", label: "Privacidade" },
  { href: "/termos", label: "Termos de Uso" },
];

const BrandSection = () => {
  return (
    <motion.div
      className="col-span-1 md:col-span-2 lg:col-span-2"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
    >
      <Link href="/" className="flex items-center space-x-4 mb-6 group">
        <motion.div
          className="relative w-16 h-16"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src="/images/logos/logo.webp"
            alt="Patrulha Aérea Civil"
            width={64}
            height={64}
            className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        </motion.div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 font-bebas tracking-wide">
            Patrulha Aérea Civil
          </h2>
          <p className="text-navy font-roboto font-medium text-base">
            Servindo com Excelência e Dedicação
          </p>
        </div>
      </Link>
      <motion.p
        className="text-gray-800 max-w-md font-roboto leading-relaxed text-base"
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

const SocialLinks = () => (
  <motion.div
    className="mt-8 flex space-x-4"
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
        className={`text-gray-800 transition-all duration-300 hover:scale-110 bg-gray-100 rounded-full p-3 hover-lift border border-gray-200 ${social.color}`}
        title={social.icon === FaXTwitter ? "X (Twitter)" : social.icon.name}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        viewport={{ once: true }}
      >
        <social.icon className="h-5 w-5" />
      </motion.a>
    ))}
  </motion.div>
);

const NavigationSection = () => (
  <motion.div
    initial={{ opacity: 0, x: -30 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    viewport={{ once: true }}
  >
    <SectionTitle title="Navegação" />
    <ul className="space-y-3">
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
            className="text-navy text-base font-medium py-2 transition-all duration-300 uppercase tracking-wider font-roboto hover:text-navy-light hover:font-semibold block relative group/navlink w-fit"
          >
            <span className="relative z-10 transition-colors duration-300">
              {link.label}
            </span>
            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-navy-light transition-all duration-300 group-hover/navlink:w-full" />
          </Link>
        </motion.li>
      ))}
    </ul>
  </motion.div>
);

const ContactSection = () => (
  <motion.div
    initial={{ opacity: 0, x: 30 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay: 0.3 }}
    viewport={{ once: true }}
  >
    <SectionTitle title="Contato & Emergência" />
    <ContactInfo />
    <EmergencyButton />
  </motion.div>
);

const SectionTitle = ({ title }: { title: string }) => (
  <motion.h3
    className="text-xl font-bold text-gray-800 mb-6 font-bebas tracking-wide border-b-2 border-navy pb-2"
    initial={{ opacity: 0, y: -10 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
  >
    {title}
  </motion.h3>
);

const ContactInfo = () => (
  <ul className="space-y-4 text-gray-800 font-roboto text-base">
    <ContactItem
      icon={FaEnvelope}
      text="contato@patrulhaaereacivil.org.br"
      index={0}
    />
    <ContactItem icon={FaPhone} text="(21) 99999-9999" index={1} />
    <ContactItem
      icon={FaExclamationTriangle}
      text="Emergência: 24/7"
      isEmergency
      index={2}
    />
    <ContactItem
      icon={FaMapMarkerAlt}
      text="Rio de Janeiro, Brasil"
      index={3}
    />
  </ul>
);

const ContactItem = ({
  icon: Icon,
  text,
  isEmergency = false,
  index,
}: {
  icon: any;
  text: string;
  isEmergency?: boolean;
  index: number;
}) => (
  <motion.li
    className={`flex items-start space-x-3 transition-colors duration-300 ${
      isEmergency ? "hover:text-alert" : "hover:text-navy"
    }`}
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 + 0.4 }}
    viewport={{ once: true }}
  >
    <Icon
      className={`h-5 w-5 mt-1 flex-shrink-0 ${
        isEmergency ? "text-alert" : "text-navy"
      }`}
    />
    <span className={isEmergency ? "font-semibold" : ""}>{text}</span>
  </motion.li>
);

const EmergencyButton = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.6 }}
    viewport={{ once: true }}
  >
    <Button
      className="w-full mt-6 bg-alert hover:bg-alert/90 text-white font-bold py-3 transition-all duration-300 hover:scale-105 shadow-lg font-roboto border-0 group/emergency relative overflow-hidden"
      asChild
    >
      <Link href="/contato">
        <span className="relative z-10 flex items-center justify-center">
          <FaExclamationTriangle className="mr-2 h-4 w-4" />
          EMERGÊNCIA
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/emergency:translate-x-[100%] transition-transform duration-1000" />
      </Link>
    </Button>
  </motion.div>
);

const BottomFooter = () => {
  return (
    <motion.div
      className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      viewport={{ once: true }}
    >
      <div className="flex items-center space-x-4 mb-4 md:mb-0">
        <motion.div
          className="relative w-8 h-6"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src="/images/logos/flag-br.webp"
            alt="Bandeira do Brasil"
            width={32}
            height={24}
            className="object-contain rounded w-full h-full"
          />
        </motion.div>
        <p className="text-gray-800 text-sm font-roboto">
          © 2024 Patrulha Aérea Civil. Todos os direitos reservados.
        </p>
      </div>

      <LegalLinks />
    </motion.div>
  );
};

const LegalLinks = () => (
  <motion.div
    className="flex flex-wrap justify-center gap-4"
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
          className="text-gray-800 hover:text-navy hover:bg-navy/10 text-sm font-roboto transition-all duration-300"
        >
          <Link href={link.href}>{link.label}</Link>
        </Button>
      </motion.div>
    ))}
  </motion.div>
);

export function Footer() {
  return (
    <footer className="bg-white text-gray-800 border-t-2 border-navy">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <BrandSection />
          <NavigationSection />
          <ContactSection />
        </div>
        <BottomFooter />
      </div>
    </footer>
  );
}
