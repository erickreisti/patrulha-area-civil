// lib/supabase/validate-env.ts
export function validateEnvironment() {
  const requiredVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  // Validar formato das chaves
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (serviceRoleKey.startsWith("eyJ")) {
    console.warn(
      "⚠️ Service Role Key parece ser um JWT. Certifique-se de que é a chave correta."
    );
  }

  // Em produção, garantir que não estamos usando chaves de desenvolvimento
  if (process.env.NODE_ENV === "production") {
    if (process.env.NEXT_PUBLIC_SITE_URL?.includes("localhost")) {
      throw new Error("URL do site não pode ser localhost em produção");
    }
  }
}
