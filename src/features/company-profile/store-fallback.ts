import type {
  AboutStatItem,
  AboutValueItem,
  CompanyProfileSettings,
  LegalPageDTO,
  TeamMemberDTO,
  TestimonialDTO,
} from "./schema";
import type { JobOpeningDTO } from "@/features/careers/schema";

interface CompanyFallbackStore {
  teamMembers: TeamMemberDTO[];
  companyProfile: CompanyProfileSettings;
  aboutStats: AboutStatItem[];
  aboutValues: AboutValueItem[];
  testimonials: TestimonialDTO[];
  jobOpenings: JobOpeningDTO[];
  legalPages: LegalPageDTO[];
  nextId: number;
}

const globalForCompany = globalThis as unknown as {
  __vmCompanyStore?: CompanyFallbackStore;
};

function createInitialStore(): CompanyFallbackStore {
  const now = new Date().toISOString();

  return {
    nextId: 300,
    teamMembers: [
      {
        id: 1,
        name: "Andika Noor Ismawan",
        role: "Founder & CEO",
        bio: "Visionary leader driving the strategic direction of Versa Morph. Passionate about leveraging technology to solve complex business challenges and deliver transformative digital solutions.",
        image: "/andika.png",
        linkedinUrl: "https://linkedin.com/company/versamorph",
        twitterUrl: null,
        status: "PUBLISHED",
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        name: "Sahri Ramadan",
        role: "Founder & CTO",
        bio: "Technical architect behind Versa Morph's engineering excellence. Expert in software architecture, cloud infrastructure, and building scalable systems that power enterprise-grade solutions.",
        image: "/sahri.png",
        linkedinUrl: "https://linkedin.com/company/versamorph",
        twitterUrl: null,
        status: "PUBLISHED",
        sortOrder: 2,
        createdAt: now,
        updatedAt: now,
      },
    ],
    companyProfile: {
      name: "Versa Morph",
      tagline: "Adapt. Innovate. Evolve.",
      description:
        "A technology-driven digital solutions company dedicated to helping businesses adapt, evolve, and thrive in the digital era.",
      email: "hello@versamorph.id",
      phone: "+62 812-3456-7890",
      whatsappPhone: "6285119871487",
      whatsappMessage: "Hi Versa Morph! I'd like to discuss a project.",
      address: "Jakarta, Indonesia",
      registeredAddress:
        "Jl. M.H. Thamrin No. 1, Jakarta Pusat, DKI Jakarta 10310, Indonesia",
      url: "https://versamorph.id",
      dpoEmail: "dpo@versamorph.id",
      privacyEmail: "privacy@versamorph.id",
      companyNumber: "9123456789",
      linkedin: "https://linkedin.com/company/versamorph",
      twitter: "https://x.com/versamorph",
      instagram: "https://instagram.com/versamorph",
    },
    aboutStats: [
      {
        value: "150+",
        label: "Enterprise Clients Transformed Worldwide",
        large: true,
      },
      { value: "24/7", label: "Infrastructure Support", large: false },
      { value: "99.9%", label: "Guaranteed System Uptime", large: false },
    ],
    aboutValues: [
      {
        icon: "Bulb",
        title: "Innovation",
        desc: "Continuously exploring emerging technologies to create meaningful and future-ready solutions.",
      },
      {
        icon: "Diamond",
        title: "Excellence",
        desc: "Striving for excellence in every project, ensuring quality, reliability, and performance.",
      },
      {
        icon: "ShieldLock",
        title: "Integrity",
        desc: "Conducting business with transparency, professionalism, and accountability.",
      },
      {
        icon: "Users",
        title: "Collaboration",
        desc: "Working closely with clients as strategic partners rather than service providers.",
      },
      {
        icon: "Rocket",
        title: "Adaptability",
        desc: "Embracing change and helping organizations navigate evolving market demands.",
      },
    ],
    testimonials: [
      {
        id: 1,
        quote:
          "Versa Morph didn't just build software; they engineered an entirely new operational nervous system for our fleet. The predictive maintenance module alone saved us over $1M in the first year.",
        author: "D.O.",
        role: "Operations Director",
        company: "Regional Logistics Provider",
        project: "Supply Chain Analytics",
        status: "PUBLISHED",
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        quote:
          "Our legacy mainframe was holding us back for years. Versa Morph's team migrated 50M customer records with zero downtime and delivered a platform that scaled 20x beyond our expectations.",
        author: "R.H.",
        role: "CTO",
        company: "Tier-1 National Bank",
        project: "Core Banking Platform",
        status: "PUBLISHED",
        sortOrder: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        quote:
          "The AI patient monitoring system reduced our ICU mortality by 28%. That's not just a metric — it's hundreds of lives saved.",
        author: "J.P.",
        role: "Medical Director",
        company: "Major Healthcare Provider",
        project: "AI Patient Monitoring",
        status: "PUBLISHED",
        sortOrder: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 4,
        quote:
          "From initial consultation to full deployment, Versa Morph demonstrated exceptional professionalism. Our cross-channel sales grew by 35%.",
        author: "S.W.",
        role: "VP of Digital",
        company: "National Retail Chain",
        project: "Omnichannel POS",
        status: "PUBLISHED",
        sortOrder: 4,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 5,
        quote:
          "They migrated 50M+ digital identities with absolute precision. Zero data loss, zero downtime.",
        author: "B.S.",
        role: "Director of IT Infrastructure",
        company: "Government Agency",
        project: "Digital ID Migration",
        status: "PUBLISHED",
        sortOrder: 5,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 6,
        quote:
          "The IoT edge computing network they deployed across our 12 factories was a game-changer.",
        author: "T.A.",
        role: "VP of Manufacturing",
        company: "Leading Manufacturing Conglomerate",
        project: "IoT Edge Computing",
        status: "PUBLISHED",
        sortOrder: 6,
        createdAt: now,
        updatedAt: now,
      },
    ],
    jobOpenings: [
      {
        id: 1,
        slug: "senior-full-stack-engineer",
        title: "Senior Full-Stack Engineer",
        department: "Engineering",
        location: "Jakarta, Indonesia (Hybrid)",
        type: "Full-time",
        workEcosystem: "Hybrid",
        category: "Technology",
        description:
          "Lead development of client projects across React/Next.js frontends and Go/Node.js backends.",
        requirements: [
          "5+ years of professional software engineering experience",
          "Expertise in React, Next.js, TypeScript, and Node.js",
          "Experience with Go, Python, or similar backend languages",
        ],
        status: "OPEN",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        slug: "iot-hardware-engineer",
        title: "IoT Hardware Engineer",
        department: "Engineering",
        location: "Jakarta, Indonesia (On-site)",
        type: "Full-time",
        workEcosystem: "On-site",
        category: "Technology",
        description:
          "Design, prototype, and deploy custom industrial hardware solutions with sensor integration and MQTT protocols.",
        requirements: [
          "3+ years of experience in embedded systems development",
          "Proficiency in C/C++ and Python",
          "Experience with LoRaWAN, BLE, Zigbee, or MQTT protocols",
        ],
        status: "OPEN",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        slug: "ux-ui-designer",
        title: "UX/UI Designer",
        department: "Design",
        location: "Remote (Asia Time Zones)",
        type: "Contract",
        workEcosystem: "Remote",
        category: "Technology",
        description:
          "Translate complex technical requirements into intuitive enterprise web and mobile interfaces.",
        requirements: [
          "3+ years of UX/UI design experience",
          "Proficiency in Figma and prototyping tools",
        ],
        status: "OPEN",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 4,
        slug: "junior-data-engineer",
        title: "Junior Data Engineer",
        department: "Data",
        location: "Jakarta, Indonesia (Remote-friendly)",
        type: "Full-time",
        workEcosystem: "Remote",
        category: "Technology",
        description:
          "Build and maintain data pipelines for analytics and AI initiatives.",
        requirements: [
          "1+ years of experience with Python or similar",
          "Basic understanding of SQL and ETL concepts",
        ],
        status: "OPEN",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 5,
        slug: "ai-solutions-engineer",
        title: "AI Solutions Engineer",
        department: "Engineering",
        location: "Remote (Global)",
        type: "Project Based",
        workEcosystem: "Remote",
        category: "Technology",
        description:
          "Design and deploy custom AI/ML solutions ranging from computer vision to LLM workflows.",
        requirements: [
          "3+ years of experience in machine learning or AI engineering",
          "Proficiency in Python, PyTorch, or TensorFlow",
        ],
        status: "OPEN",
        createdAt: now,
        updatedAt: now,
      },
    ],
    legalPages: [
      {
        id: 1,
        slug: "privacy-policy",
        title: "Privacy Policy",
        subtitle: "This Privacy Policy describes how Versa Morph collects, processes, stores, and protects your personal data.",
        lastUpdated: "June 2026",
        tocSections: [{ id: "scope", label: "1. Scope & Controller Identity" }],
        content:
          '<h2 id="scope" class="text-[28px] mt-0 mb-6 border-b border-border-glass pb-4 font-display font-bold">1. Scope &amp; Controller Identity</h2><p class="mb-6 text-[16px] text-text-secondary">Versa Morph collects only the information necessary to provide digital consulting, engineering, and inquiry responses.</p>',
        version: "2.1",
        updatedAt: now,
      },
      {
        id: 2,
        slug: "terms-conditions",
        title: "Terms & Conditions",
        subtitle: "Terms and conditions governing use of Versa Morph website, platforms, and digital engineering services.",
        lastUpdated: "June 2026",
        tocSections: [],
        content:
          '<h2 class="text-[28px] mt-0 mb-6 border-b border-border-glass pb-4 font-display font-bold">1. Acceptance of Terms</h2><p class="mb-6 text-[16px] text-text-secondary">By accessing versamorph.id you agree to be bound by these terms and applicable Indonesian law.</p>',
        version: "2.0",
        updatedAt: now,
      },
      {
        id: 3,
        slug: "cookie-policy",
        title: "Cookie Policy",
        subtitle: "Information on strictly necessary and analytics cookies used on Versa Morph platforms.",
        lastUpdated: "June 2026",
        tocSections: [],
        content:
          '<p class="mb-6 text-[16px] text-text-secondary">We use strictly necessary session and analytics cookies to ensure reliable site performance.</p>',
        version: "1.2",
        updatedAt: now,
      },
      {
        id: 4,
        slug: "sla",
        title: "Service Level Agreement (SLA)",
        subtitle: "Service availability commitments and support response targets.",
        lastUpdated: "June 2026",
        tocSections: [],
        content:
          '<p class="mb-6 text-[16px] text-text-secondary">Enterprise managed infrastructure includes a 99.9% uptime SLA and 24/7 incident escalation.</p>',
        version: "1.4",
        updatedAt: now,
      },
      {
        id: 5,
        slug: "dpa",
        title: "Data Processing Agreement (DPA)",
        subtitle: "Standard data protection terms aligned with UU PDP Indonesia and GDPR principles.",
        lastUpdated: "June 2026",
        tocSections: [],
        content:
          '<p class="mb-6 text-[16px] text-text-secondary">Standard Data Processing Agreement compliant with UU PDP Indonesia and GDPR principles.</p>',
        version: "1.3",
        updatedAt: now,
      },
      {
        id: 6,
        slug: "nda",
        title: "Mutual Non-Disclosure Agreement (NDA)",
        subtitle: "Confidentiality terms governing technical discovery and proprietary architecture disclosures.",
        lastUpdated: "June 2026",
        tocSections: [],
        content:
          '<p class="mb-6 text-[16px] text-text-secondary">All client architectures, datasets, and proprietary specs shared during discovery are protected under strict mutual confidentiality.</p>',
        version: "1.0",
        updatedAt: now,
      },
      {
        id: 7,
        slug: "affiliate-agreement",
        title: "Affiliate Partner Agreement",
        subtitle: "Terms governing referral attribution and commission payouts.",
        lastUpdated: "June 2026",
        tocSections: [],
        content:
          '<p class="mb-6 text-[16px] text-text-secondary">Terms governing referral attribution, VM-AFF partner codes, and commission payouts upon deal closure.</p>',
        version: "1.1",
        updatedAt: now,
      },
      {
        id: 8,
        slug: "partnership-guidelines",
        title: "Partnership Guidelines",
        subtitle: "Guidelines for technology and strategic co-delivery partners.",
        lastUpdated: "June 2026",
        tocSections: [],
        content:
          '<p class="mb-6 text-[16px] text-text-secondary">Guidelines for strategic cloud, technology, and co-delivery alliances with Versa Morph.</p>',
        version: "1.0",
        updatedAt: now,
      },
      {
        id: 9,
        slug: "applicant-privacy",
        title: "Applicant Privacy Notice",
        subtitle: "How Versa Morph collects and processes recruitment and applicant data.",
        lastUpdated: "June 2026",
        tocSections: [],
        content:
          '<p class="mb-6 text-[16px] text-text-secondary">How Versa Morph handles candidate resumes, portfolios, and interview records during recruitment.</p>',
        version: "1.0",
        updatedAt: now,
      },
      {
        id: 10,
        slug: "newsletter-policy",
        title: "Newsletter Policy",
        subtitle: "This Newsletter Subscription Policy governs how Versa Morph manages subscriber lists, data processing, and opt-out requests for our technology updates.",
        lastUpdated: "July 2026",
        tocSections: [],
        content:
          '<p class="mb-6 text-[16px] text-text-secondary">By subscribing to our newsletter, you agree to receive digital updates, company news, blog posts, whitepapers, and promotional offers from Versa Morph.</p>',
        version: "1.0",
        updatedAt: now,
      },
    ],
  };
}

