import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api/middleware/auth";
import {
  handleApiError,
  createSuccessResponse,
} from "@/lib/utils/error-handler";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { supabaseAdmin, user } = authResult;
    const { id } = await params;

    // Verificar se a notificação pertence ao usuário
    const { data: notification } = await supabaseAdmin
      .from("notifications")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!notification || notification.user_id !== user.id) {
      return NextResponse.json(
        { error: "Notificação não encontrada" },
        { status: 404 }
      );
    }

    // Marcar como lida
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .update({
        is_read: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar notificação: ${error.message}`);
    }

    return createSuccessResponse(data, "Notificação marcada como lida");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { supabaseAdmin, user } = authResult;
    const { id } = await params;

    // Verificar se a notificação pertence ao usuário
    const { data: notification } = await supabaseAdmin
      .from("notifications")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!notification || notification.user_id !== user.id) {
      return NextResponse.json(
        { error: "Notificação não encontrada" },
        { status: 404 }
      );
    }

    // Deletar notificação
    const { error } = await supabaseAdmin
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(`Erro ao deletar notificação: ${error.message}`);
    }

    return createSuccessResponse(null, "Notificação excluída");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
