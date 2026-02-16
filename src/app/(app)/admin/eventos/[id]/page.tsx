import { getEventById } from "@/app/actions/events/admin-events";
import EventForm from "@/components/admin/events/EventForm";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarEventoPage({ params }: Props) {
  const { id } = await params;
  const eventData = await getEventById(id);

  if (!eventData) {
    notFound();
  }

  // --- CONVERSÃO PARA EXIBIÇÃO NO INPUT ---
  // O banco entrega UTC (ex: 17:00). Nós subtraímos 3h para virar horário do Rio (14:00)
  // SOMENTE para preencher o input type="datetime-local".
  // Ao salvar, o EventForm fará o caminho inverso.
  const formatForInput = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      // 3 horas em milissegundos
      const offset = 3 * 60 * 60 * 1000;
      const localDate = new Date(date.getTime() - offset);

      return localDate.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  const formattedData = {
    ...eventData,
    start_date: formatForInput(eventData.start_date),
    end_date: formatForInput(eventData.end_date || ""),
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          Editar Evento
        </h1>
        <EventForm initialData={formattedData} />
      </div>
    </div>
  );
}
