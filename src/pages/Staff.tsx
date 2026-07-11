import { useEffect, useState, useCallback } from 'react';
import { repo } from '../lib/repo';

import type { Staff } from '../lib/types';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { EmptyState, Spinner } from '../components/ui/Card';
import { Plus, UserPlus, Edit2, Trash2, Shield, Check, X, Key, AlertCircle } from 'lucide-react';

const ROLES = ['مالك', 'مساعد', 'سكرتير', 'معلم', 'محاسب', 'مخصص'];

const PERMISSIONS = [
  { key: 'view_dashboard', label: 'عرض لوحة التحكم' },
  { key: 'manage_students', label: 'إدارة الطلاب' },
  { key: 'manage_parents', label: 'إدارة أولياء الأمور' },
  { key: 'manage_groups', label: 'إدارة المجموعات' },
  { key: 'manage_subjects', label: 'إدارة المواد' },
  { key: 'manage_staff', label: 'إدارة الموظفين' },
  { key: 'manage_sessions', label: 'إدارة الحصص' },
  { key: 'manage_attendance', label: 'إدارة الحضور' },
  { key: 'manage_homework', label: 'إدارة الواجبات' },
  { key: 'manage_exams', label: 'إدارة الامتحانات' },
  { key: 'manage_grades', label: 'إدارة الدرجات' },
  { key: 'manage_payments', label: 'إدارة المدفوعات' },
  { key: 'manage_finance', label: 'إدارة المالية' },
  { key: 'manage_notifications', label: 'إدارة الإشعارات' },
  { key: 'view_reports', label: 'عرض التقارير' },
  { key: 'view_audit', label: 'عرض سجل العمليات' },
  { key: 'manage_settings', label: 'إدارة الإعدادات' },
  { key: 'manage_backup', label: 'النسخ الاحتياطي' },
];

const ROLE_PERMISSIONS: Record<string, Record<string, boolean>> = {
  'مالك': Object.fromEntries(PERMISSIONS.map((p) => [p.key, true])),
  'محاسب': { view_dashboard: true, manage_payments: true, manage_finance: true, view_reports: true },
  'معلم': { view_dashboard: true, manage_students: true, manage_groups: true, manage_subjects: true, manage_sessions: true, manage_attendance: true, manage_homework: true, manage_exams: true, manage_grades: true, view_reports: true },
  'سكرتير': { view_dashboard: true, manage_students: true, manage_parents: true, manage_groups: true, manage_attendance: true, manage_payments: true, manage_notifications: true },
  'مساعد': { view_dashboard: true, manage_attendance: true },
  'مخصص': {},
};

// Auth management is handled on the backend/locally

