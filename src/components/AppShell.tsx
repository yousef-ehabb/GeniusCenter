import { type ReactNode, useState, useEffect, useCallback, useMemo } from 'react';
import {
  LayoutDashboard, Users, UserCog, GraduationCap, CalendarCheck, Wallet,
  TrendingUp, UserPlus, FileBarChart, Bell, Settings, ClipboardList,
  BookOpen, Award, Search, Command, ChevronLeft, ChevronRight, Database,
  LogOut, Lock,
} from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useSync } from '../lib/useSync';
import { Spinner } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RefreshCw, WifiOff, CheckCircle2 } from 'lucide-react';

export type PageId =
  | 'dashboard' | 'students' | 'parents' | 'groups' | 'subjects'
  | 'sessions' | 'attendance' | 'homework' | 'exams' | 'grades'
  | 'payments' | 'finance' | 'staff' | 'reports' | 'notifications'
  | 'settings' | 'audit' | 'backup';

type NavItem = {
  id: PageId;
  label: string;
  icon: ReactNode;
  group: string;
  permission: string;
};

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: <LayoutDashboard size={18} />, group: 'الرئيسية', permission: 'view_dashboard' },
  { id: 'students', label: 'الطلاب', icon: <Users size={18} />, group: 'الإدارة', permission: 'manage_students' },
  { id: 'parents', label: 'أولياء الأمور', icon: <UserCog size={18} />, group: 'الإدارة', permission: 'manage_parents' },
  { id: 'groups', label: 'المجموعات', icon: <GraduationCap size={18} />, group: 'الإدارة', permission: 'manage_groups' },
  { id: 'subjects', label: 'المواد', icon: <BookOpen size={18} />, group: 'الإدارة', permission: 'manage_subjects' },
  { id: 'staff', label: 'الموظفون', icon: <UserPlus size={18} />, group: 'الإدارة', permission: 'manage_staff' },
  { id: 'sessions', label: 'الحصص', icon: <CalendarCheck size={18} />, group: 'التعليم', permission: 'manage_sessions' },
  { id: 'attendance', label: 'الحضور والغياب', icon: <ClipboardList size={18} />, group: 'التعليم', permission: 'manage_attendance' },
  { id: 'homework', label: 'الواجبات', icon: <BookOpen size={18} />, group: 'التعليم', permission: 'manage_homework' },
  { id: 'exams', label: 'الامتحانات', icon: <Award size={18} />, group: 'التعليم', permission: 'manage_exams' },
  { id: 'grades', label: 'الدرجات', icon: <FileBarChart size={18} />, group: 'التعليم', permission: 'manage_grades' },
  { id: 'payments', label: 'المدفوعات', icon: <Wallet size={18} />, group: 'المالية', permission: 'manage_payments' },
  { id: 'finance', label: 'الإيرادات والمصروفات', icon: <TrendingUp size={18} />, group: 'المالية', permission: 'manage_finance' },
  { id: 'notifications', label: 'الإشعارات', icon: <Bell size={18} />, group: 'النظام', permission: 'manage_notifications' },
  { id: 'reports', label: 'التقارير', icon: <FileBarChart size={18} />, group: 'النظام', permission: 'view_reports' },
  { id: 'audit', label: 'سجل العمليات', icon: <ClipboardList size={18} />, group: 'النظام', permission: 'view_audit' },
  { id: 'backup', label: 'النسخ الاحتياطي', icon: <Database size={18} />, group: 'النظام', permission: 'manage_backup' },
  { id: 'settings', label: 'الإعدادات', icon: <Settings size={18} />, group: 'النظام', permission: 'manage_settings' },
];

const pageLabels: Record<PageId, string> = Object.fromEntries(navItems.map((n) => [n.id, n.label])) as Record<PageId, string>;