function getStore(): CompanyFallbackStore {
  if (!globalForCompany.__vmCompanyStore) {
    globalForCompany.__vmCompanyStore = createInitialStore();
  }
  return globalForCompany.__vmCompanyStore;
}

// --- TEAM & SETTINGS ---
export function getFallbackTeamMembers(): TeamMemberDTO[] {
  return [...getStore().teamMembers].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.id - b.id
  );
}

export function upsertFallbackTeamMember(
  data: Omit<TeamMemberDTO, "id" | "createdAt" | "updatedAt"> & { id?: number }
): { item: TeamMemberDTO; before?: TeamMemberDTO } {
  const store = getStore();
  const now = new Date().toISOString();
  if (data.id) {
    const idx = store.teamMembers.findIndex((m) => m.id === data.id);
    if (idx >= 0) {
      const before = { ...store.teamMembers[idx] };
      const updated: TeamMemberDTO = { ...before, ...data, id: before.id, updatedAt: now };
      store.teamMembers[idx] = updated;
      return { item: updated, before };
    }
  }
  const created: TeamMemberDTO = { ...data, id: store.nextId++, createdAt: now, updatedAt: now };
  store.teamMembers.push(created);
  return { item: created };
}

export function deleteFallbackTeamMember(id: number): TeamMemberDTO | null {
  const store = getStore();
  const idx = store.teamMembers.findIndex((m) => m.id === id);
  if (idx < 0) return null;
  const [removed] = store.teamMembers.splice(idx, 1);
  return removed;
}

