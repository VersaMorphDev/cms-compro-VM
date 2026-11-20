import fs from "node:fs";
import path from "node:path";

import { blogPosts } from "../../compro-versa-morph/src/data/blog-posts";
import { projects } from "../../compro-versa-morph/src/data/projects";
import {
  services,
  servicesDetail,
  solutions,
  approachSteps,
  whyChooseUs,
} from "../../compro-versa-morph/src/data/services";
import { faqItems } from "../../compro-versa-morph/src/data/faq";
import { partners } from "../../compro-versa-morph/src/data/partners";
import { jobOpenings, slugifyJob } from "../../compro-versa-morph/src/data/careers";
import { pricingTiers } from "../../compro-versa-morph/src/data/pricing";
import { teamMembers } from "../../compro-versa-morph/src/data/team";
import { testimonials } from "../../compro-versa-morph/src/data/testimonials";
import {
  COMPANY,
  NAV_LINKS,
  SERVICE_CATEGORIES,
  LEGAL_LINKS,
  WHATSAPP_PHONE,
  WHATSAPP_MESSAGE,
  TRENDING_TAGS,
  ABOUT_VALUES,
  ABOUT_INDUSTRIES,
  ABOUT_STATS,
  CONTACT_EMAIL,
  ADMIN_NOTIFICATION_EMAIL,
} from "../../compro-versa-morph/src/lib/constants";

const COMPRO_APP_DIR = path.resolve(
  __dirname,
  "../../compro-versa-morph/src/app"
);

const LEGAL_SLUGS = [
  "privacy-policy",
  "terms-conditions",
  "cookie-policy",
  "sla",
  "dpa",
  "nda",
  "affiliate-agreement",
  "partnership-guidelines",
  "applicant-privacy",
  "newsletter-policy",
] as const;

const LEGAL_VERSIONS: Record<string, string> = {
  "privacy-policy": "2.1",
  "terms-conditions": "2.0",
  "cookie-policy": "1.2",
  sla: "1.4",
  dpa: "1.3",
  nda: "1.0",
  "affiliate-agreement": "1.1",
  "partnership-guidelines": "1.0",
  "applicant-privacy": "1.0",
  "newsletter-policy": "1.0",
};

