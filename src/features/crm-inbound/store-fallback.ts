import type {
  AffiliateDTO,
  AffiliateReferralDTO,
  JobApplicantDTO,
  LeadDTO,
} from "./schema";

interface CrmFallbackStore {
  leads: LeadDTO[];
  affiliates: AffiliateDTO[];
  referrals: AffiliateReferralDTO[];
  applicants: JobApplicantDTO[];
  nextId: number;
}

const globalForCrm = globalThis as unknown as {
  __vmCrmStore?: CrmFallbackStore;
};

function createInitialStore(): CrmFallbackStore {
  const now = Date.now();
  const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();

  return {
    nextId: 500,
    leads: [
      {
        id: 105,
        name: "Budi Santoso",
        email: "budi.santoso@nusantaralogistics.co.id",
        phone: "+62 811-900-4421",
        company: "PT Nusantara Logistics",
        website: "https://nusantaralogistics.co.id",
        service: "Software Development",
        source: "service-page",
        partnerType: null,
        message:
          "We need an end-to-end fleet telemetry & route optimization platform covering 350 trucks across Java.",
        subscribeNewsletter: true,
        metadata: { estimatedBudget: "IDR 250M - 400M", urgency: "Q4 2026" },
        status: "NEW",
        salesNotes: "Follow up via Zoom with CTO.",
        createdAt: hoursAgo(2),
        updatedAt: hoursAgo(2),
      },
      {
        id: 104,
        name: "Clarissa Wijaya",
        email: "clarissa@medikahealth.id",
        phone: "+62 818-234-8891",
        company: "Medika Health Group",
        website: "https://medikahealth.id",
        service: "AI & Cloud Solutions",
        source: "chat",
        partnerType: null,
        message:
          "Captured via AI Assistant: Interested in predictive patient triage and HL7/FHIR hospital integration.",
        subscribeNewsletter: false,
        metadata: { chatChannel: "Web AI Assistant", country: "Indonesia" },
        status: "QUALIFIED",
        salesNotes: "Discovery sprint proposal shared on Nov 18.",
        createdAt: hoursAgo(9),
        updatedAt: hoursAgo(4),
      },
      {
        id: 103,
        name: "Marcus Chen",
        email: "m.chen@pacificcloud.sg",
        phone: "+65 9123 8840",
        company: "Pacific Cloud Pte Ltd",
        website: "https://pacificcloud.sg",
        service: "General Inquiry",
        source: "partners-apply",
        partnerType: "Technology & Cloud Co-Delivery",
        message:
          "Looking to co-deliver Kubernetes and FinOps transformations for SEA enterprise accounts.",
        subscribeNewsletter: true,
        metadata: { attachment: "PacificCloud_Partner_Deck.pdf" },
        status: "CONTACTED",
        salesNotes: "Intro call scheduled next Tuesday.",
        createdAt: hoursAgo(18),
        updatedAt: hoursAgo(10),
      },
      {
        id: 102,
        name: "Rina Kusuma",
        email: "rina@finpay.co.id",
        phone: "+62 812-8871-1102",
        company: "FinPay Digital",
        website: "https://finpay.co.id",
        service: "Web & Mobile Apps",
        source: "meeting",
        partnerType: null,
        message:
          "Booked 30-minute consultation for mobile banking super-app UX overhaul.",
        subscribeNewsletter: false,
        metadata: { meetingSlot: "2026-11-22 10:00 WIB" },
        status: "PROPOSAL_SENT",
        salesNotes: "Sent Growth + Custom Enterprise quote.",
        createdAt: hoursAgo(36),
        updatedAt: hoursAgo(20),
      },
      {
        id: 101,
        name: "Hendra Gunawan",
        email: "hendra@agrotech.id",
        phone: "+62 813-4550-2211",
        company: "AgroTech Indonesia",
        website: "https://agrotech.id",
        service: "AI & Cloud Solutions",
        source: "contact",
        partnerType: null,
        message:
          "Signed SOW for IoT soil moisture sensor dashboard across 4 plantations.",
        subscribeNewsletter: true,
        metadata: { contractValue: "IDR 180M" },
        status: "WON",
        salesNotes: "Kickoff completed with engineering squad.",
        createdAt: hoursAgo(96),
        updatedAt: hoursAgo(48),
      },
    ],
    affiliates: [
      {
        id: 1,
        affiliateCode: "VM-AFF-8K4P2M",
        name: "Dimas Pratama",
        email: "dimas@pratamaconsulting.id",
        phone: "+62 812-3344-5566",
        company: "Pratama IT Advisory",
        status: "ACTIVE",
        createdAt: hoursAgo(120),
      },
      {
        id: 2,
        affiliateCode: "VM-AFF-3R9X1Q",
        name: "Siti Rahmawati",
        email: "siti@growthbridge.co",
        phone: "+62 815-9988-7766",
        company: "GrowthBridge SEA",
        status: "ACTIVE",
        createdAt: hoursAgo(72),
      },
      {
        id: 3,
        affiliateCode: "VM-AFF-7T2N5B",
        name: "Kevin Tan",
        email: "kevin@venturesg.com",
        phone: "+65 8221 9002",
        company: "VentureSG",
        status: "SUSPENDED",
        createdAt: hoursAgo(200),
      },
    ],
    referrals: [
      {
        id: 203,
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
        message:
          "Client needs core middleware API modernization and digital onboarding flow.",
        status: "PITCHING",
        createdAt: hoursAgo(14),
        updatedAt: hoursAgo(5),
      },
      {
        id: 202,
        affiliateCode: "VM-AFF-3R9X1Q",
        affiliateName: "Siti Rahmawati",
        clientCompany: "Karya Manufaktur Tbk",
        clientPicName: "Lina Kartika",
        clientPicTitle: "Head of Operations",
        clientEmail: "lina@karyamanufaktur.co.id",
        companyIndustry: "Manufacturing",
        companyScale: "Mid-Market (250 staff)",
        platforms: "Web Dashboard + IIoT Edge",
        budget: "IDR 250M - 400M",
        timeline: "3-4 Months",
        techStack: "Go, MQTT, React",
        preferredChannel: "WhatsApp Intro",
        bestTime: "14:00 - 16:00 WIB",
        message:
          "Looking for real-time OEE monitoring across 3 assembly lines in Cikarang.",
        status: "SUBMITTED",
        createdAt: hoursAgo(6),
        updatedAt: hoursAgo(6),
      },
      {
        id: 201,
        affiliateCode: "VM-AFF-8K4P2M",
        affiliateName: "Dimas Pratama",
        clientCompany: "Sinar Retail Nusantara",
        clientPicName: "Wahyu Hidayat",
        clientPicTitle: "IT Director",
        clientEmail: "wahyu@sinarretail.id",
        companyIndustry: "Retail & E-Commerce",
        companyScale: "Enterprise",
        platforms: "Omnichannel POS",
        budget: "IDR 350M",
        timeline: "14 Weeks",
        techStack: "Next.js, Node.js, Redis",
        preferredChannel: "On-site Jakarta",
        bestTime: "Morning",
        message: "Closed deal for unified POS & inventory sync across 40 stores.",
        status: "WON",
        createdAt: hoursAgo(160),
        updatedAt: hoursAgo(40),
      },
    ],
    applicants: [
      {
        id: 304,
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
        message:
          "6 years building enterprise fintech & logistics platforms with Next.js, TypeScript, and Go.",
        status: "INTERVIEW",
        notes: "Strong system design score in take-home review. Panel interview next.",
        createdAt: hoursAgo(12),
        updatedAt: hoursAgo(3),
      },
      {
        id: 303,
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
        message:
          "Specialized in B2B SaaS design systems, Figma tokens, and enterprise mobile UX.",
        status: "APPLIED",
        notes: null,
        createdAt: hoursAgo(4),
        updatedAt: hoursAgo(4),
      },
      {
        id: 302,
        position: "AI Solutions Engineer",
        name: "Dr. Arif Wibowo",
        email: "arif.wibowo@airesearch.org",
        phone: "+62 811-5511-3344",
        linkedin: "https://linkedin.com/in/arifwibowo",
        portfolioUrl: "https://github.com/arifwibowo-ml",
        expectedSalary: "IDR 35M / mo",
        startDate: "Jan 02, 2027",
        workAuth: "Yes",
        resumeFileName: "Arif_Wibowo_ML_CV.pdf",
        resumeUrl: "https://versamorph.id/uploads/cv/arif-wibowo.pdf",
        message:
          "Published edge computer vision models and production RAG pipelines for healthcare.",
        status: "OFFERED",
        notes: "Offer letter sent for Healthcare AI Squad Lead.",
        createdAt: hoursAgo(70),
        updatedAt: hoursAgo(18),
      },
      {
        id: 301,
        position: "IoT Hardware Engineer",
        name: "Fajar Nugroho",
        email: "fajar.iot@embedded.id",
        phone: "+62 813-9090-1212",
        linkedin: "https://linkedin.com/in/fajarnugroho",
        portfolioUrl: null,
        expectedSalary: "IDR 18M / mo",
        startDate: "Nov 25, 2026",
        workAuth: "Yes",
        resumeFileName: "Fajar_Nugroho_CV.pdf",
        resumeUrl: "https://versamorph.id/uploads/cv/fajar-nugroho.pdf",
        message: "Experience designing STM32, ESP32, and Raspberry Pi CM4 industrial boards.",
        status: "SCREENING",
        notes: "Verify PCB Altium portfolio during HR call.",
        createdAt: hoursAgo(28),
        updatedAt: hoursAgo(15),
      },
    ],
  };
}

