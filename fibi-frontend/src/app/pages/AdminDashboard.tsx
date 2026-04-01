import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router';
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Eye,
  CheckCircle,
  Clock,
  LayoutDashboard,
  FolderOpen,
  BarChart,
  Settings,
  LogOut,
  Plus,
  Trash2
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import type { Project } from '../data/projects';
import { getJson, putJson, deleteJson, postFormData, putFormData } from '@/lib/api';
import {
  normalizeApiProject,
  type ProjectListResponse,
  type ProjectCreateResponse,
  type ProjectUpdateResponse,
} from '@/lib/projects';
import {
  USERS_PREFIX,
  userGrowthSeriesFromCount,
  type UsersListResponse,
  type UserListEntry,
} from '@/lib/users';
import logo from '../../assets/logo.svg';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table';
import {
  LineChart,
  Line,
  BarChart as ReBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function AdminDashboard() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    void logout().then(() => navigate('/', { replace: true }));
  };
  const [activeSection, setActiveSection] = useState('dashboard');
  const [platformSettings, setPlatformSettings] = useState({
  platformName: "FIBI",
  supportEmail: "support@fibi.com",
  contactPhone: "+254 700 000 000",
});

const [investmentRules, setInvestmentRules] = useState({
  minInvestment: 100,
  maxInvestment: 50000,
  platformFee: 2,
  currency: "USD",
});

const [paymentSettings, setPaymentSettings] = useState({
  depositsEnabled: true,
  withdrawalsEnabled: true,
  transactionFee: 1.5,
});

const [notificationSettings, setNotificationSettings] = useState({
  emailNotifications: true,
  investmentEmails: true,
  adminAlerts: true,
});

const [securitySettings, setSecuritySettings] = useState({
  twoFactorAuth: false,
  sessionTimeout: 30,
});

