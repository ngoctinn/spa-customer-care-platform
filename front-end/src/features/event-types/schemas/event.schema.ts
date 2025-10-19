import { z } from "zod";

export const eventFormSchema = z.object({
  name: z.string().min(1, "Required"),
  description: z.string().optional(),
  isActive: z.boolean(),
  durationInMinutes: z
    .number({
      message: "Thời lượng phải là một con số.", // Thêm thông báo lỗi cho rõ ràng
    })
    .int("Thời lượng phải là số nguyên")
    .positive("Thời lượng phải lớn hơn 0")
    .max(60 * 12, `Thời lượng phải nhỏ hơn 12 giờ (${60 * 12} phút)`),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;
