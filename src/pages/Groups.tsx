import { useEffect, useState, useCallback } from 'react';
import { repo } from '../lib/repo';
import type { Group, Subject, Teacher, Classroom, Student, GroupEnrollment } from '../lib/types';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { Card, CardHeader, EmptyState, Spinner } from '../components/ui/Card';
import { Search, Plus, GraduationCap, Edit2, Users, Clock, MapPin, UserPlus, X } from 'lucide-react';

const DAYS = ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];

export function Groups() {
  const [groups, setGroups] = useState<(Group & { _count?: { enrollments: number } })[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Group | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState<(Group & { enrollments?: GroupEnrollment[] }) | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [groups, subjects, teachers, classrooms, enrollments] = await Promise.all([
      repo.getAll('groups'), repo.getAll('subjects'), repo.getAll('teachers'),
      repo.getAll('classrooms'), repo.getAll('group_enrollments')
    ]);
    const subjectMap = new Map(subjects.map(s => [s.id, s]));
    const teacherMap = new Map(teachers.map(t => [t.id, t]));
    const classroomMap = new Map(classrooms.map(c => [c.id, c]));
    const enrollmentsByGroup = new Map<string, typeof enrollments>();
    for (const e of enrollments) {
      const arr = enrollmentsByGroup.get(e.group_id) || [];
      arr.push(e);
      enrollmentsByGroup.set(e.group_id, arr);
    }
    let data = groups.map(g => ({
      ...g,
      subject: (g.subject_id ? subjectMap.get(g.subject_id) : null) || null,
      teacher: (g.teacher_id ? teacherMap.get(g.teacher_id) : null) || null,
      classroom: (g.classroom_id ? classroomMap.get(g.classroom_id) : null) || null,
      enrollments: enrollmentsByGroup.get(g.id) || [],
    }));
    data.sort((a,b) => a.name.localeCompare(b.name));
    setGroups(data as (Group & { enrollments: GroupEnrollment[] })[]);
    setSubjects(subjects.filter(s => s.is_active) as Subject[]);
    setTeachers(teachers.filter(t => t.is_active) as Teacher[]);
    setClassrooms(classrooms.filter(c => c.is_active) as Classroom[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = groups.filter((g) => !search || g.name.includes(search));

  const columns: Column<Group & { enrollments?: GroupEnrollment[] }>[] = [
    {
      key: 'name', header: 'المجموعة', sortable: true, sortValue: (g) => g.name,
      render: (g) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: (g.subject?.color || '#1ba882') + '20', color: g.subject?.color || '#1ba882' }}>
            {g.subject?.name?.charAt(0) || 'م'}
          </div>
          <div>
            <p className="font-medium text-ink-900">{g.name}</p>
            <p className="text-xs text-ink-400">{g.subject?.name}</p>
          </div>
        </div>
      ),
    },
    { key: 'teacher', header: 'المعلم', render: (g) => <span className="text-ink-600">{g.teacher?.name || '—'}</span> },
    {
      key: 'schedule', header: 'المواعيد',
      render: (g) => (
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-ink-400" />
          <span className="text-xs text-ink-600">{g.schedule_days?.slice(0, 3).join('، ')}</span>
          <span className="text-xs text-ink-400 tabular">{g.start_time?.slice(0, 5)}</span>
        </div>
      ),
    },
    {
      key: 'enrollment', header: 'الطلاب',
      render: (g) => (
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-ink-400" />
          <span className="text-ink-700 font-medium tabular">{g.enrollments?.length || 0}</span>
          <span className="text-ink-400 text-xs">/ {g.capacity}</span>
        </div>
      ),
    },
    { key: 'price', header: 'السعر', sortable: true, sortValue: (g) => g.price, render: (g) => <span className="text-ink-900 font-semibold tabular">{(Number(g.price) / 100).toLocaleString('ar-EG')} ج.م</span> },
    { key: 'status', header: 'الحالة', sortable: true, sortValue: (g) => g.status, render: (g) => <StatusBadge status={g.status} /> },
    {
      key: 'actions', header: '', align: 'left',
      render: (g) => (
        <button className="btn-ghost btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); setEditing(g); setShowForm(true); }}>
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
          <input className="input pr-9" placeholder="بحث عن مجموعة..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={16} /> مجموعة جديدة</Button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(g) => g.id}
        onRowClick={(g) => setDetail(g)}
        emptyState={<EmptyState icon={<GraduationCap size={40} />} title="لا توجد مجموعات" action={<Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={16} /> مجموعة جديدة</Button>} />}
      />

      {showForm && <GroupForm group={editing} subjects={subjects} teachers={teachers} classrooms={classrooms} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
      {detail && <GroupDetail group={detail} onClose={() => setDetail(null)} onEdit={() => { setEditing(detail); setDetail(null); setShowForm(true); }} onChanged={load} />}
    </div>
  );
}

function GroupForm({ group, subjects, teachers, classrooms, onClose, onSaved }: {
  group: Group | null; subjects: Subject[]; teachers: Teacher[]; classrooms: Classroom[]; onClose: () => void; onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: group?.name || '',
    subject_id: group?.subject_id || '',
    teacher_id: group?.teacher_id || '',
    classroom_id: group?.classroom_id || '',
    schedule_days: group?.schedule_days || [],
    start_time: group?.start_time || '',
    end_time: group?.end_time || '',
    capacity: group?.capacity || 20,
    price: group ? group.price / 100 : 0,
    payment_type: group?.payment_type || 'شهري',
    status: group?.status || 'نشط',
    notes: group?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const toggleDay = (day: string) => {
    setForm((f) => ({
      ...f,
      schedule_days: f.schedule_days.includes(day) ? f.schedule_days.filter((d) => d !== day) : [...f.schedule_days, day],
    }));
  };

  const submit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const data = { ...form, price: Math.round(Number(form.price) * 100), subject_id: form.subject_id || null, teacher_id: form.teacher_id || null, classroom_id: form.classroom_id || null };
    if (group) {
      await repo.update('groups', group.id, data);
    } else {
      await repo.insert('groups', data);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open onClose={onClose} title={group ? 'تعديل المجموعة' : 'مجموعة جديدة'} size="lg" footer={
      <>
        <Button variant="secondary" onClick={onClose}>إلغاء</Button>
        <Button onClick={submit} disabled={saving || !form.name.trim()}>{saving ? <Spinner /> : 'حفظ'}</Button>
      </>
    }>
      <div className="grid grid-cols-2 gap-4">
        <Input label="اسم المجموعة *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="col-span-2" />
        <Select label="المادة" value={form.subject_id} onChange={(e) => setForm({ ...form, subject_id: e.target.value })} placeholder="بدون" options={subjects.map((s) => ({ value: s.id, label: s.name }))} />
        <Select label="المعلم" value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })} placeholder="بدون" options={teachers.map((t) => ({ value: t.id, label: t.name }))} />
        <Select label="القاعة" value={form.classroom_id} onChange={(e) => setForm({ ...form, classroom_id: e.target.value })} placeholder="بدون" options={classrooms.map((c) => ({ value: c.id, label: `${c.name} (${c.capacity})` }))} />
        <Select label="نوع الدفع" value={form.payment_type} onChange={(e) => setForm({ ...form, payment_type: e.target.value })} options={[
          { value: 'شهري', label: 'شهري' }, { value: 'بالجلسة', label: 'بالجلسة' }, { value: 'دورة', label: 'دورة' }, { value: 'أقساط', label: 'أقساط' },
        ]} />
        <Input label="السعر (ج.م)" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        <Input label="السعة" type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
        <Input label="وقت البداية" type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
        <Input label="وقت النهاية" type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
        <div className="col-span-2">
          <label className="label">أيام الأسبوع</label>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`px-3 h-8 rounded-lg text-xs font-medium transition-colors ${form.schedule_days.includes(day) ? 'bg-brand-600 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
        <Select label="الحالة" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[
          { value: 'نشط', label: 'نشط' }, { value: 'مكتمل', label: 'مكتمل' }, { value: 'متوقف', label: 'متوقف' }, { value: 'ملغى', label: 'ملغى' },
        ]} />
        <Textarea label="ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="col-span-2" />
      </div>
    </Dialog>
  );
}

function GroupDetail({ group, onClose, onEdit, onChanged }: { group: Group & { enrollments?: GroupEnrollment[] }; onClose: () => void; onEdit: () => void; onChanged: () => void }) {
  const [enrollments, setEnrollments] = useState<(GroupEnrollment & { student: Student })[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  const loadEnrollments = useCallback(async () => {
    const [enrollments, students] = await Promise.all([repo.where('group_enrollments', 'group_id', group.id), repo.getAll('students')]);
    const studentMap = new Map(students.map(s => [s.id, s]));
    const data = enrollments.map(e => ({ ...e, student: studentMap.get(e.student_id) || null }));
    setEnrollments(data as (GroupEnrollment & { student: Student })[]);
    setAllStudents(students as Student[]);
    setLoading(false);
  }, [group.id]);

  useEffect(() => { loadEnrollments(); }, [loadEnrollments]);

  const enrolledIds = new Set(enrollments.map(e => e.student_id));
  const availableStudents = allStudents
    .filter(s => !enrolledIds.has(s.id) && s.status === 'نشط')
    .filter(s => !search || s.name.includes(search) || (s.phone || '').includes(search));

  const addStudent = async (studentId: string) => {
    await repo.insert('group_enrollments', {
      group_id: group.id,
      student_id: studentId,
      status: 'نشط',
      enrollment_date: new Date().toISOString().split('T')[0],
    });
    await     loadEnrollments();
    onChanged();
  };

  const removeStudent = async (enrollmentId: string) => {
    if (!confirm('إزالة هذا الطالب من المجموعة؟')) return;
    await repo.softDelete('group_enrollments', enrollmentId);
    await     loadEnrollments();
    onChanged();
  };

  const updateEnrollmentStatus = async (enrollmentId: string, status: string) => {
    await repo.update('group_enrollments', enrollmentId, { status });
    await     loadEnrollments();
  };

  return (
    <Dialog open onClose={onClose} title={group.name} size="lg" footer={
      <>
        <Button variant="secondary" size="sm" onClick={onEdit}><Edit2 size={14} /> تعديل</Button>
        <Button variant="secondary" onClick={onClose}>إغلاق</Button>
      </>
    }>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-ink-50 border border-ink-200">
            <p className="text-xs text-ink-400">المعلم</p>
            <p className="text-sm font-medium text-ink-900">{group.teacher?.name || '—'}</p>
          </div>
          <div className="p-3 rounded-lg bg-ink-50 border border-ink-200">
            <p className="text-xs text-ink-400">القاعة</p>
            <p className="text-sm font-medium text-ink-900 flex items-center gap-1"><MapPin size={12} />{group.classroom?.name || '—'}</p>
          </div>
          <div className="p-3 rounded-lg bg-ink-50 border border-ink-200">
            <p className="text-xs text-ink-400">السعر</p>
            <p className="text-sm font-bold text-ink-900 tabular">{(Number(group.price) / 100).toLocaleString('ar-EG')} ج.م</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-ink-400">المواعيد:</span>
          {group.schedule_days?.map((d) => <Badge key={d} tone="brand">{d}</Badge>)}
          <span className="text-xs text-ink-600 tabular">{group.start_time?.slice(0, 5)} - {group.end_time?.slice(0, 5)}</span>
        </div>

        <Card>
          <CardHeader
            title="الطلاب المسجلون"
            subtitle={`${enrollments.length} / ${group.capacity}`}
            action={
              <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
                <UserPlus size={14} /> {showAdd ? 'إخفاء' : 'إضافة طالب'}
              </Button>
            }
          />

          {/* Add student panel */}
          {showAdd && (
            <div className="px-3 pb-3 border-b border-ink-100">
              <div className="relative mb-2">
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  className="input pr-9 h-8 text-sm"
                  placeholder="بحث عن طالب..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {availableStudents.length === 0 ? (
                  <p className="text-sm text-ink-400 text-center py-3">لا يوجد طلاب متاحون</p>
                ) : (
                  availableStudents.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => addStudent(s.id)}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-brand-50 text-right transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-full bg-ink-100 flex items-center justify-center text-ink-600 text-xs font-semibold">{s.name.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-800 truncate">{s.name}</p>
                        <p className="text-xs text-ink-400">{s.grade || '—'}</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus size={14} />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Enrolled students list */}
          <div className="p-3 space-y-1.5">
            {loading ? (
              <div className="flex justify-center py-4"><Spinner /></div>
            ) : enrollments.length === 0 ? (
              <p className="text-sm text-ink-400 text-center py-4">لا يوجد طلاب مسجلون</p>
            ) : (
              enrollments.map((e) => (
                <div key={e.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-ink-50 group">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold">{e.student?.name?.charAt(0) || '?'}</div>
                    <div>
                      <p className="text-sm font-medium text-ink-800">{e.student?.name || 'طالب محذوف'}</p>
                      <p className="text-xs text-ink-400">{e.student?.grade || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={e.status}
                      onChange={(ev) => updateEnrollmentStatus(e.id, ev.target.value)}
                      className="h-7 text-xs rounded-md border border-ink-200 bg-white px-1.5 text-ink-600 cursor-pointer hover:border-ink-300"
                    >
                      <option value="نشط">نشط</option>
                      <option value="متوقف">متوقف</option>
                      <option value="منتهي">منتهي</option>
                    </select>
                    <button
                      onClick={() => removeStudent(e.id)}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-ink-300 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                      title="إزالة من المجموعة"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </Dialog>
  );
}
