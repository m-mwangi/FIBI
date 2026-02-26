import { Link } from 'react-router';
import { ArrowRight, Leaf, Users, TrendingUp, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-50 to-teal-50 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl mb-6 text-emerald-900">
              Invest Together. Profit Together.
            </h1>
            <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
              FIBI enables collective investment in vetted land projects. Earn passive income through sustainable developments like eco-lodges, solar farms, and agroforestry.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/projects">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                  Explore Projects <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button size="lg" variant="outline">
                    View Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/signup">
                  <Button size="lg" variant="outline">
                    Sign Up Free
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-3xl mb-12 text-gray-900">Why Choose FIBI?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Leaf className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mb-2 text-gray-900">Sustainable Focus</h3>
                <p className="text-gray-600">
                  All projects prioritize eco-friendly development and long-term environmental impact.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 text-gray-900">Fractional Ownership</h3>
                <p className="text-gray-600">
                  Low minimum investments let you pool capital with others and diversify your portfolio.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="mb-2 text-gray-900">Passive Income</h3>
                <p className="text-gray-600">
                  Earn monthly or quarterly returns from operational income of completed projects.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="mb-2 text-gray-900">Vetted Projects</h3>
                <p className="text-gray-600">
                  Every opportunity is thoroughly researched and verified by our expert team.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-3xl mb-12 text-gray-900">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                1
              </div>
              <h3 className="mb-2 text-gray-900">Browse Land</h3>
              <p className="text-gray-600">
                Explore vetted projects with expected returns and detailed information.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                2
              </div>
              <h3 className="mb-2 text-gray-900">Invest Together</h3>
              <p className="text-gray-600">
                Contribute funds alongside other investors with low minimums.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                3
              </div>
              <h3 className="mb-2 text-gray-900">Build Sustainably</h3>
              <p className="text-gray-600">
                We develop eco-friendly income structures on the land parcels.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                4
              </div>
              <h3 className="mb-2 text-gray-900">Earn Monthly</h3>
              <p className="text-gray-600">
                Receive passive income from project operations regularly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Project Types */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-3xl mb-4 text-gray-900">Sustainable Development Projects</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Every project focuses on eco-friendly income generation
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-gray-200 rounded-lg p-6 hover:border-emerald-500 transition-colors">
              <h3 className="mb-2 text-gray-900">Eco Cabins</h3>
              <p className="text-gray-600 text-sm">
                Sustainable tourism accommodations in natural settings with minimal environmental impact.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 hover:border-emerald-500 transition-colors">
              <h3 className="mb-2 text-gray-900">Solar Farms</h3>
              <p className="text-gray-600 text-sm">
                Renewable energy installations generating clean power with long-term contracts.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 hover:border-emerald-500 transition-colors">
              <h3 className="mb-2 text-gray-900">Agroforestry</h3>
              <p className="text-gray-600 text-sm">
                Mixed forestry and agriculture systems that enhance biodiversity and soil health.
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 hover:border-emerald-500 transition-colors">
              <h3 className="mb-2 text-gray-900">Agriculture</h3>
              <p className="text-gray-600 text-sm">
                Modern farming operations using sustainable practices and innovative techniques.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/projects">
              <Button size="lg" variant="outline">
                View All Projects <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-emerald-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl mb-4">Ready to Start Investing?</h2>
          <p className="text-xl mb-8 text-emerald-50">
            Join thousands of investors building wealth through sustainable land development.
          </p>
          <Link to="/projects">
            <Button size="lg" variant="secondary">
              Explore Investment Opportunities
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}