export function getFallbackSiteSettings() {
  const store = getStore();
  return {
    companyProfile: { ...store.companyProfile },
    aboutStats: [...store.aboutStats],
    aboutValues: [...store.aboutValues],
  };
}

export function saveFallbackCompanyProfile(
  profile: CompanyProfileSettings
): CompanyProfileSettings {
  const store = getStore();
  store.companyProfile = { ...profile };
  return store.companyProfile;
}

export function saveFallbackAboutStatsValues(data: {
  stats: AboutStatItem[];
  values: AboutValueItem[];
}) {
  const store = getStore();
  store.aboutStats = [...data.stats];
  store.aboutValues = [...data.values];
  return { stats: store.aboutStats, values: store.aboutValues };
}

// --- TESTIMONIALS ---
export function getFallbackTestimonials(): TestimonialDTO[] {
  return [...getStore().testimonials].sort(
    (a, b) => a.sortOrder - b.sortOrder || b.id - a.id
  );
}

export function upsertFallbackTestimonial(
  data: Omit<TestimonialDTO, "id" | "createdAt" | "updatedAt"> & { id?: number }
): { item: TestimonialDTO; before?: TestimonialDTO } {
  const store = getStore();
  const now = new Date().toISOString();
  if (data.id) {
    const idx = store.testimonials.findIndex((t) => t.id === data.id);
    if (idx >= 0) {
      const before = { ...store.testimonials[idx] };
      const updated: TestimonialDTO = { ...before, ...data, id: before.id, updatedAt: now };
      store.testimonials[idx] = updated;
      return { item: updated, before };
    }
  }
  const created: TestimonialDTO = { ...data, id: store.nextId++, createdAt: now, updatedAt: now };
  store.testimonials.push(created);
  return { item: created };
}

