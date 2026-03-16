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
    }, 3000);
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
          <h1 className="text-4xl md:text-5xl mb-6">
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
    <h2 className="text-white text-3xl md:text-4xl font-bold text-center drop-shadow-lg px-4">
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
    {/* Title */}
    <h2 className="text-center text-3xl mb-6 text-gray-900">How It Works</h2>

    {/* Intro Paragraph */}
    <p className="text-center max-w-3xl mx-auto mb-12 text-gray-600">
      We are redefining how people participate in land ownership by making it more accessible, transparent, and impactful. Through responsible development and collaborative investment, we create opportunities for sustainable growth and reliable returns.
    </p>

    {/* Steps */}
    <div className="grid md:grid-cols-4 gap-8">
      {[ 
        { num: 1, title: "Browse Land", text: "Explore vetted projects with expected returns and detailed information." },
        { num: 2, title: "Invest Together", text: "Contribute funds alongside other investors with low minimums." },
        { num: 3, title: "Build Sustainably", text: "We develop eco-friendly income structures on the land parcels." },
        { num: 4, title: "Earn Monthly", text: "Receive passive income from project operations regularly." },
      ].map((step) => (
        <div
          key={step.num}
          className="text-center border border-gray-200 rounded-lg p-6 shadow-sm bg-white 
                     transition-transform duration-300 ease-out hover:scale-105 hover:shadow-lg"
        >
          <div className="w-16 h-16 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            {step.num}
          </div>
          <h3 className="mb-2 text-gray-900">{step.title}</h3>
          <p className="text-gray-600">{step.text}</p>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* CTA Section */}
<section className="relative pt-20 pb-0 px-4 overflow-visible">
  {/* Background Image */}
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{ backgroundImage: "url('/images/hero3.png')" }}
  />
  <div className="absolute inset-0 bg-black/60"></div>

  {/* Floating Green Box */}
  <div className="relative z-10">
    <div className="bg-emerald-600 text-white p-12 md:p-16 shadow-2xl
                    transform translate-y-1/4 md:translate-y-1/4
                    w-full md:w-1/2 ml-auto">
      {/* Heading */}
      <h2 className="text-3xl md:text-4xl mb-4 font-bold">
        Ready to Start Investing?
      </h2>

      {/* Paragraph */}
      <p className="text-xl mb-8 text-gray-100">
        Join thousands of investors building wealth through sustainable land development.
      </p>

      {/* Button */}
      <div className="flex">
        <Link to="/projects">
          <Button size="lg" variant="secondary">
            Explore Investment Opportunities
          </Button>
        </Link>
      </div>
    </div>
  </div>
</section>
    </div>
  );
}