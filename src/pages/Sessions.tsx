import { useEffect, useState, useCallback } from 'react';
import { repo } from '../lib/repo';
import type { ClassSession, Group } from '../lib/types';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';
import { StatusBadge } from '../components/ui/Badge';
import { EmptyState, Spinner } from '../components/ui/Card';
import { Plus, CalendarCheck, Edit2 } from 'lucide-react';

export function Sessions() {
  const [sessions, setSessions] = useState<(ClassSession & { group: Group })[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ClassSession | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [sessions, groups] = await Promise.all([repo.getAll('class_sessions'), repo.getAll('groups')]);
    const groupMap = new Map(groups.map(g => [g.id, g]));
    let data = sessions.map(s => ({ ...s, group: (s.group_id ? groupMap.get(s.group_id) : null) || null }));
    data.sort((a, b) => b.session_date.localeCompare(a.session_date));
    data = data.slice(0, 50);
    setSessions(data as (ClassSession & { group: Group })[]);
    groups.sort((a, b) => a.name.localeCompare(b.name));
    setGroups(groups as Group[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns: Column<ClassSession & { group: Group }>[] = [
    { key: 'date', header: 'التاريخ', sortable: true, sortValue: (s) => s.session_date, render: (s) => <span className="text-ink-700 tabular">{s.session_date}</span> },
    { key: 'time', header: 'الوقت', render: (s) => <span className="text-ink-600 tabular">{s.start_time?.slice(0, 5) || '—'}</span> },
    { key: 'group', header: 'المجموعة', sortable: true, sortValue: (s) => s.group?.name || '', render: (s) => <span className="font-medium text-ink-900">{s.group?.name || '—'}</span> },
    { key: 'topic', header: 'الموضوع', render: (s) => <span className="text-ink-600">{s.topic || '—'}</span> },
    { key: 'status', header: 'الحالة', sortable: true, sortValue: (s) => s.status, render: (s) => <StatusBadge status={s.status} /> },
    {
      key: 'actions', header: '', align: 'left',
      render: (s) => <button className="btn-ghost btn-icon btn-sm" onClick={() => { setEditing(s); setShowForm(true); }}><Edit2 size={14} /></button>,
    },
  ];

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner className="text-brand-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={16} /> حصة جديدة</Button>
      </div>
      <DataTable columns={columns} data={sessions} rowKey={(s) => s.id} emptyState={<EmptyState icon={<CalendarCheck size={40} />} title="لا توجد حصص" />} />
      {showForm && <SessionForm session={editing} groups={groups} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function SessionForm({ session, groups, onClose, onSaved }: { session: ClassSession | null; groups: Group[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    group_id: session?.group_id || '',
    session_date: session?.session_date || new Date().toISOString().split('T')[0],
    start_time: session?.start_time || '',
    end_time: session?.end_time || '',
    topic: session?.topic || '',
    status: session?.status || 'مجدولة',
    notes: session?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.group_id) return;
    setSaving(true);
    if (session) { await repo.update('class_sessions', session.id, form); }
    else { await repo.insert('class_sessions', form); }
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open onClose={onClose} title={session ? 'تعديل حصة' : 'حصة جديدة'} footer={<><Button variant="secondary" onClick={onClose}>إلغاء</Button><Button onClick={submit} disabled={saving || !form.group_id}>{saving ? <Spinner /> : 'حفظ'}</Button></>}>
      <div className="grid grid-cols-2 gap-4">
        <Select label="المجموعة *" value={form.group_id} onChange={(e) => setForm({ ...form, group_id: e.target.value })} placeholder="اختر" options={groups.map((g) => ({ value: g.id, label: g.name }))} className="col-span-2" />
        <Input label="التاريخ" type="date" value={form.session_date} onChange={(e) => setForm({ ...form, session_date: e.target.value })} />
        <Select label="الحالة" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[{ value: 'مجدولة', label: 'مجدولة' }, { value: 'تمت', label: 'تمت' }, { value: 'ملغاة', label: 'ملغاة' }, { value: 'غائبة', label: 'غائبة' }]} />
        <Input label="وقت البداية" type="time" value={form.start_time || ''} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
        <Input label="وقت النهاية" type="time" value={form.end_time || ''} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
        <Input label="الموضوع" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} className="col-span-2" />
      </div>
    </Dialog>
  );
}
