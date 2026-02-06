"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label"; // Usando Label do Shadcn
import {
  RiShieldKeyholeLine,
  RiEyeLine,
  RiEyeOffLine,
  RiErrorWarningLine,
  RiCheckLine,
  RiLockPasswordLine,
  RiUserLine,
  RiFingerprintLine,
} from "react-icons/ri";

import { setupAdminPassword } from "@/app/actions/auth/auth";

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
  const { profile, isLoading, setProfile } = useAuthStore();

  // Verificar força da senha
  useEffect(() => {
    let strength = 0;
    if (adminPassword.length >= 6) strength += 1;
    if (/[A-Z]/.test(adminPassword)) strength += 1;
    if (/[0-9]/.test(adminPassword)) strength += 1;
    if (/[^A-Za-z0-9]/.test(adminPassword)) strength += 1;
    setPasswordStrength(strength);
  }, [adminPassword]);

  // Redirecionar APENAS se não for admin
  useEffect(() => {
    if (!isLoading && (!profile || profile.role !== "admin")) {
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
        "A senha deve conter pelo menos uma letra maiúscula e um número",
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

      console.log("🔍 [SetupPassword] Configurando senha...");

      const result = await setupAdminPassword(formData);

      if (result.success) {
        setSuccess(
          profile?.admin_2fa_enabled
            ? "Senha administrativa atualizada com sucesso!"
            : "Senha administrativa configurada com sucesso!",
        );

        if (profile) {
          setProfile({
            ...profile,
            admin_2fa_enabled: true,
            admin_last_auth: new Date().toISOString(),
          });
        }

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner className="w-8 h-8 text-slate-900" />
      </div>
    );
  }

  const isEditing = profile?.admin_2fa_enabled;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100/50 font-sans relative overflow-hidden">
      {/* Background Decorativo Sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-70 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />

      <Card className="w-full max-w-md border-0 shadow-2xl shadow-slate-900/10 bg-white/80 backdrop-blur-2xl ring-1 ring-white/60 overflow-hidden relative z-10 rounded-3xl">
        {/* Top Decorative Gradient */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-50/80 to-transparent pointer-events-none" />

        <CardContent className="p-8 sm:p-10 relative">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group mb-6">
              <div
                className={`absolute -inset-1 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 ${isEditing ? "bg-amber-400" : "bg-blue-500"}`}
              ></div>
              <div className="relative bg-white/90 backdrop-blur-md p-5 rounded-full shadow-lg ring-1 ring-white">
                {isEditing ? (
                  <RiLockPasswordLine className="w-8 h-8 text-amber-600" />
                ) : (
                  <RiShieldKeyholeLine className="w-8 h-8 text-blue-600" />
                )}
              </div>
            </div>

            <h1 className="text-center text-2xl font-bold text-slate-800 mb-2 tracking-tight">
              {isEditing ? "Redefinir Senha Admin" : "Configurar Acesso"}
            </h1>
            <p className="text-center text-slate-500 text-sm max-w-xs leading-relaxed">
              {isEditing
                ? "Defina uma nova senha para substituir a atual e manter sua conta segura."
                : "Crie uma senha exclusiva para acessar o painel administrativo."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Matrícula (Read-only) */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium ml-1">
                Matrícula Vinculada
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <RiUserLine className="w-5 h-5" />
                </div>
                <Input
                  value={profile?.matricula || ""}
                  disabled
                  className="pl-10 h-12 bg-slate-50/50 border-slate-200 text-slate-500 font-mono rounded-xl"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                  <RiFingerprintLine className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Nova Senha */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium ml-1">
                Nova Senha
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors">
                  <RiLockPasswordLine className="w-5 h-5" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="pl-10 pr-10 h-12 bg-white/60 border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 rounded-xl transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                >
                  {showPassword ? (
                    <RiEyeOffLine className="w-5 h-5" />
                  ) : (
                    <RiEyeLine className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Indicador de Força */}
              <div className="flex gap-1 pt-1 h-1.5 w-full">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 rounded-full transition-all duration-500 ${
                      passwordStrength >= step
                        ? step <= 2
                          ? "bg-amber-400"
                          : "bg-emerald-500"
                        : "bg-slate-100"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-400 text-right uppercase tracking-wider font-semibold">
                {passwordStrength === 0 && "Muito Fraca"}
                {passwordStrength === 1 && "Fraca"}
                {passwordStrength === 2 && "Média"}
                {passwordStrength === 3 && "Forte"}
                {passwordStrength === 4 && "Excelente"}
              </p>
            </div>

            {/* Confirmar Senha */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium ml-1">
                Confirmar Senha
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors">
                  <RiLockPasswordLine className="w-5 h-5" />
                </div>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="pl-10 pr-10 h-12 bg-white/60 border-slate-200 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 rounded-xl transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                >
                  {showConfirmPassword ? (
                    <RiEyeOffLine className="w-5 h-5" />
                  ) : (
                    <RiEyeLine className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Feedback Messages */}
            {error && (
              <div className="flex items-center gap-3 text-red-600 text-sm p-4 bg-red-50/50 border border-red-100 rounded-xl animate-in fade-in slide-in-from-top-2">
                <div className="bg-red-100 p-1 rounded-full">
                  <RiErrorWarningLine className="w-4 h-4" />
                </div>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 text-emerald-600 text-sm p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl animate-in fade-in slide-in-from-top-2">
                <div className="bg-emerald-100 p-1 rounded-full">
                  <RiCheckLine className="w-4 h-4" />
                </div>
                <span>{success}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/perfil")}
                disabled={loading}
                className="flex-1 h-12 text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 rounded-xl font-medium"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-[2] h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 transition-all active:scale-[0.98]"
              >
                {loading ? <Spinner className="mr-2" /> : "Salvar Senha"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
