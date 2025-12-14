// src/app/not-found.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  FaExclamationTriangle,
  FaHome,
  FaSearch,
  FaPhone,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaArrowRight,
  FaGlobeAmericas,
  FaSatellite,
  FaHelicopter,
  FaCompass,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-white flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-blue-900/[0.02] bg-[size:60px_60px]" />

        {/* Decorative circles */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-[#1A2873]/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-40 w-80 h-80 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-black/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-6xl relative z-10">
        {/* Header with Logo */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/" className="inline-block mb-10 group">
            <div className="flex items-center justify-center gap-5">
              <div className="relative w-24 h-24">
                <Image
                  src="/images/logos/logo.webp"
                  alt="Patrulha Aérea Civil"
                  fill
                  className="object-contain group-hover:scale-105 transition-transform duration-300"
                  sizes="96px"
                  priority
                />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-3 mb-1">
                  <FaHelicopter className="h-7 w-7 text-[#1A2873]" />
                  <h1 className="font-bebas text-4xl bg-gradient-to-r from-[#1A2873] via-[#2A3A99] to-[#1A2873] bg-clip-text text-transparent tracking-wider uppercase leading-none">
                    PATRULHA AÉREA CIVIL
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <FaSatellite className="h-4 w-4 text-red-600" />
                  <p className="text-gray-800 text-base leading-tight font-semibold">
                    Serviço Humanitário de Excelência
                  </p>
                  <FaGlobeAmericas className="h-4 w-4 text-[#1A2873]" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Illustration and Error Message */}
          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* Error Illustration */}
            <div className="relative mb-10">
              <div className="w-64 h-64 mx-auto lg:mx-0 bg-gradient-to-br from-[#1A2873]/10 to-[#1A2873]/5 rounded-full flex items-center justify-center border-8 border-[#1A2873]/20 backdrop-blur-sm">
                <div className="w-40 h-40 bg-gradient-to-br from-white to-blue-50 rounded-full flex items-center justify-center border-8 border-[#1A2873]/30 shadow-xl">
                  <div className="w-28 h-28 bg-gradient-to-br from-[#1A2873] to-[#2A3A99] rounded-full flex flex-col items-center justify-center text-white shadow-2xl">
                    <FaExclamationTriangle className="h-12 w-12 mb-2" />
                    <span className="text-xs font-bold tracking-widest uppercase">
                      ERROR
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating Error Code */}
              <div className="absolute -top-4 -right-4 lg:-right-8">
                <motion.div
                  className="bg-gradient-to-br from-red-600 to-red-700 text-white px-8 py-4 rounded-xl shadow-2xl transform rotate-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <span className="font-mono text-5xl font-black tracking-wider">
                    404
                  </span>
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-red-700 rotate-45"></div>
                </motion.div>
              </div>
            </div>

            {/* Error Message */}
            <motion.h1
              className="text-5xl lg:text-6xl font-bold text-black mb-6 font-bebas uppercase tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              PÁGINA{" "}
              <span className="text-transparent bg-gradient-to-r from-[#1A2873] via-[#2A3A99] to-[#1A2873] bg-clip-text">
                NÃO ENCONTRADA
              </span>
            </motion.h1>

            <motion.p
              className="text-lg text-gray-700 mb-8 leading-relaxed max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              A rota que você está tentando acessar não foi localizada em nosso
              sistema. Possivelmente a página foi movida, renomeada ou está
              temporariamente indisponível.
            </motion.p>

            {/* Status Card */}
            <motion.div
              className="bg-gradient-to-r from-blue-50 to-white border-2 border-[#1A2873]/20 rounded-xl p-6 mb-8 shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#1A2873] to-[#2A3A99] rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <FaShieldAlt className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <span>Status do Incidente</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                      CRÍTICO
                    </span>
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-[#1A2873]">
                        Código:
                      </span>{" "}
                      <span className="font-mono">ERR_404_NOT_FOUND</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Descrição:</span> Recurso
                      solicitado não existe no servidor
                    </p>
                    <p className="text-xs text-gray-500">
                      ✓ Nossa equipe técnica foi automaticamente notificada
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Actions and Navigation */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            {/* Recommended Actions */}
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <FaCompass className="h-6 w-6 text-[#1A2873]" />
                <h3 className="text-2xl font-bold text-gray-900 font-bebas uppercase tracking-wide">
                  AÇÕES RECOMENDADAS
                </h3>
              </div>

              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className="w-full bg-gradient-to-r from-[#1A2873] to-[#2A3A99] hover:from-[#2A3A99] hover:to-[#1A2873] text-white font-bold py-5 text-lg rounded-xl transition-all duration-300 group shadow-lg hover:shadow-xl"
                    asChild
                  >
                    <Link
                      href="/"
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <FaHome className="h-6 w-6" />
                        <span className="text-lg">PÁGINA INICIAL</span>
                      </div>
                      <FaArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
                    </Link>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="w-full border-3 border-[#1A2873] text-[#1A2873] hover:bg-[#1A2873] hover:text-white font-bold py-5 text-lg rounded-xl transition-all duration-300 group shadow-md hover:shadow-lg"
                    asChild
                  >
                    <Link
                      href="/servicos"
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <FaSearch className="h-6 w-6" />
                        <span className="text-lg">NOSSOS SERVIÇOS</span>
                      </div>
                      <FaArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
                    </Link>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="w-full border-2 border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600 font-bold py-5 text-lg rounded-xl transition-all duration-300 hover:shadow-md"
                    asChild
                  >
                    <Link
                      href="/contato"
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <FaPhone className="h-6 w-6" />
                        <span className="text-lg">SUPORTE TÉCNICO</span>
                      </div>
                      <FaArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-2" />
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Emergency Contact */}
            <motion.div
              className="bg-gradient-to-br from-red-50 to-white border-2 border-red-200 rounded-2xl p-6 shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                  <FaExclamationTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-red-700 text-xl mb-2">
                    EMERGÊNCIA 24H
                  </h4>
                  <p className="text-gray-700 text-sm mb-4">
                    Se esta é uma situação de emergência, entre em contato
                    imediatamente:
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-red-100">
                  <FaPhone className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-800">
                      Emergência 24h:{" "}
                      <span className="text-red-600">(21) 99999-9999</span>
                    </p>
                    <p className="text-xs text-gray-600">Chamada prioritária</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
                  <FaMapMarkerAlt className="h-5 w-5 text-[#1A2873] flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-800">Base Central</p>
                    <p className="text-sm text-gray-600">Rio de Janeiro - RJ</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Navigation */}
            <motion.div
              className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <h4 className="font-bold text-gray-900 text-xl mb-5">
                NAVEGAÇÃO RÁPIDA
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    href: "/sobre",
                    label: "Sobre Nós",
                    color: "text-[#1A2873]",
                  },
                  {
                    href: "/atividades",
                    label: "Atividades",
                    color: "text-[#1A2873]",
                  },
                  {
                    href: "/noticias",
                    label: "Notícias",
                    color: "text-[#1A2873]",
                  },
                  {
                    href: "/galeria",
                    label: "Galeria",
                    color: "text-[#1A2873]",
                  },
                  { href: "/equipe", label: "Equipe", color: "text-[#1A2873]" },
                  {
                    href: "/transparencia",
                    label: "Transparência",
                    color: "text-[#1A2873]",
                  },
                ].map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    className={`${item.color} hover:text-black font-medium text-sm transition-colors py-2 px-3 rounded-lg hover:bg-gray-100 flex items-center justify-between group`}
                  >
                    <span>{item.label}</span>
                    <FaArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          className="text-center mt-16 pt-8 border-t border-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <p className="text-gray-600 text-sm font-medium">
            <span className="text-[#1A2873] font-bold">
              Patrulha Aérea Civil
            </span>{" "}
            © 2024 • Serviço Humanitário de Excelência
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Se você acredita que isto é um erro, por favor{" "}
            <Link
              href="/contato"
              className="text-red-600 hover:text-red-700 font-semibold underline decoration-red-300 decoration-2 underline-offset-2"
            >
              reporte ao nosso suporte técnico
            </Link>
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 bg-[#1A2873] rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-gray-800 rounded-full animate-pulse delay-200"></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
