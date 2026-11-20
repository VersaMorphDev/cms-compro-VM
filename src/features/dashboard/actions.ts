"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { safeAction, type ActionResult } from "@/lib/safe-action";
import {
  triggerComproRevalidation,
  type RevalidationResult,
} from "@/lib/revalidate-compro";

const syncSchema = z.object({
  tags: z.array(z.string().trim().min(1)).min(1),
});

export async function triggerManualSyncAction(
  tags: string[]
): Promise<ActionResult<RevalidationResult>> {
  return safeAction(
    {
      friendlyMessage: "Gagal menjalankan sinkronisasi cache ke website Compro.",
      source: "CMS_SERVER_ACTION",
      requestUrl: "/sync",
      payload: { tags },
    },
    async () => {
      const parsed = syncSchema.parse({ tags });
      const res = await triggerComproRevalidation(parsed.tags, ["/", "/blog", "/portfolio", "/services", "/pricing"]);
      revalidatePath("/monitoring");
      revalidatePath("/sync");
      return res;
    }
  );
}
