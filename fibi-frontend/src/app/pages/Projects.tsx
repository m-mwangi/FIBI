import { useState } from 'react';
import { Link } from 'react-router';
import { MapPin, TrendingUp, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { projects } from '../data/projects';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';

export default function Projects() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fade, setFade] = useState(false);

  const sliderImages = [
    "/images/hero5.jpeg",
    "/images/hero6.jpg",
    "/images/hero7.png",
    "/images/hero8.jpg"
  ];

  const nextSlide = () => {
    setFade(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
      setFade(false);
    }, 300);
  };

  const prevSlide = () => {
    setFade(true);
    setTimeout(() => {
      setCurrentSlide((prev) =>
        prev === 0 ? sliderImages.length - 1 : prev - 1
      );
      setFade(false);
    }, 300);
  };

  const goToSlide = (index: number) => {
    setFade(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setFade(false);
    }, 300);
  };

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

      {/* HERO SECTION WITH CAROUSEL */}
      <div className="relative w-full h-80 md:h-96">
        <img
          src={sliderImages[currentSlide]}
          alt="Investment Highlight"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${fade ? 'opacity-0' : 'opacity-100'}`}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
            Investment Opportunities
          </h1>
        </div>

        <button
          onClick={prevSlide}
          className="absolute top-1/2 -translate-y-1/2 left-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-20"
        >
          <ChevronLeft />
        </button>

        <button
          onClick={nextSlide}
          className="absolute top-1/2 -translate-y-1/2 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full z-20"
        >
          <ChevronRight />
        </button>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 w-2 rounded-full ${
                currentSlide === index ? 'bg-emerald-600' : 'bg-white/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* PROJECTS GRID */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
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
                  <h3 className="text-xl text-gray-900">{project.title}</h3>
                  <div className="flex items-center text-gray-600 text-sm mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {project.location}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-600 text-sm">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Projected ROI
                      </div>
                      <span className="text-emerald-600">{project.projectedROI}%</span>
                    </div>

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

                    <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <div className="flex items-center text-gray-600 text-xs mb-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Min. Investment
                        </div>
                        <div className="text-gray-900">{formatCurrency(project.minInvestment)}</div>
                      </div>
                    </div>

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
      </div>

    </div>
  );
}