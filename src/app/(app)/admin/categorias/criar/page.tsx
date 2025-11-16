"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export default function CriarCategoriaPage() {
  const router = useRouter();
  const { toast } = useToast(); // ✅ Correto
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    slug: "",
    tipo: "fotos" as "fotos" | "videos",
    ordem: 0,
    status: true,
  });

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/galeria/categorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // ✅ CORREÇÃO: Usar toast.success() corretamente
        toast.success("Categoria criada com sucesso.", "Sucesso!");
        router.push("/admin/galeria/categorias");
      } else {
        const error = await response.json();
        throw new Error(error.message || "Erro ao criar categoria");
      }
    } catch (error) {
      console.error("Erro:", error);
      // ✅ CORREÇÃO: Usar toast.error() corretamente
      toast.error(
        error instanceof Error ? error.message : "Erro ao criar categoria",
        "Erro"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/galeria/categorias">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nova Categoria</h1>
          <p className="text-muted-foreground">
            Adicione uma nova categoria para organizar os itens da galeria
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações da Categoria</CardTitle>
            <CardDescription>
              Preencha os dados da nova categoria
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Categoria *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => {
                    handleInputChange("nome", e.target.value);
                    // Gerar slug automaticamente
                    if (!formData.slug) {
                      handleInputChange("slug", generateSlug(e.target.value));
                    }
                  }}
                  placeholder="Ex: Eventos, Obras, Reuniões"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  placeholder="ex: eventos-obras-reunioes"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Identificador único para URLs
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                placeholder="Descreva o propósito desta categoria..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Conteúdo</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value: "fotos" | "videos") =>
                    handleInputChange("tipo", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fotos">Fotos</SelectItem>
                    <SelectItem value="videos">Vídeos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ordem">Ordem de Exibição</Label>
                <Input
                  id="ordem"
                  type="number"
                  value={formData.ordem}
                  onChange={(e) =>
                    handleInputChange("ordem", parseInt(e.target.value) || 0)
                  }
                  min="0"
                />
                <p className="text-xs text-muted-foreground">
                  Número para ordenação (menor = primeiro)
                </p>
              </div>

              <div className="flex items-center justify-between space-y-0 rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="status">Categoria Ativa</Label>
                  <p className="text-xs text-muted-foreground">
                    Categorias inativas não serão exibidas
                  </p>
                </div>
                <Switch
                  id="status"
                  checked={formData.status}
                  onCheckedChange={(checked) =>
                    handleInputChange("status", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4 mt-6">
          <Button variant="outline" type="button" asChild>
            <Link href="/admin/galeria/categorias">Cancelar</Link>
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-navy-light hover:bg-navy"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Criar Categoria
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
