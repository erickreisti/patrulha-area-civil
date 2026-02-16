"use client";

import { deleteEvent } from "@/app/actions/events/admin-events";
import { Button } from "@/components/ui/button";
import { RiDeleteBinLine } from "react-icons/ri";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function DeleteEventButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        "Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.",
      )
    )
      return;

    setIsDeleting(true);
    try {
      const res = await deleteEvent(id);
      if (res.success) {
        toast.success("Evento excluído com sucesso.");
      } else {
        toast.error("Erro ao excluir evento.");
      }
    } catch (error) {
      toast.error("Erro de conexão.");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={handleDelete}
      disabled={isDeleting}
      className="h-8 w-8 hover:bg-red-50 hover:text-red-600 transition-colors"
      title="Excluir evento"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
      ) : (
        <RiDeleteBinLine className="w-4 h-4 text-red-600" />
      )}
    </Button>
  );
}
