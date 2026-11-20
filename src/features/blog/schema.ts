import { z } from "zod";

export const BLOG_CATEGORIES = [
  "Cybersecurity",
  "Web Development",
  "UI/UX Design",
  "Mobile Applications",
  "Digital Transformation",
  "AI & Machine Learning",
  "Cloud & DevOps",
] as const;

export type ContentStatus = "DRAFT" | "PUBLISHED";

export interface BlogPostDTO {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  author: string;
  role: string;
  publishedDate: string;
  readTime: string;
  image: string | null;
  content: string;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export const blogPostSchema = z.object({
  id: z.number().int().positive().optional(),
  slug: z.string().trim().max(180).optional().default(""),
  title: z.string().trim().min(3, "Judul minimal 3 karakter").max(200),
  description: z.string().trim().min(10, "Ringkasan minimal 10 karakter").max(500),
  category: z.string().trim().min(1, "Kategori wajib dipilih"),
  author: z.string().trim().min(2, "Nama penulis wajib diisi").max(120),
  role: z.string().trim().min(2, "Peran penulis wajib diisi").max(120),
  publishedDate: z.string().trim().min(2, "Tanggal publikasi wajib diisi").max(60),
  readTime: z.string().trim().max(40).optional().default(""),
  image: z.string().trim().max(300).optional().nullable(),
  content: z.string().trim().min(10, "Konten artikel minimal 10 karakter"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;
