"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RiCalendarEventLine,
  RiMapPinLine,
  RiTimeLine,
  RiUserVoiceLine,
  RiFilter3Line,
  RiFirstAidKitLine,
  RiFlagLine,
  RiGroupLine,
  RiSearchLine,
  RiCloseLine,
  RiCheckboxCircleLine,
  RiTimerFlashLine,
  RiCheckDoubleLine,
  RiDoorOpenLine,
  RiForbidLine,
} from "react-icons/ri";

import { useEventsStore } from "@/lib/stores/useEventsStore";
import { ptBR } from "date-fns/locale";
import {
  format,
  isAfter,
  isWithinInterval,
  isValid,
  differenceInHours,
} from "date-fns";

// --- ESTILOS VISUAIS ---
const CATEGORY_STYLES: Record<
  string,
  { icon: React.ElementType; color: string; bg: string; hoverBorder: string }
> = {
  training: {
    icon: RiFirstAidKitLine,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    hoverBorder: "group-hover:border-emerald-200",
  },
  operation: {
    icon: RiFlagLine,
    color: "text-red-600",
    bg: "bg-red-50",
    hoverBorder: "group-hover:border-red-200",
  },
  meeting: {
    icon: RiGroupLine,
    color: "text-blue-600",
    bg: "bg-blue-50",
    hoverBorder: "group-hover:border-blue-200",
  },
  default: {
    icon: RiCalendarEventLine,
    color: "text-slate-600",
    bg: "bg-slate-50",
    hoverBorder: "group-hover:border-slate-300",
  },
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

const formatDateDisplay = (dateString: string) => {
  if (!dateString) return { day: "--", month: "---", weekday: "---" };
  const date = new Date(dateString);
  if (!isValid(date)) return { day: "--", month: "---", weekday: "---" };
  return {
    day: format(date, "dd"),
    month: format(date, "MMM", { locale: ptBR }).toUpperCase().replace(".", ""),
    weekday: format(date, "EEEE", { locale: ptBR }),
  };
};

const getEventStatus = (start: string, end: string, dbStatus: string) => {
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

export default function CalendarioEventosPage() {
  const { events, filter, setFilter, fetchEvents, subscribeToEvents, loading } =
    useEventsStore();
  const [searchTerm, setSearchTerm] = useState("");

  const [, setTick] = useState(0);

  useEffect(() => {
    fetchEvents();
    const unsubscribe = subscribeToEvents();
    return () => {
      unsubscribe();
    };
  }, [fetchEvents, subscribeToEvents]);

  // Atualização a cada 5 segundos para precisão no horário
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const displayedEvents = useMemo(() => {
    if (!events) return [];
    return events.filter((event) => {
      const matchesCategory = filter === "all" || event.category === filter;
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.description &&
          event.description.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [events, filter, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative bg-white pt-32 pb-12 border-b border-slate-100">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pac-primary/10 text-pac-primary text-xs font-bold uppercase tracking-widest mb-6">
              <RiCalendarEventLine className="w-4 h-4" />
              Agenda Oficial
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight">
              CALENDÁRIO DE <span className="text-pac-primary">EVENTOS</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Acompanhe o cronograma de atividades da Patrulha Aérea Civil.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
            <div className="flex flex-wrap justify-center gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className={`rounded-full h-9 px-4 text-sm font-medium transition-all ${filter === "all" ? "bg-slate-900 text-white" : "text-slate-600 border-slate-200"}`}
              >
                Todos
              </Button>
              <Button
                variant={filter === "training" ? "default" : "outline"}
                onClick={() => setFilter("training")}
                className={`rounded-full h-9 px-4 text-sm font-medium transition-all ${filter === "training" ? "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent" : "text-slate-600 border-slate-200 hover:text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50"}`}
              >
                Treinamentos
              </Button>
              <Button
                variant={filter === "operation" ? "default" : "outline"}
                onClick={() => setFilter("operation")}
                className={`rounded-full h-9 px-4 text-sm font-medium transition-all ${filter === "operation" ? "bg-red-600 hover:bg-red-700 text-white border-transparent" : "text-slate-600 border-slate-200 hover:text-red-700 hover:border-red-200 hover:bg-red-50"}`}
              >
                Operações
              </Button>
              <Button
                variant={filter === "meeting" ? "default" : "outline"}
                onClick={() => setFilter("meeting")}
                className={`rounded-full h-9 px-4 text-sm font-medium transition-all ${filter === "meeting" ? "bg-blue-600 hover:bg-blue-700 text-white border-transparent" : "text-slate-600 border-slate-200 hover:text-blue-700 hover:border-blue-200 hover:bg-blue-50"}`}
              >
                Reuniões
              </Button>
            </div>

            <div className="relative w-full md:w-72">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Buscar evento..."
                className="pl-9 pr-9 h-10 rounded-full border-slate-200 bg-white focus:ring-2 focus:ring-pac-primary/20 transition-shadow"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <RiCloseLine className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex flex-col md:flex-row border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm h-auto md:h-44"
                  >
                    <div className="w-full md:w-32 bg-slate-50 p-6 flex flex-col items-center justify-center gap-3 border-b md:border-b-0 md:border-r border-slate-100">
                      <Skeleton className="h-8 w-12" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="flex-1 p-6 space-y-4">
                      <Skeleton className="h-5 w-24 rounded-full" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <AnimatePresence mode="popLayout">
                {displayedEvents.map((evento) => {
                  const style =
                    CATEGORY_STYLES[evento.category] || CATEGORY_STYLES.default;
                  const Icon = style.icon;
                  const { day, month, weekday } = formatDateDisplay(
                    evento.start_date,
                  );

                  const currentStatusKey = getEventStatus(
                    evento.start_date,
                    evento.end_date,
                    evento.status,
                  ) as keyof typeof STATUS_CONFIG;
                  const currentStatus =
                    STATUS_CONFIG[currentStatusKey] || STATUS_CONFIG.aberto;

                  return (
                    <motion.div
                      key={evento.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card
                        className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 ${style.hoverBorder} ${currentStatusKey === "fechado" ? "opacity-75 grayscale-[0.8] hover:grayscale-0 hover:opacity-100" : ""}`}
                      >
                        <div className="flex flex-col md:flex-row">
                          <div
                            className={`p-6 md:w-36 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100 ${style.bg} shrink-0 transition-colors duration-300`}
                          >
                            <span className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1 whitespace-nowrap">
                              {weekday}
                            </span>
                            <span
                              className={`text-4xl font-black ${style.color} mb-1`}
                            >
                              {day}
                            </span>
                            <span
                              className={`text-sm font-bold uppercase tracking-wider ${style.color}`}
                            >
                              {month}
                            </span>
                            <div className="mt-4 p-2 bg-white rounded-full shadow-sm">
                              <Icon className={`w-5 h-5 ${style.color}`} />
                            </div>
                          </div>

                          <CardContent className="flex-1 p-6 flex flex-col justify-center">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="space-y-3 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge
                                    className={`bg-white border-2 text-slate-700 hover:bg-slate-50 font-bold px-2.5 py-0.5 ${style.color} border-current opacity-80`}
                                  >
                                    {evento.type}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`border font-medium px-2.5 py-0.5 flex items-center gap-1 transition-colors duration-300 ${currentStatus.classes}`}
                                  >
                                    {currentStatus.icon && (
                                      <currentStatus.icon className="w-3.5 h-3.5" />
                                    )}
                                    {currentStatus.label}
                                  </Badge>
                                </div>

                                <div>
                                  <CardTitle
                                    className={`text-xl font-bold transition-colors ${currentStatusKey === "fechado" ? "text-slate-600 line-through decoration-slate-400/50" : "text-slate-900 group-hover:text-pac-primary"}`}
                                  >
                                    {evento.title}
                                  </CardTitle>
                                  <CardDescription className="mt-2 text-slate-600 line-clamp-2 text-sm leading-relaxed">
                                    {evento.description ||
                                      "Sem descrição disponível."}
                                  </CardDescription>
                                </div>

                                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-sm text-slate-500 font-medium">
                                  <div className="flex items-center gap-1.5">
                                    <RiTimeLine className="text-pac-primary w-4 h-4" />
                                    {evento.time_display}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <RiMapPinLine className="text-pac-primary w-4 h-4" />
                                    {evento.location}
                                  </div>
                                  {evento.instructor && (
                                    <div className="flex items-center gap-1.5">
                                      <RiUserVoiceLine className="text-pac-primary w-4 h-4" />
                                      {evento.instructor}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}

            {!loading && displayedEvents.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200"
              >
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <RiFilter3Line className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Nenhum evento encontrado
                </h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-6">
                  Não encontramos resultados. Ajuste os filtros ou verifique
                  mais tarde.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilter("all");
                    setSearchTerm("");
                  }}
                  className="border-slate-200 text-slate-700 hover:border-pac-primary hover:text-pac-primary"
                >
                  Limpar filtros
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
