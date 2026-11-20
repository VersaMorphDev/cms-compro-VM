import type { BlogPostDTO } from "@/features/blog/schema";
import type { ProjectDTO } from "@/features/portfolio/schema";
import type {
  ServiceDTO,
  SolutionDTO,
  ApproachStepDTO,
  WhyChooseUsDTO,
} from "@/features/services-solutions/schema";
import type { FaqItemDTO } from "@/features/faq/schema";

interface ContentFallbackStore {
  blogPosts: BlogPostDTO[];
  projects: ProjectDTO[];
  services: ServiceDTO[];
  solutions: SolutionDTO[];
  approachSteps: ApproachStepDTO[];
  whyChooseUs: WhyChooseUsDTO[];
  faqItems: FaqItemDTO[];
  nextId: number;
}

const globalForContent = globalThis as unknown as {
  __vmContentStore?: ContentFallbackStore;
};

function createInitialContentStore(): ContentFallbackStore {
  const now = new Date().toISOString();

  return {
    nextId: 100,
    blogPosts: [
      {
        id: 1,
        slug: "securing-web-apps-2026",
        title: "Securing Web Applications: Best Practices for 2026",
        description:
          "An essential checklist for developers and CTOs to defend modern web architectures against emerging client-side threats.",
        category: "Cybersecurity",
        author: "Sahri Ramadan",
        role: "Founder & CTO",
        publishedDate: "Jul 10, 2026",
        readTime: "6 Min Read",
        image: "/blog/securing-web-apps-2026.jpg",
        content:
          '<p class="mb-4">At Versa Morph, security is a core pillar of our software development cycle. Prioritizing strict Content Security Policies (CSP) and securing the software supply chain are mandatory in 2026.</p><h2 class="text-2xl font-bold mt-6 mb-3">Prioritizing Content Security Policies</h2><p class="mb-4">Implement nonce-based CSPs and eliminate unsafe inline scripts across enterprise deployments.</p>',
        status: "PUBLISHED",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        slug: "nextjs16-micro-frontends",
        title: "Building Scalable Micro-Frontends with Next.js 16",
        description:
          "Exploring architecture strategies to scale massive frontends using Next.js 16, Module Federation, and monorepos.",
        category: "Web Development",
        author: "Sahri Ramadan",
        role: "Founder & CTO",
        publishedDate: "Jul 03, 2026",
        readTime: "7 Min Read",
        image: "/blog/nextjs16-micro-frontends.jpg",
        content:
          '<p class="mb-4">Next.js 16 introduces refined support for modular builds and independent route modules, making micro-frontend architectures more stable and performant than ever.</p>',
        status: "PUBLISHED",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        slug: "tailwind-v4-benefits",
        title: "The Power of Tailwind CSS v4 in Modern Web Design",
        description:
          "An overview of the new CSS-first configuration and compiler engine in Tailwind v4.",
        category: "UI/UX Design",
        author: "Andika Noor Ismawan",
        role: "Founder & CEO",
        publishedDate: "Jun 26, 2026",
        readTime: "5 Min Read",
        image: "/blog/tailwind-v4-benefits.jpg",
        content:
          '<p class="mb-4">Tailwind CSS v4 ditches traditional JS config in favor of CSS-first design tokens and a Rust-based compiler engine up to 10x faster.</p>',
        status: "PUBLISHED",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 4,
        slug: "ai-agents-enterprise-2026",
        title: "Deploying Deterministic AI Agents in Enterprise Workflows",
        description:
          "How to design guardrails, audit trails, and fallback pipelines when integrating LLM agents into core operations.",
        category: "AI & Machine Learning",
        author: "Sahri Ramadan",
        role: "Founder & CTO",
        publishedDate: "Nov 19, 2026",
        readTime: "4 Min Read",
        image: "/blog/ai-agents-enterprise.jpg",
        content:
          '<p class="mb-4">Draft outline covering tool-calling constraints, human-in-the-loop approvals, and observability.</p>',
        status: "DRAFT",
        createdAt: now,
        updatedAt: now,
      },
    ],
    projects: [
      {
        id: 1,
        slug: "ai-patient-monitoring",
        title: "AI-Powered Patient Monitoring Ecosystem",
        client: "Major Healthcare Provider",
        industry: "Healthcare",
        year: "2025",
        category: "AI & ML",
        image: "/projects/ai-patient-monitoring.jpg",
        description:
          "End-to-end AI patient monitoring ecosystem spanning multiple ICU divisions, combining edge AI inference with cloud predictive analytics.",
        problem:
          "Traditional threshold-based monitoring in ICU wards suffered from a 40% false negative rate and severe alert fatigue.",
        solution:
          "Hybrid edge-cloud architecture with TensorFlow Lite anomaly detection on bedside monitors and central cloud transformer models.",
        result:
          "False negative rate dropped from 40% to 3%. ICU mortality decreased by 28% within 6 months.",
        tech: ["React", "Python", "TensorFlow", "AWS", "MQTT"],
        gradient: "linear-gradient(135deg, #1e3a8a, #0f172a)",
        timeline: [
          {
            phase: "Phase 1",
            title: "Clinical Audit",
            desc: "Reviewed ICU patient monitoring telemetry indicators.",
          },
          {
            phase: "Phase 2",
            title: "Model Architecture",
            desc: "Designed Edge TF models and central Transformer pipeline.",
          },
          {
            phase: "Phase 3",
            title: "System Rollout",
            desc: "Deployed to 3 key hospital ICU divisions.",
          },
        ],
        status: "PUBLISHED",
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        slug: "iot-edge-computing",
        title: "Industrial IoT Edge Computing Network",
        client: "Leading Manufacturing Conglomerate",
        industry: "Manufacturing",
        year: "2024",
        category: "IoT & Hardware",
        image: "/projects/iot-edge-computing.jpg",
        description:
          "Factory-wide IoT edge computing network across 12 industrial facilities connecting 500+ legacy machines.",
        problem:
          "Legacy PLCs had zero network connectivity, causing 200 hours of unplanned downtime annually.",
        solution:
          "500+ custom Raspberry Pi CM4 edge nodes running Go telemetry agents with MQTT store-and-forward.",
        result:
          "Alert latency dropped to sub-10ms; unplanned downtime decreased by 67% across 12 factories.",
        tech: ["Golang", "MQTT", "Raspberry Pi", "Vue.js", "InfluxDB"],
        gradient: "linear-gradient(135deg, #065f46, #0f172a)",
        timeline: [
          {
            phase: "Phase 1",
            title: "Discovery & Audit",
            desc: "Inspected legacy PLC nodes on-site.",
          },
          {
            phase: "Phase 2",
            title: "Go Agent Dev",
            desc: "Built optimized Go telemetry agent.",
          },
          {
            phase: "Phase 3",
            title: "Industrial Deployment",
            desc: "Deployed 500+ edge nodes across 12 factories.",
          },
        ],
        status: "PUBLISHED",
        sortOrder: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        slug: "core-banking-platform",
        title: "Next-Gen Core Banking & CRM Platform",
        client: "Tier-1 National Bank",
        industry: "Finance",
        year: "2024",
        category: "Software",
        image: "/projects/core-banking-platform.jpg",
        description:
          "Complete core banking modernization decomposing a 25-year-old mainframe into 60+ cloud-native microservices on Azure AKS.",
        problem:
          "Legacy mainframe peaked at 500 TPS and cost Rp186 Miliar annually to maintain.",
        solution:
          "Decomposed monolith into 60+ microservices with PostgreSQL, Redis, Kafka, and Next.js operations panel.",
        result:
          "Throughput scaled from 500 to 10,000+ TPS; processing costs decreased by 70%.",
        tech: ["Next.js", "Node.js", "PostgreSQL", "Azure", "React Native"],
        gradient: "linear-gradient(135deg, #701a75, #0f172a)",
        timeline: [
          {
            phase: "Phase 1",
            title: "Monolith Mapping",
            desc: "Mapped dependency chains for 60+ services.",
          },
          {
            phase: "Phase 2",
            title: "Live Migration",
            desc: "Zero-downtime cutover via strangler fig pattern.",
          },
        ],
        status: "PUBLISHED",
        sortOrder: 3,
        createdAt: now,
        updatedAt: now,
      },
    ],
    services: [
      {
        id: 1,
        slug: "custom-software-development",
        title: "Custom Software Development",
        tagline:
          "Enterprise-grade software built around your unique business requirements.",
        description:
          "We design and build tailored software solutions that solve real business problems. From enterprise applications and ERP systems to CRM platforms.",
        icon: "code",
        items: [
          "Enterprise Applications",
          "ERP & CRM Systems",
          "Business Management",
          "System Integration",
        ],
        benefits: [
          "Purpose-built architecture that fits your workflows",
          "Modular, API-first design enabling seamless integration",
          "Future-proof codebase with automated testing",
        ],
        process: [
          {
            step: "Requirements Discovery",
            desc: "In-depth workshops to map business processes and constraints.",
          },
          {
            step: "Architecture Design",
            desc: "Solution architecture covering system design and security.",
          },
          {
            step: "Iterative Development",
            desc: "Agile sprints with bi-weekly demos and CI/CD.",
          },
        ],
        technologies: ["TypeScript", "Next.js", "Node.js", "Go", "PostgreSQL", "AWS"],
        useCases: [
          {
            title: "ERP Platform Modernization",
            desc: "Replaced legacy ERP with a cloud-native modular system serving 2,000+ users.",
          },
        ],
        gradient: "from-[rgba(59,130,246,0.15)] to-transparent",
        status: "PUBLISHED",
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        slug: "web-development",
        title: "Web Development",
        tagline: "Modern, responsive, and high-performing web solutions.",
        description:
          "Corporate websites, e-commerce platforms, web portals, and SaaS platforms built for speed and conversion.",
        icon: "globe",
        items: [
          "Corporate Websites",
          "E-commerce Platforms",
          "Web Portals",
          "SaaS Platforms",
        ],
        benefits: ["SEO & Core Web Vitals optimized", "Edge-cached global delivery"],
        process: [
          { step: "Discovery", desc: "Scope & wireframes" },
          { step: "Build", desc: "Next.js & Tailwind implementation" },
        ],
        technologies: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Vercel"],
        useCases: [
          {
            title: "Enterprise SaaS Portal",
            desc: "Multi-tenant web portal with real-time analytics.",
          },
        ],
        gradient: "from-[rgba(16,185,129,0.15)] to-transparent",
        status: "PUBLISHED",
        sortOrder: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        slug: "ai-machine-learning",
        title: "AI & Machine Learning",
        tagline: "Automate processes and generate actionable insights.",
        description:
          "Leverage AI technologies including chatbots, predictive analytics, computer vision, and machine learning models.",
        icon: "ai",
        items: [
          "Predictive Analytics",
          "Natural Language Processing",
          "Computer Vision",
          "Chatbots & Virtual Assistants",
        ],
        benefits: ["Custom fine-tuned models", "Production MLOps & drift monitoring"],
        process: [
          { step: "Problem Definition", desc: "Identify high-impact AI use cases." },
          { step: "Model & MLOps", desc: "Training, serving, and monitoring." },
        ],
        technologies: ["Python", "TensorFlow", "PyTorch", "LangChain", "OpenAI"],
        useCases: [
          {
            title: "Predictive Maintenance",
            desc: "Predicted equipment failures 48 hours in advance.",
          },
        ],
        gradient: "from-[rgba(236,72,153,0.15)] to-transparent",
        status: "PUBLISHED",
        sortOrder: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 4,
        slug: "cloud-devops",
        title: "Cloud & DevOps",
        tagline: "Scalable, secure, and cost-optimized infrastructure.",
        description:
          "Cloud migration, CI/CD pipelines, infrastructure monitoring, and FinOps cost optimization.",
        icon: "cloud",
        items: [
          "Cloud Migration",
          "CI/CD Pipelines",
          "Infrastructure Monitoring",
          "Performance Optimization",
        ],
        benefits: ["Multi-cloud & hybrid strategies", "GitOps with automated rollbacks"],
        process: [
          { step: "Assessment", desc: "Infrastructure audit & roadmap." },
          { step: "IaC & CI/CD", desc: "Terraform, Kubernetes, GitHub Actions." },
        ],
        technologies: ["AWS", "Google Cloud", "Azure", "Terraform", "Kubernetes"],
        useCases: [
          {
            title: "Cloud Migration",
            desc: "Migrated 200+ workloads with zero downtime.",
          },
        ],
        gradient: "from-[rgba(59,130,246,0.15)] to-transparent",
        status: "PUBLISHED",
        sortOrder: 4,
        createdAt: now,
        updatedAt: now,
      },
    ],
    solutions: [
      {
        id: 1,
        title: "Digital Transformation Consulting",
        description:
          "Strategic guidance to help organizations navigate digital disruption and build a roadmap for sustainable growth.",
        icon: "transform",
        gradient: "from-[rgba(59,130,246,0.15)] to-transparent",
        items: [
          "Digital Maturity Assessment",
          "Technology Roadmapping",
          "Change Management",
          "ROI & KPI Framework",
        ],
        status: "PUBLISHED",
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        title: "IoT & Smart Systems",
        description:
          "End-to-end IoT solutions from sensor integration and edge computing to centralized dashboards.",
        icon: "iot",
        gradient: "from-[rgba(16,185,129,0.15)] to-transparent",
        items: [
          "Industrial IoT (IIoT)",
          "Smart Building Automation",
          "Predictive Maintenance",
          "Real-time Asset Tracking",
        ],
        status: "PUBLISHED",
        sortOrder: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        title: "AI & Automation",
        description:
          "Intelligent automation combining machine learning, RPA, and data analytics to streamline operations.",
        icon: "automation",
        gradient: "from-[rgba(139,92,246,0.15)] to-transparent",
        items: [
          "Business Process Automation",
          "Intelligent Document Processing",
          "Predictive Analytics",
          "AI-powered Chatbots",
        ],
        status: "PUBLISHED",
        sortOrder: 3,
        createdAt: now,
        updatedAt: now,
      },
    ],
    approachSteps: [
      { id: 1, num: "01", title: "Discover", description: "We begin by understanding business goals, challenges, and opportunities.", sortOrder: 1 },
      { id: 2, num: "02", title: "Strategize", description: "We define the best technology strategy aligned with business objectives.", sortOrder: 2 },
      { id: 3, num: "03", title: "Design", description: "We create intuitive user experiences and scalable solution architectures.", sortOrder: 3 },
      { id: 4, num: "04", title: "Develop", description: "We build reliable and future-ready digital products using modern technologies.", sortOrder: 4 },
      { id: 5, num: "05", title: "Deploy", description: "We implement solutions efficiently with minimal operational disruption.", sortOrder: 5 },
      { id: 6, num: "06", title: "Optimize", description: "We continuously improve systems to ensure long-term performance and value.", sortOrder: 6 },
    ],
    whyChooseUs: [
      { id: 1, title: "Business-Focused Approach", description: "We focus on solving business challenges, not just delivering technology.", sortOrder: 1 },
      { id: 2, title: "End-to-End Services", description: "From consulting and design to development and maintenance, all in one place.", sortOrder: 2 },
      { id: 3, title: "Scalable Solutions", description: "Technology built to support future growth and expansion.", sortOrder: 3 },
      { id: 4, title: "Modern Technology Stack", description: "Utilizing industry-leading tools, frameworks, and platforms.", sortOrder: 4 },
      { id: 5, title: "Agile Delivery", description: "Faster project execution with continuous collaboration and flexibility.", sortOrder: 5 },
      { id: 6, title: "Long-Term Partnership", description: "Committed to supporting clients beyond project completion.", sortOrder: 6 },
    ],
    faqItems: [
      {
        id: 1,
        question: "What does Versa Morph do?",
        answer:
          "Versa Morph is a technology-driven digital solutions company providing **custom software development**, **web & mobile apps**, **AI & machine learning**, and **cloud infrastructure**.",
        category: "General",
        status: "PUBLISHED",
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        question: "What is your pricing model?",
        answer:
          "We offer **Fixed-price**, **Time & Materials**, and **Dedicated Team** models starting from Discovery engagements.",
        category: "Services",
        status: "PUBLISHED",
        sortOrder: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        question: "What is your project process?",
        answer:
          "We follow our six-step **DSDDO** methodology:\n- **Discover**\n- **Strategize**\n- **Design**\n- **Develop**\n- **Deploy**\n- **Optimize**",
        category: "Process",
        status: "PUBLISHED",
        sortOrder: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 4,
        question: "What tech stack do you specialize in?",
        answer:
          "Our core stack includes **Next.js / React**, **TypeScript**, **Node.js**, **Go**, **Python**, **PostgreSQL**, and multi-cloud infrastructure on **AWS / GCP / Azure**.",
        category: "Technical",
        status: "PUBLISHED",
        sortOrder: 4,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 5,
        question: "Do you provide post-launch SLA support?",
        answer:
          "Yes, we provide **24/7 infrastructure monitoring** and SLA guarantees tailored to your production criticality.",
        category: "Support",
        status: "PUBLISHED",
        sortOrder: 5,
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

function getStore(): ContentFallbackStore {
  if (!globalForContent.__vmContentStore) {
    globalForContent.__vmContentStore = createInitialContentStore();
  }
  return globalForContent.__vmContentStore;
}

// --- BLOG ---
export function getFallbackBlogPosts(): BlogPostDTO[] {
  return [...getStore().blogPosts].sort((a, b) => b.id - a.id);
}

export function upsertFallbackBlogPost(
  data: Omit<BlogPostDTO, "id" | "createdAt" | "updatedAt"> & { id?: number }
): { item: BlogPostDTO; before?: BlogPostDTO } {
  const store = getStore();
  const now = new Date().toISOString();
  const duplicate = store.blogPosts.find(
    (p) => p.slug === data.slug && p.id !== data.id
  );
  if (duplicate) {
    throw new Error("DUPLICATE_SLUG");
  }

  if (data.id) {
    const idx = store.blogPosts.findIndex((p) => p.id === data.id);
    if (idx >= 0) {
      const before = { ...store.blogPosts[idx] };
      const updated: BlogPostDTO = {
        ...before,
        ...data,
        id: before.id,
        updatedAt: now,
      };
      store.blogPosts[idx] = updated;
      return { item: updated, before };
    }
  }

  const created: BlogPostDTO = {
    ...data,
    id: store.nextId++,
    createdAt: now,
    updatedAt: now,
  };
  store.blogPosts.unshift(created);
  return { item: created };
}

export function deleteFallbackBlogPost(id: number): BlogPostDTO | null {
  const store = getStore();
  const idx = store.blogPosts.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  const [removed] = store.blogPosts.splice(idx, 1);
  return removed;
}

// --- PROJECTS ---
export function getFallbackProjects(): ProjectDTO[] {
  return [...getStore().projects].sort(
    (a, b) => a.sortOrder - b.sortOrder || b.id - a.id
  );
}

export function upsertFallbackProject(
  data: Omit<ProjectDTO, "id" | "createdAt" | "updatedAt"> & { id?: number }
): { item: ProjectDTO; before?: ProjectDTO } {
  const store = getStore();
  const now = new Date().toISOString();
  const duplicate = store.projects.find(
    (p) => p.slug === data.slug && p.id !== data.id
  );
  if (duplicate) {
    throw new Error("DUPLICATE_SLUG");
  }

  if (data.id) {
    const idx = store.projects.findIndex((p) => p.id === data.id);
    if (idx >= 0) {
      const before = { ...store.projects[idx] };
      const updated: ProjectDTO = {
        ...before,
        ...data,
        id: before.id,
        updatedAt: now,
      };
      store.projects[idx] = updated;
      return { item: updated, before };
    }
  }

  const created: ProjectDTO = {
    ...data,
    id: store.nextId++,
    createdAt: now,
    updatedAt: now,
  };
  store.projects.push(created);
  return { item: created };
}

export function deleteFallbackProject(id: number): ProjectDTO | null {
  const store = getStore();
  const idx = store.projects.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  const [removed] = store.projects.splice(idx, 1);
  return removed;
}

// --- SERVICES & SOLUTIONS ---
export function getFallbackServicesBundle() {
  const store = getStore();
  return {
    services: [...store.services].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
    solutions: [...store.solutions].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
    approachSteps: [...store.approachSteps].sort((a, b) => a.sortOrder - b.sortOrder),
    whyChooseUs: [...store.whyChooseUs].sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

export function upsertFallbackService(
  data: Omit<ServiceDTO, "id" | "createdAt" | "updatedAt"> & { id?: number }
): { item: ServiceDTO; before?: ServiceDTO } {
  const store = getStore();
  const now = new Date().toISOString();
  const duplicate = store.services.find(
    (s) => s.slug === data.slug && s.id !== data.id
  );
  if (duplicate) throw new Error("DUPLICATE_SLUG");

  if (data.id) {
    const idx = store.services.findIndex((s) => s.id === data.id);
    if (idx >= 0) {
      const before = { ...store.services[idx] };
      const updated: ServiceDTO = { ...before, ...data, id: before.id, updatedAt: now };
      store.services[idx] = updated;
      return { item: updated, before };
    }
  }

  const created: ServiceDTO = { ...data, id: store.nextId++, createdAt: now, updatedAt: now };
  store.services.push(created);
  return { item: created };
}

export function deleteFallbackService(id: number): ServiceDTO | null {
  const store = getStore();
  const idx = store.services.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  const [removed] = store.services.splice(idx, 1);
  return removed;
}

export function upsertFallbackSolution(
  data: Omit<SolutionDTO, "id" | "createdAt" | "updatedAt"> & { id?: number }
): { item: SolutionDTO; before?: SolutionDTO } {
  const store = getStore();
  const now = new Date().toISOString();
  if (data.id) {
    const idx = store.solutions.findIndex((s) => s.id === data.id);
    if (idx >= 0) {
      const before = { ...store.solutions[idx] };
      const updated: SolutionDTO = { ...before, ...data, id: before.id, updatedAt: now };
      store.solutions[idx] = updated;
      return { item: updated, before };
    }
  }
  const created: SolutionDTO = { ...data, id: store.nextId++, createdAt: now, updatedAt: now };
  store.solutions.push(created);
  return { item: created };
}

export function deleteFallbackSolution(id: number): SolutionDTO | null {
  const store = getStore();
  const idx = store.solutions.findIndex((s) => s.id === id);
  if (idx < 0) return null;
  const [removed] = store.solutions.splice(idx, 1);
  return removed;
}

export function upsertFallbackApproachStep(
  data: Omit<ApproachStepDTO, "id"> & { id?: number }
): { item: ApproachStepDTO; before?: ApproachStepDTO } {
  const store = getStore();
  if (data.id) {
    const idx = store.approachSteps.findIndex((a) => a.id === data.id);
    if (idx >= 0) {
      const before = { ...store.approachSteps[idx] };
      const updated: ApproachStepDTO = { ...before, ...data, id: before.id };
      store.approachSteps[idx] = updated;
      return { item: updated, before };
    }
  }
  const created: ApproachStepDTO = { ...data, id: store.nextId++ };
  store.approachSteps.push(created);
  return { item: created };
}

export function upsertFallbackWhyChooseUs(
  data: Omit<WhyChooseUsDTO, "id"> & { id?: number }
): { item: WhyChooseUsDTO; before?: WhyChooseUsDTO } {
  const store = getStore();
  if (data.id) {
    const idx = store.whyChooseUs.findIndex((w) => w.id === data.id);
    if (idx >= 0) {
      const before = { ...store.whyChooseUs[idx] };
      const updated: WhyChooseUsDTO = { ...before, ...data, id: before.id };
      store.whyChooseUs[idx] = updated;
      return { item: updated, before };
    }
  }
  const created: WhyChooseUsDTO = { ...data, id: store.nextId++ };
  store.whyChooseUs.push(created);
  return { item: created };
}

// --- FAQ ---
export function getFallbackFaqItems(): FaqItemDTO[] {
  return [...getStore().faqItems].sort(
    (a, b) => a.sortOrder - b.sortOrder || b.id - a.id
  );
}

export function upsertFallbackFaqItem(
  data: Omit<FaqItemDTO, "id" | "createdAt" | "updatedAt"> & { id?: number }
): { item: FaqItemDTO; before?: FaqItemDTO } {
  const store = getStore();
  const now = new Date().toISOString();
  if (data.id) {
    const idx = store.faqItems.findIndex((f) => f.id === data.id);
    if (idx >= 0) {
      const before = { ...store.faqItems[idx] };
      const updated: FaqItemDTO = { ...before, ...data, id: before.id, updatedAt: now };
      store.faqItems[idx] = updated;
      return { item: updated, before };
    }
  }
  const created: FaqItemDTO = { ...data, id: store.nextId++, createdAt: now, updatedAt: now };
  store.faqItems.push(created);
  return { item: created };
}

export function deleteFallbackFaqItem(id: number): FaqItemDTO | null {
  const store = getStore();
  const idx = store.faqItems.findIndex((f) => f.id === id);
  if (idx < 0) return null;
  const [removed] = store.faqItems.splice(idx, 1);
  return removed;
}
