import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  ArrowUpRight,
  Eye,
  LogOut,
  Home,
  FolderOpen,
  LayoutDashboard,
  Sparkles,
  Menu,
  Calendar,
  Wallet,
  PieChart as PieChartIcon,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Project } from '../data/projects';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Progress } from '../components/ui/progress';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import logo from '../../assets/fibi_logo.svg';
import { getJson } from '@/lib/api';
import { normalizeApiProject, resolveMediaUrl, type ProjectListResponse } from '@/lib/projects';

type ApiInvestment = {
  id: string;
  projectId: string;
  amountInvested: number;
  currentValue: number | null;
  totalReturns: number | null;
  status: 'pending' | 'active' | 'completed';
  investmentDate: string;
  project: {
    id: string;
    title: string;
    location: string;
    category: string;
    totalFunding: number;
    currentFunding: number;
    projectedROI: number;
    payoutFrequency: string;
    status: 'open' | 'funded' | 'active' | 'closed';
    fundingDeadline: string;
    imageUrl: string;
  };
};

type InvestmentsResponse = {
  investments: ApiInvestment[];
};

const PIE_COLORS = ['#059669', '#0d9488', '#6366f1', '#d97706', '#64748b'];

function formatCategory(slug: string) {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [investments, setInvestments] = useState<ApiInvestment[]>([]);
  const [isLoadingInvestments, setIsLoadingInvestments] = useState(true);
  const [investmentsError, setInvestmentsError] = useState('');
  const [platformProjects, setPlatformProjects] = useState<Project[]>([]);

  const handleLogout = () => {
    void logout().then(() => navigate('/', { replace: true }));
  };

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoadingInvestments(true);
      setInvestmentsError('');

      const result = await getJson<InvestmentsResponse>('/api/v1/investments');
      if (cancelled) return;

      if (!result.ok) {
        setInvestmentsError(result.error || 'Failed to load investments.');
        setInvestments([]);
      } else {
        setInvestments(result.data.investments ?? []);
      }

      setIsLoadingInvestments(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await getJson<ProjectListResponse>('/api/v1/projects');
      if (cancelled) return;
      if (result.ok) {
        setPlatformProjects((result.data.projects ?? []).map(normalizeApiProject));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const userInvestments = useMemo(
    () =>
      investments.map((inv) => ({
        ...inv,
        currentValue: inv.currentValue ?? inv.amountInvested,
        totalReturns: inv.totalReturns ?? 0,
        projectTitle: inv.project?.title ?? 'Project',
      })),
    [investments]
  );

  const totals = useMemo(() => {
    const totalInvested = userInvestments.reduce((sum, inv) => sum + inv.amountInvested, 0);
    const totalCurrentValue = userInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalReturns = userInvestments.reduce((sum, inv) => sum + inv.totalReturns, 0);
    const totalGain = totalCurrentValue - totalInvested;
    const totalGainPercentage =
      totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : '0.00';
    return {
      totalInvested,
      totalCurrentValue,
      totalReturns,
      totalGain,
      totalGainPercentage,
    };
  }, [userInvestments]);

  const { totalInvested, totalCurrentValue, totalReturns, totalGain, totalGainPercentage } = totals;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const portfolioData = useMemo(() => {
    const { totalInvested: inv, totalCurrentValue: cur } = totals;
    if (inv <= 0 && cur <= 0) {
      return [
        { month: 'Nov 25', value: 0 },
        { month: 'Dec 25', value: 0 },
        { month: 'Jan 26', value: 0 },
        { month: 'Feb 26', value: 0 },
      ];
    }
    const t1 = Math.round(inv * 0.25);
    const t2 = Math.round(inv * 0.55);
    const t3 = Math.round((inv + cur) / 2);
    return [
      { month: 'Nov 25', value: 0 },
      { month: 'Dec 25', value: Math.min(t1, cur) },
      { month: 'Jan 26', value: Math.min(t2, cur) },
      { month: 'Feb 26', value: Math.min(Math.max(t3, t2), cur) },
      { month: 'Mar 26', value: cur },
    ];
  }, [totals]);

  const allocationData = useMemo(() => {
    const byCat: Record<string, number> = {};
    userInvestments.forEach((inv) => {
      const key = inv.project?.category ?? 'other';
      byCat[key] = (byCat[key] ?? 0) + inv.amountInvested;
    });
    return Object.entries(byCat).map(([name, value]) => ({
      name: formatCategory(name),
      value,
    }));
  }, [userInvestments]);

  const investedIds = useMemo(
    () => new Set(userInvestments.map((i) => i.projectId)),
    [userInvestments]
  );

  const suggestedProjects = useMemo(() => {
    const open = platformProjects.filter((p) => p.status === 'open');
    const notInvested = open.filter((p) => !investedIds.has(p.id));
    if (notInvested.length > 0) return notInvested.slice(0, 3);
    if (open.length > 0) return open.slice(0, 3);
    return platformProjects.slice(0, 3);
  }, [investedIds, platformProjects]);

  const upcomingPayouts = useMemo(
    () => [
      {
        id: '1',
        project: 'Capsule Houses Eco-Lodge',
        date: new Date('2026-04-01'),
        amount: 125,
      },
      {
        id: '2',
        project: 'Solar Roofs Initiative',
        date: new Date('2026-04-15'),
        amount: 98,
      },
      {
        id: '3',
        project: 'Capsule Houses Eco-Lodge',
        date: new Date('2026-05-01'),
        amount: 125,
      },
    ],
    []
  );

  const hasInvestments = userInvestments.length > 0;

  const statCards = [
    {
      title: 'Total invested',
      value: formatCurrency(totalInvested),
      hint: hasInvestments
        ? `Across ${userInvestments.length} project${userInvestments.length === 1 ? '' : 's'}`
        : 'Start by browsing open projects',
      icon: DollarSign,
      accent: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      title: 'Current value',
      value: formatCurrency(totalCurrentValue),
      hint: `${totalGain >= 0 ? '+' : ''}${totalGainPercentage}% vs. invested`,
      icon: TrendingUp,
      accent: 'text-teal-600',
      iconBg: 'bg-teal-50',
      hintClass:
        totalGain >= 0 ? 'text-emerald-600 font-medium' : 'text-red-600 font-medium',
    },
    {
      title: 'Total returns',
      value: formatCurrency(totalReturns),
      hint: 'Paid & accrued to date',
      icon: Sparkles,
      accent: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      valueClass: 'text-emerald-600',
    },
    {
      title: 'Active projects',
      value: String(userInvestments.length),
      hint: `${userInvestments.filter((inv) => inv.status === 'active').length} generating returns`,
      icon: Briefcase,
      accent: 'text-slate-700',
      iconBg: 'bg-slate-100',
    },
  ];

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <>
      <Link
        to="/"
        onClick={onNavigate}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
      >
        <Home className="h-4 w-4 shrink-0" />
        Home
      </Link>
      <Link
        to="/projects"
        onClick={onNavigate}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
      >
        <FolderOpen className="h-4 w-4 shrink-0" />
        Projects
      </Link>
      <span className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-100 text-emerald-900 font-medium">
        <LayoutDashboard className="h-4 w-4 shrink-0" />
        Portfolio
      </span>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40">
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Withdraw earnings</DialogTitle>
            <DialogDescription>
              Withdrawals to your bank or mobile money will be available in a future update. For now,
              contact support if you need a manual payout.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawOpen(false)}>
              Close
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
              <a href="mailto:support@fibi.com">Email support</a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Account settings</DialogTitle>
            <DialogDescription>
              Profile and security settings will be connected here soon. Your session and role are
              managed securely through FIBI login.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <header
        role="banner"
        className="sticky top-0 z-30 border-b border-emerald-100/80 bg-white/90 backdrop-blur-md shadow-sm shadow-emerald-900/5"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-6 min-w-0">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="sm:hidden shrink-0 text-slate-700"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(100%,320px)] p-0">
                <SheetHeader className="p-4 border-b text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <img src={logo} alt="" className="h-8 w-auto" />
                    Menu
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col p-3 gap-1" aria-label="Mobile">
                  <NavLinks onNavigate={() => setMobileOpen(false)} />
                </nav>
                <div className="p-4 mt-auto border-t space-y-2">
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-700"
                    onClick={() => {
                      setMobileOpen(false);
                      void handleLogout();
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <Link to="/" className="shrink-0 flex items-center">
              <img src={logo} alt="FIBI" className="h-8 sm:h-9 w-auto" />
            </Link>
            <nav
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-slate-600"
              aria-label="Primary"
            >
              <Link
                to="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
              >
                <Home className="h-4 w-4" />
                Home
              </Link>
              <Link
                to="/projects"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
              >
                <FolderOpen className="h-4 w-4" />
                Projects
              </Link>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100/80 text-emerald-800">
                <LayoutDashboard className="h-4 w-4" />
                Portfolio
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden md:flex flex-col items-end text-right min-w-0">
              <span className="text-sm font-medium text-slate-900 truncate max-w-[200px]">
                {user?.name}
              </span>
              <span className="text-xs text-slate-500 truncate max-w-[200px]">{user?.email}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-300"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Log out</span>
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content">
        <div className="relative overflow-hidden border-b border-emerald-100/60 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-80" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
            <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider mb-1">
              Investor portfolio
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] ?? 'Investor'}
            </h1>
            <p className="mt-2 text-emerald-100/95 max-w-xl text-sm sm:text-base">
              Track performance, allocation, payouts, and every project you support—on any device.
            </p>
            {hasInvestments && (
              <div className="mt-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur-sm">
                  <Wallet className="h-4 w-4 shrink-0" />
                  <span>Net gain {formatCurrency(totalGain)}</span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur-sm">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>Next payout soon</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-16">
          {isLoadingInvestments ? (
            <Card className="border-0 shadow-lg rounded-2xl ring-1 ring-slate-100 max-w-lg mx-auto text-center p-10 sm:p-12">
              <h2 className="text-xl font-semibold text-slate-900">Loading investments...</h2>
              <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                Fetching your live portfolio from the backend.
              </p>
            </Card>
          ) : investmentsError ? (
            <Card className="border-0 shadow-lg rounded-2xl ring-1 ring-slate-100 max-w-lg mx-auto text-center p-10 sm:p-12">
              <h2 className="text-xl font-semibold text-slate-900">Unable to load investments</h2>
              <p className="text-red-600 mt-2 text-sm leading-relaxed">{investmentsError}</p>
              <Button
                className="mt-8 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </Card>
          ) : !hasInvestments ? (
            <Card className="border-0 shadow-lg rounded-2xl ring-1 ring-slate-100 max-w-lg mx-auto text-center p-10 sm:p-12">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
                <Briefcase className="h-7 w-7 text-emerald-700" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">No investments yet</h2>
              <p className="text-slate-600 mt-2 text-sm leading-relaxed">
                Explore vetted land and sustainability projects. When you invest, your portfolio,
                charts, and payouts will appear here.
              </p>
              <Button className="mt-8 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700" asChild>
                <Link to="/projects">Browse open projects</Link>
              </Button>
            </Card>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-8 sm:mb-10">
                {statCards.map((card) => (
                  <Card
                    key={card.title}
                    className="border-0 shadow-md shadow-slate-200/60 rounded-2xl bg-white overflow-hidden ring-1 ring-slate-100/80 hover:ring-emerald-200/60 transition-all duration-200"
                  >
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-5 px-5">
                      <CardTitle className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {card.title}
                      </CardTitle>
                      <div className={`rounded-xl p-2.5 ${card.iconBg}`}>
                        <card.icon className={`h-4 w-4 ${card.accent}`} />
                      </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                      <div
                        className={`text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 ${'valueClass' in card ? card.valueClass : ''}`}
                      >
                        {card.value}
                      </div>
                      <p
                        className={`text-xs mt-2 flex items-center gap-1 ${'hintClass' in card && card.hintClass ? card.hintClass : 'text-slate-500'}`}
                      >
                        {card.title === 'Current value' &&
                          (totalGain >= 0 ? (
                            <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                          ) : (
                            <TrendingDown className="h-3.5 w-3.5 shrink-0" />
                          ))}
                        {card.hint}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl ring-1 ring-slate-100 overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                      <CardTitle className="text-lg font-semibold text-slate-900">
                        Portfolio growth
                      </CardTitle>
                      <p className="text-sm text-slate-500 font-normal">
                        Estimated portfolio value over time
                      </p>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="h-[280px] sm:h-[300px] w-full min-h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={portfolioData}
                            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                          >
                            <defs>
                              <linearGradient id="investorArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis
                              dataKey="month"
                              stroke="#64748b"
                              tick={{ fontSize: 12 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              stroke="#64748b"
                              tick={{ fontSize: 12 }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip
                              formatter={(value: number) => [formatCurrency(value), 'Value']}
                              contentStyle={{
                                backgroundColor: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.08)',
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="value"
                              stroke="#059669"
                              strokeWidth={2}
                              fillOpacity={1}
                              fill="url(#investorArea)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {allocationData.length > 0 && (
                    <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl ring-1 ring-slate-100 overflow-hidden">
                      <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                        <div className="flex items-center gap-2">
                          <PieChartIcon className="h-5 w-5 text-emerald-600" />
                          <div>
                            <CardTitle className="text-lg font-semibold text-slate-900">
                              Allocation by category
                            </CardTitle>
                            <p className="text-sm text-slate-500 font-normal">
                              How your capital is split across themes
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-center gap-8">
                          <div className="h-[220px] w-full sm:w-[240px] shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={allocationData}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={52}
                                  outerRadius={88}
                                  paddingAngle={2}
                                >
                                  {allocationData.map((_, i) => (
                                    <Cell
                                      key={i}
                                      fill={PIE_COLORS[i % PIE_COLORS.length]}
                                      stroke="white"
                                      strokeWidth={2}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip
                                  formatter={(v: number) => formatCurrency(v)}
                                  contentStyle={{ borderRadius: 12 }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <ul className="flex-1 w-full space-y-3">
                            {allocationData.map((row, i) => (
                              <li
                                key={row.name}
                                className="flex items-center justify-between gap-3 text-sm"
                              >
                                <span className="flex items-center gap-2 min-w-0">
                                  <span
                                    className="h-2.5 w-2.5 rounded-full shrink-0"
                                    style={{
                                      backgroundColor: PIE_COLORS[i % PIE_COLORS.length],
                                    }}
                                  />
                                  <span className="text-slate-700 truncate">{row.name}</span>
                                </span>
                                <span className="font-semibold text-slate-900 tabular-nums shrink-0">
                                  {formatCurrency(row.value)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-6">
                  <Card className="border-0 shadow-md shadow-slate-200/50 rounded-2xl ring-1 ring-slate-100 overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-white pb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-emerald-600" />
                        <CardTitle className="text-lg font-semibold">Upcoming payouts</CardTitle>
                      </div>
                      <p className="text-sm text-slate-500 font-normal">Scheduled distributions</p>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      {upcomingPayouts.map((p) => (
                        <div
                          key={p.id}
                          className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-3"
                        >
                          <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
                            {p.date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-sm font-semibold text-slate-900 mt-1 line-clamp-2">
                            {p.project}
                          </p>
                          <p className="text-sm text-emerald-600 font-medium mt-1">
                            {formatCurrency(p.amount)}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md shadow-slate-200/50 rounded-2xl ring-1 ring-slate-100">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-semibold">Quick actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Link to="/projects" className="block">
                        <Button className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                          Browse projects
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11 rounded-xl border-slate-200"
                        onClick={() => setWithdrawOpen(true)}
                      >
                        Withdraw earnings
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full h-11 rounded-xl border-slate-200"
                        onClick={() => setSettingsOpen(true)}
                      >
                        Account settings
                      </Button>
                      <Separator className="my-1" />
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-full h-11 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Log out
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {suggestedProjects.length > 0 && (
                <section className="mt-10" aria-labelledby="discover-heading">
                  <div className="flex items-end justify-between gap-4 mb-4">
                    <div>
                      <h2
                        id="discover-heading"
                        className="text-lg font-semibold text-slate-900 tracking-tight"
                      >
                        Discover more projects
                      </h2>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {suggestedProjects.some((p) => !investedIds.has(p.id))
                          ? 'Diversify with open opportunities on FIBI'
                          : 'Featured projects on the platform'}
                      </p>
                    </div>
                    <Link
                      to="/projects"
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 shrink-0"
                    >
                      View all
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suggestedProjects.map((p: Project) => {
                      const pct = Math.min(
                        100,
                        Math.round((p.currentFunding / p.totalFunding) * 100)
                      );
                      return (
                        <Card
                          key={p.id}
                          className="border-0 shadow-md rounded-2xl ring-1 ring-slate-100 overflow-hidden group hover:ring-emerald-200/70 transition-all"
                        >
                          <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                            <img
                              src={resolveMediaUrl(p.imageUrl)}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                            />
                            <Badge className="absolute top-3 left-3 bg-white/95 text-slate-800 hover:bg-white shadow-sm capitalize">
                              {formatCategory(p.category)}
                            </Badge>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-slate-900 line-clamp-2 leading-snug">
                              {p.title}
                            </h3>
                            <p className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              {p.location}
                            </p>
                            <div className="mt-3 space-y-1.5">
                              <div className="flex justify-between text-xs text-slate-600">
                                <span>Funding</span>
                                <span className="font-medium text-slate-900">{pct}%</span>
                              </div>
                              <Progress value={pct} className="h-2 bg-slate-100 [&>[data-slot=progress-indicator]]:bg-emerald-600" />
                            </div>
                            <Button variant="outline" size="sm" className="w-full mt-4 rounded-xl" asChild>
                              <Link to={`/projects/${p.id}`}>View details</Link>
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              )}

              <section className="mt-10" aria-labelledby="investments-heading">
                <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl ring-1 ring-slate-100 overflow-hidden">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                    <h2 id="investments-heading" className="text-lg font-semibold text-slate-900">
                      Your investments
                    </h2>
                    <p className="text-sm text-slate-500 font-normal">
                      Live positions and project funding progress
                    </p>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-5">
                      {userInvestments.map((investment) => {
                        const project = investment.project;
                        const gain = investment.currentValue - investment.amountInvested;
                        const gainPercentage =
                          investment.amountInvested > 0
                            ? ((gain / investment.amountInvested) * 100).toFixed(2)
                            : '0';
                        const fundPct = project
                          ? Math.min(
                              100,
                              Math.round((project.currentFunding / project.totalFunding) * 100)
                            )
                          : 0;

                        return (
                          <article
                            key={investment.id}
                            className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-100/80 transition-all duration-200"
                          >
                            <div className="flex flex-col sm:flex-row">
                              {project && (
                                <div className="sm:w-44 md:w-52 shrink-0 aspect-[4/3] sm:aspect-auto sm:min-h-[200px] bg-slate-100">
                                  <img
                                    src={resolveMediaUrl(project.imageUrl)}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 p-4 sm:p-5 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                      <h3 className="text-base sm:text-lg font-semibold text-slate-900">{investment.projectTitle}</h3>
                                      <Badge
                                        className={
                                          investment.status === 'active'
                                            ? 'bg-emerald-500 hover:bg-emerald-600'
                                            : investment.status === 'pending'
                                              ? 'bg-amber-500 hover:bg-amber-600'
                                              : 'bg-slate-500 hover:bg-slate-600'
                                        }
                                      >
                                        {investment.status}
                                      </Badge>
                                      {project && (
                                        <Badge variant="outline" className="capitalize text-slate-600">
                                          {formatCategory(project.category)}
                                        </Badge>
                                      )}
                                    </div>
                                    {project && (
                                      <p className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {project.location}
                                      </p>
                                    )}

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-sm">
                                      <div className="rounded-xl bg-slate-50 px-3 py-2">
                                        <div className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                                          Invested
                                        </div>
                                        <div className="font-semibold text-slate-900 mt-0.5 tabular-nums">
                                          {formatCurrency(investment.amountInvested)}
                                        </div>
                                      </div>
                                      <div className="rounded-xl bg-slate-50 px-3 py-2">
                                        <div className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                                          Current value
                                        </div>
                                        <div className="font-semibold text-slate-900 mt-0.5 tabular-nums">
                                          {formatCurrency(investment.currentValue)}
                                        </div>
                                      </div>
                                      <div className="rounded-xl bg-slate-50 px-3 py-2">
                                        <div className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                                          Returns
                                        </div>
                                        <div className="font-semibold text-emerald-600 mt-0.5 tabular-nums">
                                          {formatCurrency(investment.totalReturns)}
                                        </div>
                                      </div>
                                      <div className="rounded-xl bg-slate-50 px-3 py-2">
                                        <div className="text-slate-500 text-xs font-medium uppercase tracking-wide">
                                          Gain
                                        </div>
                                        <div
                                          className={`font-semibold mt-0.5 tabular-nums ${gain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}
                                        >
                                          {gain >= 0 ? '+' : ''}
                                          {gainPercentage}%
                                        </div>
                                      </div>
                                    </div>

                                    {project && (
                                      <div className="mt-4 pt-4 border-t border-slate-100">
                                        <p className="text-xs font-medium text-slate-600 mb-2">
                                          Project funding progress
                                        </p>
                                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                                          <span>
                                            {formatCurrency(project.currentFunding)} raised
                                          </span>
                                          <span>{fundPct}% of goal</span>
                                        </div>
                                        <Progress
                                          value={fundPct}
                                          className="h-2 bg-slate-100 [&>[data-slot=progress-indicator]]:bg-teal-600"
                                        />
                                        <p className="text-xs text-slate-500 mt-3">
                                          Invested on{' '}
                                          {new Date(investment.investmentDate).toLocaleDateString(
                                            'en-US',
                                            {
                                              month: 'short',
                                              day: 'numeric',
                                              year: 'numeric',
                                            }
                                          )}
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {project && (
                                    <Link
                                      to={`/projects/${project.id}`}
                                      className="shrink-0 self-start sm:self-center"
                                    >
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl border-slate-200"
                                      >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View project
                                      </Button>
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                      <Link to="/projects">
                        <Button variant="outline" className="w-full h-11 rounded-xl border-slate-200">
                          Explore more opportunities
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </section>

              <p className="text-center text-xs text-slate-400 mt-10">
                Need help?{' '}
                <a href="mailto:support@fibi.com" className="text-emerald-600 hover:underline">
                  support@fibi.com
                </a>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
