import { useState } from 'react';
import { Link } from 'react-router';
import { MapPin, TrendingUp, Users, Calendar } from 'lucide-react';
import { projects } from '../data/projects';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function Projects() {
  const [filter, setFilter] = useState<string>('all');

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    if (filter === 'open') return project.status === 'open';
    return project.category === filter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'eco-lodge': 'Eco Lodge',
      'solar-farm': 'Solar Farm',
      'agroforestry': 'Agroforestry',
      'agriculture': 'Agriculture',
    };
    return labels[category] || category;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500';
      case 'funded': return 'bg-blue-500';
      case 'active': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl mb-2 text-gray-900">Investment Opportunities</h1>
          <p className="text-gray-600">Browse vetted land projects and start building your portfolio</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="open">Open for Funding</TabsTrigger>
              <TabsTrigger value="eco-lodge">Eco Lodges</TabsTrigger>
              <TabsTrigger value="solar-farm">Solar Farms</TabsTrigger>
              <TabsTrigger value="agroforestry">Agroforestry</TabsTrigger>
              <TabsTrigger value="agriculture">Agriculture</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const fundingPercentage = (project.currentFunding / project.totalFunding) * 100;
            
            return (
              <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={project.imageUrl} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status === 'open' ? 'Open' : project.status === 'funded' ? 'Funded' : 'Active'}
                    </Badge>
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary">
                      {getCategoryLabel(project.category)}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xl text-gray-900">{project.title}</h3>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {project.location}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    {/* ROI */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600 text-sm">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Projected ROI
                      </div>
                      <span className="text-emerald-600">{project.projectedROI}%</span>
                    </div>

                    {/* Funding Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Funding Progress</span>
                        <span className="text-gray-900">{fundingPercentage.toFixed(0)}%</span>
                      </div>
                      <Progress value={fundingPercentage} className="h-2" />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{formatCurrency(project.currentFunding)} raised</span>
                        <span>{formatCurrency(project.totalFunding)} goal</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <div className="flex items-center text-gray-600 text-xs mb-1">
                          <Users className="h-3 w-3 mr-1" />
                          Investors
                        </div>
                        <div className="text-gray-900">{project.investors}</div>
                      </div>
                      <div>
                        <div className="flex items-center text-gray-600 text-xs mb-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Min. Investment
                        </div>
                        <div className="text-gray-900">{formatCurrency(project.minInvestment)}</div>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link to={`/projects/${project.id}`} className="block">
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No projects found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
