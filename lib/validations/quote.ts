import { z } from "zod";

export const quoteLineSchema = z.object({
  line_number: z.number().int().positive(),
  item_id: z.string().uuid().optional().nullable(),
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(0),
  unit: z.string().min(1, "Unit is required"),
  unit_price: z.coerce.number().min(0),
});

export const quoteSchema = z.object({
  customer_id: z.string().uuid("Customer is required"),
  quote_date: z.string().min(1, "Quote date is required"),
  reference: z.string().optional().or(z.literal("")),
  currency: z.literal("NGN"),
  tax_amount: z.coerce.number().min(0).default(0),
  discount_amount: z.coerce.number().min(0).default(0),
  notes: z.string().optional().or(z.literal("")),
  lines: z.array(quoteLineSchema).min(1, "At least one line item is required"),
});

export type QuoteInput = z.infer<typeof quoteSchema>;
