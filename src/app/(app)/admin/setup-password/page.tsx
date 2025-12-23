"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  RiShieldKeyholeLine,
  RiEyeLine,
  RiEyeOffLine,
  RiErrorWarningLine,
  RiCheckLine,
} from "react-icons/ri";

export default function AdminSetupPasswordPage() {
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);

  const router = useRouter();
  const { profile, isLoading } = useAuthStore();

  // Verificar se a senha atende aos requisitos
  useEffect(() => {
    let strength = 0;
    if (adminPassword.length >= 6) strength += 1;
    if (/[A-Z]/.test(adminPassword)) strength += 1;
    if (/[0-9]/.test(adminPassword)) strength += 1;
    if (/[^A-Za-z0-9]/.test(adminPassword)) strength += 1;
    setPasswordStrength(strength);
  }, [adminPassword]);

  // Redirecionar se não for admin
  useEffect(() => {
    if (!isLoading && (!profile || profile.role !== "admin")) {
      router.push("/perfil");
    }

    // Se admin já tem senha configurada, redirecionar para perfil
    if (!isLoading && profile?.admin_2fa_enabled) {
      router.push("/perfil");
    }
  }, [profile, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adminPassword.trim()) {
      setError("Digite a senha de administrador");
      return;
    }

    if (adminPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (adminPassword.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (passwordStrength < 2) {
      setError(
        "A senha deve conter pelo menos uma letra maiúscula e um número"
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("matricula", profile?.matricula || "");
      formData.append("adminPassword", adminPassword);
      formData.append("confirmPassword", confirmPassword);

      // Importar e chamar a server action diretamente
      const adminAuthModule = await import(
        "@/app/actions/auth/admin/admin-auth"
      );
      const result = await adminAuthModule.setupAdminPassword(formData);

      console.log("🔍 [SetupPassword] Resultado:", result);

      if (result.success) {
        setSuccess("Senha administrativa configurada com sucesso!");

        // Atualizar o store local
        const { setProfile } = useAuthStore.getState();
        if (profile) {
          setProfile({
            ...profile,
            admin_2fa_enabled: true,
          });
        }

        // Redirecionar após 2 segundos
        setTimeout(() => {
          router.push("/perfil");
        }, 2000);
      } else {
        setError(result.error || "Erro ao configurar senha");
      }
    } catch (err) {
      console.error("❌ [SetupPassword] Erro:", err);
      setError("Erro ao configurar senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-navy to-navy-700">
        <Card className="w-full max-w-md border-2 border-navy/20 shadow-2xl">
          <CardContent className="p-8 text-center">
            <Spinner className="w-8 h-8 text-navy mx-auto mb-4" />
            <p className="text-slate-600">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile || profile.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-navy to-navy-700">
        <Card className="w-full max-w-md border-2 border-navy/20 shadow-2xl">
          <CardContent className="p-6 text-center">
            <RiErrorWarningLine className="w-14 h-14 text-error mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-3">
              Acesso Negado
            </h2>
            <p className="text-slate-600 mb-6">
              Apenas administradores podem acessar esta página.
            </p>
            <Button
              onClick={() => router.push("/perfil")}
              className="bg-navy hover:bg-navy/90"
            >
              Voltar ao Perfil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-navy to-navy-700">
      <Card className="w-full max-w-md border-2 border-navy/20 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-navy/10 p-3 rounded-full">
              <RiShieldKeyholeLine className="w-8 h-8 text-navy" />
            </div>
          </div>

          <h1 className="text-center text-xl font-bold text-navy mb-2">
            CONFIGURAR SENHA ADMINISTRATIVA
          </h1>
          <p className="text-center text-slate-600 text-sm mb-6">
            Configure sua senha de administrador para acessar o painel
            administrativo. Esta senha será usada como autenticação adicional de
            segurança.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Matrícula
              </label>
              <Input
                type="text"
                value={profile.matricula}
                disabled
                className="bg-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nova Senha Administrativa
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Digite sua nova senha"
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <RiEyeOffLine className="w-5 h-5" />
                  ) : (
                    <RiEyeLine className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Indicador de força da senha */}
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-600">
                    Força da senha:
                  </span>
                  <span className="text-xs font-medium">
                    {passwordStrength === 0 && "Fraca"}
                    {passwordStrength === 1 && "Fraca"}
                    {passwordStrength === 2 && "Média"}
                    {passwordStrength === 3 && "Forte"}
                    {passwordStrength === 4 && "Muito forte"}
                  </span>
                </div>
                <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      passwordStrength === 0
                        ? "w-0"
                        : passwordStrength === 1
                        ? "w-1/4 bg-error"
                        : passwordStrength === 2
                        ? "w-1/2 bg-warning"
                        : passwordStrength === 3
                        ? "w-3/4 bg-success"
                        : "w-full bg-success"
                    }`}
                  />
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  <p className="flex items-center gap-1">
                    <RiCheckLine
                      className={`w-3 h-3 ${
                        adminPassword.length >= 6
                          ? "text-success"
                          : "text-slate-300"
                      }`}
                    />
                    Mínimo 6 caracteres
                  </p>
                  <p className="flex items-center gap-1">
                    <RiCheckLine
                      className={`w-3 h-3 ${
                        /[A-Z]/.test(adminPassword)
                          ? "text-success"
                          : "text-slate-300"
                      }`}
                    />
                    Pelo menos uma letra maiúscula
                  </p>
                  <p className="flex items-center gap-1">
                    <RiCheckLine
                      className={`w-3 h-3 ${
                        /[0-9]/.test(adminPassword)
                          ? "text-success"
                          : "text-slate-300"
                      }`}
                    />
                    Pelo menos um número
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirmar Senha
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Confirme sua senha"
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  aria-label={
                    showConfirmPassword ? "Esconder senha" : "Mostrar senha"
                  }
                >
                  {showConfirmPassword ? (
                    <RiEyeOffLine className="w-5 h-5" />
                  ) : (
                    <RiEyeLine className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-error text-sm p-3 bg-error/10 rounded-lg">
                <RiErrorWarningLine className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-success text-sm p-3 bg-success/10 rounded-lg">
                <RiCheckLine className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-navy hover:bg-navy/90"
              >
                {loading ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2" />
                    Configurando...
                  </>
                ) : (
                  "Configurar Senha"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/perfil")}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>

          <div className="text-center mt-4">
            <p className="text-xs text-slate-500">
              Esta senha é adicional à senha padrão do sistema e será usada para
              acessar o painel administrativo. Guarde-a em local seguro.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
