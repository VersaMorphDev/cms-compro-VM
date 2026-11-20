import { getBlogPosts } from "@/features/blog/queries";
import BlogManagerClient from "@/features/blog/components/BlogManagerClient";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const { items, storageMode } = await getBlogPosts();

  return <BlogManagerClient initialPosts={items} storageMode={storageMode} />;
}