export function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const items = await repo.getAll('staff');
    items.sort((a, b) => a.name.localeCompare(b.name));
    setStaff(items);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (s: Staff) => {
    if (!confirm(`حذف الموظف "${s.name}"؟`)) return;
    // TODO: Notify backend to delete user if necessary
    await repo.softDelete('staff', s.id);
    load();
  };

  const columns: Column<Staff>[] = [
    {
      key: 'name', header: 'الموظف', sortable: true, sortValue: (s) => s.name,
      render: (s) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold">{s.name.charAt(0)}</div>
          <div>
            <p className="font-medium text-ink-900">{s.name}</p>
            <p className="text-xs text-ink-400">{s.username ? `@${s.username}` : s.phone || '—'}</p>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'الدور', sortable: true, sortValue: (s) => s.role, render: (s) => <Badge tone="brand">{s.role}</Badge> },
    { key: 'phone', header: 'الهاتف', render: (s) => <span className="text-ink-600 text-xs">{s.phone || '—'}</span> },
    { key: 'salary', header: 'المرتب الأساسي', sortable: true, sortValue: (s) => s.base_salary, render: (s) => <span className="text-ink-900 font-semibold tabular">{(Number(s.base_salary) / 100).toLocaleString('ar-EG')} ج.م</span> },
    { key: 'hire_date', header: 'تاريخ التعيين', render: (s) => <span className="text-ink-500 text-xs tabular">{s.hire_date}</span> },
    { key: 'status', header: 'الحالة', sortable: true, sortValue: (s) => s.status, render: (s) => <StatusBadge status={s.status} /> },
    {
      key: 'actions', header: '', align: 'left',
      render: (s) => (
        <div className="flex gap-1">
          <button className="btn-ghost btn-icon btn-sm" onClick={() => { setEditing(s); setShowForm(true); }}><Edit2 size={14} /></button>
          <button className="btn-ghost btn-icon btn-sm text-danger-600" onClick={() => handleDelete(s)}><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner className="text-brand-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={16} /> موظف جديد</Button>
        <Button variant="secondary" onClick={() => setShowMatrix(true)}><Shield size={16} /> مصفوفة الصلاحيات</Button>
      </div>
      <DataTable columns={columns} data={staff} rowKey={(s) => s.id}
        emptyState={<EmptyState icon={<UserPlus size={40} />} title="لا يوجد موظفون"
          action={<Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={16} /> موظف جديد</Button>} />}
      />
      {showForm && <StaffForm staff={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
      {showMatrix && <PermissionMatrix onClose={() => setShowMatrix(false)} />}
    </div>
  );
}

function StaffForm({ staff, onClose, onSaved }: { staff: Staff | null; onClose: () => void; onSaved: () => void }) {
  const isNew = !staff;
  const [form, setForm] = useState({
    name: staff?.name || '',
    role: staff?.role || 'مساعد',
    username: staff?.username || '',
    password: '',
    phone: staff?.phone || '',
    email: staff?.email || '',
    base_salary: staff ? staff.base_salary / 100 : 0,
    hire_date: staff?.hire_date || new Date().toISOString().split('T')[0],
    status: staff?.status || 'نشط',
    notes: staff?.notes || '',
  });
  const [permissions, setPermissions] = useState<Record<string, boolean>>(staff?.permissions || ROLE_PERMISSIONS[form.role] || {});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onRoleChange = (role: string) => {
    setForm((f) => ({ ...f, role }));
    setPermissions(ROLE_PERMISSIONS[role] || {});
  };

  const submit = async () => {
    if (!form.name.trim()) return;
    if (isNew && !form.username.trim()) { setError('اسم المستخدم مطلوب'); return; }
    if (isNew && !form.password) { setError('كلمة المرور مطلوبة'); return; }
    setSaving(true);
    setError(null);

    try {
      if (isNew) {
        // Store via local repo
        await repo.insert('staff', {
          user_id: form.username.trim(), // simple link
          username: form.username.trim(),
          password: form.password, // For backend
          name: form.name,
          role: form.role,
          phone: form.phone || null,
          email: form.email || null,
          base_salary: Math.round(Number(form.base_salary) * 100),
          hire_date: form.hire_date,
          status: form.status,
          notes: form.notes || null,
          permissions,
          is_active: true,
        } as any);
      } else {
        // Update staff record
        await repo.update('staff', staff!.id, {
          name: form.name,
          role: form.role,
          phone: form.phone || null,
          email: form.email || null,
          base_salary: Math.round(Number(form.base_salary) * 100),
          hire_date: form.hire_date,
          status: form.status,
          notes: form.notes || null,
          permissions,
        });

        // Password updates not implemented yet locally
      }

      setSaving(false);
      onSaved();
    } catch (err: any) {
      setError(err.message || 'فشل الحفظ');
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={onClose} title={isNew ? 'موظف جديد' : 'تعديل موظف'} size="lg" footer={
      <><Button variant="secondary" onClick={onClose}>إلغاء</Button><Button onClick={submit} disabled={saving || !form.name.trim()}>{saving ? <Spinner /> : 'حفظ'}</Button></>
    }>
      <div className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-danger-50 border border-danger-100">
            <AlertCircle size={16} className="text-danger-600 shrink-0 mt-0.5" />
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        )}

        {/* Login credentials */}
        <div className="p-3 rounded-lg border border-brand-200 bg-brand-50/50">
          <p className="text-xs font-semibold text-brand-700 mb-3 flex items-center gap-1.5"><Key size={13} /> بيانات تسجيل الدخول</p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={isNew ? 'اسم المستخدم *' : 'اسم المستخدم'}
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="admin"
              disabled={!isNew}
              hint={!isNew ? 'لا يمكن تغيير اسم المستخدم' : undefined}
            />
            <Input
              label={isNew ? 'كلمة المرور *' : 'كلمة مرور جديدة (اختياري)'}
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder={isNew ? '123' : 'اتركها فارغة للإبقاء'}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="الاسم *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Select label="الدور" value={form.role} onChange={(e) => onRoleChange(e.target.value)} options={ROLES.map((r) => ({ value: r, label: r }))} />
          <Input label="الهاتف" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          <Input label="البريد الإلكتروني" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Input label="المرتب الأساسي (ج.م)" type="number" value={form.base_salary} onChange={(e) => setForm((f) => ({ ...f, base_salary: Number(e.target.value) }))} />
          <Input label="تاريخ التعيين" type="date" value={form.hire_date} onChange={(e) => setForm((f) => ({ ...f, hire_date: e.target.value }))} />
          <Select label="الحالة" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} options={[{ value: 'نشط', label: 'نشط' }, { value: 'غير نشط', label: 'غير نشط' }]} />
        </div>

        {form.role === 'مخصص' && (
          <div>
            <label className="label">الصلاحيات المخصصة</label>
            <div className="grid grid-cols-2 gap-2 p-3 rounded-lg border border-ink-200 bg-ink-50">
              {PERMISSIONS.map((p) => (
                <button key={p.key} type="button" onClick={() => setPermissions((prev) => ({ ...prev, [p.key]: !prev[p.key] }))}
                  className={`flex items-center gap-2 px-3 h-8 rounded-md text-xs font-medium transition-colors ${permissions[p.key] ? 'bg-brand-50 text-brand-700' : 'bg-white text-ink-400 border border-ink-200'}`}>
                  {permissions[p.key] ? <Check size={12} /> : <X size={12} />}
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <Textarea label="ملاحظات" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
      </div>
    </Dialog>
  );
}

function PermissionMatrix({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open onClose={onClose} title="مصفوفة الصلاحيات (RBAC)" size="xl" footer={<Button variant="secondary" onClick={onClose}>إغلاق</Button>}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-200">
              <th className="px-3 py-2.5 text-right text-xs font-semibold text-ink-600">الصلاحية</th>
              {ROLES.map((r) => <th key={r} className="px-3 py-2.5 text-center text-xs font-semibold text-ink-600">{r}</th>)}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((p) => (
              <tr key={p.key} className="border-b border-ink-100">
                <td className="px-3 py-2.5 text-ink-700 font-medium">{p.label}</td>
                {ROLES.map((r) => (
                  <td key={r} className="px-3 py-2.5 text-center">
                    {ROLE_PERMISSIONS[r]?.[p.key]
                      ? <Check size={16} className="text-success-600 mx-auto" />
                      : <X size={16} className="text-ink-300 mx-auto" />}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Dialog>
  );
}
