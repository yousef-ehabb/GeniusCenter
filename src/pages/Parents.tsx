import { useEffect, useState, useCallback } from 'react';
import { repo } from '../lib/repo';
import type { Parent, Student } from '../lib/types';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';

import { EmptyState, Spinner } from '../components/ui/Card';
import { Search, Plus, UserCog, Edit2, Users } from 'lucide-react';

export function Parents() {
  const [parents, setParents] = useState<(Parent & { students?: Student[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Parent | null>(null);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [parents, students, studentParents] = await Promise.all([
      repo.getAll('parents'),
      repo.getAll('students'),
      repo.getAll('student_parents')
    ]);
    
    const studentsMap = new Map(students.map((s) => [s.id, s]));
    const studentsByParent = new Map<string, Student[]>();
    
    studentParents.forEach((sp) => {
      const s = studentsMap.get(sp.studentId);
      if (s) {
        const arr = studentsByParent.get(sp.parentId) || [];
        arr.push(s);
        studentsByParent.set(sp.parentId, arr);
      }
    });

    let data = parents.map(p => ({ ...p, students: studentsByParent.get(p.id) || [] }));
    data.sort((a,b) => a.name.localeCompare(b.name));
    setParents(data as (Parent & { students?: Student[] })[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = parents.filter((p) => !search || p.name.includes(search) || (p.phone || '').includes(search));

  const columns: Column<Parent & { students?: Student[] }>[] = [
    {
      key: 'name', header: 'ولي الأمر', sortable: true, sortValue: (p) => p.name,
      render: (p) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-info-100 flex items-center justify-center text-info-600 text-xs font-semibold">{p.name.charAt(0)}</div>
          <div>
            <p className="font-medium text-ink-900">{p.name}</p>
            <p className="text-xs text-ink-400">{p.relation}</p>
          </div>
        </div>
      ),
    },
    { key: 'phone', header: 'الهاتف', render: (p) => <span className="text-ink-600 tabular">{p.phone || '—'}</span> },
    { key: 'phone2', header: 'هاتف إضافي', render: (p) => <span className="text-ink-600 tabular">{p.phone2 || '—'}</span> },
    { key: 'email', header: 'البريد', render: (p) => <span className="text-ink-600">{p.email || '—'}</span> },
    {
      key: 'students', header: 'الأبناء',
      render: (p) => (
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-ink-400" />
          <span className="text-ink-700 font-medium tabular">{p.students?.length || 0}</span>
        </div>
      ),
    },
    {
      key: 'actions', header: '', align: 'left',
      render: (p) => (
        <button className="btn-ghost btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); setEditing(p); setShowForm(true); }}>
          <Edit2 size={14} />
        </button>
      ),
    },
  ];

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner className="text-brand-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input className="input pr-9" placeholder="بحث بالاسم أو الهاتف..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={16} /> ولي أمر جديد</Button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(p) => p.id}
        emptyState={<EmptyState icon={<UserCog size={40} />} title="لا يوجد أولياء أمور" action={<Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={16} /> ولي أمر جديد</Button>} />}
      />

      {showForm && <ParentForm parent={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function ParentForm({ parent, onClose, onSaved }: { parent: Parent | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: parent?.name || '',
    phone: parent?.phone || '',
    phone2: parent?.phone2 || '',
    email: parent?.email || '',
    relation: parent?.relation || 'ولي الأمر',
    notes: parent?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (parent) {
      await repo.update('parents', parent.id, form);
      } else {
      await repo.insert('parents', form);
      }
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open onClose={onClose} title={parent ? 'تعديل ولي الأمر' : 'ولي أمر جديد'} footer={
      <>
        <Button variant="secondary" onClick={onClose}>إلغاء</Button>
        <Button onClick={submit} disabled={saving || !form.name.trim()}>{saving ? <Spinner /> : 'حفظ'}</Button>
      </>
    }>
      <div className="space-y-4">
        <Input label="الاسم *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="الهاتف الأساسي" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Input label="هاتف إضافي" value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} />
        </div>
        <Input label="البريد الإلكتروني" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="صلة القرابة" value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} />
        <Textarea label="ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </div>
    </Dialog>
  );
}
