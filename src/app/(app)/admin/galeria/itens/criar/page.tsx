"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import {
  RiArrowLeftLine,
  RiSaveLine,
  RiImageLine,
  RiVideoLine,
  RiCheckLine,
  RiUploadLine,
  RiCloseLine,
  RiLoader4Line,
} from "react-icons/ri";

// Actions e Store
import { createItem } from "@/app/actions/gallery";
import { useCategoriasList } from "@/lib/stores/useGaleriaStore";
import { useAuthStore } from "@/lib/stores/useAuthStore";

// Interface local do formulário
interface ItemFormData {
  titulo: string;
  descricao: string;
  tipo: "foto" | "video";
  categoria_id: string | null;
  ordem: number;
  status: boolean;
  destaque: boolean;
}

export default function CriarItemGaleriaPage() {
  const router = useRouter();
  const { isAdmin, hasAdminSession } = useAuthStore();
  const { categorias, fetchCategorias } = useCategoriasList();

  const [loading, setLoading] = useState(false);
  const [arquivoFile, setArquivoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState<ItemFormData>({
    titulo: "",
    descricao: "",
    tipo: "foto",
    categoria_id: null,
    ordem: 0,
    status: true,
    destaque: false,
  });

  // Carregar categorias ao montar
  useEffect(() => {
    fetchCategorias();
  }, [fetchCategorias]);

  // Redirecionar se não for admin
  useEffect(() => {
    if (isAdmin === false) {
      toast.error("Acesso negado");
      router.push("/admin/dashboard");
    }
  }, [isAdmin, router]);

  // Manipuladores de Arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação básica de tamanho (50MB vídeo, 10MB foto)
    const maxSize =
      formData.tipo === "video" ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(
        `Arquivo muito grande. Limite: ${formData.tipo === "video" ? "50MB" : "10MB"}`,
      );
      return;
    }

    setArquivoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setThumbnailFile(file);
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!arquivoFile) return toast.error("Selecione um arquivo para upload");

    setLoading(true);

    try {
      const data = new FormData();
      data.append("titulo", formData.titulo);
      data.append("descricao", formData.descricao);
      data.append("tipo", formData.tipo);
      if (formData.categoria_id)
        data.append("categoria_id", formData.categoria_id);
      data.append("ordem", String(formData.ordem));
      data.append("status", String(formData.status));
      data.append("destaque", String(formData.destaque));

      data.append("arquivo_file", arquivoFile);
      if (thumbnailFile) data.append("thumbnail_file", thumbnailFile);

      const res = await createItem(data);

      if (res.success) {
        toast.success("Item criado com sucesso!");
        router.push("/admin/galeria/itens");
      } else {
        toast.error(res.error || "Erro ao criar item");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro interno ao criar item");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar categorias pelo tipo selecionado
  const categoriasCompativeis = categorias.filter(
    (c) =>
      (c.tipo === "fotos" && formData.tipo === "foto") ||
      (c.tipo === "videos" && formData.tipo === "video"),
  );

  if (!hasAdminSession) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Novo Item da Galeria
            </h1>
            <p className="text-gray-500">Adicione fotos ou vídeos ao acervo</p>
          </div>
          <Link href="/admin/galeria/itens">
            <Button variant="outline">
              <RiArrowLeftLine className="mr-2" /> Voltar
            </Button>
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    required
                    placeholder="Ex: Treinamento de Resgate"
                    value={formData.titulo}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        titulo: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    placeholder="Detalhes sobre o evento ou mídia..."
                    rows={4}
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        descricao: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Mídia</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={
                          formData.tipo === "foto" ? "default" : "outline"
                        }
                        className="flex-1"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            tipo: "foto",
                            categoria_id: null,
                          }));
                          setArquivoFile(null); // Resetar arquivo ao mudar tipo
                          setPreviewUrl(null);
                        }}
                      >
                        <RiImageLine className="mr-2" /> Foto
                      </Button>
                      <Button
                        type="button"
                        variant={
                          formData.tipo === "video" ? "default" : "outline"
                        }
                        className="flex-1"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            tipo: "video",
                            categoria_id: null,
                          }));
                          setArquivoFile(null);
                          setPreviewUrl(null);
                        }}
                      >
                        <RiVideoLine className="mr-2" /> Vídeo
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={formData.categoria_id || ""}
                      onValueChange={(v) =>
                        setFormData((prev) => ({ ...prev, categoria_id: v }))
                      }
                      disabled={categoriasCompativeis.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            categoriasCompativeis.length
                              ? "Selecione..."
                              : "Nenhuma disponível"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriasCompativeis.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {categoriasCompativeis.length === 0 && (
                      <p className="text-xs text-amber-600">
                        Crie uma categoria deste tipo primeiro.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload do Arquivo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Área de Upload Principal */}
                <div className="border-2 border-dashed rounded-lg p-8 text-center transition-colors hover:border-primary/50 hover:bg-gray-50">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept={formData.tipo === "foto" ? "image/*" : "video/*"}
                    onChange={handleFileChange}
                  />
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    {previewUrl && formData.tipo === "foto" ? (
                      <div className="relative w-full h-48 mb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-full object-contain rounded-md"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="absolute top-2 right-2"
                          onClick={(e) => {
                            e.preventDefault();
                            setArquivoFile(null);
                            setPreviewUrl(null);
                          }}
                        >
                          <RiCloseLine />
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 bg-primary/10 rounded-full text-primary mb-2">
                        <RiUploadLine className="w-8 h-8" />
                      </div>
                    )}

                    <span className="text-lg font-medium text-primary">
                      {arquivoFile
                        ? "Trocar arquivo"
                        : "Clique para selecionar"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {arquivoFile
                        ? arquivoFile.name
                        : formData.tipo === "foto"
                          ? "JPG, PNG, WEBP (Max 10MB)"
                          : "MP4, MOV (Max 50MB)"}
                    </span>
                  </Label>
                </div>

                {/* Upload Thumbnail (Apenas Vídeo) */}
                {formData.tipo === "video" && (
                  <div className="space-y-2 pt-4 border-t">
                    <Label>Thumbnail Personalizada (Opcional)</Label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                      />
                      {thumbnailFile && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          <RiCheckLine className="mr-1" /> OK
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Se não enviada, será usado um ícone padrão.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Status Ativo</Label>
                    <p className="text-xs text-gray-500">
                      Visível na galeria pública
                    </p>
                  </div>
                  <Switch
                    checked={formData.status}
                    onCheckedChange={(c) =>
                      setFormData((prev) => ({ ...prev, status: c }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Destaque</Label>
                    <p className="text-xs text-gray-500">Exibir na home page</p>
                  </div>
                  <Switch
                    checked={formData.destaque}
                    onCheckedChange={(c) =>
                      setFormData((prev) => ({ ...prev, destaque: c }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ordem de Exibição</Label>
                  <Input
                    type="number"
                    value={formData.ordem}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ordem: Number(e.target.value),
                      }))
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Menor número aparece primeiro.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-medium"
              disabled={loading || !arquivoFile}
            >
              {loading ? (
                <>
                  <RiLoader4Line className="mr-2 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <RiSaveLine className="mr-2" /> Salvar Item
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
