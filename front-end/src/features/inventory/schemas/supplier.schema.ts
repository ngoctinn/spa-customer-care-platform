// src/features/inventory/schemas/supplier.schema.ts
import { z } from "zod";
import { nameSchema, phoneSchema, emailSchema } from "@/lib/schemas";

export const supplierFormSchema = z.object({
  name: nameSchema.min(3, "Tên nhà cung cấp phải có ít nhất 3 ký tự."),
  contact_person: nameSchema.min(
    3,
    "Tên người liên hệ phải có ít nhất 3 ký tự."
  ),
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal("")),
  address: z.string().optional(),
});

export type SupplierFormValues = z.infer<typeof supplierFormSchema>;
