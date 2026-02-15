import Link from "next/link";
import { getEvents } from "@/app/actions/events/get-events";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  RiAddLine,
  RiPencilLine,
  RiCalendarLine,
  RiMapPinLine,
  RiFilter3Line,
} from "react-icons/ri";
import { DeleteEventButton } from "./components/DeleteEventButton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Configurações de Cache
export const dynamic = "force-dynamic";

// --- MAPEAMENTO DE ESTILOS (CORES) ---
const CATEGORY_STYLES: Record<string, string> = {
  training:
    "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  operation: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
  meeting: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
};

const STATUS_STYLES: Record<string, string> = {
  Aberto: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Confirmado: "bg-blue-100 text-blue-800 border-blue-200",
  Cancelado:
    "bg-red-100 text-red-800 border-red-200 line-through decoration-red-800/50",
  Fechado: "bg-slate-100 text-slate-600 border-slate-200",
  Planejado: "bg-slate-50 text-slate-600 border-slate-200 border-dashed",
  Esgotado: "bg-orange-100 text-orange-800 border-orange-200",
};

const CATEGORY_LABELS: Record<string, string> = {
  training: "Treinamento",
  operation: "Operação",
  meeting: "Reunião",
};

export default async function AdminEventosPage() {
  const { data: eventos } = await getEvents();

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50/50 min-h-screen">
      {/* --- CABEÇALHO --- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Gerenciar Eventos
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Controle total da agenda, operações e treinamentos.
          </p>
        </div>
        <Button
          asChild
          className="bg-pac-primary hover:bg-pac-primary-dark text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 rounded-full px-6"
        >
          <Link href="/admin/eventos/novo">
            <RiAddLine className="mr-2 h-5 w-5" /> Novo Evento
          </Link>
        </Button>
      </div>

      {/* --- TABELA / LISTAGEM --- */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-slate-50">
              <TableHead className="w-[300px] pl-6 font-semibold text-slate-600">
                Evento
              </TableHead>
              <TableHead className="font-semibold text-slate-600">
                Categoria
              </TableHead>
              <TableHead className="font-semibold text-slate-600">
                Data & Local
              </TableHead>
              <TableHead className="font-semibold text-slate-600">
                Status
              </TableHead>
              <TableHead className="text-right pr-6 font-semibold text-slate-600">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* ESTADO VAZIO */}
            {eventos?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-96 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                      <RiFilter3Line className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-lg font-medium text-slate-600">
                      Nenhum evento encontrado
                    </p>
                    <p className="text-sm max-w-xs mx-auto">
                      Sua agenda está vazia. Crie um novo evento para começar a
                      organizar as atividades.
                    </p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href="/admin/eventos/novo">Criar agora</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {/* LISTAGEM */}
            {eventos?.map((evento) => {
              const categoryStyle =
                CATEGORY_STYLES[evento.category] ||
                "bg-slate-100 text-slate-700";
              const statusStyle =
                STATUS_STYLES[evento.status] || "bg-slate-100";
              const dateFormatted = format(
                new Date(evento.start_date),
                "dd 'de' MMM, yyyy",
                { locale: ptBR },
              );

              return (
                <TableRow
                  key={evento.id}
                  className="group hover:bg-slate-50/80 transition-colors"
                >
                  {/* TÍTULO & TIPO */}
                  <TableCell className="pl-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-base group-hover:text-pac-primary transition-colors">
                        {evento.title}
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5 font-medium">
                        {evento.type}
                      </span>
                    </div>
                  </TableCell>

                  {/* CATEGORIA */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`rounded-full px-3 py-0.5 border font-medium ${categoryStyle}`}
                    >
                      {CATEGORY_LABELS[evento.category] || evento.category}
                    </Badge>
                  </TableCell>

                  {/* DATA & LOCAL */}
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      <div className="flex items-center text-slate-700 font-medium">
                        <RiCalendarLine className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                        {dateFormatted}
                      </div>
                      <div className="flex items-center text-slate-500 text-xs">
                        <RiMapPinLine className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
                        <span
                          className="truncate max-w-[150px]"
                          title={evento.location}
                        >
                          {evento.location}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* STATUS */}
                  <TableCell>
                    <Badge
                      className={`rounded-full px-2.5 shadow-none font-semibold border ${statusStyle}`}
                    >
                      {evento.status}
                    </Badge>
                  </TableCell>

                  {/* AÇÕES */}
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        asChild
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      >
                        <Link
                          href={`/admin/eventos/${evento.id}`}
                          title="Editar"
                        >
                          <RiPencilLine className="w-4 h-4" />
                        </Link>
                      </Button>

                      <DeleteEventButton id={evento.id} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
