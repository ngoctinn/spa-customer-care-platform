// src/features/customer/schemas.ts
import { z } from "zod";
import { nameSchema, phoneSchema } from "@/lib/schemas";

export const customerFormSchema = z.object({
  full_name: nameSchema,
  phone_number: phoneSchema.optional().or(z.literal("")),
  note: z.string().optional(),
  credit_limit: z.number().min(0, "Hạn mức tín dụng không được âm."),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;
