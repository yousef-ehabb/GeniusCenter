import { useState } from 'react';
import { repo } from '../lib/repo';
import { Card, CardHeader, Spinner } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, FileSpreadsheet, Download, Users, Wallet, TrendingUp, CalendarCheck, Award, BookOpen, UserPlus } from 'lucide-react';

type ReportType = 'student' | 'attendance' | 'payment' | 'financial' | 'group' | 'exam' | 'homework' | 'staff';

const REPORTS: { id: ReportType; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'student', label: 'تقرير الطلاب', icon: <Users size={20} />, desc: 'إحصائيات الطلاب والصفوف والحالات' },
  { id: 'attendance', label: 'تقرير الحضور', icon: <CalendarCheck size={20} />, desc: 'نسب الحضور والغياب' },
  { id: 'payment', label: 'تقرير المدفوعات', icon: <Wallet size={20} />, desc: 'المدفوعات والمتأخرات' },
  { id: 'financial', label: 'التقرير المالي', icon: <TrendingUp size={20} />, desc: 'الإيرادات والمصروفات والأرباح' },
  { id: 'group', label: 'تقرير المجموعات', icon: <BookOpen size={20} />, desc: 'إحصائيات المجموعات' },
  { id: 'exam', label: 'تقرير الامتحانات', icon: <Award size={20} />, desc: 'الدرجات والترتيب' },
  { id: 'homework', label: 'تقرير الواجبات', icon: <FileText size={20} />, desc: 'متابعة الواجبات' },
  { id: 'staff', label: 'تقرير الموظفين', icon: <UserPlus size={20} />, desc: 'المرتبات والصلاحيات' },
];

