import { z } from "zod";

export const itemSchema = z.object({
  item_code: z.string().optional().or(z.literal("")),
  item_name: z.string().min(1, "Item name is required"),
  standard_description: z.string().min(1, "Description is required"),
  unit: z.string().min(1, "Unit is required"),
  default_price: z.coerce.number().min(0),
  category: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type ItemInput = z.infer<typeof itemSchema>;
