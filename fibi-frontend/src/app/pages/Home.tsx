import { Link } from 'react-router';
import { ArrowRight, Leaf, Users, TrendingUp, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useState, useEffect } from 'react';

export default function Home() {
  const { isAuthenticated } = useAuth();

  const images = [
    "/images/hero9.jpeg",
    "/images/hero10.jpeg",
    "/images/hero11.jpeg",
    "/images/hero12.jpeg",
  ];

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {images.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === currentImage ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundImage: `url(${img})` }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 text-white">
          <h1 className="text-5xl md:text-6xl mb-6">
            Invest Together. Profit Together.
          </h1>
          <p className="text-xl max-w-2xl mx-auto">
            FIBI enables collective investment in vetted land projects. Earn passive income through sustainable developments like eco-lodges, solar farms, and agroforestry.
          </p>
        </div>
      </section>

            {/* Features */}
<section className="bg-white">

  {/* FULL WIDTH Image with overlay text */}
<div className="relative w-full h-[350px]">
  <img
    src="/images/hero4.png"
    alt="Kenya's World Garden"
    className="w-full h-full object-cover"
  />
  
  {/* Semi-transparent overlay */}
  <div className="absolute inset-0 bg-black/40"></div>

  {/* Centered text */}
  <div className="absolute inset-0 flex items-center justify-center">
    <h2 className="text-white text-4xl md:text-5xl font-bold text-center drop-shadow-lg px-4">
      Kenya's World Garden
    </h2>
  </div>
</div>

  {/* Content */}
  <div className="py-20 px-4">
    <div className="max-w-7xl mx-auto">

      <h2 className="text-center text-3xl mb-12 text-gray-900">
        Why Choose FIBI?
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
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
  </div>
</section>

      {/* How It Works */}
<section className="py-20 px-4 bg-gray-50">
  <div className="max-w-7xl mx-auto">
    <h2 className="text-center text-3xl mb-12 text-gray-900">How It Works</h2>
    <div className="grid md:grid-cols-4 gap-8">
      
      <div className="text-center border border-gray-200 rounded-lg p-6 shadow-sm bg-white">
        <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">1</div>
        <h3 className="mb-2 text-gray-900">Browse Land</h3>
        <p className="text-gray-600">Explore vetted projects with expected returns and detailed information.</p>
      </div>

      <div className="text-center border border-gray-200 rounded-lg p-6 shadow-sm bg-white">
        <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">2</div>
        <h3 className="mb-2 text-gray-900">Invest Together</h3>
        <p className="text-gray-600">Contribute funds alongside other investors with low minimums.</p>
      </div>

      <div className="text-center border border-gray-200 rounded-lg p-6 shadow-sm bg-white">
        <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">3</div>
        <h3 className="mb-2 text-gray-900">Build Sustainably</h3>
        <p className="text-gray-600">We develop eco-friendly income structures on the land parcels.</p>
      </div>

      <div className="text-center border border-gray-200 rounded-lg p-6 shadow-sm bg-white">
        <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">4</div>
        <h3 className="mb-2 text-gray-900">Earn Monthly</h3>
        <p className="text-gray-600">Receive passive income from project operations regularly.</p>
      </div>

    </div>
  </div>
</section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero3.png')" }}
        />
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl mb-4">Ready to Start Investing?</h2>
          <p className="text-xl mb-8 text-gray-200">
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