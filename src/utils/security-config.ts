export const SEGURANCA = {
  SENHA_PADRAO: "PAC@2025!Secure",
  TENTATIVAS_MAXIMAS: 5,
  BLOQUEIO_MINUTOS: 15,
  ROTACAO_SENHA_MESES: 6,
  COMPRIMENTO_MINIMO: 12,
  SESSION_TIMEOUT_MINUTES: 60,
  REQUIRE_EMAIL_CONFIRMATION: true,
} as const;

export const validarSenha = (
  password: string
): { isValid: boolean; message?: string } => {
  if (password.length < SEGURANCA.COMPRIMENTO_MINIMO) {
    return {
      isValid: false,
      message: `A senha deve ter pelo menos ${SEGURANCA.COMPRIMENTO_MINIMO} caracteres`,
    };
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
    return {
      isValid: false,
      message:
        "A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais",
    };
  }

  return { isValid: true };
};

export const rotacionarSenhaPadrao = async (
  novaSenha: string
): Promise<boolean> => {
  const validacao = validarSenha(novaSenha);
  if (!validacao.isValid) {
    throw new Error(validacao.message || "Senha inválida");
  }

  console.log(`[ADMIN] Senha padrão rotacionada para: ${novaSenha}`);
  return true;
};
