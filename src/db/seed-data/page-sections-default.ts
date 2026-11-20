export interface DefaultPageSectionSeed {
  pageSlug: string;
  sectionKey: string;
  sectionLabel: string;
  badge?: string | null;
  badgeSubtext?: string | null;
  headline?: string | null;
  highlight?: string | null;
  subtitle?: string | null;
  body?: string | null;
  ctaPrimaryLabel?: string | null;
  ctaPrimaryHref?: string | null;
  ctaSecondaryLabel?: string | null;
  ctaSecondaryHref?: string | null;
  extraData?: Record<string, unknown>;
  isVisible?: boolean;
  sortOrder: number;
}

export const DEFAULT_PAGE_SECTIONS: DefaultPageSectionSeed[] = [
  // ================= HOME =================
  {
    pageSlug: "home",
    sectionKey: "hero",
    sectionLabel: "Home Hero Banner",
    badge: "Versa Morph",
    badgeSubtext: "Transforming Ideas Into Digital Reality →",
    headline: "Transforming Ideas Into",
    highlight: "Digital Reality",
    subtitle:
      "A technology-driven digital solutions company dedicated to helping businesses adapt, evolve, and thrive in the digital era.",
    ctaPrimaryLabel: "Get Started",
    ctaPrimaryHref: "/contact",
    ctaSecondaryLabel: "Explore Projects →",
    ctaSecondaryHref: "/portfolio",
    extraData: {
      mobileBadgeSubtext: "Build the Future →",
      mobileHeadline: "Build the",
      mobileHighlight: "Future",
      techBarLabel: "Built With Modern Tech",
    },
    isVisible: true,
    sortOrder: 1,
  },
  {
    pageSlug: "home",
    sectionKey: "services_header",
    sectionLabel: "Home Services Header",
    badge: "What We Do",
    headline: "End-to-End",
    highlight: "Technology Services",
    subtitle:
      "We provide comprehensive technology solutions designed to support businesses at every stage of their digital journey.",
    isVisible: true,
    sortOrder: 2,
  },
  {
    pageSlug: "home",
    sectionKey: "why_choose_header",
    sectionLabel: "Home Why Choose Us Header",
    badge: "Why Choose Versa Morph",
    headline: "Your Partner in",
    highlight: "Digital Transformation",
    subtitle:
      "We focus on solving business challenges, not just delivering technology. From consulting and design to development and maintenance, we are committed to your long-term success.",
    isVisible: true,
    sortOrder: 3,
  },
  {
    pageSlug: "home",
    sectionKey: "approach_header",
    sectionLabel: "Home Our Approach Header",
    badge: "Our Approach",
    headline: "How We",
    highlight: "Deliver",
    subtitle:
      "A proven methodology that ensures successful digital transformation from start to finish.",
    isVisible: true,
    sortOrder: 4,
  },
  {
    pageSlug: "home",
    sectionKey: "featured_projects_header",
    sectionLabel: "Home Featured Projects Header",
    badge: "Portfolio",
    headline: "Featured",
    highlight: "Projects",
    subtitle:
      "A selection of our most impactful work across industries and technologies.",
    ctaPrimaryLabel: "View All Projects →",
    ctaPrimaryHref: "/portfolio",
    isVisible: true,
    sortOrder: 5,
  },
  {
    pageSlug: "home",
    sectionKey: "testimonials_header",
    sectionLabel: "Home Testimonials Header",
    badge: "Testimonials",
    headline: "What Our",
    highlight: "Clients Say",
    subtitle: "Real feedback from real partnerships.",
    isVisible: true,
    sortOrder: 6,
  },
  {
    pageSlug: "home",
    sectionKey: "blog_header",
    sectionLabel: "Home Blog Highlights Header",
    badge: "Blog",
    headline: "Latest",
    highlight: "Insights",
    subtitle:
      "Thoughts on technology, digital transformation, and building the future.",
    ctaPrimaryLabel: "Read All Articles →",
    ctaPrimaryHref: "/blog",
    isVisible: true,
    sortOrder: 7,
  },
  {
    pageSlug: "home",
    sectionKey: "cta_banner",
    sectionLabel: "Home Bottom CTA Banner",
    headline: "Ready to Transform Your",
    highlight: "Business?",
    subtitle:
      "Let's discuss how Versa Morph can help you adapt, innovate, and evolve in the digital era.",
    ctaPrimaryLabel: "Schedule a Consultation",
    ctaPrimaryHref: "/contact",
    ctaSecondaryLabel: "Explore Our Services →",
    ctaSecondaryHref: "/services",
    isVisible: true,
    sortOrder: 8,
  },

  // ================= ABOUT =================
  {
    pageSlug: "about",
    sectionKey: "hero",
    sectionLabel: "About Hero Banner",
    badge: "About Us",
    badgeSubtext: "Our Journey →",
    headline: "Transforming Ideas Into",
    highlight: "Digital Reality",
    subtitle:
      "A technology-driven digital solutions company dedicated to helping businesses adapt, evolve, and thrive in the digital era.",
    ctaPrimaryLabel: "Read Our Story",
    ctaPrimaryHref: "#company-story",
    ctaSecondaryLabel: "Join The Team",
    ctaSecondaryHref: "/contact",
    isVisible: true,
    sortOrder: 1,
  },
  {
    pageSlug: "about",
    sectionKey: "story",
    sectionLabel: "Story Behind Our Name",
    badge: "About Versa Morph",
    headline: "The Story Behind",
    highlight: "Our Name",
    extraData: {
      paragraphs: [
        "The name Versa Morph reflects our core philosophy. Versa represents versatility, flexibility, and adaptability. Morph represents transformation, evolution, and continuous innovation.",
        "Together, Versa Morph embodies our mission to help organizations transform their vision into impactful digital experiences through strategic technology implementation.",
        "A technology-driven digital solutions company dedicated to helping businesses adapt, evolve, and thrive in the digital era.",
        "We believe technology should not only solve today's challenges but also prepare businesses for tomorrow's opportunities.",
      ],
    },
    isVisible: true,
    sortOrder: 2,
  },
  {
    pageSlug: "about",
    sectionKey: "vision_mission",
    sectionLabel: "Vision & Mission Cards",
    headline: "Our Vision",
    highlight: "Our Mission",
    body: "To become a trusted global technology partner that empowers organizations through innovation, digital transformation, and sustainable technological advancement.",
    extraData: {
      missionItems: [
        "Deliver high-quality technology solutions that drive measurable business value.",
        "Help organizations accelerate their digital transformation journey.",
        "Foster innovation through modern technologies and strategic thinking.",
        "Build long-term partnerships based on trust, excellence, and collaboration.",
        "Create scalable solutions that grow alongside our clients' businesses.",
      ],
    },
    isVisible: true,
    sortOrder: 3,
  },
  {
    pageSlug: "about",
    sectionKey: "values_header",
    sectionLabel: "Core Values Section Header",
    badge: "Core Values",
    headline: "What Drives",
    highlight: "Us",
    subtitle:
      "The principles that guide every line of code we write and every piece of hardware we configure.",
    isVisible: true,
    sortOrder: 4,
  },
  {
    pageSlug: "about",
    sectionKey: "industries_header",
    sectionLabel: "Industries Section Header & List",
    badge: "Industries",
    headline: "Industries We",
    highlight: "Serve",
    subtitle:
      "We serve organizations across multiple industries with tailored technology solutions.",
    extraData: {
      industries: [
        "Technology & Software",
        "Financial Services",
        "Healthcare",
        "Manufacturing",
        "Logistics & Supply Chain",
        "Education",
        "Government & Public Sector",
        "Agriculture",
        "Retail & E-Commerce",
        "Professional Services",
        "Telecommunications",
        "Energy & Utilities",
      ],
    },
    isVisible: true,
    sortOrder: 5,
  },
  {
    pageSlug: "about",
    sectionKey: "cta_banner",
    sectionLabel: "About Commitment CTA Banner",
    headline: "Our",
    highlight: "Commitment",
    subtitle:
      "At Versa Morph, we are committed to helping businesses transform challenges into opportunities through technology. We believe that successful digital transformation requires more than technical expertise: it requires vision, innovation, and a trusted partner dedicated to long-term success.",
    isVisible: true,
    sortOrder: 6,
  },

  // ================= SERVICES =================
  {
    pageSlug: "services",
    sectionKey: "hero",
    sectionLabel: "Services Hero Banner",
    badge: "Services",
    badgeSubtext: "What We Deliver",
    headline: "Comprehensive",
    highlight: "Technology Services",
    subtitle:
      "From strategy to execution, we deliver end-to-end technology solutions that help businesses transform, scale, and succeed in the digital age.",
    isVisible: true,
    sortOrder: 1,
  },
  {
    pageSlug: "services",
    sectionKey: "process_header",
    sectionLabel: "Services Process Header",
    badge: "How We Work",
    headline: "Our",
    highlight: "Process",
    subtitle:
      "A proven methodology refined through hundreds of successful engagements.",
    isVisible: true,
    sortOrder: 2,
  },
  {
    pageSlug: "services",
    sectionKey: "cta_banner",
    sectionLabel: "Services Bottom CTA Banner",
    headline: "Need a Custom Solution?",
    highlight: "Let's Talk",
    subtitle:
      "Describe your project and we'll put together a tailored proposal within 48 hours.",
    ctaPrimaryLabel: "Start Your Project",
    ctaPrimaryHref: "/contact",
    ctaSecondaryLabel: "View Our Work →",
    ctaSecondaryHref: "/portfolio",
    isVisible: true,
    sortOrder: 3,
  },

  // ================= SOLUTIONS =================
  {
    pageSlug: "solutions",
    sectionKey: "hero",
    sectionLabel: "Solutions Hero Banner",
    badge: "Solutions",
    badgeSubtext: "Tailored for Impact",
    headline: "Solutions That",
    highlight: "Drive Change",
    subtitle:
      "Purpose-built solutions designed to address specific business challenges and unlock new opportunities for growth and efficiency.",
    isVisible: true,
    sortOrder: 1,
  },
  {
    pageSlug: "solutions",
    sectionKey: "cta_banner",
    sectionLabel: "Solutions Bottom CTA Banner",
    headline: "Ready to Start Your",
    highlight: "Transformation?",
    subtitle:
      "Schedule a free consultation and discover how our solutions can address your unique challenges.",
    ctaPrimaryLabel: "Book a Consultation",
    ctaPrimaryHref: "/contact",
    ctaSecondaryLabel: "Explore Services →",
    ctaSecondaryHref: "/services",
    isVisible: true,
    sortOrder: 2,
  },

  // ================= PORTFOLIO =================
  {
    pageSlug: "portfolio",
    sectionKey: "hero",
    sectionLabel: "Portfolio Hero Banner",
    badge: "Portfolio",
    badgeSubtext: "Proven Results",
    headline: "Work That",
    highlight: "Speaks",
    subtitle:
      "Explore a selection of our most impactful projects spanning software, hardware, and AI integration for enterprises across various industries.",
    isVisible: true,
    sortOrder: 1,
  },

  // ================= PRICING =================
  {
    pageSlug: "pricing",
    sectionKey: "hero",
    sectionLabel: "Pricing Hero Banner",
    badge: "Pricing",
    badgeSubtext: "Transparent & Flexible",
    headline: "Plans That",
    highlight: "Scale With You",
    subtitle:
      "No hidden fees, no lock-in contracts. Choose the plan that fits your stage and upgrade as you grow.",
    isVisible: true,
    sortOrder: 1,
  },
  {
    pageSlug: "pricing",
    sectionKey: "not_included",
    sectionLabel: "Pricing What's Not Included",
    badge: "Notes",
    headline: "What's Not",
    highlight: "Included",
    subtitle:
      "These items are scoped separately and quoted based on your specific needs.",
    extraData: {
      items: [
        "Third-party licensing fees",
        "Hardware procurement costs",
        "Ongoing hosting infrastructure",
        "Extended post-launch support beyond included period",
        "Additional revision cycles beyond plan limits",
        "Third-party API usage fees",
      ],
    },
    isVisible: true,
    sortOrder: 2,
  },
  {
    pageSlug: "pricing",
    sectionKey: "cta_banner",
    sectionLabel: "Pricing Bottom CTA Banner",
    headline: "Need a Custom",
    highlight: "Solution?",
    subtitle:
      "Every project is unique. Contact us for a tailored proposal that matches your specific requirements.",
    ctaPrimaryLabel: "Get a Custom Quote",
    ctaPrimaryHref: "/contact",
    ctaSecondaryLabel: "View Services →",
    ctaSecondaryHref: "/services",
    isVisible: true,
    sortOrder: 3,
  },

  // ================= CALCULATOR =================
  {
    pageSlug: "calculator",
    sectionKey: "hero",
    sectionLabel: "Calculator Hero Banner",
    badge: "Estimator",
    badgeSubtext: "Interactive Project Scoping",
    headline: "Cost & Timeline",
    highlight: "Estimator",
    subtitle:
      "Select your service type, choose your project scale, and select required addons to get a real-time range estimation.",
    extraData: {
      disclaimerTitle: "Disclaimer:",
      disclaimerBody:
        "The prices displayed are initial estimates only. Actual costs may adjust (increase or decrease) based on the detailed project scope agreed upon during consulting.",
    },
    isVisible: true,
    sortOrder: 1,
  },

  // ================= BLOG =================
  {
    pageSlug: "blog",
    sectionKey: "hero",
    sectionLabel: "Blog Hero & Search Header",
    badge: "Blog",
    badgeSubtext: "Insights & Perspectives",
    headline: "Our",
    highlight: "Insights",
    subtitle:
      "Thoughts on technology, digital transformation, and building the future, straight from our engineering team.",
    extraData: {
      searchPlaceholder: "Search articles...",
      trendingTags: [
        "AI Integration",
        "Microservices",
        "Edge Computing",
        "IoT",
        "Cybersecurity",
      ],
    },
    isVisible: true,
    sortOrder: 1,
  },
  {
    pageSlug: "blog",
    sectionKey: "newsletter_banner",
    sectionLabel: "Blog Newsletter Box",
    headline: "Subscribe to Our",
    highlight: "Insights",
    subtitle:
      "Get the latest thoughts on software engineering, cloud architecture, edge-telemetry, and industrial IoT solutions delivered straight to your inbox.",
    isVisible: true,
    sortOrder: 2,
  },

  // ================= CAREERS =================
  {
    pageSlug: "careers",
    sectionKey: "hero",
    sectionLabel: "Careers Hero Banner",
    badge: "Careers",
    badgeSubtext: "Join Our Team",
    headline: "Build the Future",
    highlight: "With Us",
    subtitle:
      "We're looking for passionate people who want to work on meaningful technology projects that make a real impact.",
    isVisible: true,
    sortOrder: 1,
  },
  {
    pageSlug: "careers",
    sectionKey: "open_application",
    sectionLabel: "Careers Open Application Card",
    headline: "Don't See the Right Role?",
    subtitle:
      "We're always open to connecting with talented individuals. Tell us about yourself and we'll keep you in mind for future opportunities.",
    isVisible: true,
    sortOrder: 2,
  },
  {
    pageSlug: "careers",
    sectionKey: "cta_banner",
    sectionLabel: "Careers Bottom CTA Banner",
    headline: "Want to Learn More About",
    highlight: "Life at Versa Morph?",
    subtitle:
      "Follow us on LinkedIn for updates on culture, events, and new opportunities.",
    ctaPrimaryLabel: "Follow Us",
    ctaPrimaryHref: "https://linkedin.com/company/versamorph",
    ctaSecondaryLabel: "About Us →",
    ctaSecondaryHref: "/about",
    isVisible: true,
    sortOrder: 3,
  },

  // ================= PARTNERS =================
  {
    pageSlug: "partners",
    sectionKey: "hero",
    sectionLabel: "Partners Hero Banner",
    badge: "Partners",
    badgeSubtext: "Trusted Collaborations",
    headline: "Our Technology",
    highlight: "Partners",
    subtitle:
      "We partner with industry-leading technology providers to deliver enterprise-grade solutions you can trust.",
    isVisible: true,
    sortOrder: 1,
  },
  {
    pageSlug: "partners",
    sectionKey: "become_partner",
    sectionLabel: "Become a Partner Card",
    headline: "Become a Partner",
    subtitle:
      "Interested in joining our ecosystem? Fill out the form below and our partnerships team will get in touch.",
    isVisible: true,
    sortOrder: 2,
  },
  {
    pageSlug: "partners",
    sectionKey: "cta_banner",
    sectionLabel: "Partners Bottom CTA Banner",
    headline: "Interested in Becoming a",
    highlight: "Partner?",
    subtitle:
      "We're always looking to expand our ecosystem with complementary technology providers and service partners.",
    ctaPrimaryLabel: "Reach Out",
    ctaPrimaryHref: "/contact",
    ctaSecondaryLabel: "Learn About Us →",
    ctaSecondaryHref: "/about",
    isVisible: true,
    sortOrder: 3,
  },

  // ================= AFFILIATE =================
  {
    pageSlug: "affiliate",
    sectionKey: "hero",
    sectionLabel: "Affiliate Hero Banner",
    badge: "Partnership",
    badgeSubtext: "Affiliate Program Loop",
    headline: "Refer Projects.",
    highlight: "Earn Commissions.",
    subtitle:
      "Partner with Versa Morph as a Growth Affiliate. Refer businesses looking for enterprise software, mobile apps, or cloud migrations, and earn 5% to 10% commission on every successfully closed contract.",
    ctaPrimaryLabel: "Join Affiliate Program",
    ctaPrimaryHref: "#register",
    ctaSecondaryLabel: "Submit Client Project",
    ctaSecondaryHref: "/affiliate/submit-project",
    isVisible: true,
    sortOrder: 1,
  },
  {
    pageSlug: "affiliate",
    sectionKey: "workflow",
    sectionLabel: "Affiliate Program 4-Step Workflow",
    badge: "Workflow",
    headline: "How the Program Works",
    extraData: {
      steps: [
        {
          num: "01",
          title: "Submit Application",
          desc: "Fill out our brief registration form below outlining your target audience or channels.",
        },
        {
          num: "02",
          title: "Get Onboarded",
          desc: "Receive your unique referral ID code along with our branding portfolio & marketing kits.",
        },
        {
          num: "03",
          title: "Refer Clients",
          desc: "Share your referral link or introduce clients via the project cost estimator / email.",
        },
        {
          num: "04",
          title: "Earn Payouts",
          desc: "Receive 5% to 10% of the total closed contract value paid out sequentially as client invoices clear.",
        },
      ],
    },
    isVisible: true,
    sortOrder: 2,
  },
  {
    pageSlug: "affiliate",
    sectionKey: "register_form",
    sectionLabel: "Affiliate Registration Card Header",
    headline: "Partner Registration Form",
    subtitle:
      "Fill in the details below to register your interest. Our growth team will reach out within 2-3 business days.",
    isVisible: true,
    sortOrder: 3,
  },

  // ================= CONTACT =================
  {
    pageSlug: "contact",
    sectionKey: "hero",
    sectionLabel: "Contact Hero & Copy",
    badge: "Let's Connect",
    headline: "Initiate.",
    highlight: "The Future.",
    subtitle:
      "Whether you're looking to accelerate digital transformation, build custom software, design mobile apps, or leverage AI solutions, our team is ready to architect your vision.",
    isVisible: true,
    sortOrder: 1,
  },
  {
    pageSlug: "contact",
    sectionKey: "contact_info",
    sectionLabel: "Contact Details & Map Embed",
    headline: "Email Us",
    subtitle: "Expect a response within 24 hours.",
    body: "SCBD Tower, 12th Floor\nJakarta Selatan, Indonesia",
    extraData: {
      hqTitle: "Headquarters",
      mapsEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.3!2d106.8!3d-6.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTInMDAuMCJTIDEwNsKwNDgnMDAuMCJF!5e0!3m2!1sen!2sid!4v1",
    },
    isVisible: true,
    sortOrder: 2,
  },

  // ================= TEAM =================
  {
    pageSlug: "team",
    sectionKey: "hero",
    sectionLabel: "Team Hero Banner",
    badge: "Founders",
    badgeSubtext: "Built by Two, Engineered for Many",
    headline: "Meet the",
    highlight: "Founders",
    subtitle:
      "Two founders leading an extended team of engineers, designers, and technology specialists across Indonesia and beyond.",
    isVisible: true,
    sortOrder: 1,
  },
  {
    pageSlug: "team",
    sectionKey: "extended_team",
    sectionLabel: "Extended Team Network",
    badge: "Extended Team",
    headline: "Backed by a",
    highlight: "Growing Team",
    subtitle:
      "Beyond our two founders, we work with a curated network of 50+ professionals across Indonesia. This lets us scale teams up or down instantly based on your project needs.",
    body: "50+ professionals ready to support your project.",
    extraData: {
      roles: [
        "UI/UX Designer",
        "Frontend Engineer",
        "Backend Engineer",
        "Mobile Developer",
        "DevOps Engineer",
        "AI/ML Engineer",
        "QA Engineer",
        "Project Manager",
        "Business Analyst",
        "Cybersecurity Specialist",
        "Data Engineer",
        "Technical Writer",
        "Cloud Architect",
        "Scrum Master",
        "Product Designer",
        "Database Administrator",
      ],
    },
    isVisible: true,
    sortOrder: 2,
  },
  {
    pageSlug: "team",
    sectionKey: "story_stats",
    sectionLabel: "Two Founders, One Vision Stats",
    badge: "Our Story",
    headline: "Two Founders, One",
    highlight: "Vision",
    subtitle:
      "Versa Morph was built on the belief that great technology starts with great people. As a founder-led company with an extensive network of specialists, we bring hands-on expertise and personal commitment to every project, scaled precisely to your needs.",
    extraData: {
      stats: [
        { num: "150+", label: "Enterprise Clients Served" },
        { num: "8+", label: "Years of Combined Experience" },
        { num: "12+", label: "Industries Covered" },
        { num: "99.9%", label: "Client Satisfaction Rate" },
      ],
    },
    isVisible: true,
    sortOrder: 3,
  },
  {
    pageSlug: "team",
    sectionKey: "cta_banner",
    sectionLabel: "Team Bottom CTA Banner",
    headline: "Ready to Work With",
    highlight: "Us?",
    subtitle:
      "Let's discuss how Versa Morph can help bring your vision to life.",
    ctaPrimaryLabel: "Start a Conversation",
    ctaPrimaryHref: "/contact",
    ctaSecondaryLabel: "Learn Our Story →",
    ctaSecondaryHref: "/about",
    isVisible: true,
    sortOrder: 4,
  },

  // ================= FAQ =================
  {
    pageSlug: "faq",
    sectionKey: "hero",
    sectionLabel: "FAQ Hero Banner",
    badge: "FAQ",
    badgeSubtext: "Got Questions?",
    headline: "Frequently Asked",
    highlight: "Questions",
    subtitle:
      "Everything you need to know about working with us. Can't find what you're looking for? Feel free to reach out.",
    isVisible: true,
    sortOrder: 1,
  },
  {
    pageSlug: "faq",
    sectionKey: "still_have_questions",
    sectionLabel: "FAQ Still Have Questions Box",
    headline: "Still Have Questions?",
    subtitle:
      "We're here to help. Contact our team and we'll get back to you within 24 hours.",
    ctaPrimaryLabel: "Contact Us",
    ctaPrimaryHref: "/contact",
    isVisible: true,
    sortOrder: 2,
  },
  {
    pageSlug: "faq",
    sectionKey: "cta_banner",
    sectionLabel: "FAQ Bottom CTA Banner",
    headline: "Ready to Start Your",
    highlight: "Project?",
    subtitle:
      "Let's discuss how Versa Morph can help you achieve your technology goals.",
    ctaPrimaryLabel: "Schedule a Consultation",
    ctaPrimaryHref: "/contact",
    ctaSecondaryLabel: "Explore Services →",
    ctaSecondaryHref: "/services",
    isVisible: true,
    sortOrder: 3,
  },

  // ================= GLOBAL =================
  {
    pageSlug: "global",
    sectionKey: "footer",
    sectionLabel: "Global Footer Headings & Copy",
    headline: "Versa Morph",
    subtitle:
      "A technology-driven digital solutions company dedicated to helping businesses adapt, evolve, and thrive in the digital era.",
    extraData: {
      servicesHeading: "Services",
      companyHeading: "Company",
      contactHeading: "Contact",
      contactSalesLabel: "Contact Sales",
    },
    isVisible: true,
    sortOrder: 1,
  },
];

export function buildDefaultSnapshot(
  seed: DefaultPageSectionSeed
): Record<string, unknown> {
  return {
    badge: seed.badge ?? null,
    badgeSubtext: seed.badgeSubtext ?? null,
    headline: seed.headline ?? null,
    highlight: seed.highlight ?? null,
    subtitle: seed.subtitle ?? null,
    body: seed.body ?? null,
    ctaPrimaryLabel: seed.ctaPrimaryLabel ?? null,
    ctaPrimaryHref: seed.ctaPrimaryHref ?? null,
    ctaSecondaryLabel: seed.ctaSecondaryLabel ?? null,
    ctaSecondaryHref: seed.ctaSecondaryHref ?? null,
    extraData: seed.extraData ?? {},
    isVisible: seed.isVisible ?? true,
  };
}
