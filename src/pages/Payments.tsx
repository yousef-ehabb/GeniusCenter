import { useEffect, useState, useCallback } from 'react';
import { repo } from '../lib/repo';
import type { Payment, Student, Group } from '../lib/types';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';
import { StatusBadge } from '../components/ui/Badge';
import { EmptyState, Spinner } from '../components/ui/Card';
import { Search, Plus, Wallet, Edit2, Printer, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

export function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editing, setEditing] = useState<Payment | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0, partial: 0 });

  const load = useCallback(async () => {
    setLoading(true);
    const [payments, allStudents, groups] = await Promise.all([
      repo.getAll('payments'),
      repo.getAll('students'),
      repo.getAll('groups'),
    ]);
    const studentMap = new Map(allStudents.map((s) => [s.id, s]));
    const groupMap = new Map(groups.map((g) => [g.id, g]));
    let list = payments.map((p) => ({
      ...p,
      student: studentMap.get(p.student_id) || null,
      group: (p.group_id ? groupMap.get(p.group_id) : null) || null,
    })) as Payment[];
    list.sort((a, b) => b.created_at.localeCompare(a.created_at));
    setPayments(list);
    setStats({
      total: list.reduce((s, p) => s + Number(p.amount), 0),
      paid: list.filter((p) => p.status === 'مدفوع').reduce((s, p) => s + Number(p.amount), 0),
      unpaid: list.filter((p) => p.status === 'غير مدفوع').reduce((s, p) => s + Number(p.amount), 0),
      partial: list.filter((p) => p.status === 'جزئي').reduce((s, p) => s + Number(p.amount), 0),
    });
    const students = allStudents.filter((s) => s.status === 'نشط');
    students.sort((a, b) => a.name.localeCompare(b.name));
    groups.sort((a, b) => a.name.localeCompare(b.name));
    setStudents(students);
    setGroups(groups);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = payments.filter((p) => {
    if (search && !(p.student?.name || '').includes(search) && !(p.receipt_number || '').includes(search)) return false;
    if (statusFilter && p.status !== statusFilter) return false;
    return true;
  });

  const columns: Column<Payment>[] = [
    { key: 'receipt', header: 'رقم الإيصال', sortable: true, sortValue: (p) => p.receipt_number || '', render: (p) => <span className="text-ink-600 font-mono text-xs">{p.receipt_number || '—'}</span> },
    {
      key: 'student', header: 'الطالب', sortable: true, sortValue: (p) => p.student?.name || '',
      render: (p) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold">{p.student?.name?.charAt(0) || '—'}</div>
          <span className="font-medium text-ink-900">{p.student?.name || '—'}</span>
        </div>
      ),
    },
    { key: 'group', header: 'المجموعة', render: (p) => <span className="text-ink-600 text-xs">{p.group?.name || '—'}</span> },
    { key: 'period', header: 'الشهر', render: (p) => <span className="text-ink-600">{p.period_month || '—'}</span> },
    { key: 'amount', header: 'المبلغ', sortable: true, sortValue: (p) => Number(p.amount), render: (p) => <span className="text-ink-900 font-semibold tabular">{(Number(p.amount) / 100).toLocaleString('ar-EG')} ج.م</span> },
    { key: 'method', header: 'الطريقة', render: (p) => <span className="text-ink-600">{p.method}</span> },
    { key: 'date', header: 'التاريخ', sortable: true, sortValue: (p) => p.payment_date || '', render: (p) => <span className="text-ink-500 text-xs tabular">{p.payment_date || '—'}</span> },
    { key: 'status', header: 'الحالة', sortable: true, sortValue: (p) => p.status, render: (p) => <StatusBadge status={p.status} /> },
    {
      key: 'actions', header: '', align: 'left',
      render: (p) => (
        <div className="flex items-center gap-1">
          <button className="btn-ghost btn-icon btn-sm" title="طباعة إيصال" onClick={(e) => { e.stopPropagation(); window.print(); }}>
            <Printer size={14} />
          </button>
          <button className="btn-ghost btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); setEditing(p); setShowForm(true); }}>
            <Edit2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner className="text-brand-600" /></div>;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="إجمالي المدفوعات" value={`${(stats.paid / 100).toLocaleString('ar-EG')} ج.م`} icon={<CheckCircle2 size={18} />} tone="text-success-600 bg-success-50" />
        <StatCard label="غير مدفوع" value={`${(stats.unpaid / 100).toLocaleString('ar-EG')} ج.م`} icon={<AlertCircle size={18} />} tone="text-danger-600 bg-danger-50" />
        <StatCard label="مدفوع جزئياً" value={`${(stats.partial / 100).toLocaleString('ar-EG')} ج.م`} icon={<AlertCircle size={18} />} tone="text-warning-600 bg-warning-50" />
        <StatCard label="الإجمالي الكلي" value={`${(stats.total / 100).toLocaleString('ar-EG')} ج.م`} icon={<TrendingUp size={18} />} tone="text-brand-600 bg-brand-50" />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input className="input pr-9" placeholder="بحث بالطالب أو رقم الإيصال..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">كل الحالات</option>
          <option value="مدفوع">مدفوع</option>
          <option value="غير مدفوع">غير مدفوع</option>
          <option value="جزئي">جزئي</option>
          <option value="مسترد">مسترد</option>
        </select>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={16} /> دفعة جديدة</Button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(p) => p.id}
        emptyState={<EmptyState icon={<Wallet size={40} />} title="لا توجد مدفوعات" action={<Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={16} /> دفعة جديدة</Button>} />}
      />

      {showForm && <PaymentForm payment={editing} students={students} groups={groups} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function StatCard({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone: string }) {
  return (
    <div className="kpi-card">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tone}`}>{icon}</div>
      <p className="text-xl font-bold text-ink-900 tabular">{value}</p>
      <p className="text-xs font-medium text-ink-600">{label}</p>
    </div>
  );
}

function PaymentForm({ payment, students, groups, onClose, onSaved }: { payment: Payment | null; students: Student[]; groups: Group[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    student_id: payment?.student_id || '',
    group_id: payment?.group_id || '',
    amount: payment ? payment.amount / 100 : 0,
    payment_type: payment?.payment_type || 'شهري',
    method: payment?.method || 'نقدي',
    status: payment?.status || 'مدفوع',
    period_month: payment?.period_month || '',
    payment_date: payment?.payment_date || new Date().toISOString().split('T')[0],
    notes: payment?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.student_id) return;
    setSaving(true);
    const student = students.find((s) => s.id === form.student_id);
    const data = {
      ...form,
      amount: Math.round(Number(form.amount) * 100),
      group_id: form.group_id || null,
      parent_id: student?.parent_id || null,
      receipt_number: payment?.receipt_number || 'REC-' + Date.now().toString().slice(-6),
    };
    if (payment) {
      await repo.update('payments', payment.id, data);
    } else {
      await repo.insert('payments', data);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open onClose={onClose} title={payment ? 'تعديل الدفعة' : 'دفعة جديدة'} size="lg" footer={
      <>
        <Button variant="secondary" onClick={onClose}>إلغاء</Button>
        <Button onClick={submit} disabled={saving || !form.student_id}>{saving ? <Spinner /> : 'حفظ'}</Button>
      </>
    }>
      <div className="grid grid-cols-2 gap-4">
        <Select label="الطالب *" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} placeholder="اختر الطالب" options={students.map((s) => ({ value: s.id, label: s.name }))} className="col-span-2" />
        <Select label="المجموعة" value={form.group_id} onChange={(e) => setForm({ ...form, group_id: e.target.value })} placeholder="بدون" options={groups.map((g) => ({ value: g.id, label: g.name }))} />
        <Input label="المبلغ (ج.م)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
        <Select label="نوع الدفع" value={form.payment_type} onChange={(e) => setForm({ ...form, payment_type: e.target.value })} options={[
          { value: 'شهري', label: 'شهري' }, { value: 'بالجلسة', label: 'بالجلسة' }, { value: 'دورة', label: 'دورة' }, { value: 'قسط', label: 'قسط' }, { value: 'جزئي', label: 'جزئي' },
        ]} />
        <Select label="طريقة الدفع" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} options={[
          { value: 'نقدي', label: 'نقدي' }, { value: 'تحويل', label: 'تحويل' }, { value: 'شيك', label: 'شيك' }, { value: 'بطاقة', label: 'بطاقة' },
        ]} />
        <Select label="الحالة" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[
          { value: 'مدفوع', label: 'مدفوع' }, { value: 'جزئي', label: 'جزئي' }, { value: 'غير مدفوع', label: 'غير مدفوع' }, { value: 'مسترد', label: 'مسترد' },
        ]} />
        <Input label="الشهر/المدة" value={form.period_month} onChange={(e) => setForm({ ...form, period_month: e.target.value })} placeholder="مثال: يوليو" />
        <Input label="تاريخ الدفع" type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} />
        <Textarea label="ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="col-span-2" />
      </div>
    </Dialog>
  );
}
