import { useState } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import { AppShell, type PageId } from './components/AppShell';
import { AuthPage } from './pages/Auth';
import { Spinner } from './components/ui/Card';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Parents } from './pages/Parents';
import { Groups } from './pages/Groups';
import { Subjects } from './pages/Subjects';
import { Sessions } from './pages/Sessions';
import { AttendancePage } from './pages/Attendance';
import { HomeworkPage, ExamsPage, GradesPage, NotificationsPage } from './pages/Education';
import { Payments } from './pages/Payments';
import { Finance } from './pages/Finance';
import { StaffPage } from './pages/Staff';
import { Reports } from './pages/Reports';
import { SettingsPage } from './pages/Settings';
import { AuditLogPage } from './pages/AuditLog';
import { Backup } from './pages/Backup';

function AppContent() {
  const { user, staff, loading } = useAuth();
  const [page, setPage] = useState<PageId>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-100">
        <Spinner className="text-brand-600" />
      </div>
    );
  }

  if (!user) return <AuthPage />;

  // If authenticated but no staff record, show waiting state
  if (user && !staff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-100">
        <div className="text-center">
          <Spinner className="text-brand-600 mx-auto mb-3" />
          <p className="text-sm text-ink-500">جاري تحميل بيانات الموظف...</p>
          <p className="text-xs text-ink-400 mt-1">إذا استمرت هذه الرسالة، تواصل مع الإدارة لربط حسابك</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard onNavigate={setPage} />;
      case 'students': return <Students />;
      case 'parents': return <Parents />;
      case 'groups': return <Groups />;
      case 'subjects': return <Subjects />;
      case 'sessions': return <Sessions />;
      case 'attendance': return <AttendancePage />;
      case 'homework': return <HomeworkPage />;
      case 'exams': return <ExamsPage />;
      case 'grades': return <GradesPage />;
      case 'payments': return <Payments />;
      case 'finance': return <Finance />;
      case 'staff': return <StaffPage />;
      case 'reports': return <Reports />;
      case 'notifications': return <NotificationsPage />;
      case 'settings': return <SettingsPage />;
      case 'audit': return <AuditLogPage />;
      case 'backup': return <Backup />;
      default: return <Dashboard onNavigate={setPage} />;
    }
  };

  return (
    <AppShell currentPage={page} onNavigate={setPage}>
      {renderPage()}
    </AppShell>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