export function Reports() {
  const [selected, setSelected] = useState<ReportType | null>(null);
  const [data, setData] = useState<React.ReactNode>(null);
  const [loading, setLoading] = useState(false);

  const generate = async (type: ReportType) => {
    setSelected(type);
    setLoading(true);
    let content: React.ReactNode = null;

    if (type === 'student') {
      const [students, parents] = await Promise.all([repo.getAll('students'), repo.getAll('parents')]);
      const parentMap = new Map(parents.map(p => [p.id, p]));
      const data = students.map(s => ({ ...s, parent: (s.parent_id ? parentMap.get(s.parent_id) : null) || null }));
      const list = data;
      const byStatus = { 'نشط': 0, 'غير نشط': 0, 'متوقف': 0, 'خرج': 0 };
      list.forEach((s: Record<string, unknown>) => { byStatus[s.status as keyof typeof byStatus]++; });
      const byGrade: Record<string, number> = {};
      list.forEach((s: Record<string, unknown>) => { const g = (s.grade as string) || 'بدون'; byGrade[g] = (byGrade[g] || 0) + 1; });
      content = (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <StatBox label="إجمالي الطلاب" value={list.length} />
            <StatBox label="نشط" value={byStatus['نشط']} tone="text-success-600" />
            <StatBox label="غير نشط" value={byStatus['غير نشط']} tone="text-ink-500" />
            <StatBox label="متوقف/خرج" value={byStatus['متوقف'] + byStatus['خرج']} tone="text-danger-600" />
          </div>
          <Card><CardHeader title="توزيع الطلاب على الصفوف" />
            <div className="p-4 space-y-2">
              {Object.entries(byGrade).map(([grade, count]) => (
                <div key={grade} className="flex items-center justify-between p-2 rounded-lg hover:bg-ink-50">
                  <span className="text-sm text-ink-700">{grade}</span>
                  <span className="text-sm font-semibold text-ink-900 tabular">{count} طالب</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      );
    } else if (type === 'attendance') {
      const [attendance, sessions, groups] = await Promise.all([repo.getAll('attendance'), repo.getAll('class_sessions'), repo.getAll('groups')]);
      const groupMap = new Map(groups.map(g => [g.id, g]));
      const sessionMap = new Map(sessions.map(s => [s.id, { ...s, group: (s.group_id ? groupMap.get(s.group_id) : null) || null }]));
      const data = attendance.map(a => ({ ...a, session: sessionMap.get(a.session_id) || null }));
      const list = data;
      const byStatus = { 'حاضر': 0, 'غائب': 0, 'متأخر': 0, 'بعذر': 0 };
      list.forEach((a: Record<string, unknown>) => { byStatus[a.status as keyof typeof byStatus]++; });
      const total = list.length;
      const rate = total > 0 ? Math.round((byStatus['حاضر'] / total) * 100) : 0;
      content = (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <StatBox label="إجمالي السجلات" value={total} />
            <StatBox label="حاضر" value={byStatus['حاضر']} tone="text-success-600" />
            <StatBox label="غائب" value={byStatus['غائب']} tone="text-danger-600" />
            <StatBox label="نسبة الحضور" value={`${rate}%`} tone="text-brand-600" />
          </div>
          <Card><CardHeader title="توزيع الحضور" />
            <div className="p-4 space-y-3">
              {Object.entries(byStatus).map(([status, count]) => {
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between mb-1"><span className="text-sm text-ink-700">{status}</span><span className="text-sm font-semibold tabular">{count} ({Math.round(pct)}%)</span></div>
                    <div className="h-2 bg-ink-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${status === 'حاضر' ? 'bg-success-500' : status === 'غائب' ? 'bg-danger-500' : status === 'متأخر' ? 'bg-warning-500' : 'bg-info-500'}`} style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      );
    } else if (type === 'payment') {
      const [payments, students, groups] = await Promise.all([repo.getAll('payments'), repo.getAll('students'), repo.getAll('groups')]);
      const studentMap = new Map(students.map(s => [s.id, s]));
      const groupMap = new Map(groups.map(g => [g.id, g]));
      const data = payments.map(p => ({ ...p, student: studentMap.get(p.student_id) || null, group: (p.group_id ? groupMap.get(p.group_id) : null) || null }));
      const list = data;
      const paid = list.filter((p: Record<string, unknown>) => p.status === 'مدفوع').reduce((s: number, p: Record<string, unknown>) => s + Number(p.amount) / 100, 0);
      const unpaid = list.filter((p: Record<string, unknown>) => p.status === 'غير مدفوع').reduce((s: number, p: Record<string, unknown>) => s + Number(p.amount) / 100, 0);
      const partial = list.filter((p: Record<string, unknown>) => p.status === 'جزئي').reduce((s: number, p: Record<string, unknown>) => s + Number(p.amount) / 100, 0);
      content = (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatBox label="مدفوع" value={`${paid.toLocaleString('ar-EG')} ج.م`} tone="text-success-600" />
            <StatBox label="غير مدفوع" value={`${unpaid.toLocaleString('ar-EG')} ج.م`} tone="text-danger-600" />
            <StatBox label="جزئي" value={`${partial.toLocaleString('ar-EG')} ج.م`} tone="text-warning-600" />
          </div>
          <Card><CardHeader title="تفاصيل المدفوعات" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-ink-200 bg-ink-50">
                  <th className="px-3 py-2 text-right text-xs font-semibold text-ink-600">الطالب</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-ink-600">المجموعة</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-ink-600">المبلغ</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-ink-600">الحالة</th>
                </tr></thead>
                <tbody>
                  {list.slice(0, 20).map((p: Record<string, unknown>) => (
                    <tr key={p.id as string} className="border-b border-ink-100">
                      <td className="px-3 py-2 text-ink-800">{(p.student as Record<string, string>)?.name || '—'}</td>
                      <td className="px-3 py-2 text-ink-600 text-xs">{(p.group as Record<string, string>)?.name || '—'}</td>
                      <td className="px-3 py-2 text-ink-900 font-semibold tabular">{(Number(p.amount) / 100).toLocaleString('ar-EG')}</td>
                      <td className="px-3 py-2 text-ink-600">{p.status as string}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      );
    } else if (type === 'financial') {
      const [income, expenses] = await Promise.all([repo.getAll('income'), repo.getAll('expenses')]);
      const totalI = income.reduce((s, i) => s + Number(i.amount) / 100, 0);
      const totalE = expenses.reduce((s, e) => s + Number(e.amount) / 100, 0);
      content = (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <StatBox label="الإيرادات" value={`${totalI.toLocaleString('ar-EG')} ج.م`} tone="text-success-600" />
            <StatBox label="المصروفات" value={`${totalE.toLocaleString('ar-EG')} ج.م`} tone="text-danger-600" />
            <StatBox label="صافي الربح" value={`${(totalI - totalE).toLocaleString('ar-EG')} ج.م`} tone={totalI - totalE >= 0 ? 'text-success-600' : 'text-danger-600'} />
          </div>
        </div>
      );
    } else {
      content = <div className="text-center py-12 text-ink-400 text-sm">سيتم إضافة هذا التقرير قريباً</div>;
    }

    setData(content);
    setLoading(false);
  };

  if (selected) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="btn-ghost btn-icon" onClick={() => setSelected(null)}>→</button>
            <h2 className="text-base font-semibold text-ink-900">{REPORTS.find((r) => r.id === selected)?.label}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm"><FileText size={14} /> PDF</Button>
            <Button variant="secondary" size="sm"><FileSpreadsheet size={14} /> Excel</Button>
            <Button variant="secondary" size="sm"><Download size={14} /> CSV</Button>
          </div>
        </div>
        {loading ? <div className="flex justify-center py-12"><Spinner className="text-brand-600" /></div> : data}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {REPORTS.map((r) => (
        <button key={r.id} onClick={() => generate(r.id)} className="card p-4 text-right hover:shadow-cardHover transition-shadow">
          <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 mb-3">{r.icon}</div>
          <p className="text-sm font-semibold text-ink-900">{r.label}</p>
          <p className="text-xs text-ink-400 mt-1">{r.desc}</p>
        </button>
      ))}
    </div>
  );
}

function StatBox({ label, value, tone = 'text-ink-900' }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="kpi-card">
      <p className={`text-2xl font-bold tabular ${tone}`}>{value}</p>
      <p className="text-xs text-ink-600">{label}</p>
    </div>
  );
}