function getStore(): CrmFallbackStore {
  if (!globalForCrm.__vmCrmStore) {
    globalForCrm.__vmCrmStore = createInitialStore();
  }
  return globalForCrm.__vmCrmStore;
}

// --- LEADS ---
export function getFallbackLeads(): LeadDTO[] {
  return [...getStore().leads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function addFallbackLead(
  data: Omit<LeadDTO, "id" | "createdAt" | "updatedAt">
): LeadDTO {
  const store = getStore();
  const now = new Date().toISOString();
  const created: LeadDTO = {
    ...data,
    id: store.nextId++,
    createdAt: now,
    updatedAt: now,
  };
  store.leads.unshift(created);
  return created;
}

export function updateFallbackLead(
  id: number,
  status: LeadDTO["status"],
  salesNotes: string | null
): { item: LeadDTO; before: LeadDTO } | null {
  const store = getStore();
  const idx = store.leads.findIndex((l) => l.id === id);
  if (idx < 0) return null;
  const before = { ...store.leads[idx] };
  const updated: LeadDTO = {
    ...before,
    status,
    salesNotes,
    updatedAt: new Date().toISOString(),
  };
  store.leads[idx] = updated;
  return { item: updated, before };
}

export function deleteFallbackLead(id: number): LeadDTO | null {
  const store = getStore();
  const idx = store.leads.findIndex((l) => l.id === id);
  if (idx < 0) return null;
  const [removed] = store.leads.splice(idx, 1);
  return removed;
}

// --- AFFILIATES & REFERRALS ---
export function getFallbackAffiliatesBundle() {
  const store = getStore();
  return {
    affiliates: [...store.affiliates].sort((a, b) => b.id - a.id),
    referrals: [...store.referrals].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
  };
}

export function addFallbackAffiliate(
  data: Omit<AffiliateDTO, "id" | "createdAt">
): AffiliateDTO {
  const store = getStore();
  const dup = store.affiliates.find(
    (a) => a.affiliateCode.toUpperCase() === data.affiliateCode.toUpperCase()
  );
  if (dup) throw new Error("DUPLICATE_CODE");

  const created: AffiliateDTO = {
    ...data,
    id: store.nextId++,
    createdAt: new Date().toISOString(),
  };
  store.affiliates.unshift(created);
  return created;
}

export function toggleFallbackAffiliateStatus(
  id: number,
  status: AffiliateDTO["status"]
): { item: AffiliateDTO; before: AffiliateDTO } | null {
  const store = getStore();
  const idx = store.affiliates.findIndex((a) => a.id === id);
  if (idx < 0) return null;
  const before = { ...store.affiliates[idx] };
  const updated: AffiliateDTO = { ...before, status };
  store.affiliates[idx] = updated;
  return { item: updated, before };
}

export function updateFallbackReferral(
  id: number,
  status: AffiliateReferralDTO["status"],
  message?: string | null
): { item: AffiliateReferralDTO; before: AffiliateReferralDTO } | null {
  const store = getStore();
  const idx = store.referrals.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  const before = { ...store.referrals[idx] };
  const updated: AffiliateReferralDTO = {
    ...before,
    status,
    message: message !== undefined ? message : before.message,
    updatedAt: new Date().toISOString(),
  };
  store.referrals[idx] = updated;
  return { item: updated, before };
}

export function deleteFallbackReferral(id: number): AffiliateReferralDTO | null {
  const store = getStore();
  const idx = store.referrals.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  const [removed] = store.referrals.splice(idx, 1);
  return removed;
}

// --- APPLICANTS ---
export function getFallbackJobApplicants(): JobApplicantDTO[] {
  return [...getStore().applicants].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function updateFallbackApplicant(
  id: number,
  status: JobApplicantDTO["status"],
  notes: string | null
): { item: JobApplicantDTO; before: JobApplicantDTO } | null {
  const store = getStore();
  const idx = store.applicants.findIndex((a) => a.id === id);
  if (idx < 0) return null;
  const before = { ...store.applicants[idx] };
  const updated: JobApplicantDTO = {
    ...before,
    status,
    notes,
    updatedAt: new Date().toISOString(),
  };
  store.applicants[idx] = updated;
  return { item: updated, before };
}

export function deleteFallbackApplicant(id: number): JobApplicantDTO | null {
  const store = getStore();
  const idx = store.applicants.findIndex((a) => a.id === id);
  if (idx < 0) return null;
  const [removed] = store.applicants.splice(idx, 1);
  return removed;
}
