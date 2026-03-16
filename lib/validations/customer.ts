import { z } from "zod";

export const customerSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  contact_person: z.string().optional().default(""),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().default(""),
  address: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

export type CustomerInput = z.infer<typeof customerSchema>;
