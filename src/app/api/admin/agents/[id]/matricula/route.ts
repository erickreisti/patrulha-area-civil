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
    const { matricula } = await request.json();

    if (!matricula || typeof matricula !== "string") {
      return createValidationError("Matrícula é obrigatória");
    }

    const result = await AgentsService.updateMatricula(
      id,
      matricula.trim(),
      user.id,
      user.email
    );

    return createSuccessResponse(result, "Matrícula atualizada com sucesso");
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
