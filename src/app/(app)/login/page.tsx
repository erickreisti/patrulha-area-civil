"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [matricula, setMatricula] = useState("");

  const formatMatricula = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
        6
      )}`;
    } else {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(
        6,
        9
      )}-${numbers.slice(9, 11)}`;
    }
  };

  const handleMatriculaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMatricula(e.target.value);
    setMatricula(formatted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-offwhite to-navy-light/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="flex items-center justify-center gap-4 mb-6"
          >
            <div className="relative w-16 h-16">
              <Image
                src="/images/logos/logo.webp"
                alt="Patrulha Aérea Civil"
                width={64}
                height={64}
                className="object-contain rounded-md"
              />
            </div>
            <div className="text-left">
              <h1 className="font-bebas text-2xl bg-gradient-to-r from-navy-light to-navy bg-clip-text text-transparent tracking-wider uppercase leading-none">
                PATRULHA AÉREA CIVIL
              </h1>
              <p className="text-gray-600 text-sm leading-tight mt-1">
                Serviço Humanitário de Excelência
              </p>
            </div>
          </Link>

          <div className="inline-flex items-center gap-2 bg-navy-light/10 px-4 py-2 rounded-full border border-navy-light/20">
            <span className="text-navy-light text-sm font-medium">
              Sistema de Autenticação
            </span>
          </div>
        </div>

        {/* Formulário SIMPLES */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 backdrop-blur-sm">
          <h2 className="text-2xl font-bebas text-gray-800 text-center mb-6 tracking-wide">
            ACESSO DO AGENTE
          </h2>

          <form className="space-y-4">
            {/* Campo Matrícula */}
            <div>
              <label className="block text-gray-800 text-sm font-semibold mb-2">
                Matrícula do Agente
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={matricula}
                  onChange={handleMatriculaChange}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  className="w-full border-2 border-gray-200 focus:border-navy-light focus:ring-2 focus:ring-navy-light/20 text-base py-3 px-4 rounded-xl transition-all duration-200 font-medium tracking-wider"
                />
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Formato: XXX.XXX.XXX-XX (11 dígitos)
              </p>
            </div>

            {/* Campo Senha */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-gray-800 text-sm font-semibold">
                  Senha
                </label>
                <button
                  type="button"
                  className="text-navy-light hover:text-navy text-sm font-medium transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <input
                type="password"
                placeholder="Digite sua senha"
                className="w-full border-2 border-gray-200 focus:border-navy-light focus:ring-2 focus:ring-navy-light/20 text-base py-3 px-4 rounded-xl transition-all duration-200 font-medium"
              />
            </div>

            {/* Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 text-navy-light border-gray-200 rounded focus:ring-navy-light focus:ring-2"
              />
              <label
                htmlFor="remember"
                className="text-gray-600 text-sm font-medium"
              >
                Manter conectado
              </label>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-navy-light to-navy hover:from-navy hover:to-navy-dark text-white font-semibold py-3.5 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Entrar no Sistema
            </button>
          </form>

          {/* Separador */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-600 font-medium">
                ou
              </span>
            </div>
          </div>

          {/* Botão Voltar */}
          <Link
            href="/"
            className="w-full border-2 border-gray-200 text-gray-600 hover:text-navy-light hover:border-navy-light hover:bg-navy-light/10 font-medium py-3 text-base rounded-xl transition-all duration-300 group shadow-sm hover:shadow-md flex items-center justify-center"
          >
            Voltar para o Site
          </Link>
        </div>
      </div>
    </div>
  );
}
