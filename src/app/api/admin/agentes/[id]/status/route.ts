// app/api/admin/agentes/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (typeof status !== "boolean") {
      return NextResponse.json(
        { error: "Status deve ser booleano (true/false)" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Atualizar status do agente
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar status:", error);
      return NextResponse.json(
        { error: "Erro ao atualizar status", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Agente ${status ? "ativado" : "desativado"} com sucesso`,
      data,
    });
  } catch (error: unknown) {
    console.error("Erro inesperado:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
