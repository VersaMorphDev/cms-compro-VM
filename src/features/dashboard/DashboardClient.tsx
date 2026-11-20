"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import PageHeaderBar from "@/components/layout/PageHeaderBar";
import BentoKpiSection from "@/components/bento/BentoKpiSection";
import FilterPillBar from "@/components/bento/FilterPillBar";
import SplitWorkspace from "@/components/bento/SplitWorkspace";
import MasterListItem from "@/components/bento/MasterListItem";
import DetailInsetPanel from "@/components/bento/DetailInsetPanel";

export interface OverviewDashboardStats {
  dbLabel: string;
  publishedContentCount: number;
  sectionsCount: number;
  blogCount: number;
  blogPublished: number;
  blogDraft: number;
  projectCount: number;
  serviceCount: number;
  solutionCount: number;
  pricingCount: number;
  calcCount: number;
  leadsCount: number;
  newLeadsCount: number;
  affiliatesCount: number;
  applicantsCount: number;
  unresolvedErrors: number;
  totalActivities: number;
}

interface OverviewItem {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  status: "Published" | "Active";
  category: string;
  metric: string;
  href: string;
  ownerName: string;
  ownerRole: string;
  ownerInitials: string;
  subCards: { id: string; metric: string; label: string }[];
  summary: { label: string; value: string }[];
}