const [adminProfile, setAdminProfile] = useState({
  name: "Admin",
  email: "admin@fibi.com",
});
  const [adminProfileSaving, setAdminProfileSaving] = useState(false);
  const [adminProfileMsg, setAdminProfileMsg] = useState('');
  const [adminProfileErr, setAdminProfileErr] = useState('');
  const [adminPwCurrent, setAdminPwCurrent] = useState('');
  const [adminPwNew, setAdminPwNew] = useState('');
  const [adminPwConfirm, setAdminPwConfirm] = useState('');
  const [adminPwBusy, setAdminPwBusy] = useState(false);
  const [adminPwErr, setAdminPwErr] = useState('');
  const [adminPwMsg, setAdminPwMsg] = useState('');

  const [adminUsers, setAdminUsers] = useState<UserListEntry[]>([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminUsersError, setAdminUsersError] = useState('');
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteUserBusy, setDeleteUserBusy] = useState(false);

  function defaultFundingDeadline(): string {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  }

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState('');
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminFormError, setAdminFormError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    category: '',
    location: '',
    minInvestment: 100,
    totalFunding: 0,
    currentFunding: 0,
    investors: 0,
    projectedROI: 10,
    payoutFrequency: 'Quarterly',
    fundingDeadline: defaultFundingDeadline(),
    description: '',
    featuresText: '',
    status: 'open',
  });
  const [addCoverFile, setAddCoverFile] = useState<File | null>(null);
  const [addGalleryFiles, setAddGalleryFiles] = useState<File[]>([]);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editGalleryFiles, setEditGalleryFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    let cancelled = false;
    (async () => {
      setProjectsLoading(true);
      setProjectsError('');
      const res = await getJson<ProjectListResponse>('/api/v1/projects');
      if (cancelled) return;
      if (!res.ok) {
        setProjectsError(res.error || 'Failed to load projects.');
        setProjects([]);
      } else {
        setProjects((res.data.projects ?? []).map(normalizeApiProject));
      }
      setProjectsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    let cancelled = false;
    (async () => {
      setAdminUsersLoading(true);
      setAdminUsersError('');
      const res = await getJson<UsersListResponse>(USERS_PREFIX);
      if (cancelled) return;
      setAdminUsersLoading(false);
      if (!res.ok) {
        setAdminUsersError(res.error || 'Failed to load users.');
        setAdminUsers([]);
      } else {
        setAdminUsers(res.data.data ?? []);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setAdminProfile({ name: user.name, email: user.email });
  }, [user]);

  if (!user) return null;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

  const totalUsers = adminUsers.length;
  const totalInvested = projects.reduce((sum, p) => sum + p.currentFunding, 0);
  const activeProjects = projects.filter(p => p.status === 'open').length;
  const platformRevenue = totalInvested * 0.02;
  const totalInvestors = projects.reduce((sum, p) => sum + p.investors, 0);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);

  const kenyanNames = ['Mwangi Kamau','Achieng Odhiambo','Juma Wanyama','Njeri Wambui','Otieno Odongo','Wanjiku Mwikali'];
  const recentTransactions = projects.map((project, index) => ({
    id: (index + 1).toString(),
    investor: kenyanNames[index % kenyanNames.length],
    project: project.title,
    amount: Math.floor(Math.random() * 15000) + 1000,
    date: new Date(Date.now() - index * 86400000).toISOString(),
    status: index % 2 === 0 ? 'completed' : 'pending'
  }));

  const userGrowthData = userGrowthSeriesFromCount(totalUsers);
  const investmentGrowthData = [
    { month: 'Oct 25', amount: 25000 },
    { month: 'Nov 25', amount: 42000 },
    { month: 'Dec 25', amount: 61000 },
    { month: 'Jan 26', amount: 83000 },
    { month: 'Feb 26', amount: 96000 },
    { month: 'Mar 26', amount: totalInvested }
  ];

  const projectInvestmentData = projects.map(project => ({
    name: project.title,
    amount: project.currentFunding
  }));

  const categoryTotals: any = {};
  projects.forEach(project => {
    categoryTotals[project.category] =
      (categoryTotals[project.category] || 0) + project.currentFunding;
  });

  const categoryChartData = Object.keys(categoryTotals).map(key => ({
    name: key,
    value: categoryTotals[key]
  }));

  const COLORS = ['#10b981','#6366f1','#f59e0b','#ef4444','#3b82f6'];

  const sidebarItems = [
    { name: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, key: 'dashboard' },
    { name: 'Users', icon: <Users className="h-4 w-4" />, key: 'users' },
    { name: 'Projects', icon: <FolderOpen className="h-4 w-4" />, key: 'projects' },
    { name: 'Transactions', icon: <BarChart className="h-4 w-4" />, key: 'transactions' },
    { name: 'Analytics', icon: <TrendingUp className="h-4 w-4" />, key: 'analytics' },
    { name: 'Settings', icon: <Settings className="h-4 w-4" />, key: 'settings' }
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setNewProject((prev) => ({ ...prev, [field]: value }));
  };

  const resetAddForm = () => {
    setNewProject({
      title: '',
      category: '',
      location: '',
      minInvestment: 100,
      totalFunding: 0,
      currentFunding: 0,
      investors: 0,
      projectedROI: 10,
      payoutFrequency: 'Quarterly',
      fundingDeadline: defaultFundingDeadline(),
      description: '',
      featuresText: '',
      status: 'open',
    });
    setAddCoverFile(null);
    setAddGalleryFiles([]);
  };

  const handleAddProject = async () => {
    setAdminFormError('');
    if (!newProject.title.trim()) {
      setAdminFormError('Title is required.');
      return;
    }
    if (!addCoverFile) {
      setAdminFormError('Upload a primary cover image (required by the server).');
      return;
    }
    setAdminBusy(true);
    const features = newProject.featuresText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const fd = new FormData();
    fd.append('title', newProject.title.trim());
    fd.append('location', newProject.location.trim());
    fd.append('category', newProject.category.trim());
    fd.append('minInvestment', String(newProject.minInvestment));
    fd.append('totalFunding', String(newProject.totalFunding));
    fd.append('currentFunding', String(newProject.currentFunding));
    fd.append('investorsCount', String(newProject.investors));
    fd.append('projectedROI', String(newProject.projectedROI));
    fd.append('payoutFrequency', newProject.payoutFrequency);
    fd.append('fundingDeadline', newProject.fundingDeadline);
    fd.append('description', newProject.description.trim() || '—');
    fd.append('features', JSON.stringify(features));
    fd.append('status', newProject.status);
    fd.append('timeline', JSON.stringify([{ phase: 'Kickoff', status: 'upcoming' }]));
    fd.append('image', addCoverFile);
    addGalleryFiles.forEach((f) => fd.append('images', f));
    const res = await postFormData<ProjectCreateResponse>('/api/v1/projects', fd);
    setAdminBusy(false);
    if (!res.ok) {
      setAdminFormError(res.error);
      return;
    }
    const created = normalizeApiProject(res.data.project);
    setProjects((prev) => [created, ...prev]);
    setIsAddModalOpen(false);
    resetAddForm();
  };

  const handleDeleteProject = async () => {
    if (!deleteProjectId) return;
    setAdminBusy(true);
    const res = await deleteJson<{ message?: string }>(`/api/v1/projects/${deleteProjectId}`);
    setAdminBusy(false);
    if (!res.ok) {
      setAdminFormError(res.error);
      return;
    }
    setProjects((prev) => prev.filter((p) => p.id !== deleteProjectId));
    setDeleteProjectId(null);
    setIsDeleteModalOpen(false);
  };

  const openProjectDetails = (project: Project) => {
    setSelectedProject({ ...project });
    setEditCoverFile(null);
    setEditGalleryFiles([]);
    setAdminFormError('');
    setIsDetailsModalOpen(true);
  };

  const handleUpdateProject = async () => {
    if (!selectedProject) return;
    setAdminFormError('');
    setAdminBusy(true);
    const id = selectedProject.id;
    let res:
      | { ok: true; data: ProjectUpdateResponse }
      | { ok: false; status: number; error: string };

    if (editCoverFile || editGalleryFiles.length > 0) {
      const fd = new FormData();
      fd.append('title', selectedProject.title);
      fd.append('location', selectedProject.location);
      fd.append('category', selectedProject.category);
      fd.append('minInvestment', String(selectedProject.minInvestment));
      fd.append('totalFunding', String(selectedProject.totalFunding));
      fd.append('currentFunding', String(selectedProject.currentFunding));
      fd.append('investorsCount', String(selectedProject.investors));
      fd.append('projectedROI', String(selectedProject.projectedROI));
      fd.append('payoutFrequency', selectedProject.payoutFrequency);
      fd.append('fundingDeadline', selectedProject.fundingDeadline);
      fd.append('description', selectedProject.description);
      fd.append('features', JSON.stringify(selectedProject.features));
      fd.append('status', selectedProject.status);
      if (editCoverFile) fd.append('image', editCoverFile);
      editGalleryFiles.forEach((f) => fd.append('images', f));
      res = await putFormData<ProjectUpdateResponse>(`/api/v1/projects/${id}`, fd);
    } else {
      res = await putJson<ProjectUpdateResponse>(`/api/v1/projects/${id}`, {
        title: selectedProject.title,
        location: selectedProject.location,
        category: selectedProject.category,
        minInvestment: selectedProject.minInvestment,
        totalFunding: selectedProject.totalFunding,
        currentFunding: selectedProject.currentFunding,
        investorsCount: selectedProject.investors,
        projectedROI: selectedProject.projectedROI,
        payoutFrequency: selectedProject.payoutFrequency,
        fundingDeadline: selectedProject.fundingDeadline,
        description: selectedProject.description,
        features: selectedProject.features,
        status: selectedProject.status,
      });
    }

    setAdminBusy(false);
    if (!res.ok) {
      setAdminFormError(res.error);
      return;
    }
    const updated = normalizeApiProject(res.data.project);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    setIsDetailsModalOpen(false);
    setSelectedProject(null);
    setEditCoverFile(null);
    setEditGalleryFiles([]);
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    setDeleteUserBusy(true);
    const res = await deleteJson<{ message?: string }>(`${USERS_PREFIX}/${deleteUserId}`);
    setDeleteUserBusy(false);
    if (!res.ok) {
      setAdminUsersError(res.error);
      return;
    }
    setAdminUsers((prev) => prev.filter((u) => u.id !== deleteUserId));
    setDeleteUserId(null);
    setIsDeleteUserModalOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col justify-between">
  <div className="px-6 py-8">

    {/* Logo */}
    <div className="flex justify-center mb-6">
      <img
        src={logo}
        alt="FIBI"
        className="h-30 w-auto"
      />
    </div>

              <nav className="flex flex-col gap-2">
            {sidebarItems.map(item => (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md w-full text-left transition-colors ${
                  activeSection === item.key ? 'bg-emerald-100 text-emerald-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon} {item.name}
              </button>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 mt-4 rounded-md w-full text-left text-red-600 hover:bg-red-100 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Log Out
            </button>
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Dashboard */}
        {activeSection === 'dashboard' && (
          <>
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
              <StatCard title="Total Users" value={totalUsers.toLocaleString()} icon={<Users className="h-4 w-4" />} subtitle="Registered accounts" />
              <StatCard title="Total Invested" value={formatCurrency(totalInvested)} icon={<DollarSign className="h-4 w-4" />} subtitle={`${totalInvestors} investors`} />
              <StatCard title="Active Projects" value={activeProjects} icon={<Activity className="h-4 w-4" />} subtitle={`Out of ${projects.length}`} />
              <StatCard title="Platform Revenue" value={formatCurrency(platformRevenue)} icon={<TrendingUp className="h-4 w-4" />} subtitle="2% platform fee" />
            </div>
            <Card className="mb-8">
              <CardHeader><CardTitle className="text-xl font-semibold">User growth (trend illustration)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}

        {activeSection === 'users' && (
          <>
            <h1 className="text-3xl font-bold mb-6">Users</h1>
            {adminUsersError && (
              <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
                {adminUsersError}
              </p>
            )}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All accounts</CardTitle>
              </CardHeader>
              <CardContent>
                {adminUsersLoading ? (
                  <p className="text-sm text-gray-500 py-8 text-center">Loading users…</p>
                ) : adminUsers.length === 0 ? (
                  <p className="text-sm text-gray-500 py-8 text-center">No users found.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {u.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={u.id === user.id}
                              title={u.id === user.id ? 'Cannot delete your own account' : 'Delete user'}
                              onClick={() => {
                                setDeleteUserId(u.id);
                                setIsDeleteUserModalOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Projects */}
        {activeSection === 'projects' && (
          <>
            <h1 className="text-3xl font-bold mb-6">Projects</h1>
            {projectsError && (
              <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
                {projectsError}
              </p>
            )}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      setAdminFormError('');
                      resetAddForm();
                      setIsAddModalOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2"/> New Project
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <p className="text-sm text-gray-500 py-8 text-center">Loading projects…</p>
                ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Funding</TableHead>
                      <TableHead>Investors</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.title}</TableCell>
                        <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                        <TableCell>{p.location}</TableCell>
                        <TableCell>
                          {p.totalFunding > 0
                            ? ((p.currentFunding / p.totalFunding) * 100).toFixed(0)
                            : '0'}
                          %
                        </TableCell>
                        <TableCell>{p.investors}</TableCell>
                        <TableCell><Badge>{p.status}</Badge></TableCell>
                        <TableCell className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openProjectDetails(p)}>
                            <Eye className="h-4 w-4"/>
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => { setDeleteProjectId(p.id); setIsDeleteModalOpen(true); }}>
                            <Trash2 className="h-4 w-4"/>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Transactions */}
        {activeSection === 'transactions' && (
          <>
            <h1 className="text-3xl font-bold mb-6">Recent Transactions</h1>
            <Card>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Investor</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentTransactions.map(t => (
                      <TableRow key={t.id}>
                        <TableCell>{t.investor}</TableCell>
                        <TableCell>{t.project}</TableCell>
                        <TableCell>{formatCurrency(t.amount)}</TableCell>
                        <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          {t.status==='completed' ? <CheckCircle className="h-4 w-4 text-green-600"/> : <Clock className="h-4 w-4 text-yellow-600"/>}
                          {t.status==='completed' ? 'Completed':'Pending'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}

        {/* Analytics */}
{activeSection === 'analytics' && (
  <>
    <h1 className="text-3xl font-bold mb-6">Analytics</h1>

    {/* Investment Growth */}
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Platform Investment Growth
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={investmentGrowthData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#10b981"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>

    {/* Investments Per Project */}
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Investment by Project
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ReBarChart data={projectInvestmentData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#6366f1" />
          </ReBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>

    {/* Category Distribution */}
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Funding by Category
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryChartData}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              label
            >
              {categoryChartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </>
)}
        {/* Settings */}
        {activeSection === 'settings' && (
<>
<h1 className="text-3xl font-bold mb-6">Settings</h1>

<div className="grid gap-6 lg:grid-cols-2">

{/* Platform Settings */}
<Card>
<CardHeader>
<CardTitle>Platform Settings</CardTitle>
</CardHeader>

<CardContent className="space-y-4">

<div>
<Label>Platform Name</Label>
<Input
value={platformSettings.platformName}
onChange={(e)=>
setPlatformSettings({...platformSettings,platformName:e.target.value})
}
/>
</div>

<div>
<Label>Support Email</Label>
<Input
value={platformSettings.supportEmail}
onChange={(e)=>
setPlatformSettings({...platformSettings,supportEmail:e.target.value})
}
/>
</div>

<div>
<Label>Contact Phone</Label>
<Input
value={platformSettings.contactPhone}
onChange={(e)=>
setPlatformSettings({...platformSettings,contactPhone:e.target.value})
}
/>
</div>

<Button className="bg-emerald-600 hover:bg-emerald-700">
Save Platform Settings
</Button>

</CardContent>
</Card>

{/* Investment Rules */}

<Card>
<CardHeader>
<CardTitle>Investment Rules</CardTitle>
</CardHeader>

<CardContent className="space-y-4">

<div>
<Label>Minimum Investment</Label>
<Input
type="number"
value={investmentRules.minInvestment}
onChange={(e)=>
setInvestmentRules({...investmentRules,minInvestment:Number(e.target.value)})
}
/>
</div>

<div>
<Label>Maximum Investment</Label>
<Input
type="number"
value={investmentRules.maxInvestment}
onChange={(e)=>
setInvestmentRules({...investmentRules,maxInvestment:Number(e.target.value)})
}
/>
</div>

<div>
<Label>Platform Fee (%)</Label>
<Input
type="number"
value={investmentRules.platformFee}
onChange={(e)=>
setInvestmentRules({...investmentRules,platformFee:Number(e.target.value)})
}
/>
</div>

<div>
<Label>Currency</Label>
<Input
value={investmentRules.currency}
onChange={(e)=>
setInvestmentRules({...investmentRules,currency:e.target.value})
}
/>
</div>

<Button className="bg-emerald-600 hover:bg-emerald-700">
Save Investment Rules
</Button>

</CardContent>
</Card>

{/* Payment Settings */}

<Card>
<CardHeader>
<CardTitle>Payment Settings</CardTitle>
</CardHeader>

<CardContent className="space-y-4">

<div className="flex justify-between items-center">
<span>Enable Deposits</span>
<input
type="checkbox"
checked={paymentSettings.depositsEnabled}
onChange={(e)=>
setPaymentSettings({...paymentSettings,depositsEnabled:e.target.checked})
}
/>
</div>

<div className="flex justify-between items-center">
<span>Enable Withdrawals</span>
<input
type="checkbox"
checked={paymentSettings.withdrawalsEnabled}
onChange={(e)=>
setPaymentSettings({...paymentSettings,withdrawalsEnabled:e.target.checked})
}
/>
</div>

<div>
<Label>Transaction Fee (%)</Label>
<Input
type="number"
value={paymentSettings.transactionFee}
onChange={(e)=>
setPaymentSettings({...paymentSettings,transactionFee:Number(e.target.value)})
}
/>
</div>

<Button className="bg-emerald-600 hover:bg-emerald-700">
Save Payment Settings
</Button>

</CardContent>
</Card>

{/* Notification Settings */}

<Card>
<CardHeader>
<CardTitle>Notification Settings</CardTitle>
</CardHeader>

<CardContent className="space-y-4">

<div className="flex justify-between items-center">
<span>Email Notifications</span>
<input
type="checkbox"
checked={notificationSettings.emailNotifications}
onChange={(e)=>
setNotificationSettings({...notificationSettings,emailNotifications:e.target.checked})
}
/>
</div>

<div className="flex justify-between items-center">
<span>Investment Confirmation Emails</span>
<input
type="checkbox"
checked={notificationSettings.investmentEmails}
onChange={(e)=>
setNotificationSettings({...notificationSettings,investmentEmails:e.target.checked})
}
/>
</div>

<div className="flex justify-between items-center">
<span>Admin Alerts</span>
<input
type="checkbox"
checked={notificationSettings.adminAlerts}
onChange={(e)=>
setNotificationSettings({...notificationSettings,adminAlerts:e.target.checked})
}
/>
</div>

<Button className="bg-emerald-600 hover:bg-emerald-700">
Save Notifications
</Button>

</CardContent>
</Card>

{/* Security Settings */}

<Card>
<CardHeader>
<CardTitle>Security</CardTitle>
</CardHeader>

<CardContent className="space-y-4">

<div className="flex justify-between items-center">
<span>Two Factor Authentication</span>
<input
type="checkbox"
checked={securitySettings.twoFactorAuth}
onChange={(e)=>
setSecuritySettings({...securitySettings,twoFactorAuth:e.target.checked})
}
/>
</div>

<div>
<Label>Session Timeout (minutes)</Label>
<Input
type="number"
value={securitySettings.sessionTimeout}
onChange={(e)=>
setSecuritySettings({...securitySettings,sessionTimeout:Number(e.target.value)})
}
/>
</div>

<Button className="bg-emerald-600 hover:bg-emerald-700">
Save Security Settings
</Button>

</CardContent>
</Card>

{/* Admin Profile */}

<Card>
<CardHeader>
<CardTitle>Admin Profile</CardTitle>
</CardHeader>

<CardContent className="space-y-4">
{adminProfileErr && (
  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{adminProfileErr}</p>
)}
{adminProfileMsg && (
  <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">{adminProfileMsg}</p>
)}

<div>
<Label>Name</Label>
<Input
value={adminProfile.name}
onChange={(e)=>
setAdminProfile({...adminProfile,name:e.target.value})
}
/>
</div>

<div>
<Label>Email</Label>
<Input
value={adminProfile.email}
disabled
className="bg-gray-50"
/>
<p className="text-xs text-gray-500 mt-1">Email is your login and cannot be changed here.</p>
</div>

<Button
  className="bg-emerald-600 hover:bg-emerald-700"
  disabled={adminProfileSaving || !adminProfile.name.trim()}
  onClick={() => {
    void (async () => {
      setAdminProfileErr('');
      setAdminProfileMsg('');
      setAdminProfileSaving(true);
      const res = await putJson(`${USERS_PREFIX}/profile`, { name: adminProfile.name.trim() });
      setAdminProfileSaving(false);
      if (!res.ok) {
        setAdminProfileErr(res.error);
        return;
      }
      setAdminProfileMsg('Profile updated.');
      await refreshUser();
    })();
  }}
>
{adminProfileSaving ? 'Saving…' : 'Update Profile'}
</Button>

</CardContent>
</Card>

<Card>
<CardHeader>
<CardTitle>Change password</CardTitle>
</CardHeader>
<CardContent className="space-y-4">
{adminPwErr && (
  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{adminPwErr}</p>
)}
{adminPwMsg && (
  <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-md px-3 py-2">{adminPwMsg}</p>
)}
<div>
<Label>Current password</Label>
<Input type="password" autoComplete="current-password" value={adminPwCurrent} onChange={(e) => setAdminPwCurrent(e.target.value)} />
</div>
<div>
<Label>New password</Label>
<Input type="password" autoComplete="new-password" value={adminPwNew} onChange={(e) => setAdminPwNew(e.target.value)} />
</div>
<div>
<Label>Confirm new password</Label>
<Input type="password" autoComplete="new-password" value={adminPwConfirm} onChange={(e) => setAdminPwConfirm(e.target.value)} />
</div>
<Button
  variant="outline"
  className="border-emerald-200 text-emerald-800"
  disabled={adminPwBusy}
  onClick={() => {
    void (async () => {
      setAdminPwErr('');
      setAdminPwMsg('');
      if (adminPwNew !== adminPwConfirm) {
        setAdminPwErr('New passwords do not match.');
        return;
      }
      if (adminPwNew.length < 6) {
        setAdminPwErr('New password must be at least 6 characters.');
        return;
      }
      setAdminPwBusy(true);
      const res = await putJson(`${USERS_PREFIX}/change-password`, {
        currentPassword: adminPwCurrent,
        newPassword: adminPwNew,
      });
      setAdminPwBusy(false);
      if (!res.ok) {
        setAdminPwErr(res.error);
        return;
      }
      setAdminPwMsg('Password updated.');
      setAdminPwCurrent('');
      setAdminPwNew('');
      setAdminPwConfirm('');
    })();
  }}
>
{adminPwBusy ? 'Updating…' : 'Update password'}
</Button>
</CardContent>
</Card>

</div>
</>
)}
        {/* Add Project Modal */}
        <Dialog
          open={isAddModalOpen}
          onOpenChange={(open) => {
            setIsAddModalOpen(open);
            if (!open) {
              setAdminFormError('');
              resetAddForm();
            }
          }}
        >
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Project</DialogTitle>
            </DialogHeader>
            {adminFormError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{adminFormError}</p>
            )}
            <div className="space-y-4">
              <div>
                <Label>Project title</Label>
                <Input value={newProject.title} onChange={(e) => handleInputChange('title', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Category</Label>
                  <Input value={newProject.category} onChange={(e) => handleInputChange('category', e.target.value)} />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={newProject.location} onChange={(e) => handleInputChange('location', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Min investment (USD)</Label>
                  <Input
                    type="number"
                    value={newProject.minInvestment}
                    onChange={(e) => handleInputChange('minInvestment', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Projected ROI (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={newProject.projectedROI}
                    onChange={(e) => handleInputChange('projectedROI', Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Total funding</Label>
                  <Input
                    type="number"
                    value={newProject.totalFunding}
                    onChange={(e) => handleInputChange('totalFunding', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Current funding</Label>
                  <Input
                    type="number"
                    value={newProject.currentFunding}
                    onChange={(e) => handleInputChange('currentFunding', Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Investors count</Label>
                  <Input
                    type="number"
                    value={newProject.investors}
                    onChange={(e) => handleInputChange('investors', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Payout frequency</Label>
                  <Input
                    value={newProject.payoutFrequency}
                    onChange={(e) => handleInputChange('payoutFrequency', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Funding deadline</Label>
                <Input
                  type="date"
                  value={newProject.fundingDeadline}
                  onChange={(e) => handleInputChange('fundingDeadline', e.target.value)}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  className="min-h-[80px]"
                  value={newProject.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
              <div>
                <Label>Features (one per line)</Label>
                <Textarea
                  className="min-h-[72px]"
                  placeholder={'One feature per line'}
                  value={newProject.featuresText}
                  onChange={(e) => handleInputChange('featuresText', e.target.value)}
                />
              </div>
              <div>
                <Label>Cover image (required)</Label>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => setAddCoverFile(e.target.files?.[0] ?? null)}
                />
              </div>
              <div>
                <Label>Gallery images (optional)</Label>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  multiple
                  onChange={(e) => setAddGalleryFiles(e.target.files ? Array.from(e.target.files) : [])}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={newProject.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="funded">Funded</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={adminBusy}
                onClick={() => void handleAddProject()}
              >
                {adminBusy ? 'Saving…' : 'Add project'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle>Confirm Deletion</DialogTitle></DialogHeader>
            <div className="py-4 text-gray-700">
              Are you sure you want to delete this project? This action cannot be undone.
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
              <Button variant="destructive" disabled={adminBusy} onClick={() => void handleDeleteProject()}>
                {adminBusy ? 'Deleting…' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isDeleteUserModalOpen}
          onOpenChange={(open) => {
            setIsDeleteUserModalOpen(open);
            if (!open) setDeleteUserId(null);
          }}
        >
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete user</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-gray-700">
              This removes the user and their related data (investments, transactions). This cannot be undone.
            </div>
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteUserModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" disabled={deleteUserBusy} onClick={() => void handleDeleteUser()}>
                {deleteUserBusy ? 'Deleting…' : 'Delete user'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Editable Project Details Modal */}
        <Dialog open={isDetailsModalOpen} onOpenChange={(open) => {
          setIsDetailsModalOpen(open);
          if (!open) {
            setAdminFormError('');
            setEditCoverFile(null);
            setEditGalleryFiles([]);
          }
        }}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Project details</DialogTitle>
            </DialogHeader>
            {adminFormError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">{adminFormError}</p>
            )}
            {selectedProject && (
              <div className="space-y-3">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={selectedProject.title}
                    onChange={(e) => setSelectedProject({ ...selectedProject, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Category</Label>
                    <Input
                      value={selectedProject.category}
                      onChange={(e) => setSelectedProject({ ...selectedProject, category: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Location</Label>
                    <Input
                      value={selectedProject.location}
                      onChange={(e) => setSelectedProject({ ...selectedProject, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Min investment</Label>
                    <Input
                      type="number"
                      value={selectedProject.minInvestment}
                      onChange={(e) =>
                        setSelectedProject({ ...selectedProject, minInvestment: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label>Projected ROI (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={selectedProject.projectedROI}
                      onChange={(e) =>
                        setSelectedProject({ ...selectedProject, projectedROI: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Total funding</Label>
                    <Input
                      type="number"
                      value={selectedProject.totalFunding}
                      onChange={(e) =>
                        setSelectedProject({ ...selectedProject, totalFunding: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label>Current funding</Label>
                    <Input
                      type="number"
                      value={selectedProject.currentFunding}
                      onChange={(e) =>
                        setSelectedProject({ ...selectedProject, currentFunding: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Investors</Label>
                    <Input
                      type="number"
                      value={selectedProject.investors}
                      onChange={(e) =>
                        setSelectedProject({ ...selectedProject, investors: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label>Payout frequency</Label>
                    <Input
                      value={selectedProject.payoutFrequency}
                      onChange={(e) =>
                        setSelectedProject({ ...selectedProject, payoutFrequency: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>Funding deadline</Label>
                  <Input
                    type="date"
                    value={selectedProject.fundingDeadline.slice(0, 10)}
                    onChange={(e) =>
                      setSelectedProject({
                        ...selectedProject,
                        fundingDeadline: new Date(e.target.value + 'T12:00:00').toISOString(),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    className="min-h-[80px]"
                    value={selectedProject.description}
                    onChange={(e) => setSelectedProject({ ...selectedProject, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Features (one per line)</Label>
                  <Textarea
                    className="min-h-[72px]"
                    value={selectedProject.features.join('\n')}
                    onChange={(e) =>
                      setSelectedProject({
                        ...selectedProject,
                        features: e.target.value
                          .split('\n')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>New cover image (optional)</Label>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={(e) => setEditCoverFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <div>
                  <Label>Add gallery images (optional)</Label>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    multiple
                    onChange={(e) => setEditGalleryFiles(e.target.files ? Array.from(e.target.files) : [])}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select
                    value={selectedProject.status}
                    onValueChange={(value) =>
                      setSelectedProject({
                        ...selectedProject,
                        status: value as Project['status'],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="funded">Funded</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={adminBusy}
                onClick={() => void handleUpdateProject()}
              >
                {adminBusy ? 'Saving…' : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </main>
    </div>
  );
}

// Reusable StatCard
function StatCard({ title, value, icon, subtitle }: any) {
  return (
    <Card>
      <CardHeader className="flex justify-between pb-2">
        <CardTitle className="text-sm text-gray-600">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}