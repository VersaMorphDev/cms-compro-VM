import type {
  CalculatorConfigDTO,
  PricingTierDTO,
} from "@/features/pricing-calculator/schema";
import type { PartnerDTO } from "@/features/partners/schema";

interface CommercialFallbackStore {
  pricingTiers: PricingTierDTO[];
  calculatorConfigs: CalculatorConfigDTO[];
  partners: PartnerDTO[];
  nextId: number;
}

const globalForCommercial = globalThis as unknown as {
  __vmCommercialStore?: CommercialFallbackStore;
};

function createInitialStore(): CommercialFallbackStore {
  const now = new Date().toISOString();

  return {
    nextId: 200,
    pricingTiers: [
      {
        id: 1,
        name: "Discovery",
        description:
          "Perfect for startups and small projects looking to validate their idea.",
        price: "IDR 2.5M",
        priceLabel: "Starting at",
        features: [
          "Requirements analysis & documentation",
          "Technology stack recommendation",
          "MVP roadmap & timeline",
          "UI/UX wireframes (up to 10 screens)",
          "2 weeks delivery",
          "1 revision cycle",
        ],
        highlighted: false,
        cta: "Get Started",
        ctaHref: "/contact",
        status: "PUBLISHED",
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        name: "Growth",
        description:
          "Ideal for scaling businesses needing a full-featured product.",
        price: "IDR 5M",
        priceLabel: "Starting at",
        features: [
          "Full product design & development",
          "Responsive web + mobile (iOS/Android)",
          "API integration (up to 3 third-party)",
          "Admin dashboard & analytics",
          "8-12 weeks delivery",
          "QA testing & deployment",
          "1 month post-launch support",
        ],
        highlighted: true,
        cta: "Most Popular",
        ctaHref: "/contact",
        status: "PUBLISHED",
        sortOrder: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        name: "Enterprise",
        description:
          "For large organizations requiring custom solutions and dedicated support.",
        price: "Custom",
        priceLabel: "Let's talk",
        features: [
          "Custom architecture & engineering",
          "AI/ML integration & IoT systems",
          "Unlimited API integrations",
          "Dedicated project manager",
          "Agile sprints with bi-weekly demos",
          "24/7 infrastructure monitoring",
          "SLA with guaranteed uptime",
        ],
        highlighted: false,
        cta: "Contact Sales",
        ctaHref: "/contact",
        status: "PUBLISHED",
        sortOrder: 3,
        createdAt: now,
        updatedAt: now,
      },
    ],
    calculatorConfigs: [
      { id: 1, configType: "SERVICE", key: "custom-software", name: "Custom Software", description: null, cost: 35000000, weeks: 4, multiplier: null, interestValue: "Software Development", isActive: true, sortOrder: 1, updatedAt: now },
      { id: 2, configType: "SERVICE", key: "web-app", name: "Web Application", description: null, cost: 25000000, weeks: 3, multiplier: null, interestValue: "Web & Mobile Apps", isActive: true, sortOrder: 2, updatedAt: now },
      { id: 3, configType: "SERVICE", key: "mobile-app", name: "Mobile Application", description: null, cost: 45000000, weeks: 6, multiplier: null, interestValue: "Web & Mobile Apps", isActive: true, sortOrder: 3, updatedAt: now },
      { id: 4, configType: "SERVICE", key: "ai-ml", name: "AI & Machine Learning", description: null, cost: 60000000, weeks: 6, multiplier: null, interestValue: "AI & Cloud Solutions", isActive: true, sortOrder: 4, updatedAt: now },
      { id: 5, configType: "SERVICE", key: "iot-hardware", name: "IoT & Hardware System", description: null, cost: 75000000, weeks: 8, multiplier: null, interestValue: "AI & Cloud Solutions", isActive: true, sortOrder: 5, updatedAt: now },
      { id: 6, configType: "SERVICE", key: "ui-ux", name: "UI/UX Design", description: null, cost: 15000000, weeks: 2, multiplier: null, interestValue: "UI/UX Design", isActive: true, sortOrder: 6, updatedAt: now },
      { id: 7, configType: "SCALE", key: "mvp", name: "MVP / Startup Scale", description: "Minimal Viable Product focused on speed-to-market.", cost: null, weeks: null, multiplier: "1.0", interestValue: null, isActive: true, sortOrder: 1, updatedAt: now },
      { id: 8, configType: "SCALE", key: "growing", name: "Growing Business", description: "Highly polished application with scalability and optimizations.", cost: null, weeks: null, multiplier: "1.35", interestValue: null, isActive: true, sortOrder: 2, updatedAt: now },
      { id: 9, configType: "SCALE", key: "enterprise", name: "Enterprise Scale", description: "Mission-critical architectures with high load capacity and SLA.", cost: null, weeks: null, multiplier: "1.8", interestValue: null, isActive: true, sortOrder: 3, updatedAt: now },
      { id: 10, configType: "ADDON", key: "auth", name: "User Auth & Roles", description: null, cost: 5000000, weeks: 1, multiplier: null, interestValue: null, isActive: true, sortOrder: 1, updatedAt: now },
      { id: 11, configType: "ADDON", key: "payment", name: "Payment Gateway", description: null, cost: 8000000, weeks: 1, multiplier: null, interestValue: null, isActive: true, sortOrder: 2, updatedAt: now },
      { id: 12, configType: "ADDON", key: "realtime", name: "Real-time Sync / Chat", description: null, cost: 12000000, weeks: 2, multiplier: null, interestValue: null, isActive: true, sortOrder: 3, updatedAt: now },
      { id: 13, configType: "ADDON", key: "db-arch", name: "Custom DB Architecture", description: null, cost: 10000000, weeks: 1, multiplier: null, interestValue: null, isActive: true, sortOrder: 4, updatedAt: now },
      { id: 14, configType: "ADDON", key: "ai-agent", name: "AI Bot & Agent", description: null, cost: 20000000, weeks: 2, multiplier: null, interestValue: null, isActive: true, sortOrder: 5, updatedAt: now },
      { id: 15, configType: "ADDON", key: "multilang", name: "Multilingual Support", description: null, cost: 6000000, weeks: 1, multiplier: null, interestValue: null, isActive: true, sortOrder: 6, updatedAt: now },
      { id: 16, configType: "ADDON", key: "devops", name: "DevOps & Cloud Setup", description: null, cost: 15000000, weeks: 2, multiplier: null, interestValue: null, isActive: true, sortOrder: 7, updatedAt: now },
    ],
    partners: [
      {
        id: 1,
        name: "AWS",
        description: "Advanced Consulting Partner for cloud infrastructure and migration",
        details: "We architect and manage AWS environments including EC2, ECS, Lambda, RDS, S3, and CloudFront.",
        category: "Cloud Infrastructure",
        url: "https://aws.amazon.com",
        logo: "amazonwebservices",
        color: "FF9900",
        status: "PUBLISHED",
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        name: "Google Cloud",
        description: "Implementation Partner for data engineering and AI/ML solutions",
        details: "We leverage GCP for BigQuery, Dataflow, Vertex AI, TensorFlow, GKE, and Cloud Run.",
        category: "Cloud Infrastructure",
        url: "https://cloud.google.com",
        logo: "googlecloud",
        color: "4285F4",
        status: "PUBLISHED",
        sortOrder: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        name: "Microsoft Azure",
        description: "Gold Partner for enterprise cloud solutions and DevOps",
        details: "We design and deploy Azure solutions including Azure DevOps, AKS, Azure Functions, and Cosmos DB.",
        category: "Cloud Infrastructure",
        url: "https://azure.microsoft.com",
        logo: "microsoftazure",
        color: "0078D4",
        status: "PUBLISHED",
        sortOrder: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 4,
        name: "Cloudflare",
        description: "Technology partner for CDN, security, and edge computing",
        details: "DNS management, DDoS protection, WAF, CDN optimization, and Workers serverless computing.",
        category: "Cloud Infrastructure",
        url: "https://cloudflare.com",
        logo: "cloudflare",
        color: "F38020",
        status: "PUBLISHED",
        sortOrder: 4,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 5,
        name: "Docker",
        description: "Container platform partner for application delivery",
        details: "Multi-stage container builds, security scanning, and optimized runtime deployments.",
        category: "DevOps & Automation",
        url: "https://docker.com",
        logo: "docker",
        color: "2496ED",
        status: "PUBLISHED",
        sortOrder: 5,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 6,
        name: "GitHub",
        description: "Platform partner for source control and CI/CD",
        details: "Source control, GitHub Actions CI/CD pipelines, and GitHub Projects agile workflows.",
        category: "DevOps & Automation",
        url: "https://github.com",
        logo: "github",
        color: "181717",
        status: "PUBLISHED",
        sortOrder: 6,
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

function getStore(): CommercialFallbackStore {
  if (!globalForCommercial.__vmCommercialStore) {
    globalForCommercial.__vmCommercialStore = createInitialStore();
  }
  return globalForCommercial.__vmCommercialStore;
}

// --- PRICING TIERS ---
export function getFallbackPricingTiers(): PricingTierDTO[] {
  return [...getStore().pricingTiers].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id - b.id
  );
}

export function upsertFallbackPricingTier(
  data: Omit<PricingTierDTO, "id" | "createdAt" | "updatedAt"> & { id?: number }
): { item: PricingTierDTO; before?: PricingTierDTO } {
  const store = getStore();
  const now = new Date().toISOString();
  if (data.id) {
    const idx = store.pricingTiers.findIndex((t) => t.id === data.id);
    if (idx >= 0) {
      const before = { ...store.pricingTiers[idx] };
      const updated: PricingTierDTO = {
        ...before,
        ...data,
        id: before.id,
        updatedAt: now,
      };
      store.pricingTiers[idx] = updated;
      return { item: updated, before };
    }
  }
  const created: PricingTierDTO = {
    ...data,
    id: store.nextId++,
    createdAt: now,
    updatedAt: now,
  };
  store.pricingTiers.push(created);
  return { item: created };
}

export function deleteFallbackPricingTier(id: number): PricingTierDTO | null {
  const store = getStore();
  const idx = store.pricingTiers.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  const [removed] = store.pricingTiers.splice(idx, 1);
  return removed;
}

// --- CALCULATOR CONFIGS ---
export function getFallbackCalculatorConfigs(): CalculatorConfigDTO[] {
  return [...getStore().calculatorConfigs].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id - b.id
  );
}

export function upsertFallbackCalculatorConfig(
  data: Omit<CalculatorConfigDTO, "id" | "updatedAt"> & { id?: number }
): { item: CalculatorConfigDTO; before?: CalculatorConfigDTO } {
  const store = getStore();
  const now = new Date().toISOString();
  const duplicate = store.calculatorConfigs.find(
    (c) => c.key === data.key && c.id !== data.id
  );
  if (duplicate) {
    throw new Error("DUPLICATE_KEY");
  }

  if (data.id) {
    const idx = store.calculatorConfigs.findIndex((c) => c.id === data.id);
    if (idx >= 0) {
      const before = { ...store.calculatorConfigs[idx] };
      const updated: CalculatorConfigDTO = {
        ...before,
        ...data,
        id: before.id,
        updatedAt: now,
      };
      store.calculatorConfigs[idx] = updated;
      return { item: updated, before };
    }
  }
  const created: CalculatorConfigDTO = {
    ...data,
    id: store.nextId++,
    updatedAt: now,
  };
  store.calculatorConfigs.push(created);
  return { item: created };
}

export function deleteFallbackCalculatorConfig(
  id: number
): CalculatorConfigDTO | null {
  const store = getStore();
  const idx = store.calculatorConfigs.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  const [removed] = store.calculatorConfigs.splice(idx, 1);
  return removed;
}

// --- PARTNERS ---
export function getFallbackPartners(): PartnerDTO[] {
  return [...getStore().partners].sort(
    (a, b) => a.sortOrder - b.sortOrder || b.id - a.id
  );
}

export function upsertFallbackPartner(
  data: Omit<PartnerDTO, "id" | "createdAt" | "updatedAt"> & { id?: number }
): { item: PartnerDTO; before?: PartnerDTO } {
  const store = getStore();
  const now = new Date().toISOString();
  if (data.id) {
    const idx = store.partners.findIndex((p) => p.id === data.id);
    if (idx >= 0) {
      const before = { ...store.partners[idx] };
      const updated: PartnerDTO = {
        ...before,
        ...data,
        id: before.id,
        updatedAt: now,
      };
      store.partners[idx] = updated;
      return { item: updated, before };
    }
  }
  const created: PartnerDTO = {
    ...data,
    id: store.nextId++,
    createdAt: now,
    updatedAt: now,
  };
  store.partners.push(created);
  return { item: created };
}

export function deleteFallbackPartner(id: number): PartnerDTO | null {
  const store = getStore();
  const idx = store.partners.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  const [removed] = store.partners.splice(idx, 1);
  return removed;
}
