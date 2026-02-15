"use client";

import { deleteEvent } from "@/app/actions/events/admin-events";
import { Button } from "@/components/ui/button";
import { RiDeleteBinLine } from "react-icons/ri";
import { toast } from "sonner";

export function DeleteEventButton({ id }: { id: string }) {
  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;

    const res = await deleteEvent(id);
    if (res.success) {
      toast.success("Evento excluído.");
    } else {
      toast.error("Erro ao excluir.");
    }
  };

  return (
    <Button size="icon" variant="ghost" onClick={handleDelete}>
      <RiDeleteBinLine className="w-4 h-4 text-red-600" />
    </Button>
  );
}
