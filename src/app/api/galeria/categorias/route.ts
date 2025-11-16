import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient(); // ✅ AGORA COM AWAIT

    // Verificar autenticação
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const categoriaData = await request.json();

    // Validar dados obrigatórios
    if (!categoriaData.nome || !categoriaData.slug) {
      return NextResponse.json(
        { error: "Nome e slug são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se slug já existe
    const { data: existingCategoria, error: slugError } = await supabase
      .from("galeria_categorias")
      .select("id")
      .eq("slug", categoriaData.slug)
      .single();

    if (slugError && slugError.code !== "PGRST116") {
      // PGRST116 = nenhum resultado
      console.error("Erro ao verificar slug:", slugError);
    }

    if (existingCategoria) {
      return NextResponse.json(
        { error: "Já existe uma categoria com este slug" },
        { status: 400 }
      );
    }

    // Inserir categoria
    const { data: categoria, error } = await supabase
      .from("galeria_categorias")
      .insert([
        {
          nome: categoriaData.nome,
          descricao: categoriaData.descricao || null,
          slug: categoriaData.slug,
          tipo: categoriaData.tipo || "fotos",
          ordem: categoriaData.ordem || 0,
          status:
            categoriaData.status !== undefined ? categoriaData.status : true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar categoria:", error);
      return NextResponse.json(
        { error: "Erro ao criar categoria: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(categoria, { status: 201 });
  } catch (error) {
    console.error("Erro interno:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = await createClient(); // ✅ AGORA COM AWAIT

    const { data: categorias, error } = await supabase
      .from("galeria_categorias")
      .select("*")
      .order("ordem", { ascending: true })
      .order("nome", { ascending: true });

    if (error) {
      console.error("Erro ao buscar categorias:", error);
      return NextResponse.json(
        { error: "Erro ao buscar categorias" },
        { status: 500 }
      );
    }

    return NextResponse.json(categorias);
  } catch (error) {
    console.error("Erro interno:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
