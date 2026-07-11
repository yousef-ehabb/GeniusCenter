import { useEffect, useState, useCallback } from 'react';
import { repo } from '../lib/repo';
import type { Homework, Group, Exam, Grade, Student, NotificationTemplate, Notification } from '../lib/types';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { Card, CardHeader, EmptyState, Spinner } from '../components/ui/Card';
import { Plus, BookOpen, Award, Bell, Edit2, Trash2, Send, FileText } from 'lucide-react';

// ============ HOMEWORK ============
export function HomeworkPage() {
  const [homework, setHomework] = useState<(Homework & { group: Group })[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Homework | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [hw, groups] = await Promise.all([repo.getAll('homework'), repo.getAll('groups')]);
    const groupMap = new Map(groups.map(g => [g.id, g]));
    let data = hw.map(h => ({ ...h, group: (h.group_id ? groupMap.get(h.group_id) : null) || null }));
    data.sort((a, b) => b.assigned_date.localeCompare(a.assigned_date));
    setHomework(data as (Homework & { group: Group })[]);
    groups.sort((a, b) => a.name.localeCompare(b.name));
    setGroups(groups);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns: Column<Homework & { group: Group }>[] = [
    { key: 'title', header: 'العنوان', sortable: true, sortValue: (h) => h.title, render: (h) => <span className="font-medium text-ink-900">{h.title}</span> },
    { key: 'group', header: 'المجموعة', render: (h) => <span className="text-ink-600">{h.group?.name || '—'}</span> },
    { key: 'assigned', header: 'تاريخ الإسناد', render: (h) => <span className="text-ink-500 text-xs tabular">{h.assigned_date}</span> },
    { key: 'due', header: 'تاريخ التسليم', render: (h) => <span className="text-ink-500 text-xs tabular">{h.due_date || '—'}</span> },
    {
      key: 'actions', header: '', align: 'left',
      render: (h) => (
        <div className="flex gap-1">
          <button className="btn-ghost btn-icon btn-sm" onClick={() => { setEditing(h); setShowForm(true); }}><Edit2 size={14} /></button>
          <button className="btn-ghost btn-icon btn-sm text-danger-600" onClick={async () => { if (confirm('حذف؟')) { await repo.softDelete('homework', h.id); load(); } }}><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner className="text-brand-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={16} /> واجب جديد</Button>
      </div>
      <DataTable columns={columns} data={homework} rowKey={(h) => h.id} emptyState={<EmptyState icon={<BookOpen size={40} />} title="لا توجد واجبات" />} />
      {showForm && <HomeworkForm homework={editing} groups={groups} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
    </div>
  );
}

function HomeworkForm({ homework, groups, onClose, onSaved }: { homework: Homework | null; groups: Group[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    group_id: homework?.group_id || '',
    title: homework?.title || '',
    description: homework?.description || '',
    assigned_date: homework?.assigned_date || new Date().toISOString().split('T')[0],
    due_date: homework?.due_date || '',
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.group_id || !form.title.trim()) return;
    setSaving(true);
    if (homework) { await repo.update('homework', homework.id, form); }
    else { await repo.insert('homework', form); }
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open onClose={onClose} title={homework ? 'تعديل واجب' : 'واجب جديد'} footer={<><Button variant="secondary" onClick={onClose}>إلغاء</Button><Button onClick={submit} disabled={saving || !form.group_id || !form.title.trim()}>{saving ? <Spinner /> : 'حفظ'}</Button></>}>
      <div className="grid grid-cols-2 gap-4">
        <Select label="المجموعة *" value={form.group_id} onChange={(e) => setForm({ ...form, group_id: e.target.value })} placeholder="اختر" options={groups.map((g) => ({ value: g.id, label: g.name }))} className="col-span-2" />
        <Input label="العنوان *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="col-span-2" />
        <Input label="تاريخ الإسناد" type="date" value={form.assigned_date} onChange={(e) => setForm({ ...form, assigned_date: e.target.value })} />
        <Input label="تاريخ التسليم" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
        <Textarea label="الوصف" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="col-span-2" />
      </div>
    </Dialog>
  );
}

// ============ EXAMS ============
export function ExamsPage() {
  const [exams, setExams] = useState<(Exam & { group: Group })[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Exam | null>(null);
  const [showGrades, setShowGrades] = useState<Exam | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [exams, groups, grades] = await Promise.all([repo.getAll('exams'), repo.getAll('groups'), repo.getAll('grades')]);
    const groupMap = new Map(groups.map(g => [g.id, g]));
    let data = exams.map(e => ({ ...e, group: groupMap.get(e.group_id) || null, grades: grades.filter(g => g.exam_id === e.id) }));
    data.sort((a, b) => b.exam_date.localeCompare(a.exam_date));
    setExams(data as (Exam & { group: Group; grades: Grade[] })[]);
    groups.sort((a, b) => a.name.localeCompare(b.name));
    setGroups(groups);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns: Column<Exam & { group: Group }>[] = [
    { key: 'title', header: 'الامتحان', sortable: true, sortValue: (e) => e.title, render: (e) => <span className="font-medium text-ink-900">{e.title}</span> },
    { key: 'group', header: 'المجموعة', render: (e) => <span className="text-ink-600">{e.group?.name || '—'}</span> },
    { key: 'date', header: 'التاريخ', sortable: true, sortValue: (e) => e.exam_date, render: (e) => <span className="text-ink-500 text-xs tabular">{e.exam_date}</span> },
    { key: 'max', header: 'الدرجة العظمى', render: (e) => <span className="text-ink-700 tabular">{e.max_score}</span> },
    { key: 'grades', header: 'عدد الدرجات', render: (e) => <Badge tone="brand">{e.grades?.length || 0}</Badge> },
    {
      key: 'actions', header: '', align: 'left',
      render: (e) => (
        <div className="flex gap-1">
          <button className="btn-ghost btn-icon btn-sm" title="إدخال درجات" onClick={() => setShowGrades(e)}><FileText size={14} /></button>
          <button className="btn-ghost btn-icon btn-sm" onClick={() => { setEditing(e); setShowForm(true); }}><Edit2 size={14} /></button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner className="text-brand-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={16} /> امتحان جديد</Button>
      </div>
      <DataTable columns={columns} data={exams} rowKey={(e) => e.id} emptyState={<EmptyState icon={<Award size={40} />} title="لا توجد امتحانات" />} />
      {showForm && <ExamForm exam={editing} groups={groups} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />}
      {showGrades && <GradeEntry exam={showGrades} onClose={() => { setShowGrades(null); load(); }} />}
    </div>
  );
}

function ExamForm({ exam, groups, onClose, onSaved }: { exam: Exam | null; groups: Group[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    group_id: exam?.group_id || '',
    title: exam?.title || '',
    exam_date: exam?.exam_date || new Date().toISOString().split('T')[0],
    max_score: exam?.max_score || 100,
    description: exam?.description || '',
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.group_id || !form.title.trim()) return;
    setSaving(true);
    if (exam) { await repo.update('exams', exam.id, form); }
    else { await repo.insert('exams', form); }
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open onClose={onClose} title={exam ? 'تعديل امتحان' : 'امتحان جديد'} footer={<><Button variant="secondary" onClick={onClose}>إلغاء</Button><Button onClick={submit} disabled={saving || !form.group_id || !form.title.trim()}>{saving ? <Spinner /> : 'حفظ'}</Button></>}>
      <div className="grid grid-cols-2 gap-4">
        <Select label="المجموعة *" value={form.group_id} onChange={(e) => setForm({ ...form, group_id: e.target.value })} placeholder="اختر" options={groups.map((g) => ({ value: g.id, label: g.name }))} className="col-span-2" />
        <Input label="العنوان *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="col-span-2" />
        <Input label="التاريخ" type="date" value={form.exam_date} onChange={(e) => setForm({ ...form, exam_date: e.target.value })} />
        <Input label="الدرجة العظمى" type="number" value={form.max_score} onChange={(e) => setForm({ ...form, max_score: Number(e.target.value) })} />
        <Textarea label="الوصف" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="col-span-2" />
      </div>
    </Dialog>
  );
}

function GradeEntry({ exam, onClose }: { exam: Exam; onClose: () => void }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [enrollments, allStudents] = await Promise.all([repo.where('group_enrollments', 'group_id', exam.group_id), repo.getAll('students')]);
      const studentMap = new Map(allStudents.map(s => [s.id, s]));
      const activeStudents = enrollments.filter(e => e.status === 'نشط').map(e => studentMap.get(e.student_id)).filter(Boolean) as Student[];
      const existing = await repo.where('grades', 'exam_id', exam.id);
      const map = new Map<string, number>();
      existing.forEach((g) => map.set(g.student_id, Number(g.score)));
      setStudents(activeStudents);
      setGrades(map);
      setLoading(false);
    })();
  }, [exam.id, exam.group_id]);

  const save = async () => {
    setSaving(true);
    const records = students.map((s) => ({ exam_id: exam.id, student_id: s.id, score: grades.get(s.id) || 0 }));
    await repo.replaceAll('grades', 'exam_id', exam.id, records);
    setSaving(false);
    onClose();
  };

  const sorted = [...students].sort((a, b) => (grades.get(b.id) || 0) - (grades.get(a.id) || 0));

  return (
    <Dialog open onClose={onClose} title={`درجات: ${exam.title}`} size="lg" footer={<><Button variant="secondary" onClick={onClose}>إلغاء</Button><Button onClick={save} disabled={saving || loading}>{saving ? <Spinner /> : 'حفظ الدرجات'}</Button></>}>
      {loading ? <div className="flex justify-center py-8"><Spinner className="text-brand-600" /></div> : (
        <div className="space-y-2">
          {sorted.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-ink-100">
              <span className="text-xs font-semibold text-ink-400 w-6 tabular">#{i + 1}</span>
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold">{s.name.charAt(0)}</div>
              <span className="flex-1 text-sm font-medium text-ink-900">{s.name}</span>
              <Input className="w-24" type="number" min={0} max={exam.max_score} value={grades.get(s.id) ?? ''} onChange={(e) => setGrades((m) => { const n = new Map(m); n.set(s.id, Number(e.target.value)); return n; })} />
              <span className="text-xs text-ink-400">/ {exam.max_score}</span>
            </div>
          ))}
        </div>
      )}
    </Dialog>
  );
}

// ============ GRADES (overview) ============
export function GradesPage() {
  const [exams, setExams] = useState<(Exam & { group: Group; grades: (Grade & { student: Student })[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [exams, groups, grades, students] = await Promise.all([repo.getAll('exams'), repo.getAll('groups'), repo.getAll('grades'), repo.getAll('students')]);
      const groupMap = new Map(groups.map(g => [g.id, g]));
      const studentMap = new Map(students.map(s => [s.id, s]));
      let data = exams.map(e => ({
        ...e,
        group: groupMap.get(e.group_id) || null,
        grades: grades.filter(g => g.exam_id === e.id).map(g => ({ ...g, student: studentMap.get(g.student_id) || null })),
      }));
      data.sort((a, b) => b.exam_date.localeCompare(a.exam_date));
      setExams(data as (Exam & { group: Group; grades: (Grade & { student: Student })[] })[]);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner className="text-brand-600" /></div>;

  return (
    <div className="space-y-4">
      {exams.length === 0 ? (
        <EmptyState icon={<Award size={40} />} title="لا توجد درجات" />
      ) : (
        exams.map((exam) => {
          const sorted = [...exam.grades].sort((a, b) => Number(b.score) - Number(a.score));
          const avg = sorted.length > 0 ? sorted.reduce((s, g) => s + Number(g.score), 0) / sorted.length : 0;
          const passRate = sorted.length > 0 ? (sorted.filter((g) => Number(g.score) >= exam.max_score * 0.5).length / sorted.length) * 100 : 0;
          return (
            <Card key={exam.id}>
              <CardHeader title={exam.title} subtitle={`${exam.group?.name} · ${exam.exam_date}`} action={
                <div className="flex gap-2">
                  <Badge tone="info">المتوسط: {avg.toFixed(1)}</Badge>
                  <Badge tone="success">نسبة النجاح: {passRate.toFixed(0)}%</Badge>
                </div>
              } />
              <div className="p-4 space-y-1.5">
                {sorted.map((g, i) => {
                  const pct = (Number(g.score) / exam.max_score) * 100;
                  return (
                    <div key={g.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-ink-50">
                      <span className="text-xs font-semibold text-ink-400 w-6 tabular">#{i + 1}</span>
                      <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold">{g.student?.name?.charAt(0)}</div>
                      <span className="flex-1 text-sm font-medium text-ink-800">{g.student?.name}</span>
                      <div className="w-32 h-2 bg-ink-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${pct >= 50 ? 'bg-success-500' : 'bg-danger-500'}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-ink-900 tabular w-16 text-left">{Number(g.score)} / {exam.max_score}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}

// ============ NOTIFICATIONS ============
export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSend, setShowSend] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const items = await repo.getAll('notifications');
    items.sort((a, b) => b.created_at.localeCompare(a.created_at));
    const data = items.slice(0, 50);
    setNotifications(data as Notification[]);
    const templates = await repo.getAll('notification_templates');
    templates.sort((a, b) => a.name.localeCompare(b.name));
    setTemplates(templates);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner className="text-brand-600" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Badge tone="brand">واتساب</Badge>
          <Badge tone="info">رسالة قصيرة</Badge>
          <Badge tone="neutral">بريد إلكتروني</Badge>
        </div>
        <Button onClick={() => setShowSend(true)}><Send size={16} /> إرسال إشعار</Button>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <h3 className="text-sm font-semibold text-ink-900 mb-3">سجل الإشعارات</h3>
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <EmptyState icon={<Bell size={36} />} title="لا توجد إشعارات" />
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="card p-3">
                  <div className="flex items-center justify-between mb-1">
                    <Badge tone={n.channel === 'واتساب' ? 'brand' : n.channel === 'رسالة قصيرة' ? 'info' : 'neutral'}>{n.channel}</Badge>
                    <StatusBadge status={n.status} />
                  </div>
                  <p className="text-sm text-ink-700 line-clamp-2">{n.body}</p>
                  <p className="text-xs text-ink-400 mt-1">{n.recipient_name || n.recipient_type} · {new Date(n.sent_at).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink-900 mb-3">القوالب الجاهزة</h3>
          <div className="space-y-2">
            {templates.map((t) => (
              <div key={t.id} className="card p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-ink-900">{t.name}</p>
                  <Badge tone={t.channel === 'واتساب' ? 'brand' : 'info'}>{t.channel}</Badge>
                </div>
                <p className="text-xs text-ink-600 line-clamp-2">{t.body}</p>
                {t.variables.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {t.variables.map((v) => <span key={v} className="text-[10px] bg-ink-100 text-ink-600 px-1.5 py-0.5 rounded font-mono">{`{${v}}`}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showSend && <SendNotification templates={templates} onClose={() => setShowSend(false)} onSaved={() => { setShowSend(false); load(); }} />}
    </div>
  );
}

function SendNotification({ templates, onClose, onSaved }: { templates: NotificationTemplate[]; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    recipient_type: 'الكل',
    channel: 'واتساب',
    template_id: '',
    subject: '',
    body: '',
  });
  const [saving, setSaving] = useState(false);

  const onTemplate = (id: string) => {
    const t = templates.find((t) => t.id === id);
    setForm({ ...form, template_id: id, body: t?.body || '' });
  };

  const submit = async () => {
    if (!form.body.trim()) return;
    setSaving(true);
    await repo.insert('notifications', {
      ...form,
      template_id: form.template_id || null,
      status: 'مرسل',
      sent_at: new Date().toISOString(),
    });
    setSaving(false);
    onSaved();
  };

  return (
    <Dialog open onClose={onClose} title="إرسال إشعار" footer={<><Button variant="secondary" onClick={onClose}>إلغاء</Button><Button onClick={submit} disabled={saving || !form.body.trim()}>{saving ? <Spinner /> : <><Send size={16} /> إرسال</>}</Button></>}>
      <div className="grid grid-cols-2 gap-4">
        <Select label="المستلم" value={form.recipient_type} onChange={(e) => setForm({ ...form, recipient_type: e.target.value })} options={[
          { value: 'الكل', label: 'الكل' }, { value: 'طالب', label: 'طالب' }, { value: 'ولي أمر', label: 'ولي أمر' }, { value: 'مجموعة', label: 'مجموعة' },
        ]} />
        <Select label="القناة" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })} options={[
          { value: 'واتساب', label: 'واتساب' }, { value: 'رسالة قصيرة', label: 'رسالة قصيرة' }, { value: 'بريد إلكتروني', label: 'بريد إلكتروني' },
        ]} />
        <Select label="قالب جاهز" value={form.template_id} onChange={(e) => onTemplate(e.target.value)} placeholder="بدون" options={templates.map((t) => ({ value: t.id, label: t.name }))} className="col-span-2" />
        <Input label="الموضوع" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="col-span-2" />
        <Textarea label="الرسالة" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="col-span-2" />
      </div>
    </Dialog>
  );
}
