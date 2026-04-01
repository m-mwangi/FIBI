import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  ArrowLeft,
  MapPin,
  TrendingUp,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Home,
  Calendar,
  Users,
  Loader2,
} from 'lucide-react';
import type { Project } from '../data/projects';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { getJson, postJson } from '@/lib/api';
import { normalizeApiProject, type ProjectOneResponse } from '@/lib/projects';
import { useAuth } from '../context/AuthContext';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'ready'>('loading');
  const [loadError, setLoadError] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [currentImage, setCurrentImage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    if (!id) {
      setProject(null);
      setLoadState('error');
      setLoadError('Missing project id.');
      return;
    }
    let cancelled = false;
    setLoadState('loading');
    setLoadError('');
    setCurrentImage(0);
    (async () => {
      const result = await getJson<ProjectOneResponse>(`/api/v1/projects/${id}`);
      if (cancelled) return;
      if (!result.ok) {
        setProject(null);
        setLoadState('error');
        setLoadError(result.error || 'Project not found.');
        return;
      }
      setProject(normalizeApiProject(result.data.project));
      setLoadState('ready');
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const images = project?.images?.length
    ? project.images
    : project
      ? [project.imageUrl]
      : [];

  if (loadState === 'loading') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-50 to-emerald-50/30 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        <p className="text-sm text-slate-600">Loading project…</p>
      </div>
    );
  }

  if (!project || loadState === 'error') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 bg-gradient-to-b from-slate-50 to-emerald-50/30">
        <div className="rounded-3xl bg-white p-10 text-center shadow-xl ring-1 ring-slate-100 max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Project not found</h2>
          <p className="text-slate-600 mb-6 text-sm">
            {loadError || 'This listing may have moved. Browse all opportunities.'}
          </p>
          <Link to="/projects">
            <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700">Back to projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  const fundingPct =
    project.totalFunding > 0
      ? Math.min(100, (project.currentFunding / project.totalFunding) * 100)
      : 0;
  const remaining = project.totalFunding - project.currentFunding;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const categoryLabel = (category: string) =>
    ({ 'eco-lodge': 'Eco lodge', 'solar-roof': 'Solar roof', agriculture: 'Agriculture' } as Record<
      string,
      string
    >)[category] || category;

  const statusIcon = (status: 'completed' | 'in-progress' | 'upcoming') => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'in-progress':
        return <Circle className="h-5 w-5 fill-teal-500 text-teal-600" />;
      default:
        return <Circle className="h-5 w-5 text-slate-300" />;
    }
  };

  const projectedReturn = () => {
    const a = parseFloat(investmentAmount);
    if (Number.isNaN(a) || a <= 0) return 0;
    return a * (project.projectedROI / 100);
  };

  const statusBadge =
    project.status === 'open'
      ? 'bg-emerald-500 text-white border-0'
      : project.status === 'funded'
        ? 'bg-sky-600 text-white border-0'
        : project.status === 'closed'
          ? 'bg-slate-600 text-white border-0'
          : 'bg-violet-600 text-white border-0';

  const statusHeadline =
    project.status === 'open'
      ? 'Open'
      : project.status === 'funded'
        ? 'Funded'
        : project.status === 'closed'
          ? 'Closed'
          : 'Active';

  const handleInvest = async () => {
    setSubmitError('');
    setSubmitSuccess('');

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const amount = Number(investmentAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setSubmitError('Enter a valid investment amount.');
      return;
    }

    if (amount < project.minInvestment) {
      setSubmitError(`Minimum investment is ${formatCurrency(project.minInvestment)}.`);
      return;
    }

    setIsSubmitting(true);
    const result = await postJson<{ message: string }>('/api/v1/investments', {
      projectId: project.id,
      amountInvested: amount,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error || 'Unable to complete investment.');
      return;
    }

    setSubmitSuccess(result.data.message || 'Investment created successfully.');
    setInvestmentAmount('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/25">
      <div className="border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <Link to="/" className="hover:text-emerald-700 flex items-center gap-1">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <Link to="/projects" className="hover:text-emerald-700">
            Projects
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <span className="text-slate-900 font-medium truncate max-w-[200px] sm:max-w-md">{project.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          All projects
        </Link>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative aspect-[16/10] sm:h-[min(480px,55vh)] overflow-hidden rounded-3xl bg-slate-100 shadow-xl ring-1 ring-slate-200/80">
              <img
                src={images[currentImage]}
                alt=""
                className="h-full w-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Previous image"
                    onClick={() => setCurrentImage((p) => (p === 0 ? images.length - 1 : p - 1))}
                    className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 p-3 text-white backdrop-blur-sm hover:bg-black/60"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    onClick={() => setCurrentImage((p) => (p + 1) % images.length)}
                    className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/45 p-3 text-white backdrop-blur-sm hover:bg-black/60"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        aria-label={`Image ${idx + 1}`}
                        onClick={() => setCurrentImage(idx)}
                        className={`h-2 rounded-full transition-all ${
                          currentImage === idx ? 'w-7 bg-emerald-400' : 'w-2 bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <Card className="border-0 rounded-2xl shadow-lg shadow-slate-200/40 ring-1 ring-slate-100">
              <CardHeader className="space-y-4 pb-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap gap-2">
                      <Badge className={statusBadge}>{statusHeadline}</Badge>
                      <Badge variant="outline" className="capitalize border-slate-200 text-slate-700">
                        {categoryLabel(project.category)}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl font-bold leading-tight text-slate-900">
                      {project.title}
                    </CardTitle>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        {project.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-slate-400" />
                        {project.investors} investors
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        Deadline {new Date(project.fundingDeadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-slate-700">{project.description}</p>
              </CardContent>
            </Card>

            <Card className="border-0 rounded-2xl shadow-lg shadow-slate-200/40 ring-1 ring-slate-100">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Key features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {project.features.map((feature, i) => (
                    <li key={i} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-0 rounded-2xl shadow-lg shadow-slate-200/40 ring-1 ring-slate-100">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Development timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-0 pl-2">
                  <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-emerald-100" aria-hidden />
                  {project.timeline.map((phase, index) => (
                    <div key={index} className="relative flex gap-4 pb-8 last:pb-0">
                      <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white ring-2 ring-emerald-100">
                        {statusIcon(phase.status)}
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <h4 className="font-semibold text-slate-900">{phase.phase}</h4>
                        <p className="text-sm capitalize text-slate-500">{phase.status.replace('-', ' ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-6 border-0 rounded-2xl shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 overflow-hidden">
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-5 py-4 text-white">
                <p className="text-xs font-medium uppercase tracking-wider text-emerald-100">Invest</p>
                <p className="mt-1 text-2xl font-bold">{formatCurrency(project.minInvestment)} min</p>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold text-slate-900">Deal terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
                  <span className="flex items-center gap-2 text-sm text-slate-600">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    Projected ROI
                  </span>
                  <span className="text-xl font-bold text-emerald-600">{project.projectedROI}%</span>
                </div>
                <p className="text-sm text-slate-600">
                  Payouts: <span className="font-medium text-slate-900">{project.payoutFrequency}</span>
                </p>

                <Separator />

                <div>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-600">Funding</span>
                    <span className="font-semibold tabular-nums">{fundingPct.toFixed(0)}%</span>
                  </div>
                  <Progress
                    value={fundingPct}
                    className="h-2.5 bg-slate-100 [&>[data-slot=progress-indicator]]:bg-emerald-600"
                  />
                  <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500">Raised</p>
                      <p className="font-semibold text-slate-900">{formatCurrency(project.currentFunding)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Remaining</p>
                      <p className="font-semibold text-slate-900">{formatCurrency(remaining)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label htmlFor="investment" className="text-slate-700">
                    Investment amount (USD)
                  </Label>
                  <Input
                    id="investment"
                    type="number"
                    placeholder={`Min. ${formatCurrency(project.minInvestment)}`}
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    className="rounded-xl border-slate-200"
                    min={project.minInvestment}
                  />
                  <p className="text-xs text-slate-500">Minimum {formatCurrency(project.minInvestment)}</p>

                  {investmentAmount && parseFloat(investmentAmount) >= project.minInvestment && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
                      <p className="text-xs font-medium text-emerald-800 uppercase tracking-wide">
                        Est. annual return
                      </p>
                      <p className="text-2xl font-bold text-emerald-700">{formatCurrency(projectedReturn())}</p>
                      <p className="mt-1 text-xs text-slate-600">Based on {project.projectedROI}% ROI (illustrative)</p>
                    </div>
                  )}

                  {project.status === 'open' ? (
                    <Button
                      className="h-12 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-base"
                      onClick={() => void handleInvest()}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processing...' : 'Invest now'}
                    </Button>
                  ) : (
                    <Button className="h-12 w-full rounded-xl" size="lg" disabled variant="secondary">
                      {project.status === 'funded'
                        ? 'Fully funded'
                        : project.status === 'closed'
                          ? 'Closed'
                          : 'Unavailable'}
                    </Button>
                  )}
                  {submitError && <p className="text-center text-xs text-red-600">{submitError}</p>}
                  {submitSuccess && <p className="text-center text-xs text-emerald-700">{submitSuccess}</p>}
                  <p className="text-center text-[11px] text-slate-400">Subject to terms and eligibility.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
