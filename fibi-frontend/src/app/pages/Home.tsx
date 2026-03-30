import { Link } from 'react-router';
import { ArrowRight, Leaf, Users, TrendingUp, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { useState, useEffect } from 'react';

const HERO_IMAGES = [
  '/images/hero9.jpeg',
  '/images/hero10.jpeg',
  '/images/hero11.jpeg',
  '/images/hero12.jpeg',
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
      ring: 'ring-emerald-100',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
    {
      icon: Users,
      title: 'Fractional ownership',
      body: 'Low minimums so you pool capital with others and diversify your portfolio.',
      ring: 'ring-teal-100',
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-700',
    },
    {
      icon: TrendingUp,
      title: 'Passive income',
      body: 'Monthly or quarterly returns from operational income as projects mature.',
      ring: 'ring-cyan-100',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-700',
    },
    {
      icon: Shield,
      title: 'Vetted projects',
      body: 'Each listing is researched and verified by our team before it goes live.',
      ring: 'ring-slate-100',
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
            <span className="text-emerald-300"> Profit together.</span>
          </h1>
          <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed mb-10">
            FIBI connects you to vetted eco-lodges, solar, and agriculture—transparent, fractional,
            built for long-term returns.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/projects">
              <Button
                size="lg"
                className="h-12 px-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white border-0 shadow-lg shadow-emerald-950/40"
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
          </div>
          <div className="flex justify-center gap-2 mt-14">
            {HERO_IMAGES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Slide ${i + 1}`}
                onClick={() => setCurrentImage(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentImage ? 'w-8 bg-emerald-400' : 'w-1.5 bg-white/35 hover:bg-white/55'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="relative min-h-[320px]">
        <img
          src="/images/hero4.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/65 to-emerald-900/25" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 flex items-center min-h-[320px]">
          <div>
            <p className="text-emerald-200 text-xs font-semibold uppercase tracking-[0.2em] mb-3">
              Vision
            </p>
            <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-bold max-w-xl leading-tight">
              Kenya&apos;s world garden—grown with investors like you.
            </h2>
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
                className="rounded-2xl bg-white p-6 text-center shadow-md shadow-slate-200/40 ring-1 ring-slate-100 hover:ring-emerald-200/50 transition-all"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center shadow-md">
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
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/92 via-slate-900/88 to-teal-950/85" />
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-stretch gap-10 lg:gap-16">
          <div className="flex-1 flex flex-col justify-center text-center lg:text-left text-white">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Ready to start?
            </h2>
            <p className="text-lg text-white/85 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Open projects show funding progress, targets, and timelines—so you decide with
              confidence.
            </p>
          </div>
          <div className="w-full max-w-md lg:max-w-lg mx-auto lg:mx-0 shrink-0">
            <div className="rounded-3xl bg-white p-8 sm:p-10 shadow-2xl ring-1 ring-white/10">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">
                Next step
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Explore the marketplace</h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                Compare minimums and projected ROI across all live listings.
              </p>
              <Link to="/projects" className="block">
                <Button className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white">
                  Browse opportunities
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              {authReady && !isAuthenticated && (
                <p className="text-center text-sm text-slate-500 mt-4">
                  New?{' '}
                  <Link to="/signup" className="text-emerald-600 font-medium hover:underline">
                    Sign up free
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
