import { and, eq, sql } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import { db } from "./index";
import { hashPassword } from "../lib/password";
import {
  adminUsers,
  blogPosts,
  projects,
  services,
  solutions,
  approachSteps,
  whyChooseUs,
  faqItems,
  pageSections,
  pricingTiers,
  calculatorConfigs,
  partners,
  teamMembers,
  testimonials,
  jobOpenings,
  siteSettings,
  legalPages,
  leads,
  affiliates,
  affiliateReferrals,
  jobApplicants,
  activityLogs,
  systemErrorLogs,
} from "./schema";
import snapshot from "./seed-data/compro-snapshot.json";
import {
  buildDefaultSnapshot,
  DEFAULT_PAGE_SECTIONS,
} from "./seed-data/page-sections-default";

const isForceReseed =
  process.argv.includes("--force") || process.env.RESEED === "true";

async function isTableEmpty(table: SQLiteTable): Promise<boolean> {
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(table);
  return Number(rows[0]?.count ?? 0) === 0;
}

async function seed() {
  console.log(
    isForceReseed
      ? "FORCE RESEED: Replacing content/config tables in SQLite (data/cms.db) with 100% real Compro data..."
      : "Seeding SQLite database (data/cms.db) idempotently with 100% real Compro data..."
  );

  if (isForceReseed) {
    // Wipe content, commercial, company, page sections, and site settings to cleanly replace sample data
    await db.delete(pageSections);
    await db.delete(blogPosts);
    await db.delete(projects);
    await db.delete(services);
    await db.delete(solutions);
    await db.delete(approachSteps);
    await db.delete(whyChooseUs);
    await db.delete(faqItems);
    await db.delete(pricingTiers);
    await db.delete(calculatorConfigs);
    await db.delete(partners);
    await db.delete(teamMembers);
    await db.delete(testimonials);
    await db.delete(jobOpenings);
    await db.delete(siteSettings);
    await db.delete(legalPages);
  }

  // 1. Default Super Admin & Editor Users (idempotent; upgrades legacy placeholder hash only)
  await db
    .insert(adminUsers)
    .values({
      name: "Sahri Ramadan",
      email: "admin@versamorph.id",
      passwordHash: hashPassword("VersaMorph#2026"),
      role: "SUPER_ADMIN",
      avatarInitials: "SR",
      isActive: true,
    })
    .onConflictDoNothing({ target: adminUsers.email });

  await db
    .update(adminUsers)
    .set({
      passwordHash: hashPassword("VersaMorph#2026"),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(adminUsers.email, "admin@versamorph.id"),
        eq(adminUsers.passwordHash, "CHANGE_ME_ON_FIRST_LOGIN")
      )
    );

  await db
    .insert(adminUsers)
    .values({
      name: "Andika Noor Ismawan",
      email: "editor@versamorph.id",
      passwordHash: hashPassword("Editor#2026"),
      role: "CONTENT_EDITOR",
      avatarInitials: "AN",
      isActive: true,
    })
    .onConflictDoNothing({ target: adminUsers.email });

  // 2. Approach Steps (6 DSDDO steps)
  if (await isTableEmpty(approachSteps)) {
    await db.insert(approachSteps).values(snapshot.approachSteps);
  }

  // 3. Why Choose Us (6 items)
  if (await isTableEmpty(whyChooseUs)) {
    await db.insert(whyChooseUs).values(snapshot.whyChooseUs);
  }

  // 4. Services (6 detailed services)
  await db
    .insert(services)
    .values(
      snapshot.services.map((s) => ({
        slug: s.slug,
        title: s.title,
        tagline: s.tagline,
        description: s.detailDescription || s.description,
        icon: s.icon,
        items: s.items,
        benefits: s.benefits,
        process: s.process,
        technologies: s.technologies,
        useCases: s.useCases,
        gradient: s.gradient,
        status: s.status,
        sortOrder: s.sortOrder,
      }))
    )
    .onConflictDoNothing({ target: services.slug });

  // 5. Solutions (6 solutions)
  if (await isTableEmpty(solutions)) {
    await db.insert(solutions).values(snapshot.solutions);
  }

  // 6. Projects / Portfolio (8 case studies)
  await db
    .insert(projects)
    .values(snapshot.projects)
    .onConflictDoNothing({ target: projects.slug });

  // 7. Blog Posts (all 16 published articles)
  await db
    .insert(blogPosts)
    .values(snapshot.blogPosts)
    .onConflictDoNothing({ target: blogPosts.slug });

  // 8. FAQ Items (all 34 Q&As across 5 categories)
  if (await isTableEmpty(faqItems)) {
    await db.insert(faqItems).values(snapshot.faqItems);
  }

  // 9. Pricing Tiers (3 tiers)
  if (await isTableEmpty(pricingTiers)) {
    await db.insert(pricingTiers).values(snapshot.pricingTiers);
  }

  // 10. Calculator Configs (34 items: Simple + Complex modes)
  await db
    .insert(calculatorConfigs)
    .values(snapshot.calculatorConfigs)
    .onConflictDoNothing({ target: calculatorConfigs.key });

  // 11. Partners (all 23 partners across 6 categories)
  if (await isTableEmpty(partners)) {
    await db.insert(partners).values(snapshot.partners);
  }

  // 12. Team Members (2 founders)
  if (await isTableEmpty(teamMembers)) {
    await db.insert(teamMembers).values(snapshot.teamMembers);
  }

  // 13. Testimonials (all 6 client testimonials)
  if (await isTableEmpty(testimonials)) {
    await db.insert(testimonials).values(snapshot.testimonials);
  }

  // 14. Job Openings (all 10 jobs)
  await db
    .insert(jobOpenings)
    .values(snapshot.jobOpenings)
    .onConflictDoNothing({ target: jobOpenings.slug });

  // 15. Site Settings (all 9 config keys from constants.ts & Footer)
  await db
    .insert(siteSettings)
    .values(
      snapshot.siteSettings.map((s) => ({
        key: s.key,
        value: s.value as Record<string, unknown>,
      }))
    )
    .onConflictDoNothing({ target: siteSettings.key });

  // 16. Legal Pages (all 10 full legal documents including newsletter-policy)
  await db
    .insert(legalPages)
    .values(
      snapshot.legalPages.map((doc) => ({
        slug: doc.slug,
        title: doc.title,
        subtitle: doc.subtitle,
        lastUpdated: doc.lastUpdated,
        tocSections: doc.tocSections,
        content: doc.content,
        version: doc.version,
      }))
    )
    .onConflictDoNothing({ target: legalPages.slug });

  // 17. Editable Page Sections (45 default per-section blocks across 15 routes)
  for (const sec of DEFAULT_PAGE_SECTIONS) {
    const existing = await db
      .select({ id: pageSections.id })
      .from(pageSections)
      .where(
        and(
          eq(pageSections.pageSlug, sec.pageSlug),
          eq(pageSections.sectionKey, sec.sectionKey)
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(pageSections).values({
        pageSlug: sec.pageSlug,
        sectionKey: sec.sectionKey,
        sectionLabel: sec.sectionLabel,
        badge: sec.badge ?? null,
        badgeSubtext: sec.badgeSubtext ?? null,
        headline: sec.headline ?? null,
        highlight: sec.highlight ?? null,
        subtitle: sec.subtitle ?? null,
        body: sec.body ?? null,
        ctaPrimaryLabel: sec.ctaPrimaryLabel ?? null,
        ctaPrimaryHref: sec.ctaPrimaryHref ?? null,
        ctaSecondaryLabel: sec.ctaSecondaryLabel ?? null,
        ctaSecondaryHref: sec.ctaSecondaryHref ?? null,
        extraData: sec.extraData ?? {},
        defaultSnapshot: buildDefaultSnapshot(sec),
        isVisible: sec.isVisible ?? true,
        sortOrder: sec.sortOrder,
      });
    }
  }

  // 18. CRM Sample Leads, Affiliates, Referrals & Applicants (only if empty)
  if (await isTableEmpty(leads)) {
    await db.insert(leads).values([
      {
        name: "Budi Santoso",
        email: "budi.santoso@nusantaralogistics.co.id",
        phone: "+62 811-900-4421",
        company: "PT Nusantara Logistics",
        website: "https://nusantaralogistics.co.id",
        service: "Software Development",
        source: "service-page",
        message: "We need an end-to-end fleet telemetry & route optimization platform covering 350 trucks across Java.",
        subscribeNewsletter: true,
        metadata: { estimatedBudget: "IDR 250M - 400M", urgency: "Q4 2026" },
        status: "NEW",
        salesNotes: "Follow up via Zoom with CTO.",
      },
      {
        name: "Clarissa Wijaya",
        email: "clarissa@medikahealth.id",
        phone: "+62 818-234-8891",
        company: "Medika Health Group",
        service: "AI & Cloud Solutions",
        source: "chat",
        message: "Captured via AI Assistant: Interested in predictive patient triage and HL7/FHIR integration.",
        subscribeNewsletter: false,
        metadata: { chatChannel: "Web AI Assistant", country: "Indonesia" },
        status: "QUALIFIED",
        salesNotes: "Discovery sprint proposal shared.",
      },
      {
        name: "Marcus Chen",
        email: "m.chen@pacificcloud.sg",
        phone: "+65 9123 8840",
        company: "Pacific Cloud Pte Ltd",
        service: "General Inquiry",
        source: "partners-apply",
        partnerType: "Technology & Cloud Co-Delivery",
        message: "Looking to co-deliver Kubernetes and FinOps transformations for SEA enterprise accounts.",
        subscribeNewsletter: true,
        metadata: { attachment: "PacificCloud_Partner_Deck.pdf" },
        status: "CONTACTED",
        salesNotes: "Intro call scheduled.",
      },
    ]);
  }

  await db
    .insert(affiliates)
    .values([
      { affiliateCode: "VM-AFF-8K4P2M", name: "Dimas Pratama", email: "dimas@pratamaconsulting.id", phone: "+62 812-3344-5566", company: "Pratama IT Advisory", status: "ACTIVE" },
      { affiliateCode: "VM-AFF-3R9X1Q", name: "Siti Rahmawati", email: "siti@growthbridge.co", phone: "+62 815-9988-7766", company: "GrowthBridge SEA", status: "ACTIVE" },
    ])
    .onConflictDoNothing({ target: affiliates.affiliateCode });

  if (await isTableEmpty(affiliateReferrals)) {
    await db.insert(affiliateReferrals).values([
      {
        affiliateCode: "VM-AFF-8K4P2M",
        affiliateName: "Dimas Pratama",
        clientCompany: "Bank Daerah Sejahtera",
        clientPicName: "Agus Hermawan",
        clientPicTitle: "VP of Digital Banking",
        clientEmail: "agus.h@banksejahtera.co.id",
        companyIndustry: "Financial Services",
        companyScale: "Enterprise (1,000+ staff)",
        platforms: "Web Portal + iOS/Android",
        budget: "IDR 500M - 1B",
        timeline: "6 Months",
        techStack: "Next.js, PostgreSQL, Kubernetes",
        preferredChannel: "Zoom / Google Meet",
        bestTime: "10:00 - 12:00 WIB",
        message: "Client needs core middleware API modernization and digital onboarding flow.",
        status: "PITCHING",
      },
    ]);
  }

  if (await isTableEmpty(jobApplicants)) {
    await db.insert(jobApplicants).values([
      {
        position: "Senior Full-Stack Engineer",
        name: "Rizky Maulana",
        email: "rizky.maulana@devmail.com",
        phone: "+62 812-7700-1122",
        linkedin: "https://linkedin.com/in/rizkymaulana",
        portfolioUrl: "https://rizky.dev",
        expectedSalary: "IDR 28M / mo",
        startDate: "Dec 01, 2026",
        workAuth: "Yes (Indonesian Citizen)",
        resumeFileName: "Rizky_Maulana_CV_2026.pdf",
        resumeUrl: "https://versamorph.id/uploads/cv/rizky-maulana.pdf",
        message: "6 years building enterprise fintech & logistics platforms with Next.js, TypeScript, and Go.",
        status: "INTERVIEW",
        notes: "Strong system design score in take-home review.",
      },
      {
        position: "UX/UI Designer",
        name: "Nadia Amanda",
        email: "nadia.amanda@design.id",
        phone: "+62 817-4422-9900",
        linkedin: "https://linkedin.com/in/nadiaamanda",
        portfolioUrl: "https://dribbble.com/nadiaamanda",
        expectedSalary: "IDR 16M / mo",
        startDate: "Immediate",
        workAuth: "Yes",
        resumeFileName: "Nadia_Amanda_Portfolio.pdf",
        resumeUrl: "https://versamorph.id/uploads/cv/nadia-amanda.pdf",
        message: "Specialized in B2B SaaS design systems and enterprise mobile UX.",
        status: "APPLIED",
      },
    ]);
  }

  // 19. Monitoring Seed & Audit Entry
  if (isForceReseed || (await isTableEmpty(activityLogs))) {
    await db.insert(activityLogs).values({
      actorName: "System Seeder",
      actorRole: "SYSTEM",
      action: isForceReseed ? "UPDATE" : "CREATE",
      module: "SYSTEM",
      targetId: "compro-full-sync",
      targetTitle: isForceReseed
        ? "Reseeded 100% Real Compro Static Data + Page Sections"
        : "Initial Full Compro SQLite Seed (data/cms.db)",
      changes: {
        after: {
          ...snapshot.counts,
          pageSections: DEFAULT_PAGE_SECTIONS.length,
          dialect: "sqlite",
        },
      },
      ipAddress: "127.0.0.1",
    });
  }

  await db
    .insert(systemErrorLogs)
    .values({
      referenceCode: "ERR-2026-INIT1",
      source: "COMPRO_FRONTEND",
      severity: "WARN",
      friendlyMessage: "Contoh pencatatan error teknis (sudah selesai ditangani).",
      technicalMessage: "Sample warning log initialized during SQLite database seeding.",
      stackTrace: "at seed (src/db/seed.ts)",
      requestUrl: "/seed",
      payloadSnapshot: { sample: true, token: "[REDACTED]" },
      actorName: "System Seeder",
      isResolved: true,
      resolvedBy: "System Seeder",
      resolvedAt: new Date(),
    })
    .onConflictDoNothing({ target: systemErrorLogs.referenceCode });

  console.log(
    `SQLite seeding completed! Counts: ${JSON.stringify({
      ...snapshot.counts,
      pageSections: DEFAULT_PAGE_SECTIONS.length,
    })}`
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
