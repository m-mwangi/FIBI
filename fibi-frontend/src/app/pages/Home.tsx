import { Link } from 'react-router';
import { ArrowRight, Leaf, Users, TrendingUp, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useState, useEffect } from 'react';
import { Seo } from '../seo/Seo';
import { baseGraph, breadcrumbSchema, webPageSchema } from '../seo/schema';

/**
 * The homepage title is the site's single most contested string. It leads with
 * the brand because "FIBI" is easily confused in search with several unrelated
 * organisations, then states the category in the words a buyer would actually
 * type.
 */
const SEO_TITLE = 'FIBI — Fractional Land Investment in Kenya';
const SEO_DESCRIPTION =
  'Invest from a fraction of the cost in vetted Kenyan land projects — eco-lodges, solar and agriculture. Transparent terms, published returns, collective ownership.';

const HERO_IMAGES = [
  '/images/capsule12.jpeg',
  '/images/avo3.jpg',
  '/images/solar2.jpg',
];

export default function Home() {
  const { isAuthenticated, authReady } = useAuth();
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => {
      setCurrentImage((p) => (p + 1) % HERO_IMAGES.length);
    }, 4000);
    return () => window.clearInterval(t);
  }, []);

  const features = [
    {
      icon: Leaf,
      title: 'Sustainable focus',
      body: 'Eco-friendly development and long-term environmental impact on every project.',
      ring: 'ring-emerald-300',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      icon: Users,
      title: 'Fractional ownership',
      body: 'Low minimums so you pool capital with others and diversify your portfolio.',
      ring: 'ring-emerald-300',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-700',
    },
    {
      icon: TrendingUp,
      title: 'Passive income',
      body: 'Monthly or quarterly returns from operational income as projects mature.',
      ring: 'ring-emerald-300',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-700',
    },
    {
      icon: Shield,
      title: 'Vetted projects',
      body: 'Each listing is researched and verified by our team before it goes live.',
      ring: 'ring-emerald-300', // updated to match green
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700',
    },
  ];

  const steps = [
    { n: 1, t: 'Browse', d: 'Review returns, timelines, and documents for each project.' },
    { n: 2, t: 'Invest', d: 'Contribute alongside others with clear minimums and terms.' },
    { n: 3, t: 'Build', d: 'Sustainable structures and operations on the ground.' },
    { n: 4, t: 'Earn', d: 'Receive distributions on the schedule defined for each deal.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Seo
        title={SEO_TITLE}
        bareTitle
        description={SEO_DESCRIPTION}
        path="/"
        jsonLd={[
          baseGraph(
            webPageSchema({
              name: SEO_TITLE,
              description: SEO_DESCRIPTION,
              path: '/',
            }),
            breadcrumbSchema([{ name: 'Home', path: '/' }]),
          ),
        ]}
      />
      <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          {HERO_IMAGES.map((src, i) => (
            <div
              key={src}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1200ms] ${
                i === currentImage ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-emerald-950/20" />
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 text-white pt-16 pb-24">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-emerald-100 backdrop-blur-md mb-6">
            <Sparkles className="h-4 w-4 text-emerald-300" />
            Kenyan land &amp; sustainability, together
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
            Invest together.
            <span className="text-emerald-500"> Profit together.</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-10">
            FIBI connects you to vetted eco-lodges, solar, and agriculture—transparent, fractional,
            built for long-term returns.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/projects">
              <Button
                size="lg"
                className="h-12 px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg shadow-emerald-950/40"
              >
                View opportunities
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            {authReady &&
              (isAuthenticated ? (
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 rounded-full border-white/35 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    My portfolio
                  </Button>
                </Link>
              ) : (
                <Link to="/signup">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-8 rounded-full border-white/35 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                  >
                    Create account
                  </Button>
                </Link>
              ))}
            <Link to="/membership">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 rounded-full border-white/35 bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                Join membership
              </Button>
            </Link>
          </div>
          <div className="flex justify-center gap-2 mt-14">
            {HERO_IMAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setCurrentImage(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentImage ? 'w-8 bg-emerald-600' : 'w-1.5 bg-white/35 hover:bg-white/55'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 px-4 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
              Why FIBI?
            </h2>
            <p className="mt-3 text-slate-600 text-lg">
              Clarity, impact, and access to real asset-backed opportunities.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
            {features.map((f) => (
              <Card
                key={f.title}
                className={`border-0 rounded-2xl shadow-lg shadow-slate-200/40 ring-1 ${f.ring} hover:shadow-xl transition-shadow duration-300`}
              >
                <CardContent className="p-6 sm:p-8">
                  <div
                    className={`w-14 h-14 rounded-2xl ${f.iconBg} flex items-center justify-center mb-5`}
                  >
                    <f.icon className={`h-7 w-7 ${f.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{f.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 px-4 bg-slate-50 border-y border-slate-100">
  <div className="max-w-7xl mx-auto">
    <h2 className="text-center text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
      How it works
    </h2>
    <p className="text-center text-slate-600 max-w-2xl mx-auto mb-14 text-lg">
      From discovery to distributions—simple steps for serious participation.
    </p>
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {steps.map((s) => (
        <div
          key={s.n}
          className="rounded-2xl bg-white p-6 text-center shadow-md shadow-slate-200/40 transition-transform duration-300 hover:scale-105 hover:-translate-y-2"
        >
          <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-emerald-600 text-white font-bold flex items-center justify-center shadow-md">
            {s.n}
          </div>
          <h3 className="font-semibold text-slate-900 text-lg mb-2">{s.t}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{s.d}</p>
        </div>
      ))}
    </div>
  </div>
</section>

      <section className="relative py-24 sm:py-32 px-4 overflow-hidden">
  <div
    className="absolute inset-0 bg-cover bg-center"
    style={{ backgroundImage: "url('/images/hero3.png')" }}
  />
  {/* darker overlay */}
<div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/45 to-black/40" />
  
  <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch gap-10 lg:gap-16">
    <div className="flex-1 flex flex-col justify-center text-center lg:text-left text-white">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
        Ready to start?
      </h2>
      <p className="text-lg text-white/85 max-w-xl mx-auto lg:mx-0 leading-relaxed">
        Open projects show funding progress, targets, and timelines—so you decide with confidence.
      </p>
    </div>
    <div className="w-full max-w-md lg:max-w-lg mx-auto lg:mx-0 shrink-0">
      <div className="rounded-3xl p-8 sm:p-10 shadow-2xl bg-emerald-600 text-white">
        <p className="text-xs font-semibold uppercase tracking-wider mb-1">
          Next step
        </p>
        <h3 className="text-2xl font-bold mb-3">Explore the marketplace</h3>
        <p className="mb-6 leading-relaxed">
          Compare minimums and projected ROI across all live listings.
        </p>
        <Link to="/projects" className="block">
          <Button className="w-full h-12 rounded-xl bg-white text-black shadow-lg hover:bg-slate-100 hover:shadow-xl hover:scale-105 hover:text-black transition-all duration-200">
  Browse opportunities
  <ArrowRight className="ml-2 h-4 w-4" />
</Button>
        </Link>
        {authReady && !isAuthenticated && (
          <p className="text-center text-sm mt-4">
  New?{' '}
  <Link
    to="/signup"
    className="text-white font-bold underline hover:text-emerald-100 transition-colors"
  >
    Sign up free
  </Link>
</p>        )}
      </div>
    </div>
  </div>
</section>
</div>
  );
}