export function deleteFallbackTestimonial(id: number): TestimonialDTO | null {
  const store = getStore();
  const idx = store.testimonials.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  const [removed] = store.testimonials.splice(idx, 1);
  return removed;
}

// --- LEGAL PAGES ---
export function getFallbackLegalPages(): LegalPageDTO[] {
  return [...getStore().legalPages].sort((a, b) => a.id - b.id);
}

export function upsertFallbackLegalPage(
  data: Omit<LegalPageDTO, "id" | "updatedAt"> & { id?: number }
): { item: LegalPageDTO; before?: LegalPageDTO } {
  const store = getStore();
  const now = new Date().toISOString();
  const duplicate = store.legalPages.find(
    (p) => p.slug === data.slug && p.id !== data.id
  );
  if (duplicate) throw new Error("DUPLICATE_SLUG");

  if (data.id) {
    const idx = store.legalPages.findIndex((p) => p.id === data.id);
    if (idx >= 0) {
      const before = { ...store.legalPages[idx] };
      const updated: LegalPageDTO = { ...before, ...data, id: before.id, updatedAt: now };
      store.legalPages[idx] = updated;
      return { item: updated, before };
    }
  }
  const created: LegalPageDTO = { ...data, id: store.nextId++, updatedAt: now };
  store.legalPages.push(created);
  return { item: created };
}

