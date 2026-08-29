require("dotenv/config");
const { prisma } = require("../config/db");
const { ciandaMasterPlan } = require("./data/cianda-master-plan");

const projectSeeds = [
  {
    title: "Capsule Houses Eco-Lodge",
    location: "Kirinyaga, Kenya",
    category: "eco-lodge",
    minInvestmentMinor: 50000n,
    totalFundingMinor: 45000000n,
    currentFundingMinor: 31500000n,
    investorsCount: 142,
    projectedROI: 12.5,
    payoutFrequency: "Monthly",
    fundingDeadline: new Date("2026-12-15"),
    description:
      "Premium eco-lodge featuring 12 luxury cabins in a serene natural environment with strong eco-tourism demand.",
    features: [
      "12 luxury eco-cabins",
      "100% solar powered",
      "Organic farm-to-table restaurant",
      "Nature tours",
      "Year-round tourism demand",
    ],
    imageUrl: "/images/capsule1.jpg",
    images: [
      "/images/capsule1.jpg",
      "/images/capsule2.jpg",
      "/images/capsule3.jpg",
      "/images/capsule4.png",
    ],
    status: "open",
    timeline: [
      { phase: "Land Acquisition", status: "completed" },
      { phase: "Environmental Permits", status: "completed" },
      { phase: "Construction", status: "in_progress" },
      { phase: "Operations", status: "upcoming" },
    ],
  },
  {
    title: "Solar Roofs Initiative",
    location: "Kenya",
    category: "solar-roof",
    minInvestmentMinor: 100000n,
    totalFundingMinor: 120000000n,
    currentFundingMinor: 96000000n,
    investorsCount: 218,
    projectedROI: 9.8,
    payoutFrequency: "Quarterly",
    fundingDeadline: new Date("2026-11-30"),
    description:
      "Large-scale solar roof installations supplying clean energy to homes and businesses across Kenya.",
    features: [
      "Residential and commercial installations",
      "Long-term energy contracts",
      "Government incentives",
      "Low maintenance costs",
      "Renewable energy impact",
    ],
    imageUrl:
      "https://images.unsplash.com/photo-1657688332253-9b4eb735d6d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    images: [
      "https://images.unsplash.com/photo-1657688332253-9b4eb735d6d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    ],
    status: "open",
    timeline: [
      { phase: "Site Assessment", status: "completed" },
      { phase: "Grid Approval", status: "completed" },
      { phase: "Installation Phase", status: "in_progress" },
      { phase: "Energy Production", status: "upcoming" },
    ],
  },
  {
    title: "Mt. Kenya Avocado Farm",
    location: "Nyeri County, Kenya",
    category: "agriculture",
    minInvestmentMinor: 75000n,
    totalFundingMinor: 65000000n,
    currentFundingMinor: 45500000n,
    investorsCount: 176,
    projectedROI: 14.3,
    payoutFrequency: "Monthly",
    fundingDeadline: new Date("2026-12-20"),
    description:
      "Commercial avocado farming focused on export-grade Hass avocados with reliable international demand.",
    features: [
      "Export-grade Hass avocados",
      "Modern irrigation systems",
      "Strong global demand",
      "Sustainable farming practices",
    ],
    imageUrl: "/images/avocado2.jpeg",
    images: [
      "/images/avocado1.jpeg",
      "/images/avocado2.jpeg",
      "/images/avocado3.jpeg",
    ],
    status: "open",
    timeline: [
      { phase: "Land Preparation", status: "completed" },
      { phase: "Irrigation Installation", status: "in_progress" },
      { phase: "First Harvest", status: "upcoming" },
      { phase: "Export Operations", status: "upcoming" },
    ],
  },
  {
    title: "Msambweni 2700-Acre Coastal Parcel",
    location: "Msambweni, Kwale County",
    category: "bulk-parcel",
    minInvestmentMinor: 10000000n,
    totalFundingMinor: 810000000000n,
    currentFundingMinor: 0n,
    investorsCount: 0,
    projectedROI: 18.5,
    payoutFrequency: "Quarterly",
    fundingDeadline: new Date("2027-06-30"),
    description:
      "2,700-acre mixed coastal parcel (beach plus inland) ideal for phased hospitality, mixed-use and strategic land banking.",
    features: [
      "Large coastal frontage",
      "Beach plus inland mix",
      "Phased development potential",
      "Long-term capital appreciation",
    ],
    imageUrl: "/images/coast-2700.jpg",
    images: ["/images/coast-2700.jpg"],
    status: "open",
    timeline: [
      { phase: "Due Diligence and Survey", status: "in_progress" },
      { phase: "Title and Compliance", status: "upcoming" },
      { phase: "Infrastructure Planning", status: "upcoming" },
    ],
  },
  {
    title: "Dongo Kundu SEZ 940 Acres",
    location: "Dongo Kundu, Mombasa",
    category: "bulk-parcel",
    minInvestmentMinor: 10000000n,
    totalFundingMinor: 376000000000n,
    currentFundingMinor: 0n,
    investorsCount: 0,
    projectedROI: 16.2,
    payoutFrequency: "Quarterly",
    fundingDeadline: new Date("2027-06-30"),
    description:
      "940-acre parcel near Dongo Kundu SEZ positioned for logistics, industrial support, and long-term infrastructure growth.",
    features: [
      "SEZ adjacency",
      "Infrastructure upside",
      "Commercial development potential",
      "Strategic regional location",
    ],
    imageUrl: "/images/dongo-kundu-940.jpg",
    images: ["/images/dongo-kundu-940.jpg"],
    status: "open",
    timeline: [
      { phase: "Market and Zoning Review", status: "in_progress" },
      { phase: "Legal Structuring", status: "upcoming" },
      { phase: "Investor Placement", status: "upcoming" },
    ],
  },
  {
    title: "Msambweni 484-Acre Diversified Coastal Farm",
    location: "Mchingirini, Msambweni",
    category: "agriculture",
    minInvestmentMinor: 10000000n,
    totalFundingMinor: 96800000000n,
    currentFundingMinor: 0n,
    investorsCount: 0,
    projectedROI: 20.1,
    payoutFrequency: "Quarterly",
    fundingDeadline: new Date("2027-09-30"),
    description:
      "Premium 484-acre diversified farm with citrus, grapes, mangoes, coconuts, forestry and irrigated sections. Includes high-value future development optionality.",
    features: [
      "330 acres mature citrus, grapes and mango",
      "2000+ coconut trees",
      "165 acres under irrigation",
      "Commercial forestry and livestock operations",
      "Eco-tourism and carbon-credit potential",
    ],
    imageUrl: "/images/msambweni-484.jpg",
    images: ["/images/msambweni-484.jpg"],
    status: "open",
    timeline: [
      { phase: "Operational Audit", status: "in_progress" },
      { phase: "Yield Optimization Plan", status: "upcoming" },
      { phase: "Expansion and Value-Add", status: "upcoming" },
    ],
  },
  {
    title: "Mtwapa Jumba la Mtwana Beach Plot 11.5 Acres",
    location: "Mtwapa, Kilifi County",
    category: "coastal-beach",
    minInvestmentMinor: 10000000n,
    totalFundingMinor: 57500000000n,
    currentFundingMinor: 0n,
    investorsCount: 0,
    projectedROI: 17.4,
    payoutFrequency: "Quarterly",
    fundingDeadline: new Date("2027-06-30"),
    description:
      "11.5-acre prime beach plot at Jumba la Mtwana corridor with high hospitality and luxury residential development potential.",
    features: [
      "Prime beach corridor",
      "Luxury development suitability",
      "Tourism demand area",
      "Strong appreciation profile",
    ],
    imageUrl: "/images/mtwapa-11-5.jpg",
    images: ["/images/mtwapa-11-5.jpg"],
    status: "open",
    timeline: [
      { phase: "Coastal Survey and EIA", status: "in_progress" },
      { phase: "Master Planning", status: "upcoming" },
      { phase: "Project Structuring", status: "upcoming" },
    ],
  },
  {
    title: "Vipingo Beach 167 Acres",
    location: "Vipingo, Kilifi County",
    category: "coastal-beach",
    minInvestmentMinor: 10000000n,
    totalFundingMinor: 250500000000n,
    currentFundingMinor: 0n,
    investorsCount: 0,
    projectedROI: 16.8,
    payoutFrequency: "Quarterly",
    fundingDeadline: new Date("2027-07-31"),
    description:
      "167-acre coastal beach parcel in Vipingo suitable for integrated resort and high-end mixed-use development.",
    features: [
      "Extensive beach frontage",
      "High-end mixed-use potential",
      "Premium coastal market",
      "Institutional-scale acreage",
    ],
    imageUrl: "/images/vipingo-167.jpg",
    images: ["/images/vipingo-167.jpg"],
    status: "open",
    timeline: [
      { phase: "Site Feasibility", status: "in_progress" },
      { phase: "Capital Structuring", status: "upcoming" },
      { phase: "Phase 1 Delivery", status: "upcoming" },
    ],
  },
  {
    title: "Makuyu 613.5-Acre Agricultural Estate",
    location: "Makuyu, Muranga County",
    category: "agriculture",
    minInvestmentMinor: 5000000n,
    totalFundingMinor: 245400000000n,
    currentFundingMinor: 0n,
    investorsCount: 0,
    projectedROI: 15.2,
    payoutFrequency: "Quarterly",
    fundingDeadline: new Date("2027-08-31"),
    description:
      "613.5-acre large-scale agricultural estate near highway access on tarmac, suitable for high-yield commercial farming.",
    features: [
      "Large contiguous acreage",
      "Tarmac and highway proximity",
      "Commercial scale farming",
      "Strong food-chain demand",
    ],
    imageUrl: "/images/makuyu-613.jpg",
    images: ["/images/makuyu-613.jpg"],
    status: "open",
    timeline: [
      { phase: "Soil and Water Assessment", status: "in_progress" },
      { phase: "Crop Program Setup", status: "upcoming" },
      { phase: "Harvest Cycle Launch", status: "upcoming" },
    ],
  },
  {
    title: "Muhoroni 960-Acre Sugarcane Farm",
    location: "Muhoroni, Kisumu County",
    category: "agriculture",
    minInvestmentMinor: 5000000n,
    totalFundingMinor: 172800000000n,
    currentFundingMinor: 0n,
    investorsCount: 0,
    projectedROI: 14.7,
    payoutFrequency: "Quarterly",
    fundingDeadline: new Date("2027-08-31"),
    description:
      "960-acre sugarcane farm investment with scale, established crop suitability and reliable off-take market potential.",
    features: [
      "960 acres under cane potential",
      "Large-scale row-crop economics",
      "Regional off-take demand",
      "Scalable irrigation opportunities",
    ],
    imageUrl: "/images/muhoroni-960.jpg",
    images: ["/images/muhoroni-960.jpg"],
    status: "open",
    timeline: [
      { phase: "Land Prep and Inputs", status: "in_progress" },
      { phase: "Planting and Management", status: "upcoming" },
      { phase: "First Harvest Contracting", status: "upcoming" },
    ],
  },
  {
    title: "Kwale Mackinnon 52,000-Acre Mega Agricultural Block",
    location: "Mackinnon, Kwale County",
    category: "agriculture",
    minInvestmentMinor: 5000000n,
    totalFundingMinor: 1144000000000n,
    currentFundingMinor: 0n,
    investorsCount: 0,
    projectedROI: 19.8,
    payoutFrequency: "Bi-Annual",
    fundingDeadline: new Date("2027-12-31"),
    description:
      "52,000-acre mega agricultural block for long-horizon food, fodder and industrial crop programs with exceptional scale economics.",
    features: [
      "Ultra-large contiguous block",
      "Low acquisition base",
      "Fodder and staple crop suitability",
      "Massive scale development optionality",
    ],
    imageUrl: "/images/mackinnon-52000.jpg",
    images: ["/images/mackinnon-52000.jpg"],
    status: "open",
    timeline: [
      { phase: "Master Agronomic Planning", status: "in_progress" },
      { phase: "Infrastructure Rollout", status: "upcoming" },
      { phase: "Scaled Production", status: "upcoming" },
    ],
  },
  {
    title: "Nguruman Magadi 9,000-Acre Riverfront Block",
    location: "Near Magadi Township, Kajiado County",
    category: "agriculture",
    minInvestmentMinor: 5000000n,
    totalFundingMinor: 315000000000n,
    currentFundingMinor: 0n,
    investorsCount: 0,
    projectedROI: 18.9,
    payoutFrequency: "Quarterly",
    fundingDeadline: new Date("2027-10-31"),
    description:
      "9,000-acre contiguous riverfront parcel (5,000 + 4,000 acres) near Magadi with freehold titles, irrigation potential and strong nearby livestock demand.",
    features: [
      "Permanent river frontage",
      "Contiguous 9000 acres",
      "Near airstrip and KWS security",
      "Virgin fertile land",
      "Freehold titles",
    ],
    imageUrl: "/images/kajiado-9000.jpg",
    images: ["/images/kajiado-9000.jpg"],
    status: "open",
    timeline: [
      { phase: "Hydrology and WARMA Compliance", status: "in_progress" },
      { phase: "Irrigation Reservoir Planning", status: "upcoming" },
      { phase: "Commercial Rollout", status: "upcoming" },
    ],
  },
  {
    title: "Koru Kericho 2000-Acre Sugar Farm",
    location: "Koru, Kericho County",
    category: "agriculture",
    minInvestmentMinor: 5000000n,
    totalFundingMinor: 360000000000n,
    currentFundingMinor: 0n,
    investorsCount: 0,
    projectedROI: 15.5,
    payoutFrequency: "Quarterly",
    fundingDeadline: new Date("2027-09-30"),
    description:
      "2,000-acre sugar farm project with strong processing ecosystem access and stable long-term agricultural cash flow profile.",
    features: [
      "2000-acre commercial sugar block",
      "Established sugar-farming region",
      "Scale-friendly mechanization",
      "Long-term cash flow potential",
    ],
    imageUrl: "/images/koru-2000.jpg",
    images: ["/images/koru-2000.jpg"],
    status: "open",
    timeline: [
      { phase: "Field Development", status: "in_progress" },
      { phase: "Planting Cycle", status: "upcoming" },
      { phase: "Offtake Contracts", status: "upcoming" },
    ],
  },
];

/** Creates one project row plus its timeline phases and gallery images. */
const createProject = (project, parentId = null) => {
  const { timeline, images = [], components: _components, ...projectData } = project;
  return prisma.project.create({
    data: {
      ...projectData,
      parentId,
      timeline: {
        create: timeline,
      },
      projectImages: {
        create: images.map((imageUrl) => ({ imageUrl })),
      },
    },
  });
};

async function seedProjectsOnly() {
  console.log("Seeding projects only...");

  await prisma.timeline.deleteMany();
  await prisma.project.deleteMany();

  for (const project of projectSeeds) {
    await createProject(project);
  }

  // The master plan has to exist before its components can point at it, so it
  // is seeded as a tree rather than another entry in the flat list above.
  const master = await createProject(ciandaMasterPlan);
  for (const component of ciandaMasterPlan.components) {
    await createProject(component, master.id);
  }

  const ciandaCount = 1 + ciandaMasterPlan.components.length;
  console.log(
    `Seed complete. Inserted ${projectSeeds.length + ciandaCount} projects ` +
      `(${ciandaCount} of them the ${ciandaMasterPlan.title} master plan and its components).`
  );
}

seedProjectsOnly()
  .catch((error) => {
    console.error("Project seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
