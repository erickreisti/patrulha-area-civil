import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Images, Folder, PlusCircle, Video, Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function GaleriaAdminPage() {
  const supabase = await createClient(); // ✅ AGORA COM AWAIT

  // Buscar estatísticas
  const { data: categoriasCount } = await supabase
    .from("galeria_categorias")
    .select("id", { count: "exact" });

  const { data: itensCount } = await supabase
    .from("galeria_itens")
    .select("id", { count: "exact" });

  const { data: fotosCount } = await supabase
    .from("galeria_itens")
    .select("id", { count: "exact" })
    .eq("tipo", "foto");

  const { data: videosCount } = await supabase
    .from("galeria_itens")
    .select("id", { count: "exact" })
    .eq("tipo", "video");

  const stats = [
    {
      title: "Total de Categorias",
      value: categoriasCount?.length || 0,
      icon: Folder,
      description: "Categorias organizadas",
      href: "/admin/galeria/categorias",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total de Itens",
      value: itensCount?.length || 0,
      icon: Images,
      description: "Fotos e vídeos",
      href: "/admin/galeria/itens",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Fotos",
      value: fotosCount?.length || 0,
      icon: Camera,
      description: "Imagens",
      href: "/admin/galeria/itens?tipo=foto",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Vídeos",
      value: videosCount?.length || 0,
      icon: Video,
      description: "Vídeos",
      href: "/admin/galeria/itens?tipo=video",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  const quickActions = [
    {
      title: "Nova Categoria",
      description: "Criar nova categoria para organizar itens",
      href: "/admin/galeria/categorias/criar",
      icon: PlusCircle,
      buttonText: "Criar Categoria",
    },
    {
      title: "Adicionar Item",
      description: "Upload de nova foto ou vídeo",
      href: "/admin/galeria/itens/criar",
      icon: PlusCircle,
      buttonText: "Adicionar Item",
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">
            Galeria
          </h1>
          <p className="text-muted-foreground">
            Gerencie categorias e itens da galeria de mídia
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="border-0 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
              <Button variant="ghost" size="sm" className="mt-2 -ml-2" asChild>
                <Link href={stat.href}>Ver detalhes</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickActions.map((action, index) => (
          <Card
            key={index}
            className="border-0 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <action.icon className="h-5 w-5" />
                {action.title}
              </CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-navy-light hover:bg-navy">
                <Link href={action.href}>{action.buttonText}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Navegação Rápida */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Gerenciamento</CardTitle>
          <CardDescription>
            Acesse as seções específicas da galeria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              asChild
              className="justify-start h-auto p-4 border-gray-200 hover:border-navy-light"
            >
              <Link href="/admin/galeria/categorias">
                <Folder className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Categorias</div>
                  <div className="text-sm text-muted-foreground">
                    Gerencie todas as categorias
                  </div>
                </div>
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="justify-start h-auto p-4 border-gray-200 hover:border-navy-light"
            >
              <Link href="/admin/galeria/itens">
                <Images className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-semibold">Itens</div>
                  <div className="text-sm text-muted-foreground">
                    Gerencie fotos e vídeos
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
