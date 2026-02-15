import { z } from "zod";

export const EventCategoryEnum = z.enum(["training", "operation", "meeting"]);

export const eventSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().nullable().optional(),
  type: z.string().min(1, "O tipo é obrigatório"),
  category: EventCategoryEnum,
  start_date: z.string(),
  end_date: z.string(),
  time_display: z.string().min(1, "O horário é obrigatório"), // Ex: 08:00 - 12:00
  location: z.string().min(1, "O local é obrigatório"),
  instructor: z.string().nullable().optional(),
  status: z.string(),
});

export type EventType = z.infer<typeof eventSchema>;
