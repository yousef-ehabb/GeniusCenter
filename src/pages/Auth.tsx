import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { repo } from '../lib/repo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Card';
import { GraduationCap, Lock, User, AlertCircle, ChevronDown, Mail, Phone } from 'lucide-react';
import type { Staff } from '../lib/types';

export function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sign Up form state
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    (async () => {
      const all = await repo.getAll('staff');
      const active = all
        .filter((s: any) => s.username)
        .sort((a, b) => a.name.localeCompare(b.name));

      setStaffList(active);
      if (active.length > 0) {
        setSelectedUsername(active[0].username!);
      } else {
        setIsSignUp(true);
      }
    })();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUsername || !password) return;
    setError(null);
    setLoading(true);
    const { error } = await signIn(selectedUsername, password);
    if (error) setError(error);
    setLoading(false);
  };

  const submitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !name) return;
    setError(null);
    setLoading(true);
    const { error } = await signUp(username, password, name, phone || undefined, email || undefined);
    if (error) setError(error);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-100 p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mb-3 shadow-lg">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-ink-900">منصة المعلم</h1>
          <p className="text-sm text-ink-400 mt-1">نظام إدارة أعمال المعلمين</p>
        </div>

        <div className="card p-6 shadow-pop">
          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-danger-50 border border-danger-100">
              <AlertCircle size={16} className="text-danger-600 shrink-0 mt-0.5" />
              <p className="text-sm text-danger-700">{error}</p>
            </div>
          )}

          {isSignUp ? (
            <form onSubmit={submitRegister} className="space-y-4">
              {staffList.length === 0 && (
                <div className="p-3 rounded-lg bg-brand-50 border border-brand-100 mb-2">
                  <p className="text-xs text-brand-700 font-medium leading-relaxed">
                    لا يوجد مستخدمون مسجلون في النظام. يرجى إنشاء حساب المالك الأول للبدء.
                  </p>
                </div>
              )}

              <Input
                label="الاسم الكامل *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مدير النظام / المعلم"
                icon={<User size={15} />}
                required
                autoFocus
              />

              <Input
                label="اسم المستخدم *"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                icon={<User size={15} />}
                required
              />

              <Input
                label="كلمة المرور *"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                icon={<Lock size={15} />}
                required
              />

              <Input
                label="رقم الهاتف (اختياري)"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01xxxxxxxxx"
                icon={<Phone size={15} />}
              />

              <Input
                label="البريد الإلكتروني (اختياري)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                icon={<Mail size={15} />}
              />

              <Button type="submit" className="w-full mt-2" disabled={loading || !username || !password || !name}>
                {loading ? <Spinner /> : (staffList.length === 0 ? 'إنشاء حساب المالك والبدء' : 'إنشاء الحساب')}
              </Button>

              {staffList.length > 0 && (
                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setError(null);
                    }}
                    className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                  >
                    لديك حساب بالفعل؟ تسجيل الدخول
                  </button>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">اسم المستخدم</label>
                <div className="relative">
                  <User size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none z-10" />
                  <select
                    className="input pr-9 appearance-none cursor-pointer"
                    value={selectedUsername}
                    onChange={(e) => setSelectedUsername(e.target.value)}
                    disabled={staffList.length === 0}
                  >
                    {staffList.length === 0 ? (
                      <option value="">لا يوجد مستخدمون بعد</option>
                    ) : (
                      staffList.map((s) => (
                        <option key={s.id} value={s.username!}>
                          {s.username} — {s.name}
                        </option>
                      ))
                    )}
                  </select>
                  <ChevronDown size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
                </div>
              </div>

              <Input
                label="كلمة المرور"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                icon={<Lock size={15} />}
                required
                autoFocus={staffList.length > 0}
              />

              <Button type="submit" className="w-full" disabled={loading || staffList.length === 0 || !password}>
                {loading ? <Spinner /> : 'تسجيل الدخول'}
              </Button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError(null);
                  }}
                  className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  ليس لديك حساب؟ إنشاء حساب جديد
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-ink-400 mt-6">
          © 2025 منصة المعلم — جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
