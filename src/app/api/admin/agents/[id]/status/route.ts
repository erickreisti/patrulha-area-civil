import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/api/middleware/auth";
import {
  handleApiError,
  createSuccessResponse,
  createValidationError,
} from "@/lib/utils/error-handler";
import { AgentsService } from "@/lib/services/agents.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;
    const { id } = await params;
    const { status } = await request.json();

    if (typeof status !== "boolean") {
      return createValidationError("Status deve ser true ou false");
    }

    const result = await AgentsService.updateStatus(
      id,
      status,
      user.id,
      user.email
    );

    return createSuccessResponse(
      result,
      `Agente ${status ? "ativado" : "desativado"} com sucesso`
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
