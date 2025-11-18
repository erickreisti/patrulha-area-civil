// src/app/(app)/admin/noticias/page.tsx - PADRONIZADO
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  FaNewspaper,
  FaPlus,
  FaSearch,
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaStar,
  FaRegStar,
  FaCalendarAlt,
  FaUser,
  FaChartBar,
  FaHome,
  FaTrash,
  FaArchive,
  FaRocket,
  FaArrowLeft,
} from "react-icons/fa";
import { NoticiaWithAutor, NoticiaStatus } from "@/types/noticias";

const CATEGORIAS = [
  "Operações",
  "Treinamento",
  "Cooperação",
  "Projetos Sociais",
  "Equipamentos",
  "Eventos",
  "Comunicação",
];

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState<NoticiaWithAutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<NoticiaStatus | "all">(
    "all"
  );
  const [filterCategoria, setFilterCategoria] = useState<string>("all");
  const [filterDestaque, setFilterDestaque] = useState<
    "all" | "destaque" | "normal"
  >("all");

  const supabase = createClient();

  useEffect(() => {
    fetchNoticias();
  }, []);

  const fetchNoticias = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("noticias")
        .select(
          `
          *,
          autor:profiles(full_name, graduacao)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNoticias(data || []);
    } catch (error) {
      console.error("Erro ao buscar notícias:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNoticias = noticias.filter((noticia) => {
    const matchesSearch =
      noticia.titulo.toLowerCase().includes(search.toLowerCase()) ||
      noticia.resumo.toLowerCase().includes(search.toLowerCase()) ||
      noticia.conteudo.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || noticia.status === filterStatus;
    const matchesCategoria =
      filterCategoria === "all" || noticia.categoria === filterCategoria;
    const matchesDestaque =
      filterDestaque === "all" ||
      (filterDestaque === "destaque" && noticia.destaque) ||
      (filterDestaque === "normal" && !noticia.destaque);

    return (
      matchesSearch && matchesStatus && matchesCategoria && matchesDestaque
    );
  });

  const toggleNoticiaStatus = async (
    noticiaId: string,
    currentStatus: NoticiaStatus
  ) => {
    try {
      let newStatus: NoticiaStatus;
      if (currentStatus === "rascunho") {
        newStatus = "publicado";
      } else if (currentStatus === "publicado") {
        newStatus = "arquivado";
      } else {
        newStatus = "publicado";
      }

      const { error } = await supabase
        .from("noticias")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", noticiaId);

      if (error) throw error;

      setNoticias((prev) =>
        prev.map((noticia) =>
          noticia.id === noticiaId
            ? {
                ...noticia,
                status: newStatus,
                updated_at: new Date().toISOString(),
              }
            : noticia
        )
      );
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    }
  };

  const toggleDestaque = async (
    noticiaId: string,
    currentDestaque: boolean
  ) => {
    try {
      const { error } = await supabase
        .from("noticias")
        .update({
          destaque: !currentDestaque,
          updated_at: new Date().toISOString(),
        })
        .eq("id", noticiaId);

      if (error) throw error;

      setNoticias((prev) =>
        prev.map((noticia) =>
          noticia.id === noticiaId
            ? {
                ...noticia,
                destaque: !currentDestaque,
                updated_at: new Date().toISOString(),
              }
            : noticia
        )
      );
    } catch (error) {
      console.error("Erro ao alterar destaque:", error);
    }
  };

  const deleteNoticia = async (noticiaId: string) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("noticias")
        .delete()
        .eq("id", noticiaId);
      if (error) throw error;
      setNoticias((prev) => prev.filter((noticia) => noticia.id !== noticiaId));
    } catch (error) {
      console.error("Erro ao excluir notícia:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const stats = {
    total: noticias.length,
    rascunho: noticias.filter((n) => n.status === "rascunho").length,
    publicado: noticias.filter((n) => n.status === "publicado").length,
    arquivado: noticias.filter((n) => n.status === "arquivado").length,
    destaque: noticias.filter((n) => n.destaque).length,
  };

  const getStatusBadge = (status: NoticiaStatus) => {
    const variants = {
      rascunho: "bg-yellow-500 text-white",
      publicado: "bg-green-500 text-white",
      arquivado: "bg-gray-500 text-white",
    };
    return variants[status];
  };

  const getStatusText = (status: NoticiaStatus) => {
    const texts = {
      rascunho: "RASCUNHO",
      publicado: "PUBLICADO",
      arquivado: "ARQUIVADO",
    };
    return texts[status];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-bebas tracking-wide">
              GERENCIAR NOTÍCIAS
            </h1>
            <p className="text-gray-600">
              Crie e gerencie as notícias do site da Patrulha Aérea Civil
            </p>
          </div>

          {/* Botões de Navegação */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
            {/* 🟣 ROXO - Funcionalidades Administrativas */}
            <Link href="/admin/dashboard">
              <Button
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
              >
                <FaChartBar className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>

            {/* 🔵 AZUL - Ações Administrativas */}
            <Link href="/perfil">
              <Button
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              >
                <FaUser className="w-4 h-4 mr-2" />
                Meu Perfil
              </Button>
            </Link>

            {/* ⚫ CINZA - Navegação Neutra */}
            <Link href="/">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-700 hover:bg-slate-100"
              >
                <FaHome className="w-4 h-4 mr-2" />
                Voltar ao Site
              </Button>
            </Link>

            {/* 🟢 Verde para ações de criação */}
            <Link href="/admin/noticias/criar">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <FaPlus className="w-4 h-4 mr-2" />
                Nova Notícia
              </Button>
            </Link>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {stats.total}
                  </p>
                </div>
                <FaNewspaper className="w-8 h-8 text-navy" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rascunho</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.rascunho}
                  </p>
                </div>
                <FaEyeSlash className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Publicado</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.publicado}
                  </p>
                </div>
                <FaEye className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Arquivado</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {stats.arquivado}
                  </p>
                </div>
                <FaArchive className="w-8 h-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Destaque</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.destaque}
                  </p>
                </div>
                <FaStar className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros e Busca */}
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Buscar por título, resumo ou conteúdo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy text-sm"
                >
                  <option value="all">Todos os status</option>
                  <option value="rascunho">Rascunho</option>
                  <option value="publicado">Publicado</option>
                  <option value="arquivado">Arquivado</option>
                </select>

                <select
                  value={filterCategoria}
                  onChange={(e) => setFilterCategoria(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy text-sm"
                >
                  <option value="all">Todas categorias</option>
                  {CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <select
                  value={filterDestaque}
                  onChange={(e) => setFilterDestaque(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="destaque">Em destaque</option>
                  <option value="normal">Normais</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Notícias */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FaNewspaper className="w-5 h-5 mr-2 text-navy" />
              Lista de Notícias ({filteredNoticias.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto"></div>
                <p className="text-gray-600 mt-4">Carregando notícias...</p>
              </div>
            ) : filteredNoticias.length === 0 ? (
              <div className="text-center py-8">
                <FaNewspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">
                  {noticias.length === 0
                    ? "Nenhuma notícia cadastrada no sistema"
                    : "Nenhuma notícia encontrada com os filtros aplicados"}
                </p>
                {noticias.length === 0 && (
                  <Link href="/admin/noticias/criar">
                    <Button className="bg-green-600 hover:bg-green-700 text-white mt-4">
                      <FaPlus className="w-4 h-4 mr-2" />
                      Criar Primeira Notícia
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Notícia
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Categoria
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Autor
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Publicação
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNoticias.map((noticia) => (
                      <tr
                        key={noticia.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                              {noticia.imagem ? (
                                <img
                                  src={noticia.imagem}
                                  alt={noticia.titulo}
                                  className="w-12 h-12 rounded object-cover"
                                />
                              ) : (
                                <FaNewspaper className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {noticia.destaque && (
                                  <FaStar className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                                )}
                                <p className="font-semibold text-gray-800 truncate">
                                  {noticia.titulo}
                                </p>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {noticia.resumo}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">
                                  /{noticia.slug}
                                </code>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-700"
                          >
                            {noticia.categoria}
                          </Badge>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <FaUser className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {noticia.autor?.full_name ||
                                  "Autor não definido"}
                              </p>
                              <p className="text-xs text-gray-600">
                                {noticia.autor?.graduacao || "PAC"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {formatDate(noticia.data_publicacao)}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <Badge className={getStatusBadge(noticia.status)}>
                            {getStatusText(noticia.status)}
                          </Badge>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                            {/* 🔵 AZUL - Ações Administrativas */}
                            <Link href={`/admin/noticias/${noticia.id}`}>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                              >
                                <FaEdit className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                            </Link>

                            {/* 🟢 Verde para ações de status */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                toggleNoticiaStatus(noticia.id, noticia.status)
                              }
                              className="w-full sm:w-auto border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                            >
                              {noticia.status === "rascunho" ? (
                                <FaRocket className="w-3 h-3 mr-1" />
                              ) : noticia.status === "publicado" ? (
                                <FaArchive className="w-3 h-3 mr-1" />
                              ) : (
                                <FaEye className="w-3 h-3 mr-1" />
                              )}
                              {noticia.status === "rascunho"
                                ? "Publicar"
                                : noticia.status === "publicado"
                                ? "Arquivar"
                                : "Republicar"}
                            </Button>

                            {/* 🟡 Amarelo para ações de destaque */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                toggleDestaque(noticia.id, noticia.destaque)
                              }
                              className="w-full sm:w-auto border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white"
                            >
                              {noticia.destaque ? (
                                <FaRegStar className="w-3 h-3 mr-1" />
                              ) : (
                                <FaStar className="w-3 h-3 mr-1" />
                              )}
                              {noticia.destaque ? "Remover" : "Destacar"}
                            </Button>

                            {/* 🔴 VERMELHO - Ações Destrutivas */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteNoticia(noticia.id)}
                              className="w-full sm:w-auto text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                            >
                              <FaTrash className="w-3 h-3 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
