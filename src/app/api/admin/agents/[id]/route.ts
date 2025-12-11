import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/api/middleware/auth";
import {
  handleApiError,
  createSuccessResponse,
} from "@/lib/utils/error-handler";
import { AgentsService } from "@/lib/services/agents.service";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;
    const { id } = await params;

    const result = await AgentsService.deleteAgent(id, user.id, user.email);

    return createSuccessResponse(result, "Agente excluído com sucesso");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
