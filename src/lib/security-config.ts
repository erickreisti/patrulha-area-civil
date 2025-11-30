// src/lib/security-config.ts
export const SEGURANCA = {
  SENHA_PADRAO: "PAC@2025!Secure",
  TENTATIVAS_MAXIMAS: 5,
  BLOQUEIO_MINUTOS: 15,
  ROTACAO_SENHA_MESES: 6,
  COMPRIMENTO_MINIMO: 12,
} as const;

// Função para admin rotacionar senhas (usar no painel admin)
export const rotacionarSenhaPadrao = async (novaSenha: string) => {
  // Esta função seria chamada apenas pelo admin
  // Via API route ou função server-side
  console.log(`[ADMIN] Senha padrão rotacionada para: ${novaSenha}`);

  // Aqui você implementaria a lógica para atualizar
  // todas as senhas no Supabase Auth
  // return await atualizarSenhasEmMassa(novaSenha);
};