export function deleteFallbackLegalPage(id: number): LegalPageDTO | null {
  const store = getStore();
  const idx = store.legalPages.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  const [removed] = store.legalPages.splice(idx, 1);
  return removed;
}

// --- CAREERS / JOB OPENINGS ---
export function getFallbackJobOpenings(): JobOpeningDTO[] {
  return [...getStore().jobOpenings].sort((a, b) => b.id - a.id);
}

export function upsertFallbackJobOpening(
  data: Omit<JobOpeningDTO, "id" | "createdAt" | "updatedAt"> & { id?: number }
): { item: JobOpeningDTO; before?: JobOpeningDTO } {
  const store = getStore();
  const now = new Date().toISOString();
  const duplicate = store.jobOpenings.find(
    (j) => j.slug === data.slug && j.id !== data.id
  );
  if (duplicate) throw new Error("DUPLICATE_SLUG");

  if (data.id) {
    const idx = store.jobOpenings.findIndex((j) => j.id === data.id);
    if (idx >= 0) {
      const before = { ...store.jobOpenings[idx] };
      const updated: JobOpeningDTO = { ...before, ...data, id: before.id, updatedAt: now };
      store.jobOpenings[idx] = updated;
      return { item: updated, before };
    }
  }
  const created: JobOpeningDTO = { ...data, id: store.nextId++, createdAt: now, updatedAt: now };
  store.jobOpenings.unshift(created);
  return { item: created };
}

export function deleteFallbackJobOpening(id: number): JobOpeningDTO | null {
  const store = getStore();
  const idx = store.jobOpenings.findIndex((j) => j.id === id);
  if (idx < 0) return null;
  const [removed] = store.jobOpenings.splice(idx, 1);
  return removed;
}
