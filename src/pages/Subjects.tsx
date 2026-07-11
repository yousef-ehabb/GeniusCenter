import { useEffect, useState, useCallback } from 'react';
import { repo } from '../lib/repo';
import type { Subject } from '../lib/types';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';
import { EmptyState, Spinner } from '../components/ui/Card';
import { Plus, BookOpen, Edit2, Trash2 } from 'lucide-react';

export function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await repo.getAll('subjects');
    setSubjects([...data].sort((a, b) => a.name.localeCompare(b.name)));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns: Column<Subject>[] = [
    {
      key: 'name', header: 'المادة', sortable: true, sortValue: (s) => s.name,
      render: (s) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: s.color + '20', color: s.color }}>{s.name.charAt(0)}</div>
          <span className="font-medium text-ink-900">{s.name}</span>
        </div>
      ),
    },
    { key: 'name_en', header: 'الاسم الإنجليزي', render: (s) => <span className="text-ink-500 text-xs">{s.name_en || '—'}</span> },
    { key: 'color', header: 'اللون', render: (s) => <div className="w-6 h-6 rounded-full border border-ink-200" style={{ backgroundColor: s.color }} /> },
    {
      key: 'actions', header: '', align: 'left',
      render: (s) => (
        <div className="flex gap-1">
          <button className="btn-ghost btn-icon btn-sm" onClick={() => { setEditing(s); setShowForm(true); }}><Edit2 size={14} /></button>
          <button className="btn-ghost btn-icon btn-sm text-danger-600" onClick={async () => { if (confirm('حذف؟')) { await repo.softDelete('subjects', s.id); load(); } }}><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner className="text-brand-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={16} /> مادة جديدة</Button>
      </div>
      <DataTable columns={columns} data={subjects} rowKey={(s) => s.id} emptyState={<EmptyState icon={<BookOpen size={40} />} title="لا توجد مواد" />} />
      {showForm && <SubjectForm subject={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function SubjectForm({ subject, onClose, onSaved }: { subject: Subject | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: subject?.name || '', name_en: subject?.name_en || '', color: subject?.color || '#1ba882' });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (subject) await repo.update('subjects', subject.id, form);
    else await repo.insert('subjects', { ...form, is_active: true });
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open onClose={onClose} title={subject ? 'تعديل مادة' : 'مادة جديدة'} footer={<><Button variant="secondary" onClick={onClose}>إلغاء</Button><Button onClick={submit} disabled={saving || !form.name.trim()}>{saving ? <Spinner /> : 'حفظ'}</Button></>}>
      <div className="space-y-4">
        <Input label="اسم المادة *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="الاسم الإنجليزي" value={form.name_en} onChange={(e) => setForm({ ...form, name_en: e.target.value })} />
        <div>
          <label className="label">اللون</label>
          <div className="flex items-center gap-2">
            <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-12 h-9 rounded-lg border border-ink-200" />
            <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="flex-1" />
          </div>
        </div>
      </div>
    </Dialog>
  );
}
