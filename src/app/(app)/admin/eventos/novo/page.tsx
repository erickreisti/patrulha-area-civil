import EventForm from "@/components/admin/events/EventForm";

export default function NovoEventoPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">
          Criar Novo Evento
        </h1>
        <EventForm />
      </div>
    </div>
  );
}
