import { z } from "zod";

export const FAQ_CATEGORIES = [
  "General",
  "Services",
  "Process",
  "Technical",
  "Support",
] as const;

export interface FaqItemDTO {
  id: number;
  question: string;
  answer: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const faqSchema = z.object({
  id: z.number().int().positive().optional(),
  question: z.string().trim().min(5, "Pertanyaan minimal 5 karakter").max(300),
  answer: z.string().trim().min(5, "Jawaban minimal 5 karakter"),
  category: z.enum(FAQ_CATEGORIES),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export type FaqInput = z.infer<typeof faqSchema>;
