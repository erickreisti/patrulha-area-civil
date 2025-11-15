// src/app/test-supabase/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestSupabase() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const testConnection = async () => {
      try {
        const supabase = createClient();

        // Teste simples - tentar buscar qualquer coisa
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .limit(1);

        if (error) {
          // Se a tabela não existe, mas a conexão funciona
          if (error.code === "42P01") {
            setStatus("success");
            setMessage(
              "✅ Conexão com Supabase estabelecida! (Tabelas ainda não criadas)"
            );
          } else {
            throw error;
          }
        } else {
          setStatus("success");
          setMessage("✅ Conexão com Supabase estabelecida com sucesso!");
        }
      } catch (error: any) {
        setStatus("error");
        setMessage(`❌ Erro: ${error.message}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Teste de Conexão Supabase
        </h1>
        <div
          className={`p-4 rounded text-center ${
            status === "loading"
              ? "bg-yellow-100 text-yellow-800"
              : status === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status === "loading" ? "🔄 Testando conexão..." : message}
        </div>

        {status === "error" && (
          <div className="mt-4 p-4 bg-gray-100 rounded text-sm">
            <p className="font-semibold mb-2">Solução de problemas:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Verifique se as variáveis de ambiente estão corretas</li>
              <li>Confirme se o projeto Supabase está ativo</li>
              <li>Teste a URL diretamente no navegador</li>
            </ul>
          </div>
        )}

        <div className="mt-6 text-center">
          <a href="/" className="text-navy-light hover:text-navy font-medium">
            ← Voltar para o site
          </a>
        </div>
      </div>
    </div>
  );
}