function interpolateCompanyExpressions(input: string): string {
  return input
    .replace(/\$\{COMPANY\.name\}/g, COMPANY.name)
    .replace(/\{COMPANY\.name\}/g, COMPANY.name)
    .replace(/\$\{COMPANY\.tagline\}/g, COMPANY.tagline)
    .replace(/\{COMPANY\.tagline\}/g, COMPANY.tagline)
    .replace(/\$\{COMPANY\.description\}/g, COMPANY.description)
    .replace(/\{COMPANY\.description\}/g, COMPANY.description)
    .replace(/\$\{COMPANY\.email\}/g, COMPANY.email)
    .replace(/\{COMPANY\.email\}/g, COMPANY.email)
    .replace(/\$\{COMPANY\.phone\}/g, COMPANY.phone)
    .replace(/\{COMPANY\.phone\}/g, COMPANY.phone)
    .replace(/\$\{COMPANY\.address\}/g, COMPANY.address)
    .replace(/\{COMPANY\.address\}/g, COMPANY.address)
    .replace(/\$\{COMPANY\.registeredAddress\}/g, COMPANY.registeredAddress)
    .replace(/\{COMPANY\.registeredAddress\}/g, COMPANY.registeredAddress)
    .replace(/\$\{COMPANY\.url\}/g, COMPANY.url)
    .replace(/\{COMPANY\.url\}/g, COMPANY.url)
    .replace(/\$\{COMPANY\.foundingYear\}/g, String(COMPANY.foundingYear))
    .replace(/\{COMPANY\.foundingYear\}/g, String(COMPANY.foundingYear))
    .replace(/\$\{COMPANY\.legal\.jurisdiction\}/g, COMPANY.legal.jurisdiction)
    .replace(/\{COMPANY\.legal\.jurisdiction\}/g, COMPANY.legal.jurisdiction)
    .replace(/\$\{COMPANY\.legal\.governingLaw\}/g, COMPANY.legal.governingLaw)
    .replace(/\{COMPANY\.legal\.governingLaw\}/g, COMPANY.legal.governingLaw)
    .replace(/\$\{COMPANY\.legal\.dpoEmail\}/g, COMPANY.legal.dpoEmail)
    .replace(/\{COMPANY\.legal\.dpoEmail\}/g, COMPANY.legal.dpoEmail)
    .replace(/\$\{COMPANY\.legal\.privacyEmail\}/g, COMPANY.legal.privacyEmail)
    .replace(/\{COMPANY\.legal\.privacyEmail\}/g, COMPANY.legal.privacyEmail)
    .replace(/\$\{COMPANY\.legal\.registeredOffice\}/g, COMPANY.legal.registeredOffice)
    .replace(/\{COMPANY\.legal\.registeredOffice\}/g, COMPANY.legal.registeredOffice)
    .replace(/\$\{COMPANY\.legal\.companyNumber\}/g, COMPANY.legal.companyNumber)
    .replace(/\{COMPANY\.legal\.companyNumber\}/g, COMPANY.legal.companyNumber)
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/\{`([^`]*)`\}/g, "$1")
    .replace(/\{" "\}/g, " ")
    .replace(/className=/g, "class=")
    .replace(/<Link\s+/g, "<a ")
    .replace(/<\/Link>/g, "</a>");
}

function extractLegalPage(slug: string) {
  const filePath = path.join(COMPRO_APP_DIR, slug, "page.tsx");
  const raw = fs.readFileSync(filePath, "utf8");

  // Extract `sections` array literal
  const sectionsMatch = raw.match(/const sections\s*=\s*(\[[\s\S]*?\]);/);
  let tocSections: { id: string; label: string }[] = [];
  if (sectionsMatch) {
    // Evaluate safe static array literal
    const fn = new Function(`return (${sectionsMatch[1]});`);
    tocSections = fn() as { id: string; label: string }[];
  }

  // Extract LegalLayout props & inner body
  const titleMatch = raw.match(/<LegalLayout[\s\S]*?title=\{`([\s\S]*?)`\}/) ||
    raw.match(/<LegalLayout[\s\S]*?title="([^"]*)"/);
  const subtitleMatch = raw.match(/subtitle=\{`([\s\S]*?)`\}/) ||
    raw.match(/subtitle="([^"]*)"/);
  const lastUpdatedMatch = raw.match(/lastUpdated="([^"]*)"/);

  const rawTitleHtml = titleMatch ? interpolateCompanyExpressions(titleMatch[1]) : slug;
  const plainTitle = rawTitleHtml.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim();
  const subtitle = subtitleMatch ? interpolateCompanyExpressions(subtitleMatch[1]) : "";
  const lastUpdated = lastUpdatedMatch ? lastUpdatedMatch[1] : "June 2026";

  const sectionsAttrIdx = raw.indexOf("sections={sections}");
  const bodyStart =
    sectionsAttrIdx !== -1 ? raw.indexOf(">", sectionsAttrIdx) : -1;
  const bodyEnd = raw.lastIndexOf("</LegalLayout>");
  const rawBody =
    bodyStart !== -1 && bodyEnd !== -1
      ? raw.slice(bodyStart + 1, bodyEnd).trim()
      : "";

  const content = interpolateCompanyExpressions(rawBody);

  return {
    slug,
    title: plainTitle,
    titleHtml: rawTitleHtml,
    subtitle,
    lastUpdated,
    tocSections,
    content,
    version: LEGAL_VERSIONS[slug] || "1.0",
  };
}

function main() {
  // Merge servicesDetail & services so every item is represented completely
  const normalizedServices = servicesDetail.map((sd, idx) => {
    const basic = services.find((s) => s.title === sd.title);
    return {
      slug: sd.slug,
      title: sd.title,
      tagline: sd.tagline,
      description: basic?.description || sd.description,
      detailDescription: sd.description,
      icon: sd.icon,
      items: sd.items,
      benefits: sd.benefits,
      process: sd.process,
      technologies: sd.technologies,
      useCases: sd.useCases,
      gradient: sd.gradient,
      status: "PUBLISHED" as const,
      sortOrder: idx + 1,
    };
  });

  const normalizedBlogPosts = Object.entries(blogPosts).map(([slug, post]) => ({
    slug,
    title: post.title,
    description: post.description,
    category: post.category,
    author: post.author,
    role: post.role,
    publishedDate: post.date,
    readTime: post.readTime,
    image: post.image ?? null,
    content: post.content,
    status: "PUBLISHED" as const,
  }));

  const normalizedProjects = Object.entries(projects).map(([slug, p], idx) => ({
    slug,
    title: p.title,
    client: p.client,
    industry: p.industry,
    year: p.year,
    category: p.category,
    description: p.description,
    problem: p.problem,
    solution: p.solution,
    result: p.result,
    tech: p.tech,
    gradient: p.gradient,
    image: p.image ?? null,
    timeline: p.timeline ?? [],
    status: "PUBLISHED" as const,
    sortOrder: idx + 1,
  }));

  const normalizedSolutions = solutions.map((sol, idx) => ({
    title: sol.title,
    description: sol.description,
    icon: sol.icon,
    gradient: sol.gradient,
    items: sol.items,
    status: "PUBLISHED" as const,
    sortOrder: idx + 1,
  }));

  const normalizedApproachSteps = approachSteps.map((step, idx) => ({
    num: step.num,
    title: step.title,
    description: step.desc,
    sortOrder: idx + 1,
  }));

  const normalizedWhyChooseUs = whyChooseUs.map((w, idx) => ({
    title: w.title,
    description: w.description,
    sortOrder: idx + 1,
  }));

  const normalizedFaq = faqItems.map((f, idx) => ({
    question: f.question,
    answer: f.answer,
    category: f.category,
    status: "PUBLISHED" as const,
    sortOrder: idx + 1,
  }));

  const normalizedPartners = partners.map((p, idx) => ({
    name: p.name,
    description: p.description,
    details: p.details,
    category: p.category,
    url: p.url ?? null,
    logo: p.logo,
    color: p.color,
    status: "PUBLISHED" as const,
    sortOrder: idx + 1,
  }));

  const normalizedJobs = jobOpenings.map((j) => ({
    slug: slugifyJob(j.title),
    title: j.title,
    department: j.department,
    location: j.location,
    type: j.type,
    workEcosystem: j.workEcosystem,
    category: j.category,
    description: j.description,
    requirements: j.requirements,
    status: "OPEN" as const,
  }));

  const normalizedPricingTiers = pricingTiers.map((t, idx) => ({
    name: t.name,
    description: t.description,
    price: t.price,
    priceLabel: t.priceLabel,
    features: t.features,
    highlighted: Boolean(t.highlighted),
    cta: t.cta,
    ctaHref: "/contact",
    status: "PUBLISHED" as const,
    sortOrder: idx + 1,
  }));

  const normalizedTeamMembers = teamMembers.map((m, idx) => ({
    name: m.name,
    role: m.role,
    bio: m.bio,
    image: m.image,
    linkedinUrl: m.social.linkedin ?? null,
    twitterUrl: m.social.twitter ?? null,
    status: "PUBLISHED" as const,
    sortOrder: idx + 1,
  }));

  const normalizedTestimonials = testimonials.map((t, idx) => ({
    quote: t.quote,
    author: t.author,
    role: t.role,
    company: t.company,
    project: t.project,
    status: "PUBLISHED" as const,
    sortOrder: idx + 1,
  }));

  const normalizedLegalPages = LEGAL_SLUGS.map((slug) => extractLegalPage(slug));

  const calculatorConfigs = [
    // Simple Mode Services (6)
    { configType: "SERVICE", key: "custom-software", name: "Custom Software", description: null, cost: 35000000, weeks: 4, multiplier: null, interestValue: "Software Development", sortOrder: 1 },
    { configType: "SERVICE", key: "web-app", name: "Web Application", description: null, cost: 25000000, weeks: 3, multiplier: null, interestValue: "Web & Mobile Apps", sortOrder: 2 },
    { configType: "SERVICE", key: "mobile-app", name: "Mobile Application", description: null, cost: 45000000, weeks: 6, multiplier: null, interestValue: "Web & Mobile Apps", sortOrder: 3 },
    { configType: "SERVICE", key: "ai-ml", name: "AI & Machine Learning", description: null, cost: 60000000, weeks: 6, multiplier: null, interestValue: "AI & Cloud Solutions", sortOrder: 4 },
    { configType: "SERVICE", key: "iot-hardware", name: "IoT & Hardware System", description: null, cost: 75000000, weeks: 8, multiplier: null, interestValue: "AI & Cloud Solutions", sortOrder: 5 },
    { configType: "SERVICE", key: "ui-ux", name: "UI/UX Design", description: null, cost: 15000000, weeks: 2, multiplier: null, interestValue: "UI/UX Design", sortOrder: 6 },
    // Simple Mode Scales (3)
    { configType: "SCALE", key: "mvp", name: "MVP / Startup Scale", description: "Minimal Viable Product focused on speed-to-market.", cost: null, weeks: null, multiplier: "1.0", interestValue: null, sortOrder: 1 },
    { configType: "SCALE", key: "growing", name: "Growing Business", description: "Highly polished application with scalability and optimizations.", cost: null, weeks: null, multiplier: "1.35", interestValue: null, sortOrder: 2 },
    { configType: "SCALE", key: "enterprise", name: "Enterprise Scale", description: "Mission-critical architectures with high load capacity and SLA.", cost: null, weeks: null, multiplier: "1.8", interestValue: null, sortOrder: 3 },
    // Simple Mode Add-ons (7)
    { configType: "ADDON", key: "auth", name: "User Auth & Roles", description: null, cost: 5000000, weeks: 1, multiplier: null, interestValue: null, sortOrder: 1 },
    { configType: "ADDON", key: "payment", name: "Payment Gateway", description: null, cost: 8000000, weeks: 1, multiplier: null, interestValue: null, sortOrder: 2 },
    { configType: "ADDON", key: "realtime", name: "Real-time Sync / Chat", description: null, cost: 12000000, weeks: 2, multiplier: null, interestValue: null, sortOrder: 3 },
    { configType: "ADDON", key: "db-arch", name: "Custom DB Architecture", description: null, cost: 10000000, weeks: 1, multiplier: null, interestValue: null, sortOrder: 4 },
    { configType: "ADDON", key: "ai-agent", name: "AI Bot & Agent", description: null, cost: 20000000, weeks: 2, multiplier: null, interestValue: null, sortOrder: 5 },
    { configType: "ADDON", key: "multilang", name: "Multilingual Support", description: null, cost: 6000000, weeks: 1, multiplier: null, interestValue: null, sortOrder: 6 },
    { configType: "ADDON", key: "devops", name: "DevOps & Cloud Setup", description: null, cost: 15000000, weeks: 2, multiplier: null, interestValue: null, sortOrder: 7 },
    // Complex Mode Platforms (4)
    { configType: "PLATFORM", key: "web", name: "Web Application", description: null, cost: 25000000, weeks: 2, multiplier: null, interestValue: null, sortOrder: 1 },
    { configType: "PLATFORM", key: "mobile", name: "Mobile App (iOS/Android)", description: null, cost: 45000000, weeks: 2, multiplier: null, interestValue: null, sortOrder: 2 },
    { configType: "PLATFORM", key: "desktop", name: "Desktop Software", description: null, cost: 40000000, weeks: 2, multiplier: null, interestValue: null, sortOrder: 3 },
    { configType: "PLATFORM", key: "admin", name: "Admin Portal & CMS", description: null, cost: 20000000, weeks: 2, multiplier: null, interestValue: null, sortOrder: 4 },
    // Complex Mode UX Multipliers (3)
    { configType: "UX_MULTIPLIER", key: "ux-wireframe", name: "Wireframe / Structural", description: "No custom branding. Simple black/white layout.", cost: null, weeks: null, multiplier: "0.6", interestValue: null, sortOrder: 1 },
    { configType: "UX_MULTIPLIER", key: "ux-standard", name: "Standard Polish", description: "Clean responsive design tailored to your branding.", cost: null, weeks: null, multiplier: "1.0", interestValue: null, sortOrder: 2 },
    { configType: "UX_MULTIPLIER", key: "ux-premium", name: "Premium Motion Design", description: "Custom animations, glassmorphism, high wow-factor.", cost: null, weeks: null, multiplier: "1.4", interestValue: null, sortOrder: 3 },
    // Complex Mode Features (6)
    { configType: "COMPLEX_FEATURE", key: "ai", name: "Gemini AI Assistant Integration", description: null, cost: 20000000, weeks: 2, multiplier: null, interestValue: null, sortOrder: 1 },
    { configType: "COMPLEX_FEATURE", key: "realtime-ws", name: "WebSockets Real-time / Sync Chat", description: null, cost: 15000000, weeks: 2, multiplier: null, interestValue: null, sortOrder: 2 },
    { configType: "COMPLEX_FEATURE", key: "i18n", name: "Multilingual Support (i18n)", description: null, cost: 7000000, weeks: 1, multiplier: null, interestValue: null, sortOrder: 3 },
    { configType: "COMPLEX_FEATURE", key: "payment-gw", name: "Secure Payment Gateways", description: null, cost: 8000000, weeks: 1, multiplier: null, interestValue: null, sortOrder: 4 },
    { configType: "COMPLEX_FEATURE", key: "iot", name: "IoT Devices Edge Integrations", description: null, cost: 30000000, weeks: 2, multiplier: null, interestValue: null, sortOrder: 5 },
    { configType: "COMPLEX_FEATURE", key: "api", name: "Third-party APIs (SAP/CRM Sync)", description: null, cost: 25000000, weeks: 2, multiplier: null, interestValue: null, sortOrder: 6 },
    // Complex Mode Infra Tiers (3)
    { configType: "INFRA_TIER", key: "vps", name: "Single Instance VPS hosting", description: "Standard deployment suitable for low traffic and startups.", cost: 0, weeks: 0, multiplier: null, interestValue: null, sortOrder: 1 },
    { configType: "INFRA_TIER", key: "cluster", name: "Dockerized Auto-scaling Clusters (AWS / Azure)", description: "Highly available and fault-tolerant architecture for massive scale traffic peaks.", cost: 20000000, weeks: 1, multiplier: null, interestValue: null, sortOrder: 2 },
    { configType: "INFRA_TIER", key: "zerotrust", name: "Zero-trust Multi-region Node System", description: "Ultra-secure end-to-end encryption with global caching for latency requirements.", cost: 35000000, weeks: 2, multiplier: null, interestValue: null, sortOrder: 3 },
    // Complex Mode Scope Unit Rates (2)
    { configType: "SCOPE_RATE", key: "rate-per-screen", name: "Cost per Screen / Page", description: "Multiplied by selected screen count slider (2-50).", cost: 2000000, weeks: 0, multiplier: null, interestValue: null, sortOrder: 1 },
    { configType: "SCOPE_RATE", key: "rate-per-role", name: "Cost per User Access Role", description: "Multiplied by selected access role tier slider (1-8).", cost: 4000000, weeks: 0, multiplier: null, interestValue: null, sortOrder: 2 },
  ];

  const siteSettings = [
    {
      key: "company_profile",
      value: {
        name: COMPANY.name,
        tagline: COMPANY.tagline,
        description: COMPANY.description,
        email: CONTACT_EMAIL,
        adminNotificationEmail: ADMIN_NOTIFICATION_EMAIL,
        phone: COMPANY.phone,
        whatsappPhone: WHATSAPP_PHONE,
        whatsappMessage: WHATSAPP_MESSAGE,
        address: COMPANY.address,
        registeredAddress: COMPANY.registeredAddress,
        url: COMPANY.url,
        dpoEmail: COMPANY.legal.dpoEmail,
        privacyEmail: COMPANY.legal.privacyEmail,
        companyNumber: COMPANY.legal.companyNumber,
        jurisdiction: COMPANY.legal.jurisdiction,
        governingLaw: COMPANY.legal.governingLaw,
        foundingYear: COMPANY.foundingYear,
        linkedin: COMPANY.social.linkedin,
        twitter: COMPANY.social.twitter,
        instagram: COMPANY.social.instagram,
      },
    },
    { key: "about_stats", value: { items: ABOUT_STATS } },
    { key: "about_values", value: { items: ABOUT_VALUES } },
    { key: "about_industries", value: { items: ABOUT_INDUSTRIES } },
    { key: "trending_tags", value: { items: TRENDING_TAGS } },
    { key: "nav_links", value: { items: NAV_LINKS } },
    {
      key: "footer_company_links",
      value: {
        items: [
          { name: "About Us", href: "/about" },
          { name: "Team", href: "/team" },
          { name: "Portfolio", href: "/portfolio" },
          { name: "Pricing", href: "/pricing" },
          { name: "Project Calculator", href: "/calculator" },
          { name: "Careers", href: "/careers" },
          { name: "Blog", href: "/blog" },
          { name: "FAQ", href: "/faq" },
          { name: "Partners", href: "/partners" },
          { name: "Affiliate", href: "/affiliate" },
        ],
      },
    },
    { key: "legal_links", value: { items: LEGAL_LINKS } },
    { key: "service_categories", value: { items: SERVICE_CATEGORIES } },
  ];

  const snapshot = {
    extractedAt: new Date().toISOString(),
    counts: {
      blogPosts: normalizedBlogPosts.length,
      projects: normalizedProjects.length,
      services: normalizedServices.length,
      solutions: normalizedSolutions.length,
      approachSteps: normalizedApproachSteps.length,
      whyChooseUs: normalizedWhyChooseUs.length,
      faqItems: normalizedFaq.length,
      partners: normalizedPartners.length,
      jobOpenings: normalizedJobs.length,
      pricingTiers: normalizedPricingTiers.length,
      teamMembers: normalizedTeamMembers.length,
      testimonials: normalizedTestimonials.length,
      legalPages: normalizedLegalPages.length,
      calculatorConfigs: calculatorConfigs.length,
      siteSettings: siteSettings.length,
    },
    blogPosts: normalizedBlogPosts,
    projects: normalizedProjects,
    services: normalizedServices,
    solutions: normalizedSolutions,
    approachSteps: normalizedApproachSteps,
    whyChooseUs: normalizedWhyChooseUs,
    faqItems: normalizedFaq,
    partners: normalizedPartners,
    jobOpenings: normalizedJobs,
    pricingTiers: normalizedPricingTiers,
    teamMembers: normalizedTeamMembers,
    testimonials: normalizedTestimonials,
    legalPages: normalizedLegalPages,
    calculatorConfigs,
    siteSettings,
  };

  const outPath = path.resolve(
    __dirname,
    "../src/db/seed-data/compro-snapshot.json"
  );
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(snapshot, null, 2), "utf8");

  console.log("Extracted Compro snapshot counts:", snapshot.counts);
  for (const doc of normalizedLegalPages) {
    if (doc.content.includes("COMPANY.") || doc.content.includes("<Link")) {
      console.warn(`WARNING: Residual JSX expression in legal page ${doc.slug}`);
    }
  }
}

main();
