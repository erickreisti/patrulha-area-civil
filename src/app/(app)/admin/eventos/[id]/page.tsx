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

  const formatForInput = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toISOString().slice(0, 16);
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
    // Atualizado: Estilos consistentes com o Dashboard
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
      <EventForm initialData={formattedData} />
    </div>
  );
}
