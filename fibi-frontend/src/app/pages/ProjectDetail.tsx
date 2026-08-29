import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import {
  ArrowLeft,
  Check,
  Copy,
  CreditCard,
  Landmark,
  MapPin,
  TrendingUp,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Home,
  Calendar,
  Users,
  Layers,
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
import { categoryLabel, normalizeApiProject, type ProjectOneResponse } from '@/lib/projects';
import { useAuth } from '../context/AuthContext';
import { Seo } from '../seo/Seo';
import { baseGraph, breadcrumbSchema, webPageSchema } from '../seo/schema';
import { consumePrerenderPayload } from '../seo/prerenderData';

type PaymentMethodOption = {
  provider: string;
  label: string;
  description: string;
  settlement: 'instant' | 'delayed';
  bankName?: string;
};

type WireInstructions = {
  reference: string;
  account: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    swiftCode: string | null;
    branch: string | null;
    currency: string;
  };
  instructions: string;
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  /**
   * Project supplied by the prerenderer for this exact URL, if any.
   *
   * Read once, in a state initialiser, so the server render and the first
   * client render produce identical markup — hydration compares the two and
   * throws the tree away on a mismatch. The id check guards the case where the
   * payload belongs to a different project than the one being viewed.
   */
  const [seededProject] = useState<Project | null>(() => {
    const seeded = consumePrerenderPayload().project ?? null;
    return seeded && String(seeded.id) === String(id) ? seeded : null;
  });

  const [project, setProject] = useState<Project | null>(seededProject);
  const [loadState, setLoadState] = useState<'loading' | 'error' | 'ready'>(
    seededProject ? 'ready' : 'loading',
  );
  const [loadError, setLoadError] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('STRIPE');
  // Set when a bank transfer is initiated: the investor must be shown where to
  // send money and which reference to quote, and that panel replaces the form.
  const [wireInstructions, setWireInstructions] = useState<WireInstructions | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
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
    // A prerendered page already shows this project. Refetch in the background
    // for fresh funding figures rather than replacing it with a spinner — but
    // only for the project that was actually seeded, so navigating on to a
    // different one still shows a loading state instead of stale content.
    const alreadyShowing = seededProject && String(seededProject.id) === String(id);
    if (!alreadyShowing) setLoadState('loading');
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
  }, [id, seededProject]);

  const images = project?.images?.length
    ? project.images
    : project
      ? [project.imageUrl]
      : [];

  // Which rails are usable right now. Unauthenticated visitors are not shown a
  // choice at all — they are sent to log in first.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    (async () => {
      const res = await getJson<{ methods: PaymentMethodOption[] }>('/api/v1/payments/methods');
      if (cancelled || !res.ok) return;
      const methods = res.data.methods ?? [];
      setPaymentMethods(methods);
      if (methods.length > 0 && !methods.some((m) => m.provider === selectedProvider)) {
        setSelectedProvider(methods[0].provider);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

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
        {/* A project that no longer resolves must not stay indexable. */}
        <Seo title="Project not found" path={`/projects/${id ?? ''}`} noindex />
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
    project.totalFundingMinor > 0
      ? Math.min(100, (project.currentFundingMinor / project.totalFundingMinor) * 100)
      : 0;
  const remaining = project.totalFundingMinor - project.currentFundingMinor;
  const components = project.components ?? [];
  // The capital the components add up to. On a master plan seeded from a deck
  // this equals its own target; showing it lets a reader check that rather
  // than take it on trust.
  const componentsTotalMinor = components.reduce((sum, c) => sum + c.totalFundingMinor, 0);

  // Takes integer MINOR units (cents), matching the API.
  const formatCurrency = (minorUnits: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(minorUnits / 100);

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

  /** Returns MINOR units, because that is what formatCurrency takes. */
  const projectedReturn = () => {
    const major = parseFloat(investmentAmount);
    if (Number.isNaN(major) || major <= 0) return 0;
    return Math.round(major * 100 * (project.projectedROI / 100));
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

    // The field is in major units (the user types "500"); everything below the
    // input — the minimum check and the API — is in minor units.
    const amountMajor = Number(investmentAmount);
    if (!Number.isFinite(amountMajor) || amountMajor <= 0) {
      setSubmitError('Enter a valid investment amount.');
      return;
    }
    const amountMinor = Math.round(amountMajor * 100);

    if (amountMinor < project.minInvestmentMinor) {
      setSubmitError(`Minimum investment is ${formatCurrency(project.minInvestmentMinor)}.`);
      return;
    }

    setIsSubmitting(true);
    const result = await postJson<{
      message: string;
      checkoutUrl?: string;
      nextAction?:
        | { type: 'redirect'; url: string }
        | ({ type: 'bank_transfer' } & WireInstructions)
        | { type: 'none' };
    }>('/api/v1/investments', {
      projectId: project.id,
      amountInvestedMinor: amountMinor,
      provider: selectedProvider,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error || 'Unable to complete investment.');
      return;
    }

    const nextAction = result.data.nextAction;

    // A bank transfer does not redirect anywhere — the investor now has to go
    // and move money, so the instructions stay on screen.
    if (nextAction?.type === 'bank_transfer') {
      setWireInstructions({
        reference: nextAction.reference,
        account: nextAction.account,
        instructions: nextAction.instructions,
      });
      setInvestmentAmount('');
      return;
    }

    const redirectUrl =
      nextAction?.type === 'redirect' ? nextAction.url : result.data.checkoutUrl;
    if (!redirectUrl) {
      setSubmitError(result.data.message || 'Unable to initiate payment.');
      return;
    }

    setSubmitSuccess(result.data.message || 'Redirecting to payment…');
    setInvestmentAmount('');
    window.location.href = redirectUrl;
  };

  const copyReference = () => {
    if (!wireInstructions) return;
    void navigator.clipboard?.writeText(wireInstructions.reference).then(() => {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 1800);
    });
  };

  const projectPath = `/projects/${project.id}`;
  const categoryName = categoryLabel(project.category);

  /**
   * Description leads with the facts a searcher is comparing on — what, where,
   * and what it targets — rather than the marketing copy, which is the same on
   * every listing and gives a snippet nothing to distinguish.
   */
  const seoDescription =
    `${categoryName} project in ${project.location}, Kenya. ` +
    `Targeting ${project.projectedROI}% projected ROI with ${project.payoutFrequency} payouts. ` +
    `${project.description || ''}`.trim().slice(0, 300);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/25">
      {/*
        No Product or Offer schema here — see the note in seo/schema.ts. A land
        offering is not retail stock, and marking it up as such invites both
        the wrong rich result and the wrong kind of regulatory attention.
        BreadcrumbList mirrors the visible trail immediately below.
      */}
      <Seo
        title={`${project.title} — ${categoryName} in ${project.location}`}
        description={seoDescription}
        path={projectPath}
        image={project.imageUrl || undefined}
        jsonLd={[
          baseGraph(
            webPageSchema({
              name: project.title,
              description: seoDescription,
              path: projectPath,
              image: project.imageUrl || undefined,
            }),
            breadcrumbSchema([
              { name: 'Home', path: '/' },
              { name: 'Projects', path: '/projects' },
              // Mirrors the visible trail, which gains a level when this
              // project is a component of a larger development.
              ...(project.parent
                ? [{ name: project.parent.title, path: `/projects/${project.parent.id}` }]
                : []),
              { name: project.title, path: projectPath },
            ]),
          ),
        ]}
      />
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
          {project.parent && (
            <>
              <ChevronRight className="h-4 w-4 text-slate-300" />
              <Link
                to={`/projects/${project.parent.id}`}
                className="hover:text-emerald-700 truncate max-w-[160px] sm:max-w-xs"
              >
                {project.parent.title}
              </Link>
            </>
          )}
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

            {/*
              The two directions of the master-plan link. A component says what
              it belongs to; a master plan lists what it is made of. Both are
              placed directly under the description, because "is this the whole
              development or one piece of it?" is the first question an
              investor has once they have read what the project is.
            */}
            {project.parent && (
              <Card className="border-0 rounded-2xl shadow-lg shadow-slate-200/40 ring-1 ring-emerald-100 bg-emerald-50/40">
                <CardContent className="flex flex-wrap items-center gap-4 p-5">
                  <img
                    src={project.parent.imageUrl}
                    alt=""
                    className="h-16 w-24 shrink-0 rounded-xl object-cover bg-slate-100"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                      <Layers className="h-3.5 w-3.5" />
                      Part of a master plan
                    </p>
                    <p className="mt-1 truncate font-semibold text-slate-900">{project.parent.title}</p>
                    <p className="text-sm text-slate-600">
                      {categoryLabel(project.parent.category)} · {project.parent.location}
                    </p>
                  </div>
                  <Link to={`/projects/${project.parent.id}`} className="shrink-0">
                    <Button variant="outline" className="rounded-xl border-emerald-200 text-emerald-800">
                      View master plan
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {components.length > 0 && (
              <Card className="border-0 rounded-2xl shadow-lg shadow-slate-200/40 ring-1 ring-slate-100">
                <CardHeader className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <Layers className="h-5 w-5 text-emerald-600" />
                    Linked projects
                  </CardTitle>
                  <p className="text-sm text-slate-600">
                    {components.length} projects that make up this development. Each one can be
                    reviewed and backed on its own.
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-slate-100">
                    {components.map((component) => (
                      <li key={component.id}>
                        <Link
                          to={`/projects/${component.id}`}
                          className="group flex items-center gap-4 py-3"
                        >
                          <img
                            src={component.imageUrl}
                            alt=""
                            className="h-14 w-20 shrink-0 rounded-xl object-cover bg-slate-100"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium text-slate-900 group-hover:text-emerald-700">
                              {component.title}
                            </p>
                            <p className="text-sm text-slate-500">
                              {categoryLabel(component.category)} · min{' '}
                              {formatCurrency(component.minInvestmentMinor)}
                            </p>
                          </div>
                          <div className="hidden shrink-0 text-right sm:block">
                            <p className="font-semibold tabular-nums text-slate-900">
                              {formatCurrency(component.totalFundingMinor)}
                            </p>
                            <p className="text-xs text-slate-500">capital</p>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-emerald-600" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
                    <span className="text-slate-600">Linked projects total</span>
                    <span className="font-semibold tabular-nums text-slate-900">
                      {formatCurrency(componentsTotalMinor)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

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
                <p className="mt-1 text-2xl font-bold">{formatCurrency(project.minInvestmentMinor)} min</p>
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
                      <p className="font-semibold text-slate-900">{formatCurrency(project.currentFundingMinor)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Remaining</p>
                      <p className="font-semibold text-slate-900">{formatCurrency(remaining)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {wireInstructions ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                      <div className="flex items-start gap-2">
                        <Landmark className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-emerald-900">
                            Transfer details ready
                          </p>
                          <p className="mt-0.5 text-xs text-emerald-800">
                            Your investment is reserved. It is confirmed once the transfer reaches us.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* The reference is the only thing tying an incoming wire to
                        this investment, so it gets the most prominent treatment
                        and a copy button. */}
                    <div className="rounded-xl border-2 border-dashed border-emerald-300 bg-white p-4 text-center">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Payment reference — quote this exactly
                      </p>
                      <p className="mt-1 font-mono text-xl font-bold tracking-wider text-slate-900">
                        {wireInstructions.reference}
                      </p>
                      <button
                        type="button"
                        onClick={copyReference}
                        className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
                      >
                        {copiedRef ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedRef ? 'Copied' : 'Copy reference'}
                      </button>
                    </div>

                    <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                      {[
                        ['Bank', wireInstructions.account.bankName],
                        ['Account name', wireInstructions.account.accountName],
                        ['Account number', wireInstructions.account.accountNumber],
                        ['SWIFT / BIC', wireInstructions.account.swiftCode],
                        ['Branch', wireInstructions.account.branch],
                        ['Currency', wireInstructions.account.currency],
                      ]
                        .filter(([, value]) => Boolean(value))
                        .map(([label, value]) => (
                          <div key={label as string} className="flex items-start justify-between gap-3 px-4 py-2.5">
                            <dt className="text-xs text-slate-500">{label}</dt>
                            <dd className="text-right text-sm font-medium text-slate-800">{value}</dd>
                          </div>
                        ))}
                    </dl>

                    <p className="text-xs leading-relaxed text-slate-500">{wireInstructions.instructions}</p>

                    <Button
                      variant="outline"
                      className="h-11 w-full rounded-xl"
                      onClick={() => setWireInstructions(null)}
                    >
                      Make another investment
                    </Button>
                  </div>
                ) : (
                <div className="space-y-3">
                  <Label htmlFor="investment" className="text-slate-700">
                    Investment amount ({project.currency})
                  </Label>
                  <Input
                    id="investment"
                    type="number"
                    placeholder={`Min. ${formatCurrency(project.minInvestmentMinor)}`}
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    className="rounded-xl border-slate-200"
                    min={project.minInvestmentMinor / 100}
                  />
                  <p className="text-xs text-slate-500">Minimum {formatCurrency(project.minInvestmentMinor)}</p>

                  {investmentAmount && parseFloat(investmentAmount) * 100 >= project.minInvestmentMinor && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
                      <p className="text-xs font-medium text-emerald-800 uppercase tracking-wide">
                        Est. annual return
                      </p>
                      <p className="text-2xl font-bold text-emerald-700">{formatCurrency(projectedReturn())}</p>
                      <p className="mt-1 text-xs text-slate-600">Based on {project.projectedROI}% ROI (illustrative)</p>
                    </div>
                  )}

                  {/* Only a choice when there is one to make. */}
                  {paymentMethods.length > 1 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Payment method
                      </p>
                      <div className="space-y-2">
                        {paymentMethods.map((m) => {
                          const active = selectedProvider === m.provider;
                          return (
                            <button
                              key={m.provider}
                              type="button"
                              onClick={() => setSelectedProvider(m.provider)}
                              aria-pressed={active}
                              className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                                active
                                  ? 'border-emerald-500 bg-emerald-50/60'
                                  : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <span
                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                  active ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {m.provider === 'MANUAL_WIRE' ? (
                                  <Landmark className="h-4 w-4" />
                                ) : (
                                  <CreditCard className="h-4 w-4" />
                                )}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-sm font-medium text-slate-800">{m.label}</span>
                                <span className="block text-xs text-slate-500">{m.description}</span>
                                {/* Settlement speed is the real difference
                                    between these options, so say it up front. */}
                                <span
                                  className={`mt-1 inline-block rounded-md px-1.5 py-0.5 text-[0.6875rem] font-medium ${
                                    m.settlement === 'instant'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {m.settlement === 'instant'
                                    ? 'Confirmed instantly'
                                    : 'Confirmed in 1-3 business days'}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {project.status === 'open' ? (
                    <Button
                      className="h-12 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-base"
                      onClick={() => void handleInvest()}
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? 'Processing...'
                        : selectedProvider === 'MANUAL_WIRE'
                          ? 'Get transfer details'
                          : 'Invest now'}
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
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
