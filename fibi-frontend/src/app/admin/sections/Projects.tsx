import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { deleteJson, postFormData, putFormData, putJson } from '@/lib/api';
import {
  normalizeApiProject,
  type ProjectCreateResponse,
  type ProjectUpdateResponse,
} from '@/lib/projects';
import type { Project } from '../../data/projects';
import { useAdminData } from '../lib/AdminDataContext';
import { PROJECTS_API } from '../lib/types';
import { DataTable, type Column } from '../components/DataTable';
import { Flash, FundingBar, PageHeader, StatusPill } from '../components/primitives';
import { formatCompact, formatDate, formatNumber } from '../lib/format';
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

export default function Projects() {
  const { projects, setProjects } = useAdminData();

  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState<{ mode: 'create' } | { mode: 'edit'; project: Project } | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const [flash, setFlash] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const filtered = useMemo(
    () => (statusFilter === 'all' ? projects.data : projects.data.filter((p) => p.status === statusFilter)),
    [projects.data, statusFilter]
  );

  const counts = useMemo(() => {
    const base: Record<string, number> = { all: projects.data.length };
    for (const s of STATUSES) base[s] = projects.data.filter((p) => p.status === s).length;
    return base;
  }, [projects.data]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setForm(emptyForm());
    setCoverFile(null);
    setGalleryFiles([]);
    setFormError('');
    setEditing({ mode: 'create' });
  };

  const openEdit = (project: Project) => {
    setForm(formFromProject(project));
    setCoverFile(null);
    setGalleryFiles([]);
    setFormError('');
    setEditing({ mode: 'edit', project });
  };

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
  };

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    const res = await deleteJson<{ message?: string }>(`${PROJECTS_API}/${pendingDelete.id}`);
    setBusy(false);
    if (!res.ok) {
      setFlash({ type: 'err', text: res.error });
      setPendingDelete(null);
      return;
    }
    setProjects((prev) => prev.filter((p) => p.id !== pendingDelete.id));
    setFlash({ type: 'ok', text: `“${pendingDelete.title}” deleted.` });
    setPendingDelete(null);
  };

  const columns: Column<Project>[] = [
    {
      key: 'title',
      header: 'Project',
      sortValue: (p) => p.title.toLowerCase(),
      cell: (p) => (
        <div className="min-w-0">
          <p className="truncate font-medium text-slate-800">{p.title}</p>
          <p className="truncate text-xs text-slate-500">{p.location}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortValue: (p) => p.category,
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
          <p className="mt-1 text-xs text-slate-400">
            {formatCompact(p.currentFunding)} / {formatCompact(p.totalFunding)}
          </p>
        </div>
      ),
    },
    {
      key: 'investors',
      header: 'Investors',
      sortValue: (p) => p.investors,
      className: 'text-slate-600',
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
            {formatDate(p.fundingDeadline)}
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
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setPendingDelete(p);
            }}
            aria-label={`Delete ${p.title}`}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Projects"
        description="Create, edit and retire the land projects investors can back."
      />

      {flash && <Flash type={flash.type}>{flash.text}</Flash>}

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
          onChange: setStatusFilter,
          options: [
            { value: 'all', label: 'All', count: counts.all },
            ...STATUSES.map((s) => ({
              value: s,
              label: s[0]!.toUpperCase() + s.slice(1),
              count: counts[s],
            })),
          ],
        }}
        toolbarAction={
          <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700" onClick={openCreate}>
            <Plus className="h-4 w-4" /> New project
          </Button>
        }
        emptyTitle="No projects"
        emptyBody="Create your first project to open it for investment."
      />

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing?.mode === 'edit' ? 'Edit project' : 'New project'}
            </DialogTitle>
          </DialogHeader>

          {formError && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {formError}
            </p>
          )}

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="pf-title">Project title</Label>
              <Input
                id="pf-title"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pf-category">Category</Label>
                <Input
                  id="pf-category"
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                  placeholder="agriculture"
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-location">Location</Label>
                <Input
                  id="pf-location"
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="Nyeri County, Kenya"
                  className="h-11 rounded-xl"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pf-min">Minimum investment</Label>
                <Input
                  id="pf-min"
                  type="number"
                  value={form.minInvestment}
                  onChange={(e) => set('minInvestment', Number(e.target.value))}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-roi">Projected ROI (%)</Label>
                <Input
                  id="pf-roi"
                  type="number"
                  step="0.1"
                  value={form.projectedROI}
                  onChange={(e) => set('projectedROI', Number(e.target.value))}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-total">Total funding target</Label>
                <Input
                  id="pf-total"
                  type="number"
                  value={form.totalFunding}
                  onChange={(e) => set('totalFunding', Number(e.target.value))}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-current">Current funding</Label>
                <Input
                  id="pf-current"
                  type="number"
                  value={form.currentFunding}
                  onChange={(e) => set('currentFunding', Number(e.target.value))}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-investors">Investors count</Label>
                <Input
                  id="pf-investors"
                  type="number"
                  value={form.investors}
                  onChange={(e) => set('investors', Number(e.target.value))}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-payout">Payout frequency</Label>
                <Input
                  id="pf-payout"
                  value={form.payoutFrequency}
                  onChange={(e) => set('payoutFrequency', e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-deadline">Funding deadline</Label>
                <Input
                  id="pf-deadline"
                  type="date"
                  value={form.fundingDeadline}
                  onChange={(e) => set('fundingDeadline', e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pf-status">Status</Label>
                <Select value={form.status} onValueChange={(v) => set('status', v)}>
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

            <div className="space-y-2">
              <Label htmlFor="pf-desc">Description</Label>
              <Textarea
                id="pf-desc"
                className="min-h-[90px] rounded-xl"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pf-features">Features</Label>
              <Textarea
                id="pf-features"
                className="min-h-[80px] rounded-xl"
                placeholder="One feature per line"
                value={form.featuresText}
                onChange={(e) => set('featuresText', e.target.value)}
              />
              <p className="text-xs text-slate-400">One per line.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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
                  onChange={(e) => setGalleryFiles(e.target.files ? Array.from(e.target.files) : [])}
                  className="h-11 rounded-xl py-2"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
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

      <Dialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete “{pendingDelete?.title}”?</DialogTitle>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-slate-600">
            This permanently removes the project and its images. Investors who already backed it
            will lose the linked record. This cannot be undone.
          </p>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="rounded-xl"
              disabled={busy}
              onClick={() => void handleDelete()}
            >
              {busy ? 'Deleting…' : 'Delete project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
