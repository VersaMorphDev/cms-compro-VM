"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, isDatabaseConfigured } from "@/db";
import { blogPosts } from "@/db/schema";
import { logActivity } from "@/lib/activity-logger";
import {
  isUniqueConstraintError as isUniqueSlugError,
  safeAction,
  UserFacingError,
  type ActionResult,
} from "@/lib/safe-action";
import { estimateReadTime, slugify } from "@/lib/utils";
import {
  deleteFallbackBlogPost,
  upsertFallbackBlogPost,
} from "@/features/content/store-fallback";
import { blogPostSchema, type BlogPostDTO, type ContentStatus } from "./schema";

export async function saveBlogPostAction(
  rawInput: unknown
): Promise<ActionResult<BlogPostDTO>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menyimpan artikel blog. Silakan coba lagi.",
      source: "CMS_SERVER_ACTION",
      actorName: "Sahri Ramadan",
      requestUrl: "/content/blog",
      payload: rawInput,
    },
    async () => {
      const parsed = blogPostSchema.parse(rawInput);
      const resolvedSlug = slugify(parsed.slug || parsed.title);
      if (!resolvedSlug) {
        throw new UserFacingError("Slug artikel tidak valid.");
      }

      const readTime =
        parsed.readTime?.trim() || estimateReadTime(parsed.content);
      const imageVal = parsed.image?.trim() || null;

      let savedItem: BlogPostDTO | null = null;
      let beforeItem: unknown = undefined;
      const isUpdate = Boolean(parsed.id);

      if (isDatabaseConfigured) {
        try {
          if (parsed.id) {
            const [existing] = await db
              .select()
              .from(blogPosts)
              .where(eq(blogPosts.id, parsed.id))
              .limit(1);

            if (!existing) {
              throw new UserFacingError("Artikel blog tidak ditemukan.");
            }
            beforeItem = {
              title: existing.title,
              slug: existing.slug,
              status: existing.status,
            };

            const [updated] = await db
              .update(blogPosts)
              .set({
                slug: resolvedSlug,
                title: parsed.title,
                description: parsed.description,
                category: parsed.category,
                author: parsed.author,
                role: parsed.role,
                publishedDate: parsed.publishedDate,
                readTime,
                image: imageVal,
                content: parsed.content,
                status: parsed.status,
                updatedAt: new Date(),
              })
              .where(eq(blogPosts.id, parsed.id))
              .returning();

            savedItem = {
              id: updated.id,
              slug: updated.slug,
              title: updated.title,
              description: updated.description,
              category: updated.category,
              author: updated.author,
              role: updated.role,
              publishedDate: updated.publishedDate,
              readTime: updated.readTime,
              image: updated.image,
              content: updated.content,
              status: updated.status as ContentStatus,
              createdAt: updated.createdAt.toISOString(),
              updatedAt: updated.updatedAt.toISOString(),
            };
          } else {
            const [inserted] = await db
              .insert(blogPosts)
              .values({
                slug: resolvedSlug,
                title: parsed.title,
                description: parsed.description,
                category: parsed.category,
                author: parsed.author,
                role: parsed.role,
                publishedDate: parsed.publishedDate,
                readTime,
                image: imageVal,
                content: parsed.content,
                status: parsed.status,
              })
              .returning();

            savedItem = {
              id: inserted.id,
              slug: inserted.slug,
              title: inserted.title,
              description: inserted.description,
              category: inserted.category,
              author: inserted.author,
              role: inserted.role,
              publishedDate: inserted.publishedDate,
              readTime: inserted.readTime,
              image: inserted.image,
              content: inserted.content,
              status: inserted.status as ContentStatus,
              createdAt: inserted.createdAt.toISOString(),
              updatedAt: inserted.updatedAt.toISOString(),
            };
          }
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          if (isUniqueSlugError(dbErr)) {
            throw new UserFacingError(
              "Slug artikel sudah digunakan. Gunakan slug lain.",
              { slug: ["Slug sudah terdaftar"] }
            );
          }
          try {
            const res = upsertFallbackBlogPost({
              id: parsed.id,
              slug: resolvedSlug,
              title: parsed.title,
              description: parsed.description,
              category: parsed.category,
              author: parsed.author,
              role: parsed.role,
              publishedDate: parsed.publishedDate,
              readTime,
              image: imageVal,
              content: parsed.content,
              status: parsed.status,
            });
            savedItem = res.item;
            beforeItem = res.before;
          } catch (fbErr) {
            if (isUniqueSlugError(fbErr)) {
              throw new UserFacingError(
                "Slug artikel sudah digunakan. Gunakan slug lain.",
                { slug: ["Slug sudah terdaftar"] }
              );
            }
            throw fbErr;
          }
        }
      } else {
        try {
          const res = upsertFallbackBlogPost({
            id: parsed.id,
            slug: resolvedSlug,
            title: parsed.title,
            description: parsed.description,
            category: parsed.category,
            author: parsed.author,
            role: parsed.role,
            publishedDate: parsed.publishedDate,
            readTime,
            image: imageVal,
            content: parsed.content,
            status: parsed.status,
          });
          savedItem = res.item;
          beforeItem = res.before;
        } catch (fbErr) {
          if (isUniqueSlugError(fbErr)) {
            throw new UserFacingError(
              "Slug artikel sudah digunakan. Gunakan slug lain.",
              { slug: ["Slug sudah terdaftar"] }
            );
          }
          throw fbErr;
        }
      }

      if (!savedItem) {
        throw new Error("Blog post could not be saved");
      }

      await logActivity({
        action: isUpdate ? "UPDATE" : "CREATE",
        module: "BLOG",
        targetId: savedItem.slug,
        targetTitle: savedItem.title,
        changes: {
          before: beforeItem,
          after: {
            slug: savedItem.slug,
            category: savedItem.category,
            status: savedItem.status,
          },
        },
      });

      revalidatePath("/content/blog");
      revalidatePath("/monitoring");

      return savedItem;
    }
  );
}

