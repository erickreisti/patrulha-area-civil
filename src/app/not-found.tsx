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
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-offwhite to-navy-light/10 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/" className="inline-block mb-8">
            <div className="flex items-center justify-center gap-4">
              <div className="relative w-20 h-20">
                <Image
                  src="/images/logos/logo.webp"
                  alt="Patrulha Aérea Civil"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <div className="text-left">
                <h1 className="font-bebas text-3xl bg-gradient-to-r from-navy-light to-navy bg-clip-text text-transparent tracking-wider uppercase leading-none">
                  PATRULHA AÉREA CIVIL
                </h1>
                <p className="text-gray-600 text-sm leading-tight mt-1">
                  Serviço Humanitário de Excelência
                </p>
              </div>
            </div>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Lado Esquerdo - Ilustração e Código de Erro */}
          <motion.div
            className="text-center lg:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative mb-8">
              <div className="w-48 h-48 mx-auto lg:mx-0 bg-navy-light/10 rounded-full flex items-center justify-center border-4 border-navy-light/20">
                <div className="w-32 h-32 bg-navy-light/20 rounded-full flex items-center justify-center border-4 border-navy-light/30">
                  <FaExclamationTriangle className="h-16 w-16 text-navy-light" />
                </div>
              </div>

              {/* Código de Erro */}
              <div className="absolute -top-4 -right-4 lg:-right-8">
                <div className="bg-alert text-white px-6 py-3 rounded-lg shadow-lg transform rotate-6">
                  <span className="font-mono text-4xl font-bold tracking-wider">
                    404
                  </span>
                </div>
              </div>
            </div>

            <motion.h1
              className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4 font-bebas uppercase tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              PÁGINA <span className="text-navy">NÃO ENCONTRADA</span>
            </motion.h1>

            <motion.p
              className="text-lg text-gray-600 mb-6 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              A rota que você está tentando acessar não foi localizada em nosso
              sistema. Possivelmente a página foi movida, renomeada ou está
              temporariamente indisponível.
            </motion.p>

            <motion.div
              className="bg-navy-light/5 border border-navy-light/20 rounded-lg p-4 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-start gap-3">
                <FaShieldAlt className="h-5 w-5 text-navy-light mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-700 font-medium">
                    Status:{" "}
                    <span className="text-alert font-bold">
                      PÁGINA NÃO LOCALIZADA
                    </span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Nossa equipe foi notificada sobre este incidente.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Lado Direito - Ações e Navegação */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 font-bebas uppercase tracking-wide">
                AÇÕES RECOMENDADAS
              </h3>

              <div className="space-y-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className="w-full bg-navy-light hover:bg-navy text-white font-semibold py-4 text-base rounded-lg transition-all duration-300 group/button relative overflow-hidden shadow-md"
                    asChild
                  >
                    <Link
                      href="/"
                      className="flex items-center justify-center gap-3"
                    >
                      <FaHome className="h-5 w-5" />
                      <span>VOLTAR PARA PÁGINA INICIAL</span>
                    </Link>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="w-full border-2 border-navy-light text-navy-light hover:bg-navy-light hover:text-white font-semibold py-4 text-base rounded-lg transition-all duration-300 group/outline relative overflow-hidden"
                    asChild
                  >
                    <Link
                      href="/servicos"
                      className="flex items-center justify-center gap-3"
                    >
                      <FaSearch className="h-5 w-5" />
                      <span>EXPLORAR NOSSOS SERVIÇOS</span>
                    </Link>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="w-full border-2 border-gray-300 text-gray-600 hover:border-navy hover:text-navy font-semibold py-4 text-base rounded-lg transition-all duration-300"
                    asChild
                  >
                    <Link
                      href="/contato"
                      className="flex items-center justify-center gap-3"
                    >
                      <FaPhone className="h-5 w-5" />
                      <span>FALAR COM SUPORTE</span>
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Informações de Contato de Emergência */}
            <motion.div
              className="bg-alert/5 border border-alert/20 rounded-xl p-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="flex items-start gap-3 mb-3">
                <FaExclamationTriangle className="h-6 w-6 text-alert mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-alert text-lg mb-1">
                    EMERGÊNCIA?
                  </h4>
                  <p className="text-gray-700 text-sm mb-3">
                    Se esta é uma situação de emergência, entre em contato
                    imediatamente:
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <FaPhone className="h-4 w-4 text-alert" />
                  <span className="font-semibold">
                    Emergência 24h: (21) 99999-9999
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="h-4 w-4 text-alert" />
                  <span>Base Central - Rio de Janeiro</span>
                </div>
              </div>
            </motion.div>

            {/* Navegação Rápida */}
            <motion.div
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <h4 className="font-bold text-gray-800 mb-3 text-lg">
                NAVEGAÇÃO RÁPIDA
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/sobre"
                  className="text-navy hover:text-navy-light text-sm font-medium transition-colors py-1"
                >
                  Sobre Nós
                </Link>
                <Link
                  href="/atividades"
                  className="text-navy hover:text-navy-light text-sm font-medium transition-colors py-1"
                >
                  Atividades
                </Link>
                <Link
                  href="/noticias"
                  className="text-navy hover:text-navy-light text-sm font-medium transition-colors py-1"
                >
                  Notícias
                </Link>
                <Link
                  href="/galeria"
                  className="text-navy hover:text-navy-light text-sm font-medium transition-colors py-1"
                >
                  Galeria
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Rodapé da Página 404 */}
        <motion.div
          className="text-center mt-12 pt-6 border-t border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <p className="text-gray-500 text-sm">
            Patrulha Aérea Civil © 2024 • Serviço Humanitário de Excelência
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Se você acredita que isto é um erro, por favor{" "}
            <Link
              href="/contato"
              className="text-navy-light hover:text-navy font-medium"
            >
              reporte ao nosso suporte
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
