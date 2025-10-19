// src/features/work-schedules/schemas/time-off.schema.ts
import { z } from "zod";

export const timeOffRequestSchema = z
  .object({
    start_time: z.date(),
    end_time: z.date(),
    reason: z.string().min(10, "Lý do nghỉ phải có ít nhất 10 ký tự."),
  })
  .refine((data) => data.end_time > data.start_time, {
    message: "Thời gian kết thúc phải sau thời gian bắt đầu.",
    path: ["end_time"],
  });

export type TimeOffRequestFormValues = z.infer<typeof timeOffRequestSchema>;