export function AppShell({ currentPage, onNavigate, children }: { currentPage: PageId; onNavigate: (p: PageId) => void; children: ReactNode }) {
  const { staff, hasPermission, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [showLock, setShowLock] = useState(false);

  const visibleItems = useMemo(() => navItems.filter((n) => hasPermission(n.permission)), [hasPermission]);
  const groups = useMemo(() => [...new Set(visibleItems.map((n) => n.group))], [visibleItems]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const navigate = useCallback((p: PageId) => {
    onNavigate(p);
    setCmdOpen(false);
  }, [onNavigate]);

  return (
    <div className="flex h-screen overflow-hidden bg-ink-100">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} shrink-0 bg-white border-l border-ink-200 flex flex-col transition-all duration-200`}>
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-ink-200 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
            <GraduationCap size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-ink-900 leading-tight">منصة المعلم</p>
              <p className="text-[10px] text-ink-400 leading-tight">نظام إدارة أعمال المعلمين</p>
            </div>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-2 no-scrollbar">
          {groups.map((group) => (
            <div key={group} className="mb-3">
              {!collapsed && <p className="text-[10px] font-semibold text-ink-400 uppercase tracking-wider px-3 mb-1">{group}</p>}
              <div className="space-y-0.5">
                {visibleItems.filter((n) => n.group === group).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`nav-item w-full ${currentPage === item.id ? 'nav-item-active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-2 border-t border-ink-200 shrink-0 space-y-0.5">
          <button className="nav-item w-full" onClick={() => setShowLock(true)} title={collapsed ? 'قفل الجلسة' : undefined}>
            <Lock size={18} />
            {!collapsed && <span>قفل الجلسة</span>}
          </button>
          <button className="nav-item w-full text-danger-600 hover:bg-danger-50 hover:text-danger-700" onClick={() => signOut()} title={collapsed ? 'تسجيل الخروج' : undefined}>
            <LogOut size={18} />
            {!collapsed && <span>تسجيل الخروج</span>}
          </button>
          <button className="nav-item w-full" onClick={() => setCollapsed((v) => !v)}>
            {collapsed ? <ChevronLeft size={18} /> : <><ChevronRight size={18} /><span>طي القائمة</span></>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-ink-200 flex items-center justify-between px-5 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-ink-900">{pageLabels[currentPage]}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCmdOpen(true)}
              className="flex items-center gap-2 h-9 px-3 rounded-lg border border-ink-200 bg-ink-50 text-sm text-ink-400 hover:bg-ink-100 hover:border-ink-300 transition-colors w-64"
            >
              <Search size={15} />
              <span className="text-xs">بحث سريع...</span>
              <span className="ms-auto flex items-center gap-0.5 text-[10px] text-ink-400 bg-white border border-ink-200 rounded px-1.5 py-0.5">
                <Command size={10} />K
              </span>
            </button>
            <SyncIndicator />
            <div className="w-px h-6 bg-ink-200" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold">
                {staff?.name?.charAt(0) || 'م'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-ink-900 leading-tight">{staff?.name || 'المستخدم'}</p>
                <p className="text-[10px] text-ink-400 leading-tight">{staff?.role || ''}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-5">
          <div className="max-w-[1400px] mx-auto animate-fade-in">{children}</div>
        </main>
      </div>

      {/* Command Palette */}
      {cmdOpen && <CommandPalette items={visibleItems} onClose={() => setCmdOpen(false)} onNavigate={navigate} />}

      {/* Session Lock */}
      {showLock && <SessionLock onUnlock={() => setShowLock(false)} />}
    </div>
  );
}

function CommandPalette({ items, onClose, onNavigate }: { items: NavItem[]; onClose: () => void; onNavigate: (p: PageId) => void }) {
  const [query, setQuery] = useState('');
  const filtered = items.filter((n) => n.label.includes(query) || n.group.includes(query));

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 animate-fade-in">
      <div className="absolute inset-0 bg-ink-950/20 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative card w-full max-w-xl shadow-pop animate-slide-up overflow-hidden">
        <div className="flex items-center gap-2 px-4 h-12 border-b border-ink-200">
          <Search size={16} className="text-ink-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن صفحة أو إجراء..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-400"
          />
          <kbd className="text-[10px] text-ink-400 bg-ink-100 border border-ink-200 rounded px-1.5 py-0.5">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-ink-400 text-center py-8">لا توجد نتائج</p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="nav-item w-full justify-start"
              >
                {item.icon}
                <span>{item.label}</span>
                <span className="ms-auto text-[10px] text-ink-400">{item.group}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SyncIndicator() {
  const { online, syncing, pendingCount, lastSync, triggerSync } = useSync();

  if (syncing) {
    return (
      <div className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg bg-brand-50 text-brand-700 text-xs">
        <RefreshCw size={13} className="animate-spin" />
        <span>مزامنة...</span>
      </div>
    );
  }

  if (!online) {
    return (
      <div className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg bg-warning-50 text-warning-700 text-xs" title="غير متصل بالإنترنت — التغييرات محفوظة محلياً">
        <WifiOff size={13} />
        <span>غير متصل</span>
      </div>
    );
  }

  if (pendingCount > 0) {
    return (
      <button
        onClick={triggerSync}
        className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg bg-warning-50 text-warning-700 text-xs hover:bg-warning-100 transition-colors"
        title={`${pendingCount} تغيير في انتظار المزامنة`}
      >
        <RefreshCw size={13} />
        <span>{pendingCount} بانتظار</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg bg-success-50 text-success-700 text-xs" title={lastSync ? `آخر مزامنة: ${new Date(lastSync).toLocaleTimeString('ar')}` : 'متصل'}>
      <CheckCircle2 size={13} />
      <span className="hidden sm:inline">متزامن</span>
    </div>
  );
}

function SessionLock({ onUnlock }: { onUnlock: () => void }) {
  const { user, signIn } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const unlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signIn(user?.username || '', password);
    if (error) {
      setError('كلمة المرور غير صحيحة');
    } else {
      onUnlock();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-sm p-6 shadow-pop animate-slide-up">
        <div className="flex flex-col items-center mb-5">
          <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 mb-3">
            <Lock size={24} />
          </div>
          <h2 className="text-base font-semibold text-ink-900">الجلسة مقفلة</h2>
          <p className="text-xs text-ink-400 mt-1">أدخل كلمة المرور لاستئناف العمل</p>
        </div>
        {error && (
          <div className="mb-3 p-2.5 rounded-lg bg-danger-50 border border-danger-100 text-sm text-danger-700 text-center">
            {error}
          </div>
        )}
        <form onSubmit={unlock} className="space-y-3">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            className="input text-center"
          />
          <Button type="submit" className="w-full" disabled={loading || !password}>
            {loading ? <Spinner /> : 'فتح القفل'}
          </Button>
        </form>
      </div>
    </div>
  );
}
