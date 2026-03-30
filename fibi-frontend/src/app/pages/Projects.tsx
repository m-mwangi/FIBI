import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { MapPin, TrendingUp, Calendar, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { projects } from '../data/projects';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';

const SLIDER = [
  '/images/hero5.jpeg',
  '/images/hero6.jpg',
  '/images/hero7.png',
  '/images/hero8.jpg',
];

export default function Projects() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [slide, setSlide] = useState(0);
  const [fade, setFade] = useState(false);

  const withFade = useCallback((fn: () => void) => {
    setFade(true);
    window.setTimeout(() => {
      fn();
      setFade(false);
    }, 220);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      withFade(() => setSlide((p) => (p + 1) % SLIDER.length));
    }, 6000);
    return () => window.clearInterval(id);
  }, [withFade]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
      n
    );

  const categoryLabel = (c: string) =>
    ({ 'eco-lodge': 'Eco lodge', 'solar-roof': 'Solar', agriculture: 'Agriculture' } as Record<string, string>)[
      c
    ] || c;

  const statusClass: Record<string, string> = {
    open: 'bg-emerald-500 hover:bg-emerald-600 border-0 text-white',
    funded: 'bg-sky-600 hover:bg-sky-700 border-0 text-white',
    active: 'bg-violet-600 hover:bg-violet-700 border-0 text-white',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/35">
      <div className="relative h-[min(400px,52vh)] min-h-[280px]">
        <img
          src={SLIDER[slide]}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            fade ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/45 to-emerald-900/25" />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center">
          <p className="text-emerald-200/90 text-xs font-semibold uppercase tracking-[0.2em] mb-2">
            Investor marketplace
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
            Opportunities
          </h1>
          <p className="mt-3 text-white/85 max-w-xl text-sm sm:text-base">
            Vetted projects—funding, ROI, and timelines in one place.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 text-white/70 text-sm">
            <Users className="h-4 w-4" />
            {projects.length} listings
          </p>
        </div>
        <button
          type="button"
          aria-label="Previous"
          onClick={() => withFade(() => setSlide((p) => (p === 0 ? SLIDER.length - 1 : p - 1)))}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/40 p-2.5 text-white backdrop-blur-sm hover:bg-black/55 border border-white/10"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => withFade(() => setSlide((p) => (p + 1) % SLIDER.length))}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/40 p-2.5 text-white backdrop-blur-sm hover:bg-black/55 border border-white/10"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {SLIDER.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => withFade(() => setSlide(i))}
              className={`h-2 rounded-full transition-all ${i === slide ? 'w-8 bg-emerald-400' : 'w-2 bg-white/45'}`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">All projects</h2>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">Compare minimums, funding, and returns.</p>
          </div>
          <Link to="/">
            <Button variant="outline" className="rounded-xl border-slate-200 w-full sm:w-auto">
              Home
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const pct = Math.min(100, (project.currentFunding / project.totalFunding) * 100);
            return (
              <Card
                key={project.id}
                className="group overflow-hidden rounded-2xl border-0 shadow-lg shadow-slate-200/50 ring-1 ring-slate-100 transition-all hover:ring-emerald-200/60 hover:shadow-xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <img
                    src={project.imageUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent opacity-80" />
                  <Badge className={`absolute right-3 top-3 ${statusClass[project.status] ?? 'bg-slate-600'}`}>
                    {project.status === 'open' ? 'Open' : project.status === 'funded' ? 'Funded' : 'Active'}
                  </Badge>
                  <Badge className="absolute left-3 top-3 border-0 bg-white/95 capitalize text-slate-800 shadow-sm">
                    {categoryLabel(project.category)}
                  </Badge>
                </div>
                <CardHeader className="space-y-1 px-5 pt-5 pb-0">
                  <h3 className="line-clamp-2 text-lg font-semibold leading-snug text-slate-900">
                    {project.title}
                  </h3>
                  <div className="flex items-center text-sm text-slate-500">
                    <MapPin className="mr-1 h-4 w-4 shrink-0 text-emerald-600" />
                    {project.location}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 px-5 pb-5 pt-4">
                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
                    <span className="flex items-center text-sm text-slate-600">
                      <TrendingUp className="mr-2 h-4 w-4 text-emerald-600" />
                      Projected ROI
                    </span>
                    <span className="text-lg font-bold text-emerald-600">{project.projectedROI}%</span>
                  </div>
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-600">Funding</span>
                      <span className="font-semibold tabular-nums text-slate-900">{pct.toFixed(0)}%</span>
                    </div>
                    <Progress
                      value={pct}
                      className="h-2.5 bg-slate-100 [&>[data-slot=progress-indicator]]:bg-emerald-600"
                    />
                    <div className="mt-1.5 flex justify-between text-xs text-slate-500">
                      <span>{formatCurrency(project.currentFunding)} raised</span>
                      <span>{formatCurrency(project.totalFunding)} goal</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 border-t border-slate-100 pt-3 text-sm text-slate-600">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    Min.{' '}
                    <span className="font-semibold text-slate-900">{formatCurrency(project.minInvestment)}</span>
                  </div>
                  <Link to={`/projects/${project.id}`} className="block">
                    <Button className="h-11 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700">View details</Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
