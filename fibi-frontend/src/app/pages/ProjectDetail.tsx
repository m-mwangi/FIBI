import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { ArrowLeft, MapPin, TrendingUp, CheckCircle2, Circle, ChevronLeft, ChevronRight } from 'lucide-react';
import { projects } from '../data/projects';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';

export default function ProjectDetail() {
  const { id } = useParams();
  const project = projects.find(p => p.id === id);
  const [investmentAmount, setInvestmentAmount] = useState('');

  const [currentImage, setCurrentImage] = useState(0);
  const images = project?.images || (project ? [project.imageUrl] : []);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4 text-gray-900">Project not found</h2>
          <Link to="/projects">
            <Button variant="outline">Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  const fundingPercentage = (project.currentFunding / project.totalFunding) * 100;
  const remainingFunding = project.totalFunding - project.currentFunding;

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
      'solar-roof': 'Solar Roof',
      'agriculture': 'Agriculture',
    };
    return labels[category] || category;
  };

  const getStatusIcon = (status: 'completed' | 'in-progress' | 'upcoming') => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in-progress':
        return <Circle className="h-5 w-5 text-blue-600 fill-blue-600" />;
      case 'upcoming':
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  const calculateProjectedReturn = () => {
    const amount = parseFloat(investmentAmount);
    if (isNaN(amount) || amount <= 0) return 0;
    return amount * (project.projectedROI / 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Back Button */}
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 font-medium text-sm bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full shadow-lg transition duration-200 z-50"
            >
              <ArrowLeft size={16} />
              Back to Projects
            </Link>

            {/* Hero Image Carousel */}
            <div className="relative h-96 rounded-lg overflow-hidden mt-2">
              <img
                src={images[currentImage]}
                alt={`${project.title} image ${currentImage + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
              />

              {/* Left Chevron */}
              {images.length > 1 && (
                <button
                  onClick={() =>
                    setCurrentImage(prev => (prev === 0 ? images.length - 1 : prev - 1))
                  }
                  className="absolute top-1/2 -translate-y-1/2 left-4 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full shadow-md z-20 transition"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {/* Right Chevron */}
              {images.length > 1 && (
                <button
                  onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)}
                  className="absolute top-1/2 -translate-y-1/2 right-4 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full shadow-md z-20 transition"
                >
                  <ChevronRight size={24} />
                </button>
              )}

              {/* Pagination Dots */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        currentImage === idx ? 'bg-emerald-600' : 'bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Project Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">{project.title}</CardTitle>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {project.location}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {getCategoryLabel(project.category)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{project.description}</p>
              </CardContent>
            </Card>

            {/* Key Features */}
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {project.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Project Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Development Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {project.timeline.map((phase, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0">{getStatusIcon(phase.status)}</div>
                      <div className="flex-1">
                        <h4 className="text-gray-900 mb-1">{phase.phase}</h4>
                        <p className="text-sm text-gray-600 capitalize">{phase.status.replace('-', ' ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Investment Card */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Investment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* ROI */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-gray-600">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Projected Annual ROI
                    </div>
                    <div className="text-2xl text-emerald-600">{project.projectedROI}%</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Payout Frequency: <span className="text-gray-900">{project.payoutFrequency}</span>
                  </div>
                </div>

                <Separator />

                {/* Funding Progress */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Funding Progress</span>
                    <span className="text-gray-900">{fundingPercentage.toFixed(0)}%</span>
                  </div>
                  <Progress value={fundingPercentage} className="h-3 mb-2" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Raised</div>
                      <div className="text-gray-900">{formatCurrency(project.currentFunding)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Remaining</div>
                      <div className="text-gray-900">{formatCurrency(remainingFunding)}</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Investment Calculator */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="investment">Investment Amount</Label>
                    <Input
                      id="investment"
                      type="number"
                      placeholder={`Min. ${formatCurrency(project.minInvestment)}`}
                      value={investmentAmount}
                      onChange={e => setInvestmentAmount(e.target.value)}
                      className="mt-1"
                      min={project.minInvestment}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum investment: {formatCurrency(project.minInvestment)}
                    </p>
                  </div>

                  {investmentAmount && parseFloat(investmentAmount) >= project.minInvestment && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Projected Annual Return</div>
                      <div className="text-2xl text-emerald-600">
                        {formatCurrency(calculateProjectedReturn())}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Based on {project.projectedROI}% ROI
                      </div>
                    </div>
                  )}

                  {project.status === 'open' ? (
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700" size="lg">
                      Invest Now
                    </Button>
                  ) : (
                    <Button className="w-full" size="lg" disabled>
                      {project.status === 'funded' ? 'Fully Funded' : 'Not Available'}
                    </Button>
                  )}

                  <p className="text-xs text-gray-500 text-center">
                    Investments are subject to terms and conditions
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}