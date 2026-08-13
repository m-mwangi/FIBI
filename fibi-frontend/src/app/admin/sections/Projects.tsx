import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  CircleDollarSign,
  FolderOpen,
  Image as ImageIcon,
  MapPin,
  Pencil,
  Plus,
  Target,
  Trash2,
  Users as UsersIcon,
} from 'lucide-react';
import { deleteJson, postFormData, putFormData, putJson } from '@/lib/api';
import {
  normalizeApiProject,
  resolveMediaUrl,
  type ProjectCreateResponse,
  type ProjectUpdateResponse,
} from '@/lib/projects';
import type { Project } from '../../data/projects';
import { useAdminData } from '../lib/AdminDataContext';
import { useTableState } from '../lib/useTableState';
import { PROJECTS_API } from '../lib/types';
import { DataTable, type Column } from '../components/DataTable';
import {
  EmptyState,
  Flash,
  FundingBar,
  PageHeader,
  Ring,
  Segmented,
  Skeleton,
  StatCard,
  StatusPill,
} from '../components/primitives';
import {
  formatCompact,
  formatCurrency,
  formatDate,
  formatNumber,
  fundingPercent,
} from '../lib/format';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

const STATUSES = ['open', 'funded', 'active', 'closed'] as const;

function defaultFundingDeadline(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

type FormState = {
  title: string;
  category: string;
  location: string;
  minInvestment: number;
  totalFunding: number;
  currentFunding: number;
  investors: number;
  projectedROI: number;
  payoutFrequency: string;
  fundingDeadline: string;
  description: string;
  featuresText: string;
  status: string;
};

const emptyForm = (): FormState => ({
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

const formFromProject = (p: Project): FormState => ({
  title: p.title,
  category: p.category,
  location: p.location,
  minInvestment: p.minInvestment,
  totalFunding: p.totalFunding,
  currentFunding: p.currentFunding,
  investors: p.investors,
  projectedROI: p.projectedROI,
  payoutFrequency: p.payoutFrequency,
  fundingDeadline: p.fundingDeadline.slice(0, 10),
  description: p.description,
  featuresText: p.features.join('\n'),
  status: p.status,
});

const inputClass = 'h-11 rounded-xl border-slate-200';

/** Groups the 15-field form into labelled sections instead of one long column. */
function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-slate-100 pt-5 first:border-0 first:pt-0">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

/**
 * Project cover with a placeholder fallback.
 *
 * Not every stored `imageUrl` resolves — seeded projects point at paths the API
 * does not serve. A bare <img> on a dead URL paints an empty box, which reads
 * as a broken layout rather than "no image", so a failed load falls back to the
 * same placeholder used when there is no cover at all.
 */
function CoverImage({ url, className = '' }: { url: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (!url || failed) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-slate-100 ${className}`}>
        <ImageIcon className="h-6 w-6 text-slate-300" />
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

/** Card used by the grid view — the covers already uploaded were never shown. */
function ProjectCard({
  project,
  onEdit,
  onDelete,
}: {
  project: Project;
  onEdit: (p: Project) => void;
  onDelete: (p: Project) => void;
}) {
  const cover = resolveMediaUrl(project.imageUrl);
  const overdue =
    project.status === 'open' && new Date(project.fundingDeadline).getTime() < Date.now();

  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--adm-line)] bg-white shadow-[var(--adm-e1)] transition-shadow hover:shadow-[var(--adm-e2)]">
      <div className="relative h-36 overflow-hidden bg-slate-100">
        <CoverImage url={cover} className="transition-transform duration-500 group-hover:scale-[1.03]" />
        <div className="absolute left-3 top-3">
          <StatusPill status={project.status} className="bg-white/95 backdrop-blur" />
        </div>
        {overdue && (
          <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-2 py-0.5 text-[0.6875rem] font-semibold text-white">
            Past due
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-slate-900">{project.title}</h3>
            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
              <MapPin className="h-3 w-3 shrink-0" />
              {project.location}
            </p>
          </div>
          <Ring current={project.currentFunding} total={project.totalFunding} size={42} />
        </div>

        <dl className="adm-num mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
          <div>
            <dt className="text-[0.6875rem] text-slate-400">Raised</dt>
            <dd className="text-sm font-semibold text-slate-800">
              {formatCompact(project.currentFunding)}
            </dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] text-slate-400">Target</dt>
            <dd className="text-sm font-semibold text-slate-800">
              {formatCompact(project.totalFunding)}
            </dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] text-slate-400">ROI</dt>
            <dd className="text-sm font-semibold text-emerald-600">{project.projectedROI}%</dd>
          </div>
        </dl>

        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <span className="adm-num flex items-center gap-1.5 text-xs text-slate-500">
            <UsersIcon className="h-3.5 w-3.5" />
            {formatNumber(project.investors)} investors
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(project)}
              aria-label={`Edit ${project.title}`}
              className="adm-focus rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(project)}
              aria-label={`Delete ${project.title}`}
              className="adm-focus rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function Projects() {
  const { projects, setProjects, refreshAudit } = useAdminData();
  const [state, set] = useTableState();
  const [params, setParams] = useSearchParams();

  const [view, setView] = useState<'table' | 'grid'>('table');
  const [editing, setEditing] = useState<{ mode: 'create' } | { mode: 'edit'; project: Project } | null>(
    null
  );
  const [form, setForm] = useState<FormState>(emptyForm());
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Project[]>([]);
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const statusFilter = state.filter;

  const filtered = useMemo(
    () =>
      statusFilter === 'all'
        ? projects.data
        : projects.data.filter((p) => p.status === statusFilter),
    [projects.data, statusFilter]
  );

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: projects.data.length };
    for (const s of STATUSES) base[s] = projects.data.filter((p) => p.status === s).length;
    return base;
  }, [projects.data]);

  const stats = useMemo(() => {
    const raised = projects.data.reduce((sum, p) => sum + p.currentFunding, 0);
    const target = projects.data.reduce((sum, p) => sum + p.totalFunding, 0);
    const investors = projects.data.reduce((sum, p) => sum + p.investors, 0);
    return { raised, target, investors, coverage: target > 0 ? (raised / target) * 100 : 0 };
  }, [projects.data]);

  const set2 = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setForm(emptyForm());
    setCoverFile(null);
    setCoverPreview('');
    setGalleryFiles([]);
    setFormError('');
    setEditing({ mode: 'create' });
  };

  const openEdit = (project: Project) => {
    setForm(formFromProject(project));
    setCoverFile(null);
    setCoverPreview(resolveMediaUrl(project.imageUrl));
    setGalleryFiles([]);
    setFormError('');
    setEditing({ mode: 'edit', project });
  };

  // Deep links from the command palette: ?focus=<id> opens that project, ?new=1
  // opens an empty form. Consumed once, then stripped so a refresh does not
  // reopen the dialog the operator just dismissed.
  const focusId = params.get('focus');
  const wantsNew = params.get('new');
  useEffect(() => {
    if (!focusId && !wantsNew) return;
    if (wantsNew) {
      openCreate();
    } else if (focusId) {
      const match = projects.data.find((p) => p.id === focusId);
      if (!match) return;
      openEdit(match);
    }
    const next = new URLSearchParams(params);
    next.delete('focus');
    next.delete('new');
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId, wantsNew, projects.data]);

  /** Object URLs must be revoked or each pick leaks a blob for the session. */
  useEffect(() => {
    if (!coverFile) return;
    const url = URL.createObjectURL(coverFile);
    setCoverPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [coverFile]);

  /** Shared field set for both create and update payloads. */
  const appendFields = (fd: FormData, features: string[]) => {
    fd.append('title', form.title.trim());
    fd.append('location', form.location.trim());
    fd.append('category', form.category.trim());
    fd.append('minInvestment', String(form.minInvestment));
    fd.append('totalFunding', String(form.totalFunding));
    fd.append('currentFunding', String(form.currentFunding));
    fd.append('investorsCount', String(form.investors));
    fd.append('projectedROI', String(form.projectedROI));
    fd.append('payoutFrequency', form.payoutFrequency);
    fd.append('fundingDeadline', form.fundingDeadline);
    fd.append('description', form.description.trim() || '—');
    fd.append('features', JSON.stringify(features));
    fd.append('status', form.status);
  };

  const handleSubmit = async () => {
    if (!editing) return;
    setFormError('');

    if (!form.title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (editing.mode === 'create' && !coverFile) {
      setFormError('A primary cover image is required by the server.');
      return;
    }

    const features = form.featuresText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    setBusy(true);

    if (editing.mode === 'create') {
      const fd = new FormData();
      appendFields(fd, features);
      fd.append('timeline', JSON.stringify([{ phase: 'Kickoff', status: 'upcoming' }]));
      fd.append('image', coverFile!);
      galleryFiles.forEach((f) => fd.append('images', f));

      const res = await postFormData<ProjectCreateResponse>(PROJECTS_API, fd);
      setBusy(false);
      if (!res.ok) {
        setFormError(res.error);
        return;
      }
      setProjects((prev) => [normalizeApiProject(res.data.project), ...prev]);
      setFlash({ type: 'ok', text: `“${form.title.trim()}” created.` });
      setEditing(null);
      void refreshAudit();
      return;
    }

    const id = editing.project.id;
    let res:
      | { ok: true; data: ProjectUpdateResponse }
      | { ok: false; status: number; error: string };

    // Multipart only when there are files — a JSON PUT is cheaper otherwise.
    if (coverFile || galleryFiles.length > 0) {
      const fd = new FormData();
      appendFields(fd, features);
      if (coverFile) fd.append('image', coverFile);
      galleryFiles.forEach((f) => fd.append('images', f));
      res = await putFormData<ProjectUpdateResponse>(`${PROJECTS_API}/${id}`, fd);
    } else {
      res = await putJson<ProjectUpdateResponse>(`${PROJECTS_API}/${id}`, {
        title: form.title.trim(),
        location: form.location.trim(),
        category: form.category.trim(),
        minInvestment: form.minInvestment,
        totalFunding: form.totalFunding,
        currentFunding: form.currentFunding,
        investorsCount: form.investors,
        projectedROI: form.projectedROI,
        payoutFrequency: form.payoutFrequency,
        fundingDeadline: form.fundingDeadline,
        description: form.description.trim() || '—',
        features,
        status: form.status,
      });
    }

    setBusy(false);
    if (!res.ok) {
      setFormError(res.error);
      return;
    }
    const updated = normalizeApiProject(res.data.project);
    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
    setFlash({ type: 'ok', text: `“${updated.title}” updated.` });
    setEditing(null);
    void refreshAudit();
  };

  /** See Users.handleDelete — allSettled so one failure does not abandon the rest. */
  const handleDelete = async () => {
    if (pendingDelete.length === 0) return;
    setBusy(true);

    const results = await Promise.allSettled(
      pendingDelete.map((p) => deleteJson<{ message?: string }>(`${PROJECTS_API}/${p.id}`))
    );

    const removed: string[] = [];
    let failures = 0;
    results.forEach((result, i) => {
      if (result.status === 'fulfilled' && result.value.ok) removed.push(pendingDelete[i]!.id);
      else failures += 1;
    });

    setBusy(false);

    if (removed.length > 0) {
      const removedSet = new Set(removed);
      setProjects((prev) => prev.filter((p) => !removedSet.has(p.id)));
      void refreshAudit();
    }

    setFlash(
      failures === 0
        ? { type: 'ok', text: `${removed.length} project${removed.length === 1 ? '' : 's'} deleted.` }
        : {
            type: 'err',
            text:
              removed.length > 0
                ? `Deleted ${removed.length}, but ${failures} could not be removed.`
                : 'None of the selected projects could be deleted.',
          }
    );
    setPendingDelete([]);
  };

  const columns: Column<Project>[] = [
    {
      key: 'title',
      header: 'Project',
      sortValue: (p) => p.title.toLowerCase(),
      cell: (p) => {
        const cover = resolveMediaUrl(p.imageUrl);
        return (
          <div className="flex items-center gap-3">
            <span className="block h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              <CoverImage url={cover} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-medium text-slate-800">{p.title}</p>
              <p className="truncate text-xs text-slate-500">{p.location}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'category',
      header: 'Category',
      sortValue: (p) => p.category,
      headerClassName: 'hidden lg:table-cell',
      className: 'hidden lg:table-cell',
      cell: (p) => (
        <span className="inline-flex rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium capitalize text-slate-600">
          {p.category.replace(/-/g, ' ')}
        </span>
      ),
    },
    {
      key: 'funding',
      header: 'Funding',
      sortValue: (p) => (p.totalFunding > 0 ? p.currentFunding / p.totalFunding : 0),
      cell: (p) => (
        <div>
          <FundingBar current={p.currentFunding} total={p.totalFunding} />
          <p className="adm-num mt-1 text-xs text-slate-400">
            {formatCompact(p.currentFunding)} / {formatCompact(p.totalFunding)}
          </p>
        </div>
      ),
    },
    {
      key: 'investors',
      header: 'Investors',
      sortValue: (p) => p.investors,
      className: 'adm-num text-slate-600 hidden md:table-cell',
      headerClassName: 'hidden md:table-cell',
      cell: (p) => formatNumber(p.investors),
    },
    {
      key: 'deadline',
      header: 'Deadline',
      sortValue: (p) => new Date(p.fundingDeadline).getTime(),
      cell: (p) => {
        const overdue = p.status === 'open' && new Date(p.fundingDeadline).getTime() < Date.now();
        return (
          <span className={overdue ? 'text-sm font-medium text-amber-600' : 'text-sm text-slate-600'}>
            <span className="adm-num">{formatDate(p.fundingDeadline)}</span>
            {overdue && <span className="block text-xs">past due</span>}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortValue: (p) => p.status,
      cell: (p) => <StatusPill status={p.status} />,
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'text-right',
      className: 'text-right',
      cell: (p) => (
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(p);
            }}
            aria-label={`Edit ${p.title}`}
            className="adm-focus rounded-lg p-2 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPendingDelete([p]);
            }}
            aria-label={`Delete ${p.title}`}
            className="adm-focus rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const viewToggle = (
    <Segmented
      size="sm"
      value={view}
      onChange={setView}
      options={[
        { value: 'table', label: 'Table' },
        { value: 'grid', label: 'Grid' },
      ]}
    />
  );

  const newButton = (
    <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={openCreate}>
      <Plus className="h-4 w-4" /> New project
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Projects"
        description="Create, edit and retire the land projects investors can back."
        actions={
          <>
            <span className="hidden sm:block">{viewToggle}</span>
            {newButton}
          </>
        }
      />

      {flash && <Flash type={flash.type}>{flash.text}</Flash>}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Projects"
          value={counts.all}
          icon={FolderOpen}
          hint={`${counts.open} open · ${counts.funded} funded`}
          loading={projects.loading}
        />
        <StatCard
          label="Capital raised"
          value={formatCurrency(stats.raised)}
          icon={CircleDollarSign}
          tone="sky"
          hint={`of ${formatCompact(stats.target)} targeted`}
          loading={projects.loading}
        />
        <StatCard
          label="Target coverage"
          value={`${stats.coverage.toFixed(0)}%`}
          icon={Target}
          tone="violet"
          hint="Raised across all targets"
          loading={projects.loading}
        />
        <StatCard
          label="Investor positions"
          value={formatNumber(stats.investors)}
          icon={UsersIcon}
          tone="amber"
          hint="Summed across projects"
          loading={projects.loading}
        />
      </div>

      {view === 'table' ? (
        <DataTable
          rows={filtered}
          columns={columns}
          rowKey={(p) => p.id}
          loading={projects.loading}
          error={projects.error}
          onRowClick={openEdit}
          searchable={(p) => `${p.title} ${p.location} ${p.category} ${p.status}`}
          searchPlaceholder="Search title, location or category…"
          filters={{
            value: statusFilter,
            onChange: set.setFilter,
            options: [
              { value: 'all', label: 'All', count: counts.all },
              ...STATUSES.map((s) => ({
                value: s,
                label: s[0]!.toUpperCase() + s.slice(1),
                count: counts[s],
              })),
            ],
          }}
          toolbarExtra={<span className="sm:hidden">{viewToggle}</span>}
          bulkActions={[
            {
              label: 'Delete',
              icon: <Trash2 className="h-3.5 w-3.5" />,
              tone: 'danger',
              onClick: setPendingDelete,
            },
          ]}
          emptyTitle="No projects"
          emptyBody="Create your first project to open it for investment."
        />
      ) : (
        <div>
          {/* Grid keeps the same filter chips as the table so switching view
              does not silently change what is on screen. */}
          <div className="mb-4 flex flex-wrap items-center gap-1.5">
            {[
              { value: 'all', label: 'All', count: counts.all },
              ...STATUSES.map((s) => ({
                value: s as string,
                label: s[0]!.toUpperCase() + s.slice(1),
                count: counts[s],
              })),
            ].map((opt) => {
              const active = statusFilter === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set.setFilter(opt.value)}
                  className={`adm-focus rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                  <span className={`adm-num ml-1.5 ${active ? 'text-white/60' : 'text-slate-400'}`}>
                    {opt.count}
                  </span>
                </button>
              );
            })}
            <span className="ml-auto sm:hidden">{viewToggle}</span>
          </div>

          {projects.loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-2xl" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-[var(--adm-line)] bg-white">
              <EmptyState
                title={projects.error ? 'Could not load projects' : 'No projects'}
                body={projects.error || 'Create your first project to open it for investment.'}
                icon={FolderOpen}
                action={newButton}
              />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onEdit={openEdit}
                  onDelete={(project) => setPendingDelete([project])}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / edit */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-2xl sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing?.mode === 'edit' ? 'Edit project' : 'New project'}</DialogTitle>
          </DialogHeader>

          {formError && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {formError}
            </p>
          )}

          <div className="space-y-6 py-2">
            <FormSection title="Identity" description="How the project appears to investors">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pf-title">Project title</Label>
                  <Input
                    id="pf-title"
                    value={form.title}
                    onChange={(e) => set2('title', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="pf-category">Category</Label>
                    <Input
                      id="pf-category"
                      value={form.category}
                      onChange={(e) => set2('category', e.target.value)}
                      placeholder="agriculture"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pf-location">Location</Label>
                    <Input
                      id="pf-location"
                      value={form.location}
                      onChange={(e) => set2('location', e.target.value)}
                      placeholder="Nyeri County, Kenya"
                      className={inputClass}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pf-status">Status</Label>
                    <Select value={form.status} onValueChange={(v) => set2('status', v)}>
                      <SelectTrigger id="pf-status" className="h-11 rounded-xl">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection title="Economics" description="Targets, returns and payout cadence">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="pf-total">Funding target</Label>
                  <Input
                    id="pf-total"
                    type="number"
                    value={form.totalFunding}
                    onChange={(e) => set2('totalFunding', Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-current">Raised so far</Label>
                  <Input
                    id="pf-current"
                    type="number"
                    value={form.currentFunding}
                    onChange={(e) => set2('currentFunding', Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-min">Minimum investment</Label>
                  <Input
                    id="pf-min"
                    type="number"
                    value={form.minInvestment}
                    onChange={(e) => set2('minInvestment', Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-roi">Projected ROI (%)</Label>
                  <Input
                    id="pf-roi"
                    type="number"
                    step="0.1"
                    value={form.projectedROI}
                    onChange={(e) => set2('projectedROI', Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-investors">Investors count</Label>
                  <Input
                    id="pf-investors"
                    type="number"
                    value={form.investors}
                    onChange={(e) => set2('investors', Number(e.target.value))}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-payout">Payout frequency</Label>
                  <Input
                    id="pf-payout"
                    value={form.payoutFrequency}
                    onChange={(e) => set2('payoutFrequency', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-deadline">Funding deadline</Label>
                  <Input
                    id="pf-deadline"
                    type="date"
                    value={form.fundingDeadline}
                    onChange={(e) => set2('fundingDeadline', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Live read-out: the two funding numbers are meaningless apart,
                  and typing one without seeing the ratio is how targets end up
                  silently over-funded. */}
              <div className="mt-4 rounded-xl border border-[var(--adm-line)] bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Funding progress</p>
                    <p className="adm-num mt-0.5 text-sm text-slate-700">
                      {formatCurrency(form.currentFunding)} of {formatCurrency(form.totalFunding)}
                    </p>
                  </div>
                  <Ring current={form.currentFunding} total={form.totalFunding} size={46} />
                </div>
                {form.totalFunding > 0 && form.currentFunding > form.totalFunding && (
                  <p className="mt-2 text-xs font-medium text-amber-600">
                    Raised exceeds the target by{' '}
                    {formatCurrency(form.currentFunding - form.totalFunding)}.
                  </p>
                )}
                {fundingPercent(form.currentFunding, form.totalFunding) >= 100 &&
                  form.status === 'open' && (
                    <p className="mt-2 text-xs font-medium text-sky-600">
                      This project is fully funded but still marked open.
                    </p>
                  )}
              </div>
            </FormSection>

            <FormSection title="Media" description="Cover image and gallery shown on the public site">
              <div className="grid gap-4 sm:grid-cols-[auto_1fr]">
                <div className="h-28 w-40 shrink-0 overflow-hidden rounded-xl border border-[var(--adm-line)] bg-slate-100">
                  {coverPreview ? (
                    <img src={coverPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pf-cover">
                      Cover image{editing?.mode === 'create' ? ' (required)' : ' (optional)'}
                    </Label>
                    <Input
                      id="pf-cover"
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                      className="h-11 rounded-xl py-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pf-gallery">Gallery images (optional)</Label>
                    <Input
                      id="pf-gallery"
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      multiple
                      onChange={(e) =>
                        setGalleryFiles(e.target.files ? Array.from(e.target.files) : [])
                      }
                      className="h-11 rounded-xl py-2"
                    />
                    {galleryFiles.length > 0 && (
                      <p className="text-xs text-slate-500">
                        {galleryFiles.length} image{galleryFiles.length === 1 ? '' : 's'} queued.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection title="Narrative" description="What investors read on the project page">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pf-desc">Description</Label>
                  <Textarea
                    id="pf-desc"
                    className="min-h-[100px] rounded-xl"
                    value={form.description}
                    onChange={(e) => set2('description', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-features">Features</Label>
                  <Textarea
                    id="pf-features"
                    className="min-h-[90px] rounded-xl"
                    placeholder="One feature per line"
                    value={form.featuresText}
                    onChange={(e) => set2('featuresText', e.target.value)}
                  />
                  <p className="text-xs text-slate-400">One per line.</p>
                </div>
              </div>
            </FormSection>
          </div>

          <DialogFooter className="gap-2 border-t border-slate-100 pt-4">
            <Button variant="outline" className="rounded-xl" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700"
              disabled={busy}
              onClick={() => void handleSubmit()}
            >
              {busy ? 'Saving…' : editing?.mode === 'edit' ? 'Save changes' : 'Create project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pendingDelete.length > 0} onOpenChange={(open) => !open && setPendingDelete([])}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {pendingDelete.length === 1
                ? `Delete “${pendingDelete[0]!.title}”?`
                : `Delete ${pendingDelete.length} projects?`}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-slate-600">
            This permanently removes{' '}
            {pendingDelete.length === 1 ? 'the project and its images' : 'these projects and their images'}.
            Investors who already backed {pendingDelete.length === 1 ? 'it' : 'them'} will lose the
            linked record. This cannot be undone.
          </p>
          {pendingDelete.length > 1 && (
            <ul className="max-h-32 overflow-y-auto rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {pendingDelete.map((p) => (
                <li key={p.id} className="truncate py-0.5">
                  {p.title}
                </li>
              ))}
            </ul>
          )}
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setPendingDelete([])}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={busy}
              onClick={() => void handleDelete()}
            >
              {busy ? 'Deleting…' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
