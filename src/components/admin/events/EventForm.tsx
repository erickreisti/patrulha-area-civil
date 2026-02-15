"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  RiSaveLine,
  RiArrowLeftLine,
  RiCalendarLine,
  RiTimeLine,
  RiMapPinLine,
  RiUserVoiceLine,
  RiText,
  RiFlagLine,
  RiPriceTag3Line,
} from "react-icons/ri";
import { format, isValid } from "date-fns";

import { eventSchema, type EventType } from "@/lib/schemas/events";
import { createEvent, updateEvent } from "@/app/actions/events/admin-events";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EventFormProps {
  initialData?: EventType | null;
}

const formSchema = eventSchema.extend({
  id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EventForm({ initialData }: EventFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: FormValues = {
    title: initialData?.title ?? "",
    description: initialData?.description ?? "",
    type: initialData?.type ?? "",
    category: initialData?.category ?? "training",
    start_date: initialData?.start_date ?? "",
    end_date: initialData?.end_date ?? "",
    time_display: initialData?.time_display ?? "",
    location: initialData?.location ?? "",
    instructor: initialData?.instructor ?? "",
    status: initialData?.status ?? "Aberto",
    id: initialData?.id,
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // --- AUTOMAÇÃO DO HORÁRIO ---
  const startDate = form.watch("start_date");
  const endDate = form.watch("end_date");

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isValid(start) && isValid(end)) {
        const startTime = format(start, "HH:mm");
        const endTime = format(end, "HH:mm");
        const autoTimeDisplay = `${startTime} - ${endTime}`;

        const currentDisplay = form.getValues("time_display");
        // Só preenche se o campo estiver vazio para não sobrescrever edição manual
        if (
          !currentDisplay ||
          currentDisplay === "" ||
          form.formState.touchedFields.start_date
        ) {
          form.setValue("time_display", autoTimeDisplay);
        }
      }
    }
  }, [startDate, endDate, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    let result;

    try {
      if (initialData?.id) {
        const dataToUpdate = { ...values, id: initialData.id } as EventType;
        result = await updateEvent(dataToUpdate);
        if (result.success) {
          toast.success("Evento atualizado!");
          router.refresh();
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...createData } = values;
        result = await createEvent(createData as Omit<EventType, "id">);
        if (result.success) {
          toast.success("Evento criado com sucesso!");
          router.push("/admin/eventos");
          router.refresh();
        }
      }

      if (!result.success) {
        toast.error(result.error || "Ocorreu um erro.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro inesperado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-6xl mx-auto pb-10"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
              {initialData ? "Editar Evento" : "Novo Evento"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Preencha os dados da atividade oficial.
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 sm:flex-none"
            >
              <RiArrowLeftLine className="mr-2" /> Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-pac-primary hover:bg-pac-primary-dark flex-1 sm:flex-none shadow-md hover:shadow-lg transition-all"
            >
              <RiSaveLine className="mr-2" />
              {isSubmitting ? "Salvando..." : "Salvar Dados"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* --- COLUNA PRINCIPAL (ESQUERDA - MAIOR) --- */}
          <div className="lg:col-span-2 space-y-6">
            {/* CARD 1: Informações Básicas */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-lg font-bold text-slate-700 flex items-center gap-2">
                  <RiText className="text-pac-primary" /> Sobre o Evento
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Título ocupa 2/3 */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-slate-600 font-semibold">
                          Título do Evento
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Treinamento de Resgate em Altura"
                            {...field}
                            className="h-11 text-base font-medium"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tipo ocupa 1/3 - Trocamos para o lado do título */}
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-slate-600 flex items-center gap-1">
                          Etiqueta{" "}
                          <span className="text-xs font-normal text-slate-400">
                            (Ex: Curso, Missão)
                          </span>
                        </FormLabel>
                        <div className="relative">
                          <RiPriceTag3Line className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <FormControl>
                            <Input
                              placeholder="Ex: Curso"
                              {...field}
                              className="pl-10 h-11"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600 font-semibold">
                        Descrição Completa
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva os objetivos, requisitos e detalhes operacionais..."
                          className="min-h-[120px] resize-y text-base leading-relaxed"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* CARD 2: Quando e Onde (Localização agora está aqui, bem grande) */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-lg font-bold text-slate-700 flex items-center gap-2">
                  <RiCalendarLine className="text-pac-primary" /> Quando e Onde
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-slate-600">
                          Início
                        </FormLabel>
                        <div className="relative">
                          <RiCalendarLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              className="pl-10 h-11"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold text-slate-600">
                          Término
                        </FormLabel>
                        <div className="relative">
                          <RiCalendarLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                          <FormControl>
                            <Input
                              type="datetime-local"
                              {...field}
                              className="pl-10 h-11"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="time_display"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-600">
                        Texto do Horário (Exibição)
                      </FormLabel>
                      <div className="relative">
                        <RiTimeLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <FormControl>
                          <Input
                            placeholder="Gerado automaticamente..."
                            {...field}
                            className="pl-10 h-11 bg-slate-50"
                          />
                        </FormControl>
                      </div>
                      <FormDescription>
                        Horário formatado que aparecerá no cartão.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CAMPO LOCALIZAÇÃO (AGORA GRANDE) */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-600">
                        Localização / Endereço
                      </FormLabel>
                      <div className="relative">
                        <RiMapPinLine className="absolute left-3 top-1/2 -translate-y-1/2 text-pac-primary pointer-events-none w-5 h-5" />
                        <FormControl>
                          <Input
                            placeholder="Ex: Base Aérea de Santa Cruz - Rua dos Hangares, s/n"
                            {...field}
                            className="pl-10 h-12 border-slate-300 focus:border-pac-primary focus:ring-pac-primary/20 transition-all font-medium text-base"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* --- COLUNA LATERAL (DIREITA - MENOR) --- */}
          <div className="space-y-6">
            {/* Configurações do Sistema */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-lg font-bold text-slate-700 flex items-center gap-2">
                  <RiFlagLine className="text-pac-primary" /> Configurações
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-600">
                        Status Atual
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Aberto">🟢 Aberto</SelectItem>
                          <SelectItem value="Esgotado">🟠 Esgotado</SelectItem>
                          <SelectItem value="Confirmado">
                            🔵 Confirmado
                          </SelectItem>
                          <SelectItem value="Planejado">
                            ⚪ Planejado
                          </SelectItem>
                          <SelectItem value="Cancelado">
                            🔴 Cancelado
                          </SelectItem>
                          <SelectItem value="Fechado">⚫ Fechado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-600">
                        Categoria (Cor)
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="training">
                            🟩 Treinamento
                          </SelectItem>
                          <SelectItem value="operation">🟥 Operação</SelectItem>
                          <SelectItem value="meeting">🟦 Reunião</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Define o ícone e a cor do card.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Responsável */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-lg font-bold text-slate-700 flex items-center gap-2">
                  <RiUserVoiceLine className="text-pac-primary" /> Responsável
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <FormField
                  control={form.control}
                  name="instructor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold text-slate-600">
                        Instrutor / Líder
                      </FormLabel>
                      <div className="relative">
                        <RiUserVoiceLine className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <FormControl>
                          <Input
                            placeholder="Quem irá ministrar?"
                            {...field}
                            value={field.value ?? ""}
                            className="pl-10 h-11"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
