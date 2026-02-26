export interface Project {
  id: string;
  title: string;
  location: string;
  category: 'eco-lodge' | 'solar-farm' | 'agroforestry' | 'agriculture';
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
  status: 'open' | 'funded' | 'active';
  timeline: {
    phase: string;
    status: 'completed' | 'in-progress' | 'upcoming';
  }[];
}

export const projects: Project[] = [
  {
    id: '1',
    title: 'Costa Verde Eco-Lodge Development',
    location: 'Costa Rica',
    category: 'eco-lodge',
    minInvestment: 500,
    totalFunding: 450000,
    currentFunding: 315000,
    investors: 142,
    projectedROI: 12.5,
    payoutFrequency: 'Monthly',
    fundingDeadline: '2026-04-15',
    description: 'Premium eco-lodge featuring 12 luxury cabins in the heart of Costa Rica\'s rainforest. Sustainable design with solar power, rainwater harvesting, and organic farm-to-table dining.',
    features: [
      '12 luxury eco-cabins',
      '100% solar powered',
      'Organic farm-to-table restaurant',
      'Rainforest canopy tours',
      'Year-round tourism demand'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1657737738312-0f524f5ed190?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3N0YSUyMHJpY2ElMjBlY28lMjBsb2RnZSUyMHJhaW5mb3Jlc3R8ZW58MXx8fHwxNzcyMTE2MDUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    status: 'open',
    timeline: [
      { phase: 'Land Acquisition', status: 'completed' },
      { phase: 'Environmental Permits', status: 'completed' },
      { phase: 'Construction', status: 'in-progress' },
      { phase: 'Operations', status: 'upcoming' }
    ]
  },
  {
    id: '2',
    title: 'Arizona Solar Farm Expansion',
    location: 'Arizona, USA',
    category: 'solar-farm',
    minInvestment: 1000,
    totalFunding: 1200000,
    currentFunding: 960000,
    investors: 218,
    projectedROI: 9.8,
    payoutFrequency: 'Quarterly',
    fundingDeadline: '2026-03-30',
    description: '50-acre solar farm expansion with 20-year power purchase agreement. Grid-connected facility supplying clean energy to 3,500 homes.',
    features: [
      '50-acre installation',
      '20-year PPA secured',
      'Powers 3,500+ homes',
      'Government incentives',
      'Low maintenance costs'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1657688332253-9b4eb735d6d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb2xhciUyMGZhcm0lMjBwYW5lbHMlMjBkZXNlcnR8ZW58MXx8fHwxNzcyMTE2MDUzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    status: 'open',
    timeline: [
      { phase: 'Site Assessment', status: 'completed' },
      { phase: 'Grid Connection', status: 'completed' },
      { phase: 'Panel Installation', status: 'in-progress' },
      { phase: 'Energy Production', status: 'upcoming' }
    ]
  },
  {
    id: '3',
    title: 'Oregon Agroforestry Co-op',
    location: 'Oregon, USA',
    category: 'agroforestry',
    minInvestment: 250,
    totalFunding: 280000,
    currentFunding: 280000,
    investors: 387,
    projectedROI: 11.2,
    payoutFrequency: 'Monthly',
    fundingDeadline: '2026-02-01',
    description: 'Diversified agroforestry system combining timber production, hazelnut orchards, and mushroom cultivation. Regenerative practices enhance soil health and biodiversity.',
    features: [
      'Mixed timber & nut crops',
      'Specialty mushroom production',
      'Carbon credit revenue',
      'Regenerative agriculture',
      'Multiple income streams'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1560842704-0b0a1ab6702e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JvZm9yZXN0cnklMjBvcmVnb24lMjBmb3Jlc3R8ZW58MXx8fHwxNzcyMTE2MDU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    status: 'funded',
    timeline: [
      { phase: 'Land Preparation', status: 'completed' },
      { phase: 'Tree Planting', status: 'completed' },
      { phase: 'First Harvest', status: 'in-progress' },
      { phase: 'Full Production', status: 'upcoming' }
    ]
  },
  {
    id: '4',
    title: 'Vertical Farm Greenhouse',
    location: 'Colorado, USA',
    category: 'agriculture',
    minInvestment: 750,
    totalFunding: 650000,
    currentFunding: 455000,
    investors: 176,
    projectedROI: 14.3,
    payoutFrequency: 'Monthly',
    fundingDeadline: '2026-05-20',
    description: 'High-tech vertical farming facility producing leafy greens and herbs year-round. Hydroponic systems use 95% less water than traditional farming.',
    features: [
      'Year-round production',
      'Hydroponic technology',
      '95% water savings',
      'Local restaurant contracts',
      'Controlled environment'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1758524056596-af1c19797d01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZXJ0aWNhbCUyMGZhcm0lMjBncmVlbmhvdXNlJTIwaHlkcm9wb25pY3xlbnwxfHx8fDE3NzIxMTYwNTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    status: 'open',
    timeline: [
      { phase: 'Facility Construction', status: 'completed' },
      { phase: 'System Installation', status: 'in-progress' },
      { phase: 'Trial Crops', status: 'upcoming' },
      { phase: 'Commercial Production', status: 'upcoming' }
    ]
  },
  {
    id: '5',
    title: 'Portuguese Vineyard Estate',
    location: 'Douro Valley, Portugal',
    category: 'agriculture',
    minInvestment: 2000,
    totalFunding: 890000,
    currentFunding: 623000,
    investors: 94,
    projectedROI: 10.5,
    payoutFrequency: 'Annually',
    fundingDeadline: '2026-04-01',
    description: 'Historic vineyard estate producing premium wines for European markets. Includes wine tourism experiences and tasting room.',
    features: [
      '35-acre vineyard',
      'Premium wine production',
      'Wine tourism revenue',
      'Export contracts secured',
      'Heritage property'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1693825208005-02563f6a95ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW5leWFyZCUyMHBvcnR1Z2FsJTIwZG91cm8lMjB2YWxsZXl8ZW58MXx8fHwxNzcyMTE2MDU0fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    status: 'open',
    timeline: [
      { phase: 'Estate Acquisition', status: 'completed' },
      { phase: 'Vineyard Renovation', status: 'in-progress' },
      { phase: 'First Vintage', status: 'upcoming' },
      { phase: 'Tourism Launch', status: 'upcoming' }
    ]
  },
  {
    id: '6',
    title: 'Scottish Highland Rewilding',
    location: 'Scottish Highlands, UK',
    category: 'agroforestry',
    minInvestment: 300,
    totalFunding: 520000,
    currentFunding: 364000,
    investors: 412,
    projectedROI: 8.7,
    payoutFrequency: 'Quarterly',
    fundingDeadline: '2026-06-10',
    description: 'Large-scale rewilding project combining native woodland restoration with nature tourism and carbon credits. Supporting local biodiversity recovery.',
    features: [
      'Native woodland restoration',
      'Wildlife tourism',
      'Carbon credit income',
      'Biodiversity enhancement',
      'Government grants'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1707042167798-ad1a67303e17?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY290dGlzaCUyMGhpZ2hsYW5kcyUyMHJld2lsZGluZyUyMGZvcmVzdHxlbnwxfHx8fDE3NzIxMTYwNTV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    status: 'open',
    timeline: [
      { phase: 'Land Survey', status: 'completed' },
      { phase: 'Initial Planting', status: 'in-progress' },
      { phase: 'Wildlife Return', status: 'upcoming' },
      { phase: 'Eco-tourism', status: 'upcoming' }
    ]
  }
];

export interface UserInvestment {
  projectId: string;
  projectTitle: string;
  amountInvested: number;
  investmentDate: string;
  currentValue: number;
  totalReturns: number;
  status: 'active' | 'pending' | 'completed';
}

export const mockUserInvestments: UserInvestment[] = [
  {
    projectId: '3',
    projectTitle: 'Oregon Agroforestry Co-op',
    amountInvested: 1000,
    investmentDate: '2025-11-15',
    currentValue: 1045,
    totalReturns: 45,
    status: 'active'
  },
  {
    projectId: '1',
    projectTitle: 'Costa Verde Eco-Lodge Development',
    amountInvested: 2500,
    investmentDate: '2026-01-20',
    currentValue: 2500,
    totalReturns: 0,
    status: 'pending'
  }
];