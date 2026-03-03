// src/data/projects.ts

export interface Project {
  id: string;
  title: string;
  location: string;
  category: string;
  minInvestment: number;
  totalFunding: number;
  currentFunding: number;
  investors: number;
  projectedROI: number;
  payoutFrequency: string;
  fundingDeadline: string;
  description: string;
  features: string[];
  imageUrl: string;
  images?: string[]; // Added array for multiple images
  status: 'open' | 'funded' | 'active';
  timeline: { phase: string; status: 'completed' | 'in-progress' | 'upcoming' }[];
}

export const projects: Project[] = [
  {
    id: '1',
    title: 'Capsule Houses Eco-Lodge',
    location: 'Kirinyaga, Kenya',
    category: 'eco-lodge',
    minInvestment: 500,
    totalFunding: 450000,
    currentFunding: 315000,
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
    category: 'solar-farm',
    minInvestment: 1000,
    totalFunding: 1200000,
    currentFunding: 960000,
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
    id: '4',
    title: 'Mt. Kenya Avocado Farm',
    location: 'Nyeri County, Kenya',
    category: 'agriculture',
    minInvestment: 750,
    totalFunding: 650000,
    currentFunding: 455000,
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
      'https://images.unsplash.com/photo-1758524056596-af1c19797d01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
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
    projectId: '4',
    projectTitle: 'Mt. Kenya Avocado Farm',
    amountInvested: 1500,
    currentValue: 1720,
    totalReturns: 220,
    status: 'pending',
    investmentDate: '2026-01-20',
  },
];