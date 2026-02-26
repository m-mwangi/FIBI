export type InvestmentStatus = "open" | "funded" | "closed";

export interface Investment {
  id: string;
  title: string;
  location: string;
  description: string;
  pricePerUnit: number;
  roi: string;
  images: string[];
  status: InvestmentStatus;
  createdAt: string;
}

export interface HeroContent {
  title: string;
  subtitle: string;
  imageUrl: string;
}
