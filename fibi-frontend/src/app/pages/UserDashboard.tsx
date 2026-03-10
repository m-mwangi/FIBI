import { Link } from 'react-router';
import { TrendingUp, DollarSign, Briefcase, ArrowUpRight, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockUserInvestments } from '../data/projects';
import { projects } from '../data/projects';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const totalInvested = mockUserInvestments.reduce((sum, inv) => sum + inv.amountInvested, 0);
  const totalCurrentValue = mockUserInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalReturns = mockUserInvestments.reduce((sum, inv) => sum + inv.totalReturns, 0);
  const totalGain = totalCurrentValue - totalInvested;
  const totalGainPercentage = ((totalGain / totalInvested) * 100).toFixed(2);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Mock chart data
  const portfolioData = [
    { month: 'Nov 25', value: 0 },
    { month: 'Dec 25', value: 1000 },
    { month: 'Jan 26', value: 1015 },
    { month: 'Feb 26', value: 3545 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl mb-2 text-gray-900">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">Track your portfolio performance and earnings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-gray-900">{formatCurrency(totalInvested)}</div>
              <p className="text-xs text-gray-500 mt-1">Across {mockUserInvestments.length} projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">Current Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-gray-900">{formatCurrency(totalCurrentValue)}</div>
              <p className="text-xs text-emerald-600 mt-1 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +{totalGainPercentage}% gain
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">Total Returns</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-emerald-600">{formatCurrency(totalReturns)}</div>
              <p className="text-xs text-gray-500 mt-1">Lifetime earnings</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-gray-600">Active Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-gray-900">{mockUserInvestments.length}</div>
              <p className="text-xs text-gray-500 mt-1">
                {mockUserInvestments.filter(inv => inv.status === 'active').length} generating returns
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Portfolio Growth Chart */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={portfolioData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']}
                      contentStyle={{ 
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/projects">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Browse New Projects
                  </Button>
                </Link>
                <Button variant="outline" className="w-full">
                  Withdraw Earnings
                </Button>
                <Button variant="outline" className="w-full">
                  Account Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Active Investments */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Investments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUserInvestments.map((investment) => {
                  const project = projects.find(p => p.id === investment.projectId);
                  const gain = investment.currentValue - investment.amountInvested;
                  const gainPercentage = ((gain / investment.amountInvested) * 100).toFixed(2);
                  
                  return (
                    <div key={investment.projectId}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-gray-900">{investment.projectTitle}</h3>
                            <Badge 
                              className={
                                investment.status === 'active' 
                                  ? 'bg-green-500' 
                                  : investment.status === 'pending'
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-500'
                              }
                            >
                              {investment.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Invested</div>
                              <div className="text-gray-900">{formatCurrency(investment.amountInvested)}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Current Value</div>
                              <div className="text-gray-900">{formatCurrency(investment.currentValue)}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Total Returns</div>
                              <div className="text-emerald-600">{formatCurrency(investment.totalReturns)}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Gain</div>
                              <div className={gain >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                {gain >= 0 ? '+' : ''}{gainPercentage}%
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-gray-500 mt-2">
                            Invested on {new Date(investment.investmentDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </div>
                        </div>

                        {project && (
                          <Link to={`/projects/${project.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </Link>
                        )}
                      </div>
                      
                      {investment !== mockUserInvestments[mockUserInvestments.length - 1] && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link to="/projects">
                  <Button variant="outline" className="w-full">
                    Explore More Investment Opportunities
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}