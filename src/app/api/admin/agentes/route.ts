// app/api/admin/agentes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    // Verificar se é admin (via token JWT)
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();

    // Buscar todos os agentes
    const { data: agents, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar agentes:", error);
      return NextResponse.json(
        { error: "Erro ao buscar agentes", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: agents || [],
      count: agents?.length || 0,
    });
  } catch (error: unknown) {
    console.error("Erro inesperado:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
