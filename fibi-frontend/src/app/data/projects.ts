// src/data/projects.ts

/**
 * A project referenced from another project — a master plan seen from one of
 * its components, or a component seen from its master plan. Carries only what
 * a link card shows; follow the id for the rest.
 */
export interface ProjectLink {
  id: string;
  title: string;
  category: string;
  location: string;
  status: string;
  imageUrl: string;
  currency: string;
  minInvestmentMinor: number;
  totalFundingMinor: number;
  currentFundingMinor: number;
  projectedROI: number;
}

export interface Project {
  id: string;
  title: string;
  location: string;
  category: string;
  // Money: integer MINOR units (cents), matching the API. The `Minor` suffix
  // makes a missed call site fail loudly instead of rendering 100x wrong.
  minInvestmentMinor: number;
  totalFundingMinor: number;
  currentFundingMinor: number;
  /** ISO-4217 code this project is denominated in. */
  currency: string;
  investors: number;
  projectedROI: number;
  payoutFrequency: string;
  fundingDeadline: string;
  description: string;
  features: string[];
  imageUrl: string;
  images?: string[]; // Added array for multiple images
  status: 'open' | 'funded' | 'active' | 'closed';
  timeline: { phase: string; status: 'completed' | 'in-progress' | 'upcoming' }[];
  /** Set when this project is one component of a larger development. */
  parentId?: string | null;
  parent?: ProjectLink | null;
  /** Set when this project is a master plan other projects hang off. */
  components?: ProjectLink[];
}

export const projects: Project[] = [
  {
    id: '1',
    title: 'Capsule Houses Eco-Lodge',
    location: 'Kirinyaga, Kenya',
    category: 'eco-lodge',
    minInvestmentMinor: 50000,
    totalFundingMinor: 45000000,
    currentFundingMinor: 31500000,
    currency: 'USD',
    investors: 142,
    projectedROI: 12.5,
    payoutFrequency: 'Monthly',
    fundingDeadline: '2026-04-15',
    description:
      'Premium eco-lodge featuring 12 luxury cabins in a serene natural environment. Sustainable design with solar power, rainwater harvesting, and organic farm-to-table dining.',
    features: [
      '12 luxury eco-cabins',
      '100% solar powered',
      'Organic farm-to-table restaurant',
      'Nature tours',
      'Year-round tourism demand',
    ],
    imageUrl:
      '/images/capsule1.jpg',
    images: [
      '/images/capsule1.jpg',
      '/images/capsule2.jpg',
      '/images/capsule3.jpg',
      '/images/capsule4.png',
      '/images/capsule5.jpg',
      '/images/capsule6.jpg',
      '/images/capsule7.png',
      '/images/capsule10.jpg',
      '/images/capsule12.jpeg',
      '/images/capsule13.jpg',
      '/images/capsule14.jpg',
    ],
    status: 'open',
    timeline: [
      { phase: 'Land Acquisition', status: 'completed' },
      { phase: 'Environmental Permits', status: 'completed' },
      { phase: 'Construction', status: 'in-progress' },
      { phase: 'Operations', status: 'upcoming' },
    ],
  },
  {
    id: '2',
    title: 'Solar Roofs Initiative',
    location: 'Kenya',
    category: 'solar-roof',
    minInvestmentMinor: 100000,
    totalFundingMinor: 120000000,
    currentFundingMinor: 96000000,
    currency: 'USD',
    investors: 218,
    projectedROI: 9.8,
    payoutFrequency: 'Quarterly',
    fundingDeadline: '2026-03-30',
    description:
      'Large-scale solar roof installations supplying clean energy to homes and businesses across Kenya.',
    features: [
      'Residential & commercial installations',
      'Long-term energy contracts',
      'Government incentives',
      'Low maintenance costs',
      'Clean renewable energy',
    ],
    imageUrl:
      'https://images.unsplash.com/photo-1657688332253-9b4eb735d6d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    status: 'open',
    timeline: [
      { phase: 'Site Assessment', status: 'completed' },
      { phase: 'Grid Approval', status: 'completed' },
      { phase: 'Installation Phase', status: 'in-progress' },
      { phase: 'Energy Production', status: 'upcoming' },
    ],
  },
  {
    id: '3',
    title: 'Mt. Kenya Avocado Farm',
    location: 'Nyeri County, Kenya',
    category: 'agriculture',
    minInvestmentMinor: 75000,
    totalFundingMinor: 65000000,
    currentFundingMinor: 45500000,
    currency: 'USD',
    investors: 176,
    projectedROI: 14.3,
    payoutFrequency: 'Monthly',
    fundingDeadline: '2026-05-20',
    description:
      'Commercial avocado farming project located in the fertile highlands near Mt. Kenya. Focused on export-grade Hass avocados with strong international demand.',
    features: [
      'Export-grade Hass avocados',
      'Fertile volcanic soils',
      'Strong global demand',
      'Modern irrigation systems',
      'Sustainable farming practices',
    ],
    imageUrl:
      '/images/avocado2.jpeg',
    images: [
      '/images/avocado1.jpeg',
      '/images/avocado2.jpeg',
      '/images/avocado3.jpeg',
      '/images/avocado4.jpeg',
      '/images/avocado5.jpeg',
    ],

    status: 'open',
    timeline: [
      { phase: 'Land Preparation', status: 'completed' },
      { phase: 'Irrigation Installation', status: 'in-progress' },
      { phase: 'First Harvest', status: 'upcoming' },
      { phase: 'Export Operations', status: 'upcoming' },
    ],
  },
];

// Mock user investments for Dashboard demo
export const mockUserInvestments = [
  {
    projectId: '1',
    projectTitle: 'Capsule Houses Eco-Lodge',
    amountInvested: 5000,
    currentValue: 5250,
    totalReturns: 250,
    status: 'active',
    investmentDate: '2026-01-10',
  },
  {
    projectId: '2',
    projectTitle: 'Solar Roofs Initiative',
    amountInvested: 2000,
    currentValue: 2180,
    totalReturns: 180,
    status: 'active',
    investmentDate: '2026-01-15',
  },
  {
    projectId: '3',
    projectTitle: 'Mt. Kenya Avocado Farm',
    amountInvested: 1500,
    currentValue: 1720,
    totalReturns: 220,
    status: 'pending',
    investmentDate: '2026-01-20',
  },
];