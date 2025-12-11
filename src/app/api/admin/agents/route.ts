import { NextRequest, NextResponse } from "next/server";
import { requireAdminAuth } from "@/lib/api/middleware/auth";
import {
  handleApiError,
  createSuccessResponse,
  createValidationError,
} from "@/lib/api/utils/error-handler";
import { AgentsService } from "@/lib/services/agents.service";

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);

    const options = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "50"),
      search: searchParams.get("search") || undefined,
      status:
        searchParams.get("status") === "true"
          ? true
          : searchParams.get("status") === "false"
          ? false
          : undefined,
      role: searchParams.get("role") || undefined,
    };

    const result = await AgentsService.getAgents(options);

    return createSuccessResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;

    const body = await request.json();

    // Validações básicas
    if (!body.matricula || !body.email || !body.full_name) {
      return createValidationError("Matrícula, email e nome são obrigatórios");
    }

    const result = await AgentsService.createAgent(body, user.id, user.email);

    return createSuccessResponse(result, "Agente criado com sucesso");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