export async function toggleBlogStatusAction(
  id: number,
  status: ContentStatus
): Promise<ActionResult<{ id: number; status: ContentStatus }>> {
  return safeAction(
    {
      friendlyMessage: "Gagal mengubah status publikasi artikel.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/content/blog",
      payload: { id, status },
    },
    async () => {
      const parsed = z
        .object({
          id: z.number().int().positive(),
          status: z.enum(["DRAFT", "PUBLISHED"]),
        })
        .parse({ id, status });

      let targetTitle = `Post #${parsed.id}`;
      let prevStatus = "DRAFT";

      if (isDatabaseConfigured) {
        try {
          const [existing] = await db
            .select()
            .from(blogPosts)
            .where(eq(blogPosts.id, parsed.id))
            .limit(1);

          if (!existing) {
            throw new UserFacingError("Artikel tidak ditemukan.");
          }
          prevStatus = existing.status;
          targetTitle = existing.title;

          await db
            .update(blogPosts)
            .set({ status: parsed.status, updatedAt: new Date() })
            .where(eq(blogPosts.id, parsed.id));
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const all = (await import("@/features/content/store-fallback")).getFallbackBlogPosts();
          const target = all.find((p) => p.id === parsed.id);
          if (!target) throw new UserFacingError("Artikel tidak ditemukan.");
          prevStatus = target.status;
          targetTitle = target.title;
          upsertFallbackBlogPost({ ...target, status: parsed.status });
        }
      } else {
        const all = (await import("@/features/content/store-fallback")).getFallbackBlogPosts();
        const target = all.find((p) => p.id === parsed.id);
        if (!target) throw new UserFacingError("Artikel tidak ditemukan.");
        prevStatus = target.status;
        targetTitle = target.title;
        upsertFallbackBlogPost({ ...target, status: parsed.status });
      }

      await logActivity({
        action: parsed.status === "PUBLISHED" ? "PUBLISH" : "STATUS_CHANGE",
        module: "BLOG",
        targetId: String(parsed.id),
        targetTitle,
        changes: {
          before: { status: prevStatus },
          after: { status: parsed.status },
        },
      });

      revalidatePath("/content/blog");
      revalidatePath("/monitoring");

      return { id: parsed.id, status: parsed.status };
    }
  );
}

export async function deleteBlogPostAction(
  id: number
): Promise<ActionResult<{ id: number }>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menghapus artikel blog.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/content/blog",
      payload: { id },
    },
    async () => {
      const parsedId = z.number().int().positive().parse(id);
      let deletedTitle = `Post #${parsedId}`;

      if (isDatabaseConfigured) {
        try {
          const [deleted] = await db
            .delete(blogPosts)
            .where(eq(blogPosts.id, parsedId))
            .returning();
          if (!deleted) throw new UserFacingError("Artikel tidak ditemukan.");
          deletedTitle = deleted.title;
        } catch (dbErr) {
          if (dbErr instanceof UserFacingError) throw dbErr;
          const deleted = deleteFallbackBlogPost(parsedId);
          if (!deleted) throw new UserFacingError("Artikel tidak ditemukan.");
          deletedTitle = deleted.title;
        }
      } else {
        const deleted = deleteFallbackBlogPost(parsedId);
        if (!deleted) throw new UserFacingError("Artikel tidak ditemukan.");
        deletedTitle = deleted.title;
      }

      await logActivity({
        action: "DELETE",
        module: "BLOG",
        targetId: String(parsedId),
        targetTitle: deletedTitle,
        changes: { before: { id: parsedId, title: deletedTitle } },
      });

      revalidatePath("/content/blog");
      revalidatePath("/monitoring");

      return { id: parsedId };
    }
  );
}