export default function DashboardClient({
  stats,
}: {
  stats: OverviewDashboardStats;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>("blog");
  const [activeMiniCard, setActiveMiniCard] = useState<string>("compro");

  const overviewItems: OverviewItem[] = useMemo(
    () => [
      {
        id: "sections",
        code: "MOD-00",
        title: "Page Sections & Hero Copy",
        subtitle: "Editable static sections across all 15 routes",
        status: "Published",
        category: "Content",
        metric: `${stats.sectionsCount} Sections`,
        href: "/content/sections",
        ownerName: "Sahri Ramadan",
        ownerRole: "Founder & CTO",
        ownerInitials: "SR",
        subCards: [
          {
            id: "sec1",
            metric: `${stats.sectionsCount} Blocks`,
            label: "Per-Section Defaults",
          },
          { id: "sec2", metric: "15 Pages", label: "Home to Global Footer" },
          { id: "sec3", metric: "Reset", label: "Restore Default Snapshot" },
        ],
        summary: [
          { label: "Total Sections", value: `${stats.sectionsCount} Blocks` },
          { label: "Compro Sync", value: "#sections tag" },
          { label: "Storage", value: "SQLite" },
        ],
      },
      {
        id: "blog",
        code: "MOD-01",
        title: "Blog & Insights",
        subtitle: `${stats.blogPublished} published · ${stats.blogDraft} draft`,
        status: "Published",
        category: "Content",
        metric: `${stats.blogCount} Posts`,
        href: "/content/blog",
        ownerName: "Sahri Ramadan",
        ownerRole: "Founder & CTO",
        ownerInitials: "SR",
        subCards: [
          {
            id: "b1",
            metric: `${stats.blogPublished} Posts`,
            label: "Published Articles",
          },
          {
            id: "b2",
            metric: `${stats.blogDraft} Drafts`,
            label: "Pending Review",
          },
          {
            id: "b3",
            metric: "HTML",
            label: "Rich Content Editor",
          },
        ],
        summary: [
          { label: "Total Items", value: `${stats.blogCount} Articles` },
          { label: "Compro Route", value: "/blog" },
          { label: "Storage", value: "SQLite" },
        ],
      },
      {
        id: "portfolio",
        code: "MOD-02",
        title: "Portfolio & Case Studies",
        subtitle: "Problem, Solution & Timeline",
        status: "Published",
        category: "Content",
        metric: `${stats.projectCount} Cases`,
        href: "/content/portfolio",
        ownerName: "Andika Noor",
        ownerRole: "Founder & CEO",
        ownerInitials: "AN",
        subCards: [
          {
            id: "p1",
            metric: `${stats.projectCount} Projects`,
            label: "Enterprise Case Studies",
          },
          { id: "p2", metric: "Phases", label: "Timeline Milestones" },
          { id: "p3", metric: "Stack", label: "Technologies Covered" },
        ],
        summary: [
          { label: "Total Items", value: `${stats.projectCount} Projects` },
          { label: "Compro Route", value: "/portfolio" },
          { label: "Storage", value: "SQLite" },
        ],
      },
      {
        id: "services",
        code: "MOD-03",
        title: "Services & Solutions",
        subtitle: "Offerings & DSDDO Steps",
        status: "Published",
        category: "Content",
        metric: `${stats.serviceCount} Services`,
        href: "/content/services",
        ownerName: "Sahri Ramadan",
        ownerRole: "Founder & CTO",
        ownerInitials: "SR",
        subCards: [
          {
            id: "s1",
            metric: `${stats.serviceCount} Services`,
            label: "Service Detail Pages",
          },
          {
            id: "s2",
            metric: `${stats.solutionCount} Solutions`,
            label: "Industry Solutions",
          },
          { id: "s3", metric: "6 Steps", label: "DSDDO Methodology" },
        ],
        summary: [
          {
            label: "Total Items",
            value: `${stats.serviceCount + stats.solutionCount} Offerings`,
          },
          { label: "Compro Route", value: "/services" },
          { label: "Storage", value: "SQLite" },
        ],
      },
      {
        id: "pricing",
        code: "MOD-04",
        title: "Pricing & Calculator",
        subtitle: "Commercial tiers & IDR rates",
        status: "Active",
        category: "Commercial",
        metric: `${stats.pricingCount} Tiers`,
        href: "/commercial/pricing",
        ownerName: "Andika Noor",
        ownerRole: "Founder & CEO",
        ownerInitials: "AN",
        subCards: [
          {
            id: "pr1",
            metric: `${stats.pricingCount} Tiers`,
            label: "Discovery / Growth / Ent",
          },
          {
            id: "pr2",
            metric: `${stats.calcCount} Params`,
            label: "Calculator Rate Configs",
          },
          { id: "pr3", metric: "IDR", label: "Live Estimator Formula" },
        ],
        summary: [
          { label: "Packages", value: `${stats.pricingCount} Tiers` },
          { label: "Compro Route", value: "/calculator" },
          { label: "Storage", value: "SQLite" },
        ],
      },
      {
        id: "leads",
        code: "MOD-05",
        title: "Inbound Leads & CRM",
        subtitle: "Contact, Affiliates & Applicants",
        status: "Active",
        category: "CRM",
        metric: `${stats.leadsCount} Leads`,
        href: "/crm/leads",
        ownerName: "Sales & HR",
        ownerRole: "Business Development",
        ownerInitials: "BD",
        subCards: [
          {
            id: "l1",
            metric: `${stats.newLeadsCount} New`,
            label: "Unread Lead Inquiries",
          },
          {
            id: "l2",
            metric: `${stats.affiliatesCount} Partners`,
            label: "Affiliate Loop (VM-AFF)",
          },
          {
            id: "l3",
            metric: `${stats.applicantsCount} CVs`,
            label: "Job Applicants",
          },
        ],
        summary: [
          {
            label: "Total CRM",
            value: `${stats.leadsCount + stats.applicantsCount} Records`,
          },
          { label: "Inbound API", value: "/api/v1/inbound" },
          { label: "Pipeline", value: "Live" },
        ],
      },
    ],
    [stats]
  );

  const filteredItems = useMemo(() => {
    return overviewItems.filter((item) => {
      if (activeTab === "published" && item.status !== "Published") return false;
      if (activeTab === "active" && item.status !== "Active") return false;
      if (categoryFilter !== "all" && item.category !== categoryFilter) {
        return false;
      }
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (
        searchQuery.trim() &&
        !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.code.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [overviewItems, activeTab, categoryFilter, statusFilter, searchQuery]);

  const selectedItem =
    filteredItems.find((i) => i.id === selectedId) ??
    filteredItems[0] ??
    overviewItems[0];

  const activeFiltersCount =
    (categoryFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <div className="space-y-4">
      <PageHeaderBar
        title="Overview"
        backHref="/"
        primaryActionLabel="New Blog Post"
        primaryActionHref="/content/blog"
      />

      <BentoKpiSection
        leftStats={[
          {
            label: "Published Content",
            value: String(stats.publishedContentCount),
            unit: "items",
          },
          {
            label: "Inbound Leads",
            value: String(stats.leadsCount),
            unit: "leads",
          },
          {
            label: "Activity Events",
            value: String(stats.totalActivities),
            unit: "audited",
          },
        ]}
        timelineSegments={[
          {
            label: "Content",
            endLabel: `${stats.blogCount + stats.projectCount} items`,
            progressPercent: 85,
            avatars: ["SR", "AN"],
          },
          {
            label: "Commercial",
            endLabel: `${stats.pricingCount} tiers`,
            progressPercent: 72,
            avatars: ["PR"],
          },
          {
            label: "Monitoring",
            endLabel: `${stats.unresolvedErrors} Open Errors`,
            progressPercent: stats.unresolvedErrors > 0 ? 50 : 18,
            avatars: ["SYS"],
          },
        ]}
        rightTitle="Storage Engine"
        rightValue={stats.dbLabel}
        rightBadge="Compro Bridge"
        rightActionLabel="Quick Sync"
        onRightAction={() => router.push("/sync")}
        miniCards={[
          {
            id: "db",
            code: "Drizzle ORM",
            title: "SQLite File",
            subtitle: "data/cms.db",
            highlighted: activeMiniCard === "db",
          },
          {
            id: "compro",
            code: "Next.js 16",
            title: "Compro Web",
            subtitle: "ISR Webhook",
            highlighted: activeMiniCard === "compro",
          },
          {
            id: "monitor",
            code: "Telemetry",
            title: "Error Guard",
            subtitle: `${stats.unresolvedErrors} Unresolved`,
            highlighted: activeMiniCard === "monitor",
          },
        ]}
        onMiniCardClick={(id) => {
          setActiveMiniCard(id);
          if (id === "monitor") router.push("/monitoring/errors");
          if (id === "compro") router.push("/sync");
        }}
      />

      <FilterPillBar
        activeCount={activeFiltersCount}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search module or code..."
        selects={[
          {
            id: "category",
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { label: "All categories", value: "all" },
              { label: "Content", value: "Content" },
              { label: "Commercial", value: "Commercial" },
              { label: "CRM", value: "CRM" },
            ],
          },
          {
            id: "status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "All statuses", value: "all" },
              { label: "Published", value: "Published" },
              { label: "Active", value: "Active" },
            ],
          },
        ]}
      />

      <SplitWorkspace
        tabs={[
          { id: "all", label: "All Modules", count: overviewItems.length },
          {
            id: "published",
            label: "Published",
            count: overviewItems.filter((i) => i.status === "Published").length,
          },
          {
            id: "active",
            label: "Active CRM",
            count: overviewItems.filter((i) => i.status === "Active").length,
          },
        ]}
        activeTabId={activeTab}
        onTabChange={setActiveTab}
        leftTitle="CMS Modules"
        leftContent={
          filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <MasterListItem
                key={item.id}
                selected={selectedItem.id === item.id}
                onClick={() => setSelectedId(item.id)}
                avatarText={item.ownerInitials}
                title={`${item.code} · ${item.title}`}
                subtitle={item.subtitle}
                statusLabel={item.status}
                rightMetric={item.metric}
              />
            ))
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              No modules match the selected filters.
            </div>
          )
        }
        rightContent={
          <DetailInsetPanel
            eyebrow="Module details"
            codeOrTitle={selectedItem.code}
            statusBadge={selectedItem.status}
            middleLabel="Section"
            middleValue={selectedItem.title}
            ownerLabel="Maintainer"
            ownerName={selectedItem.ownerName}
            ownerRole={selectedItem.ownerRole}
            ownerAvatarText={selectedItem.ownerInitials}
            subCards={selectedItem.subCards.map((c) => ({
              ...c,
              onClick: () => router.push(selectedItem.href),
            }))}
            onAddSubCard={() => router.push(selectedItem.href)}
            summaryItems={selectedItem.summary}
            primaryActionLabel="Manage Module"
            onPrimaryAction={() => router.push(selectedItem.href)}
            onSecondaryIconA={() => router.push("/monitoring")}
            onSecondaryIconB={() => router.push("/monitoring/errors")}
          />
        }
      />
    </div>
  );
}
