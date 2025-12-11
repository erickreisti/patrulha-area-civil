import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/utils/error-handler";

interface AuthResult {
  user: {
    id: string;
    email: string;
    role: "admin" | "agent";
  };
  supabaseAdmin: ReturnType<typeof createAdminClient>;
}

export async function requireAdminAuth(
  request: NextRequest
): Promise<AuthResult | NextResponse> {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError("Token de autorização não fornecido", 401);
    }

    const token = authHeader.split(" ")[1];
    const supabaseAdmin = createAdminClient();

    // Verificar token
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new ApiError("Token inválido ou expirado", 401);
    }

    // Verificar se é admin
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      throw new ApiError("Apenas administradores podem acessar", 403);
    }

    if (!profile.status) {
      throw new ApiError("Conta inativa", 403);
    }

    return {
      user: {
        id: user.id,
        email: user.email!,
        role: profile.role as "admin" | "agent",
      },
      supabaseAdmin,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Erro de autenticação" },
      { status: 500 }
    );
  }
}

export async function requireAuth(
  request: NextRequest
): Promise<AuthResult | NextResponse> {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      throw new ApiError("Não autorizado", 401);
    }

    const token = authHeader.split(" ")[1];
    const supabaseAdmin = createAdminClient();

    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new ApiError("Token inválido ou expirado", 401);
    }

    // Verificar status do usuário
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.status) {
      throw new ApiError("Conta inativa", 403);
    }

    return {
      user: {
        id: user.id,
        email: user.email!,
        role: profile.role as "admin" | "agent",
      },
      supabaseAdmin,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { error: "Erro de autenticação" },
      { status: 500 }
    );
  }
}
