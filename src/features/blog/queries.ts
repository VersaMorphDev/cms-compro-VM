import { desc } from "drizzle-orm";
import { db, isDatabaseConfigured } from "@/db";
import { blogPosts } from "@/db/schema";
import { getFallbackBlogPosts } from "@/features/content/store-fallback";
import type { BlogPostDTO, ContentStatus } from "./schema";

export async function getBlogPosts(): Promise<{
  items: BlogPostDTO[];
  storageMode: "database" | "memory";
}> {
  if (isDatabaseConfigured) {
    try {
      const rows = await db
        .select()
        .from(blogPosts)
        .orderBy(desc(blogPosts.createdAt), desc(blogPosts.id));

      return {
        storageMode: "database",
        items: rows.map((r) => ({
          id: r.id,
          slug: r.slug,
          title: r.title,
          description: r.description,
          category: r.category,
          author: r.author,
          role: r.role,
          publishedDate: r.publishedDate,
          readTime: r.readTime,
          image: r.image,
          content: r.content,
          status: (r.status === "DRAFT" ? "DRAFT" : "PUBLISHED") as ContentStatus,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })),
      };
    } catch (err) {
      console.warn(
        "[BlogQueries] Falling back to memory store:",
        err instanceof Error ? err.message : "DB error"
      );
    }
  }

  return {
    storageMode: "memory",
    items: getFallbackBlogPosts(),
  };
}
