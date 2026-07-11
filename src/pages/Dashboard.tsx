import { useEffect, useState } from 'react';
import { repo } from '../lib/repo';
import type { Student, Payment, ClassSession, Expense, Income, Attendance } from '../lib/types';
import { Users, UserPlus, CalendarCheck, Wallet, TrendingUp, TrendingDown, AlertCircle, Clock, ArrowLeftRight, Settings } from 'lucide-react';
import { Card, CardHeader, Spinner } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import type { PageId } from '../components/AppShell';

type KPI = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone: string;
  sub?: string;
};

export function Dashboard({ onNavigate }: { onNavigate: (p: PageId) => void }) {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [todaySessions, setTodaySessions] = useState<ClassSession[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [recentActivity, setRecentActivity] = useState<{ id: string; text: string; time: string; icon: React.ReactNode }[]>([]);
  const [unpaidStudents, setUnpaidStudents] = useState<{ name: string; amount: number; group: string }[]>([]);
  const [weeklyAttendance, setWeeklyAttendance] = useState<{ day: string; present: number; absent: number }[]>([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    const [students, paymentsRaw, studentsForPayments, groupsForPayments, sessions, groupsForSessions, subjects, teachers, expenses, income, attendance, classSessionsForAttendance] = await Promise.all([
      repo.getAll('students'),
      repo.getAll('payments'),
      repo.getAll('students'),
      repo.getAll('groups'),
      repo.getAll('class_sessions'),
      repo.getAll('groups'),
      repo.getAll('subjects'),
      repo.getAll('teachers'),
      repo.getAll('expenses'),
      repo.getAll('income'),
      repo.getAll('attendance'),
      repo.getAll('class_sessions'),
    ]);

    // Payments: join students + groups, sort by created_at desc, limit 10
    const studentMap = new Map(studentsForPayments.map((s) => [s.id, s]));
    const groupMap = new Map(groupsForPayments.map((g) => [g.id, g]));
    const recentPaymentsAll = paymentsRaw.map((p) => ({ ...p, student: studentMap.get(p.student_id) || null, group: (p.group_id ? groupMap.get(p.group_id) : null) || null }));
    recentPaymentsAll.sort((a, b) => b.created_at.localeCompare(a.created_at));
    const paymentList = recentPaymentsAll.slice(0, 10) as Payment[];

    // Class sessions: join groups → subjects + teachers, filter by today, sort by start_time
    const subjectMap = new Map(subjects.map((s) => [s.id, s]));
    const teacherMap = new Map(teachers.map((t) => [t.id, t]));
    const groupMapSessions = new Map(groupsForSessions.map((g) => [g.id, { ...g, subject: (g.subject_id ? subjectMap.get(g.subject_id) : null) || null, teacher: (g.teacher_id ? teacherMap.get(g.teacher_id) : null) || null }]));
    let todaySessions = sessions.filter((s) => s.session_date === today).map((s) => ({ ...s, group: groupMapSessions.get(s.group_id) || null }));
    todaySessions.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
    const sessionList = todaySessions as ClassSession[];

    // Attendance: join class_sessions (session_date)
    const sessionMap = new Map(classSessionsForAttendance.map((s) => [s.id, s]));
    const attendanceWithSession = attendance.map((a) => ({ ...a, session: sessionMap.get(a.session_id) || null }));
    const attendanceList = attendanceWithSession as Attendance[];

    const studentList = students as Student[];
    const expenseList = expenses as Expense[];
    const incomeList = income as Income[];

    const activeStudents = studentList.filter((s) => s.status === 'نشط').length;
    const inactiveStudents = studentList.filter((s) => s.status !== 'نشط').length;
    const newStudents = studentList.filter((s) => {
      const d = new Date(s.enrollment_date || s.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return d > thirtyDaysAgo;
    }).length;

    const totalRevenue = incomeList.reduce((sum, i) => sum + Number(i.amount) / 100, 0);
    const totalExpenses = expenseList.reduce((sum, e) => sum + Number(e.amount) / 100, 0);
    const profit = totalRevenue - totalExpenses;
    const unpaid = paymentList.filter((p) => p.status === 'غير مدفوع' || p.status === 'جزئي');

    setKpis([
      { label: 'إجمالي الطلاب', value: studentList.length, icon: <Users size={18} />, tone: 'text-brand-600 bg-brand-50', sub: `${activeStudents} نشط · ${inactiveStudents} غير نشط` },
      { label: 'طلاب جدد (30 يوم)', value: newStudents, icon: <UserPlus size={18} />, tone: 'text-info-600 bg-info-50' },
      { label: 'حصص اليوم', value: sessionList.length, icon: <CalendarCheck size={18} />, tone: 'text-accent-600 bg-accent-50' },
      { label: 'لم يسددوا', value: unpaid.length, icon: <AlertCircle size={18} />, tone: 'text-danger-600 bg-danger-50', sub: `${unpaid.reduce((s, p) => s + Number(p.amount) / 100, 0)} ج.م مستحق` },
      { label: 'الإيرادات', value: `${totalRevenue.toLocaleString('ar-EG')} ج.م`, icon: <TrendingUp size={18} />, tone: 'text-success-600 bg-success-50' },
      { label: 'المصروفات', value: `${totalExpenses.toLocaleString('ar-EG')} ج.م`, icon: <TrendingDown size={18} />, tone: 'text-danger-600 bg-danger-50' },
      { label: 'صافي الربح', value: `${profit.toLocaleString('ar-EG')} ج.م`, icon: <Wallet size={18} />, tone: profit >= 0 ? 'text-success-600 bg-success-50' : 'text-danger-600 bg-danger-50' },
      { label: 'الرصيد النقدي', value: `${(totalRevenue - totalExpenses).toLocaleString('ar-EG')} ج.م`, icon: <ArrowLeftRight size={18} />, tone: 'text-brand-600 bg-brand-50' },
    ]);

    setTodaySessions(sessionList);
    setRecentPayments(paymentList.slice(0, 6));

    // Unpaid students
    const unpaidMap = new Map<string, { name: string; amount: number; group: string }>();
    unpaid.forEach((p) => {
      const name = p.student?.name || '';
      if (unpaidMap.has(name)) {
        unpaidMap.get(name)!.amount += Number(p.amount) / 100;
      } else {
        unpaidMap.set(name, { name, amount: Number(p.amount) / 100, group: p.group?.name || '' });
      }
    });
    setUnpaidStudents([...unpaidMap.values()]);

    // Weekly attendance chart
    const dayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d;
    });
    const weekly = last7Days.map((d) => {
      const dayName = dayNames[d.getDay()];
      const dateStr = d.toISOString().split('T')[0];
      const dayAttendance = attendanceList.filter((a) => (a as unknown as { session?: { session_date: string } }).session?.session_date === dateStr);
      const present = dayAttendance.filter((a) => a.status === 'حاضر' || a.status === 'متأخر').length;
      const absent = dayAttendance.filter((a) => a.status === 'غائب').length;
      return { day: dayName, present, absent };
    });
    setWeeklyAttendance(weekly);

    // Recent activity
    const logs = await repo.getAll('audit_log');
    logs.sort((a, b) => b.created_at.localeCompare(a.created_at));
    const recentLogs = logs.slice(0, 8);
    const activityIcons: Record<string, React.ReactNode> = {
      'إضافة': <UserPlus size={14} />,
      'تهيئة': <Settings size={14} />,
      'تعديل': <TrendingUp size={14} />,
      'حذف': <TrendingDown size={14} />,
    };
    setRecentActivity(
      recentLogs.map((a) => ({
        id: a.id,
        text: `${a.action} — ${a.entity_type || ''}`,
        time: new Date(a.created_at).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }),
        icon: activityIcons[a.action] || <Clock size={14} />,
      }))
    );

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner className="text-brand-600" />
      </div>
    );
  }

  const maxAttendance = Math.max(...weeklyAttendance.flatMap((d) => [d.present, d.absent]), 1);

  return (
    <div className="space-y-5">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
          <div key={i} className="kpi-card hover:shadow-cardHover transition-shadow">
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.tone}`}>
                {kpi.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-ink-900 tabular">{kpi.value}</p>
            <div>
              <p className="text-xs font-medium text-ink-600">{kpi.label}</p>
              {kpi.sub && <p className="text-[10px] text-ink-400 mt-0.5">{kpi.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Today's Classes */}
        <Card className="lg:col-span-2">
          <CardHeader title="حصص اليوم" subtitle={`${todaySessions.length} حصة مجدولة`} action={
            <button onClick={() => onNavigate('sessions')} className="text-xs text-brand-600 hover:text-brand-700 font-medium">عرض الكل</button>
          } />
          <div className="p-4 space-y-2">
            {todaySessions.length === 0 ? (
              <p className="text-sm text-ink-400 text-center py-8">لا توجد حصص اليوم</p>
            ) : (
              todaySessions.map((s) => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-ink-100 hover:border-ink-200 hover:bg-ink-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-700 text-xs font-bold shrink-0">
                    {s.start_time?.slice(0, 5) || '--:--'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">{s.group?.name || 'مجموعة'}</p>
                    <p className="text-xs text-ink-500">{s.topic || 'حصة دراسية'}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Unpaid Students */}
        <Card>
          <CardHeader title="مدفوعات متأخرة" subtitle={`${unpaidStudents.length} طالب`} action={
            <button onClick={() => onNavigate('payments')} className="text-xs text-brand-600 hover:text-brand-700 font-medium">عرض الكل</button>
          } />
          <div className="p-4 space-y-2">
            {unpaidStudents.length === 0 ? (
              <p className="text-sm text-ink-400 text-center py-8">لا توجد مدفوعات متأخرة</p>
            ) : (
              unpaidStudents.slice(0, 5).map((u, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-ink-50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-danger-50 flex items-center justify-center text-danger-600 text-xs font-semibold">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink-900">{u.name}</p>
                      <p className="text-[10px] text-ink-400">{u.group}</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-danger-600 tabular">{u.amount.toLocaleString('ar-EG')} ج.م</p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Weekly Attendance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader title="الحضور الأسبوعي" subtitle="آخر 7 أيام" />
          <div className="p-4">
            <div className="flex items-end justify-between gap-2 h-48">
              {weeklyAttendance.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="flex items-end gap-1 flex-1 w-full justify-center">
                    <div
                      className="w-3 rounded-t bg-brand-500 transition-all hover:bg-brand-600"
                      style={{ height: `${(d.present / maxAttendance) * 100}%`, minHeight: d.present > 0 ? '4px' : '0' }}
                      title={`حاضر: ${d.present}`}
                    />
                    <div
                      className="w-3 rounded-t bg-danger-400 transition-all hover:bg-danger-500"
                      style={{ height: `${(d.absent / maxAttendance) * 100}%`, minHeight: d.absent > 0 ? '4px' : '0' }}
                      title={`غائب: ${d.absent}`}
                    />
                  </div>
                  <p className="text-[10px] text-ink-500 font-medium">{d.day}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-ink-100">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-brand-500" />
                <span className="text-xs text-ink-600">حاضر</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded bg-danger-400" />
                <span className="text-xs text-ink-600">غائب</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader title="النشاط الأخير" />
          <div className="p-4 space-y-1">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-ink-400 text-center py-8">لا يوجد نشاط</p>
            ) : (
              recentActivity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-ink-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-ink-100 flex items-center justify-center text-ink-500 shrink-0 mt-0.5">
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-ink-800">{a.text}</p>
                    <p className="text-[10px] text-ink-400">{a.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader title="أحدث المدفوعات" action={
          <button onClick={() => onNavigate('payments')} className="text-xs text-brand-600 hover:text-brand-700 font-medium">عرض الكل</button>
        } />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200 bg-ink-50">
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-ink-600">الطالب</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-ink-600">المجموعة</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-ink-600">الشهر</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-ink-600">المبلغ</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-ink-600">الطريقة</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-ink-600">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p) => (
                <tr key={p.id} className="border-b border-ink-100 table-row-hover">
                  <td className="px-4 py-2.5 text-ink-800 font-medium">{p.student?.name || '—'}</td>
                  <td className="px-4 py-2.5 text-ink-600">{p.group?.name || '—'}</td>
                  <td className="px-4 py-2.5 text-ink-600">{p.period_month || '—'}</td>
                  <td className="px-4 py-2.5 text-ink-900 font-semibold tabular">{(Number(p.amount) / 100).toLocaleString('ar-EG')} ج.م</td>
                  <td className="px-4 py-2.5 text-ink-600">{p.method}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
