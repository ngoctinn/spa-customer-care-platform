// src/features/resources/schemas/room.schema.ts
import { z } from "zod";

export const roomFormSchema = z.object({
  name: z.string().min(3, "Tên phòng phải có ít nhất 3 ký tự."),
  description: z.string().optional(),
});

export type RoomFormValues = z.infer<typeof roomFormSchema>;
