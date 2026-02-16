"use client";

import { useEffect, useState, useCallback } from "react";
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
// Removido import do Skeleton não usado, pois usamos RiLoader4Line
import {
  RiAddLine,
  RiPencilLine,
  RiCalendarLine,
  RiMapPinLine,
  RiFilter3Line,
  RiCheckDoubleLine,
  RiTimerFlashLine,
  RiCheckboxCircleLine,
  RiDoorOpenLine,
  RiForbidLine,
  RiLoader4Line,
} from "react-icons/ri";
import { DeleteEventButton } from "./components/DeleteEventButton";
import { createBrowserClient } from "@supabase/ssr";
import {
  format,
  isValid,
  isAfter,
  isWithinInterval,
  differenceInHours,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { type EventType } from "@/lib/schemas/events";

// --- CONFIGURAÇÃO VISUAL ---
const CATEGORY_STYLES: Record<string, string> = {
  training:
    "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
  operation: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
  meeting: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100",
};

const CATEGORY_LABELS: Record<string, string> = {
  training: "Treinamento",
  operation: "Operação",
  meeting: "Reunião",
};

const STATUS_CONFIG: Record<
  string,
  { label: string; classes: string; icon: React.ElementType | null }
> = {
  aberto: {
    label: "Aberto",
    classes: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: RiDoorOpenLine,
  },
  confirmado: {
    label: "Confirmado",
    classes: "bg-blue-100 text-blue-700 border-blue-200 font-bold",
    icon: RiCheckDoubleLine,
  },
  andamento: {
    label: "Em Andamento",
    classes:
      "bg-cyan-100 text-cyan-700 border-cyan-200 font-bold animate-[pulse_3s_ease-in-out_infinite]",
    icon: RiTimerFlashLine,
  },
  fechado: {
    label: "Fechado",
    classes: "bg-slate-900 text-slate-200 border-slate-700",
    icon: RiCheckboxCircleLine,
  },
  cancelado: {
    label: "Cancelado",
    classes: "bg-red-100 text-red-700 border-red-200 font-medium",
    icon: RiForbidLine,
  },
};

// --- LÓGICA DE STATUS ---
const calculateEventStatus = (start: string, end: string, dbStatus: string) => {
  const normalizedStatus = dbStatus ? dbStatus.toLowerCase() : "aberto";

  if (normalizedStatus === "cancelado") return "cancelado";

  if (!start || !end) return "aberto";
  const now = new Date();
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (!isValid(startDate) || !isValid(endDate)) return "aberto";

  if (isAfter(now, endDate)) return "fechado";
  if (isWithinInterval(now, { start: startDate, end: endDate }))
    return "andamento";

  const hoursUntilStart = differenceInHours(startDate, now);
  if (hoursUntilStart <= 24 && hoursUntilStart >= 0) return "confirmado";

  if (STATUS_CONFIG[normalizedStatus]) return normalizedStatus;

  return "aberto";
};

export default function AdminEventosPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  // 1. Função de busca estável
  const fetchData = useCallback(async () => {
    try {
      const res = await getEvents();
      if (res.success) {
        setEvents(res.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Efeito de Carga Inicial (Separado e Seguro)
  useEffect(() => {
    let mounted = true;

    // Wrapper assíncrono para evitar warning do ESLint
    const load = async () => {
      if (mounted) await fetchData();
    };

    load();

    return () => {
      mounted = false;
    };
  }, [fetchData]);

  // 3. Realtime do Supabase
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    const channel = supabase
      .channel("admin-events-list")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => {
          console.log("⚡ Admin: Mudança detectada no banco");
          fetchData();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // 4. Pulso de Vida (Relógio - 5s)
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50/50 min-h-screen">
      {/* HEADER */}
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

      {/* TABLE */}
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
                Status (Atual)
              </TableHead>
              <TableHead className="text-right pr-6 font-semibold text-slate-600">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading State
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5} className="h-16 text-center">
                    <div className="flex items-center justify-center text-slate-400 gap-2">
                      <RiLoader4Line className="animate-spin" /> Carregando...
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : events.length === 0 ? (
              // Empty State
              <TableRow>
                <TableCell colSpan={5} className="h-96 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                      <RiFilter3Line className="w-8 h-8 opacity-50" />
                    </div>
                    <p className="text-lg font-medium text-slate-600">
                      Nenhum evento encontrado
                    </p>
                    <Button variant="outline" className="mt-4" asChild>
                      <Link href="/admin/eventos/novo">Criar agora</Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              // Data Rows
              events.map((evento) => {
                const statusKey = calculateEventStatus(
                  evento.start_date,
                  evento.end_date,
                  evento.status,
                );
                const statusConfig =
                  STATUS_CONFIG[statusKey] || STATUS_CONFIG.aberto;
                const StatusIcon = statusConfig.icon;

                const categoryStyle =
                  CATEGORY_STYLES[evento.category] ||
                  "bg-slate-100 text-slate-700";
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
                    <TableCell className="pl-6 py-4">
                      <div className="flex flex-col">
                        <span
                          className={`font-bold text-base transition-colors ${statusKey === "fechado" ? "text-slate-500 line-through decoration-slate-300" : "text-slate-800 group-hover:text-pac-primary"}`}
                        >
                          {evento.title}
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5 font-medium">
                          {evento.type}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`rounded-full px-3 py-0.5 border font-medium ${categoryStyle}`}
                      >
                        {CATEGORY_LABELS[evento.category] || evento.category}
                      </Badge>
                    </TableCell>

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

                    <TableCell>
                      <Badge
                        className={`rounded-full px-2.5 shadow-none font-semibold border flex w-fit items-center gap-1 transition-all duration-300 ${statusConfig.classes}`}
                      >
                        {StatusIcon && <StatusIcon className="w-3 h-3" />}
                        {statusConfig.label}
                      </Badge>
                    </TableCell>

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
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
