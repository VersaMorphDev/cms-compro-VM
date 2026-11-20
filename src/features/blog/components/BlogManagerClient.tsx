"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IconTrash, IconWand, IconSend } from "@tabler/icons-react";
import PageHeaderBar from "@/components/layout/PageHeaderBar";
import BentoKpiSection from "@/components/bento/BentoKpiSection";
import FilterPillBar from "@/components/bento/FilterPillBar";
import SplitWorkspace from "@/components/bento/SplitWorkspace";
import MasterListItem from "@/components/bento/MasterListItem";
import RichContentEditor from "@/components/editor/RichContentEditor";
import ConfirmDeleteModal from "@/components/editor/ConfirmDeleteModal";
import { useToast } from "@/components/ui/ToastProvider";
import { estimateReadTime, slugify } from "@/lib/utils";
import {
  deleteBlogPostAction,
  saveBlogPostAction,
  toggleBlogStatusAction,
} from "../actions";
import {
  BLOG_CATEGORIES,
  type BlogPostDTO,
  type ContentStatus,
} from "../schema";

interface BlogManagerClientProps {
  initialPosts: BlogPostDTO[];
  storageMode: "database" | "memory";
}

function BlogEditorForm({
  post,
  onSaved,
  onDeleted,
}: {
  post: BlogPostDTO | null;
  onSaved: (saved: BlogPostDTO) => void;
  onDeleted: (deletedId: number) => void;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [description, setDescription] = useState(post?.description ?? "");
  const [category, setCategory] = useState(post?.category ?? BLOG_CATEGORIES[0]);
  const [author, setAuthor] = useState(post?.author ?? "Sahri Ramadan");
  const [role, setRole] = useState(post?.role ?? "Founder & CTO");
  const [publishedDate, setPublishedDate] = useState(
    post?.publishedDate ?? "Nov 19, 2026"
  );
  const [readTime, setReadTime] = useState(post?.readTime ?? "");
  const [image, setImage] = useState(post?.image ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [status, setStatus] = useState<ContentStatus>(post?.status ?? "DRAFT");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await saveBlogPostAction({
        id: post?.id,
        title,
        slug: slug || slugify(title),
        description,
        category,
        author,
        role,
        publishedDate,
        readTime: readTime || estimateReadTime(content),
        image: image || null,
        content,
        status,
      });

      if (result.ok) {
        toast({
          type: "success",
          title: post ? "Artikel diperbarui" : "Artikel baru dibuat",
          description: `"${result.data.title}" (${result.data.status}) tersimpan.`,
        });
        onSaved(result.data);
      } else {
        toast({
          type: "error",
          title: result.error.isValidation
            ? "Periksa input artikel"
            : "Gagal menyimpan artikel",
          description: result.error.message,
          referenceCode: result.error.referenceCode,
        });
      }
    });
  };

  const handleQuickToggleStatus = () => {
    if (!post) return;
    const nextStatus: ContentStatus =
      status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    startTransition(async () => {
      const result = await toggleBlogStatusAction(post.id, nextStatus);
      if (result.ok) {
        setStatus(nextStatus);
        toast({
          type: "success",
          title:
            nextStatus === "PUBLISHED"
              ? "Artikel dipublikasikan"
              : "Artikel dikembalikan ke Draft",
        });
        onSaved({ ...post, status: nextStatus });
      } else {
        toast({
          type: "error",
          title: "Gagal mengubah status",
          description: result.error.message,
          referenceCode: result.error.referenceCode,
        });
      }
    });
  };

  const handleConfirmDelete = () => {
    if (!post) return;
    startTransition(async () => {
      const result = await deleteBlogPostAction(post.id);
      setDeleteOpen(false);
      if (result.ok) {
        toast({
          type: "success",
          title: "Artikel dihapus",
          description: `"${post.title}" telah dihapus.`,
        });
        onDeleted(post.id);
      } else {
        toast({
          type: "error",
          title: "Gagal menghapus artikel",
          description: result.error.message,
          referenceCode: result.error.referenceCode,
        });
      }
    });
  };

  return (
    <>
      <form onSubmit={handleSave} className="flex flex-col gap-4 h-full">
        {/* Top Metadata Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 pb-4">
          <div>
            <p className="text-[11px] font-medium text-slate-400">
              {post ? `Editing Post #${post.id}` : "Create New Blog Post"}
            </p>
            <h3 className="font-display font-bold text-lg text-white">
              {title || "Untitled Article"}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ContentStatus)}
              className="bg-[#1C2029] border border-white/15 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-[#86FF00]"
            >
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
            </select>

            {post && (
              <button
                type="button"
                disabled={isPending}
                onClick={handleQuickToggleStatus}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C2029] border border-white/10 hover:border-[#86FF00]/60 text-[11px] font-semibold text-slate-200 transition-colors cursor-pointer"
              >
                <IconSend size={13} />
                <span>{status === "PUBLISHED" ? "Unpublish" : "Publish"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Article Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!post) setSlug(slugify(e.target.value));
              }}
              placeholder="e.g. Securing Web Applications: Best Practices for 2026"
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              URL Slug
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="securing-web-apps-2026"
                className="flex-1 bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none"
              />
              <button
                type="button"
                title="Auto-generate slug"
                onClick={() => setSlug(slugify(title))}
                className="px-2.5 rounded-xl bg-[#1C2029] border border-white/10 hover:border-[#86FF00] text-slate-300 hover:text-[#86FF00] cursor-pointer"
              >
                <IconWand size={14} />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            >
              {BLOG_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Author Name
            </label>
            <input
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Author Role
            </label>
            <input
              type="text"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Published Date
            </label>
            <input
              type="text"
              required
              value={publishedDate}
              onChange={(e) => setPublishedDate(e.target.value)}
              placeholder="Jul 10, 2026"
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Cover Image Path / URL
            </label>
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="/blog/cover.jpg"
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-[11px] font-medium text-slate-400">
              Short Excerpt / Meta Description
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary shown on blog cards and SEO meta tags..."
              className="w-full bg-[#1C2029] border border-white/10 focus:border-[#86FF00] rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>
        </div>

        <RichContentEditor
          label="Article Body (HTML)"
          value={content}
          onChange={(val) => {
            setContent(val);
            setReadTime(estimateReadTime(val));
          }}
          mode="html"
          minRows={7}
        />

        {/* Footer Action Bar */}
        <div className="bg-[#1C2029] border border-white/8 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 mt-auto">
          <div className="flex items-center gap-5 text-xs">
            <div>
              <span className="block text-[10px] text-slate-400">Read Time</span>
              <span className="font-semibold text-white">
                {readTime || estimateReadTime(content)}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Compro URL</span>
              <span className="font-mono text-[11px] text-slate-300">
                /blog/{slug || "auto"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {post && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => setDeleteOpen(true)}
                className="w-9 h-9 rounded-full bg-[#14171E] border border-white/10 hover:border-rose-500/50 hover:text-rose-400 flex items-center justify-center text-slate-400 transition-colors cursor-pointer"
                title="Delete article"
              >
                <IconTrash size={16} />
              </button>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-full bg-[#86FF00] hover:bg-[#9BFF2E] text-[#090A0F] text-xs font-bold transition-colors cursor-pointer disabled:opacity-60 shadow-[0_4px_18px_rgba(134,255,0,0.25)]"
            >
              {isPending ? "Saving..." : post ? "Save Changes" : "Publish Article"}
            </button>
          </div>
        </div>
      </form>

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus Artikel Blog?"
        description={`Artikel "${post?.title}" akan dihapus permanen dan tercatat di log aktivitas.`}
        loading={isPending}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

export default function BlogManagerClient({
  initialPosts,
  storageMode,
}: BlogManagerClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | "new">(
    initialPosts[0]?.id ?? "new"
  );
  const [activeMiniCard, setActiveMiniCard] = useState("all");

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((p) => {
      if (activeTab === "draft" && p.status !== "DRAFT") return false;
      if (activeTab === "published" && p.status !== "PUBLISHED") return false;
      if (categoryFilter !== "all" && p.category !== categoryFilter) {
        return false;
      }
      if (statusFilter !== "all" && p.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !p.title.toLowerCase().includes(q) &&
          !p.slug.toLowerCase().includes(q) &&
          !p.author.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [initialPosts, activeTab, categoryFilter, statusFilter, searchQuery]);

  const selectedPost =
    selectedId === "new"
      ? null
      : filteredPosts.find((p) => p.id === selectedId) ??
        filteredPosts[0] ??
        null;

  const editorKey = selectedId === "new" ? "new" : String(selectedPost?.id ?? "new");

  const publishedCount = initialPosts.filter((p) => p.status === "PUBLISHED").length;
  const draftCount = initialPosts.filter((p) => p.status === "DRAFT").length;
  const totalCount = Math.max(1, initialPosts.length);

  const activeFiltersCount =
    (categoryFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <div className="space-y-4">
      <PageHeaderBar
        title="Blog & Insights"
        backHref="/"
        primaryActionLabel="New Article"
        onPrimaryAction={() => setSelectedId("new")}
      />

      <BentoKpiSection
        leftStats={[
          { label: "Total Articles", value: String(initialPosts.length), unit: "posts" },
          { label: "Published Live", value: String(publishedCount), unit: "articles" },
          { label: "Pending Drafts", value: String(draftCount), unit: "drafts" },
        ]}
        timelineSegments={[
          {
            label: "Published",
            endLabel: `${Math.round((publishedCount / totalCount) * 100)}%`,
            progressPercent: Math.round((publishedCount / totalCount) * 100),
            avatars: ["SR", "AN"],
          },
          {
            label: "Draft Queue",
            endLabel: `${Math.round((draftCount / totalCount) * 100)}%`,
            progressPercent: Math.round((draftCount / totalCount) * 100) || 8,
            avatars: ["ED"],
          },
          {
            label: "Categories",
            endLabel: `${new Set(initialPosts.map((p) => p.category)).size} active`,
            progressPercent: 72,
            avatars: ["TX"],
          },
        ]}
        rightTitle="Editorial Engine"
        rightValue={storageMode === "database" ? "PostgreSQL" : "Memory Store"}
        rightBadge="Compro /blog"
        rightActionLabel="+ Write Post"
        onRightAction={() => setSelectedId("new")}
        miniCards={[
          {
            id: "all",
            code: "All Posts",
            title: `${initialPosts.length} Articles`,
            subtitle: "Editorial Index",
            highlighted: activeMiniCard === "all",
          },
          {
            id: "PUBLISHED",
            code: "Live",
            title: `${publishedCount} Published`,
            subtitle: "Visible on Web",
            highlighted: activeMiniCard === "PUBLISHED",
          },
          {
            id: "DRAFT",
            code: "Review",
            title: `${draftCount} Drafts`,
            subtitle: "Work in Progress",
            highlighted: activeMiniCard === "DRAFT",
          },
        ]}
        onMiniCardClick={(id) => {
          setActiveMiniCard(id);
          setStatusFilter(id);
        }}
      />

      <FilterPillBar
        activeCount={activeFiltersCount}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search title, slug, author..."
        selects={[
          {
            id: "category",
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { label: "All categories", value: "all" },
              ...BLOG_CATEGORIES.map((c) => ({ label: c, value: c })),
            ],
          },
          {
            id: "status",
            value: statusFilter,
            onChange: (v) => {
              setStatusFilter(v);
              setActiveMiniCard(v);
            },
            options: [
              { label: "All statuses", value: "all" },
              { label: "Published", value: "PUBLISHED" },
              { label: "Draft", value: "DRAFT" },
            ],
          },
        ]}
      />

      <SplitWorkspace
        tabs={[
          { id: "all", label: "All Posts", count: initialPosts.length },
          { id: "draft", label: "Draft", count: draftCount },
          { id: "published", label: "Published", count: publishedCount },
        ]}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
        leftTitle="Editorial Articles"
        leftContent={
          filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <MasterListItem
                key={post.id}
                selected={selectedId !== "new" && selectedPost?.id === post.id}
                onClick={() => setSelectedId(post.id)}
                avatarText={post.author.slice(0, 2).toUpperCase()}
                title={post.title}
                subtitle={`${post.category} · ${post.publishedDate}`}
                statusLabel={post.status}
                rightMetric={post.readTime}
              />
            ))
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              Belum ada artikel yang sesuai filter.
            </div>
          )
        }
        rightContent={
          <BlogEditorForm
            key={editorKey}
            post={selectedPost}
            onSaved={(saved) => {
              setSelectedId(saved.id);
              router.refresh();
            }}
            onDeleted={() => {
              setSelectedId("new");
              router.refresh();
            }}
          />
        }
      />
    </div>
  );
}
