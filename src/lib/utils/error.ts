import { NextResponse } from "next/server";

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleError(error: unknown): NextResponse {
  console.error("Error:", error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        details: error.details,
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details:
          process.env.NODE_ENV === "development"
            ? { message: error.message, stack: error.stack }
            : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: "Erro interno do servidor",
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

export function createSuccessResponse<T = unknown>(
  data?: T,
  message?: string
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

// Erros comuns
export const Errors = {
  NOT_FOUND: (resource: string) =>
    new AppError(`${resource} não encontrado`, 404),

  UNAUTHORIZED: () => new AppError("Não autorizado", 401),

  FORBIDDEN: () => new AppError("Acesso negado", 403),

  BAD_REQUEST: (message: string) => new AppError(message, 400),

  CONFLICT: (message: string) => new AppError(message, 409),

  VALIDATION: (errors: Record<string, string[]>) =>
    new AppError("Erro de validação", 400, { errors }),
};
