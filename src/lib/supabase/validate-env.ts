export function validateEnvironment(): void {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const errorMsg = `Variáveis de ambiente faltando: ${missing.join(", ")}`;
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

  if (!supabaseUrl.startsWith("https://")) {
    console.error("❌ URL do Supabase deve usar HTTPS");
    throw new Error("URL do Supabase inválida - deve usar HTTPS");
  }

  if (process.env.NODE_ENV === "production") {
    if (
      supabaseUrl.includes("localhost") ||
      supabaseUrl.includes("127.0.0.1") ||
      supabaseUrl.includes("0.0.0.0")
    ) {
      console.error("❌ URL do Supabase contém endereço local em produção");
      throw new Error("Não use localhost em produção");
    }

    if (supabaseUrl.includes("http://")) {
      console.error("❌ URL do Supabase usa HTTP em produção");
      throw new Error("Use HTTPS em produção");
    }
  }

  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (supabaseAnonKey.length < 20) {
    console.error("❌ Chave anônima muito curta");
    throw new Error("Chave anônima inválida");
  }

  if (supabaseServiceKey.length < 20) {
    console.error("❌ Service role key muito curta");
    throw new Error("Service role key inválida");
  }

  console.log("✅ Ambiente validado com sucesso");
}

export function validateClientEnvironment(): boolean {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return !!(supabaseUrl && supabaseAnonKey);
  } catch {
    return false;
  }
}
