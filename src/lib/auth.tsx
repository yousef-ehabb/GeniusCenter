import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const API_BASE = 'http://localhost:3001/api';

const ALL_PERMISSIONS: Record<string, boolean> = {
  view_dashboard: true, manage_students: true, manage_parents: true,
  manage_groups: true, manage_subjects: true, manage_sessions: true,
  manage_attendance: true, manage_homework: true, manage_exams: true,
  manage_grades: true, manage_payments: true, manage_finance: true,
  manage_staff: true, manage_notifications: true, view_reports: true,
  view_audit: true, manage_settings: true, manage_backup: true,
};

export const ROLE_PERMISSIONS: Record<string, Record<string, boolean>> = {
  'admin': ALL_PERMISSIONS,
  'teacher': { view_dashboard: true, manage_students: true, manage_groups: true, manage_subjects: true, manage_sessions: true, manage_attendance: true, manage_homework: true, manage_exams: true, manage_grades: true, view_reports: true },
  'assistant': { view_dashboard: true, manage_attendance: true },
};

const LOCAL_AUTH_KEY = 'tutor_erp_local_auth';

type UserState = {
  id: string;
  username: string;
  name: string;
  role: string;
};

type AuthState = {
  user: UserState | null;
  staff: UserState | null; // For compatibility with older code that expected user vs staff
  loading: boolean;
  permissions: Record<string, boolean>;
  signIn: (username: string, password: string) => Promise<{ error: string | null }>;
  signUp: (username: string, password: string, name: string, phone?: string, email?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  hasPermission: (key: string) => boolean;
  refreshStaff: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_AUTH_KEY);
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse auth state');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const err = await res.json();
        return { error: err.error || 'فشل تسجيل الدخول' };
      }

      const data = await res.json();
      setUser(data.user);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(data.user));
      return { error: null };
    } catch (error) {
      return { error: 'حدث خطأ في الاتصال بالخادم' };
    }
  };

  const signUp = async (username: string, password: string, name: string, phone?: string, email?: string) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, name, phone, email })
      });

      if (!res.ok) {
        const err = await res.json();
        return { error: err.error || 'فشل إنشاء الحساب' };
      }

      const data = await res.json();
      setUser(data.user);
      localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(data.user));
      return { error: null };
    } catch (error) {
      return { error: 'حدث خطأ في الاتصال بالخادم' };
    }
  };

  const signOut = async () => {
    localStorage.removeItem(LOCAL_AUTH_KEY);
    setUser(null);
  };

  const refreshStaff = async () => {
    // Implement if needed for local API
  };

  const permissions = (() => {
    if (!user) return {};
    return ROLE_PERMISSIONS[user.role] || {};
  })();

  return (
    <AuthContext.Provider value={{
      user,
      staff: user, // Alias user to staff for backwards compatibility
      loading,
      permissions,
      signIn,
      signUp,
      signOut,
      hasPermission: (k) => !!permissions[k],
      refreshStaff
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
