import { useEffect, useState, useCallback, useRef } from 'react';
import { repo } from '../lib/repo';
import type { ClassSession, Group, Student, Attendance, GroupEnrollment, Subject } from '../lib/types';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { Card, EmptyState, Spinner } from '../components/ui/Card';
import { ClipboardList, QrCode, Search, Check, X, Clock, CalendarCheck, ScanLine, Users } from 'lucide-react';

const ATTENDANCE_STATUSES = [
  { value: 'حاضر', label: 'حاضر', icon: <Check size={14} />, tone: 'bg-success-100 text-success-700 border-success-200' },
  { value: 'غائب', label: 'غائب', icon: <X size={14} />, tone: 'bg-danger-100 text-danger-700 border-danger-200' },
  { value: 'متأخر', label: 'متأخر', icon: <Clock size={14} />, tone: 'bg-warning-100 text-warning-600 border-warning-200' },
  { value: 'بعذر', label: 'بعذر', icon: <CalendarCheck size={14} />, tone: 'bg-info-100 text-info-600 border-info-200' },
];

export function AttendancePage() {
  const [sessions, setSessions] = useState<(ClassSession & { group: Group })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  const [showTake, setShowTake] = useState<ClassSession | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [sessions, groups, subjects] = await Promise.all([
      repo.getAll('class_sessions'),
      repo.getAll('groups'),
      repo.getAll('subjects'),
    ]);
    const subjectMap = new Map(subjects.map((s: Subject) => [s.id, s]));
    const groupMap = new Map(groups.map((g: Group) => [g.id, { ...g, subject: (g.subject_id ? subjectMap.get(g.subject_id) : null) || null }]));
    let data = sessions.map((s: ClassSession) => ({ ...s, group: groupMap.get(s.group_id) || null }));
    data.sort((a, b) => b.session_date.localeCompare(a.session_date));
    data = data.slice(0, 30);
    setSessions(data as (ClassSession & { group: Group })[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = selectedSession ? sessions.filter((s) => s.id === selectedSession) : sessions;

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner className="text-brand-600" /></div>;

  return (
    <div className="space-y-4">
      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => setShowQR(true)} className="card p-4 flex items-center gap-3 hover:shadow-cardHover transition-shadow text-right">
          <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600"><QrCode size={20} /></div>
          <div>
            <p className="text-sm font-semibold text-ink-900">مسح QR للحضور</p>
            <p className="text-xs text-ink-400">امسح كود الطالب لتسجيل الحضور</p>
          </div>
        </button>
        <button onClick={() => setShowTake(sessions[0] || null)} className="card p-4 flex items-center gap-3 hover:shadow-cardHover transition-shadow text-right">
          <div className="w-10 h-10 rounded-lg bg-info-50 flex items-center justify-center text-info-600"><Users size={20} /></div>
          <div>
            <p className="text-sm font-semibold text-ink-900">تسجيل يدوي</p>
            <p className="text-xs text-ink-400">سجل الحضور لجلسة محددة</p>
          </div>
        </button>
        <button className="card p-4 flex items-center gap-3 hover:shadow-cardHover transition-shadow text-right">
          <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center text-accent-600"><ScanLine size={20} /></div>
          <div>
            <p className="text-sm font-semibold text-ink-900">ماسح USB</p>
            <p className="text-xs text-ink-400">ماسح QR بمنفذ USB</p>
          </div>
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          options={sessions.map((s) => ({ value: s.id, label: `${s.group?.name} — ${s.session_date} ${s.start_time?.slice(0, 5) || ''}` }))}
          placeholder="كل الجلسات"
          className="w-80"
        />
      </div>

      {/* Sessions list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <EmptyState icon={<ClipboardList size={40} />} title="لا توجد جلسات" description="أنشئ جلسات من صفحة الحصص" />
        ) : (
          filtered.map((s) => <SessionRow key={s.id} session={s} onTake={() => setShowTake(s)} />)
        )}
      </div>

      {showTake && <TakeAttendance session={showTake} onClose={() => setShowTake(null)} onSaved={() => { setShowTake(null); load(); }} />}
      {showQR && <QRAttendance sessions={sessions} onClose={() => setShowQR(false)} onSaved={load} />}
    </div>
  );
}

function SessionRow({ session, onTake }: { session: ClassSession & { group: Group }; onTake: () => void }) {
  const [counts, setCounts] = useState({ present: 0, absent: 0, late: 0, excused: 0, total: 0 });

  useEffect(() => {
    repo.where('attendance', 'session_id', session.id).then((records: Attendance[]) => {
      setCounts({
        present: records.filter((a) => a.status === 'حاضر').length,
        absent: records.filter((a) => a.status === 'غائب').length,
        late: records.filter((a) => a.status === 'متأخر').length,
        excused: records.filter((a) => a.status === 'بعذر').length,
        total: records.length,
      });
    });
  }, [session.id]);

  return (
    <Card>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-700 text-xs font-bold shrink-0">
            {session.start_time?.slice(0, 5) || '--:--'}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">{session.group?.name}</p>
            <p className="text-xs text-ink-400">{session.session_date} · {session.topic || 'حصة دراسية'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {counts.total > 0 ? (
            <div className="flex items-center gap-2">
              <Badge tone="success">حاضر: {counts.present}</Badge>
              <Badge tone="danger">غائب: {counts.absent}</Badge>
              {counts.late > 0 && <Badge tone="warning">متأخر: {counts.late}</Badge>}
              {counts.excused > 0 && <Badge tone="info">بعذر: {counts.excused}</Badge>}
            </div>
          ) : (
            <Badge tone="neutral">لم يسجل</Badge>
          )}
          <StatusBadge status={session.status} />
          <Button size="sm" onClick={onTake}>تسجيل الحضور</Button>
        </div>
      </div>
    </Card>
  );
}

function TakeAttendance({ session, onClose, onSaved }: { session: ClassSession; onClose: () => void; onSaved: () => void }) {
  const [enrollments, setEnrollments] = useState<(GroupEnrollment & { student: Student })[]>([]);
  const [attendance, setAttendance] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      repo.where('group_enrollments', 'group_id', session.group_id),
      repo.getAll('students'),
      repo.where('attendance', 'session_id', session.id),
    ]).then(([enrollments, students, existing]) => {
      const studentMap = new Map(students.map((s: Student) => [s.id, s]));
      const enr = enrollments
        .filter((e: GroupEnrollment) => e.status === 'نشط')
        .map((e: GroupEnrollment) => ({ ...e, student: studentMap.get(e.student_id) || null } as GroupEnrollment & { student: Student }));
      setEnrollments(enr);
      const map = new Map<string, string>();
      (existing as Attendance[]).forEach((a) => map.set(a.student_id, a.status));
      enr.forEach((e) => { if (!map.has(e.student_id)) map.set(e.student_id, 'حاضر'); });
      setAttendance(map);
      setLoading(false);
    });
  }, [session.id, session.group_id]);

  const setStatus = (studentId: string, status: string) => {
    setAttendance((m) => { const next = new Map(m); next.set(studentId, status); return next; });
  };

  const markAll = (status: string) => {
    setAttendance((m) => {
      const next = new Map(m);
      enrollments.forEach((e) => next.set(e.student_id, status));
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    const records = enrollments.map((e) => ({
      session_id: session.id,
      student_id: e.student_id,
      status: attendance.get(e.student_id) || 'حاضر',
    }));
    await repo.replaceAll('attendance', 'session_id', session.id, records);
    await repo.update('class_sessions', session.id, { status: 'تمت' });
    setSaving(false);
    onSaved();
  };

  const presentCount = Array.from(attendance.values()).filter((s) => s === 'حاضر' || s === 'متأخر').length;
  const absentCount = Array.from(attendance.values()).filter((s) => s === 'غائب').length;

  return (
    <Dialog open onClose={onClose} title="تسجيل الحضور" size="xl" footer={
      <>
        <div className="text-xs text-ink-500 me-auto">حاضر: {presentCount} · غائب: {absentCount} · الإجمالي: {enrollments.length}</div>
        <Button variant="secondary" onClick={onClose}>إلغاء</Button>
        <Button onClick={save} disabled={saving || loading}>{saving ? <Spinner /> : 'حفظ الحضور'}</Button>
      </>
    }>
      {loading ? (
        <div className="flex justify-center py-12"><Spinner className="text-brand-600" /></div>
      ) : enrollments.length === 0 ? (
        <EmptyState icon={<Users size={36} />} title="لا يوجد طلاب مسجلون" />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-ink-200">
            <span className="text-xs text-ink-500">تعيين للكل:</span>
            {ATTENDANCE_STATUSES.map((s) => (
              <button key={s.value} onClick={() => markAll(s.value)} className={`px-2.5 h-7 rounded-md text-xs font-medium border ${s.tone} hover:opacity-80`}>
                {s.label}
              </button>
            ))}
          </div>
          {enrollments.map((e) => {
            const status = attendance.get(e.student_id) || 'حاضر';
            return (
              <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border border-ink-100 hover:border-ink-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold">{e.student.name.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-medium text-ink-900">{e.student.name}</p>
                    <p className="text-xs text-ink-400">{e.student.grade}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {ATTENDANCE_STATUSES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStatus(e.student_id, s.value)}
                      className={`flex items-center gap-1 px-2.5 h-7 rounded-md text-xs font-medium border transition-all ${status === s.value ? s.tone : 'bg-white text-ink-400 border-ink-200 hover:bg-ink-50'}`}
                    >
                      {s.icon} {s.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Dialog>
  );
}

function QRAttendance({ sessions, onClose, onSaved }: { sessions: (ClassSession & { group: Group })[]; onClose: () => void; onSaved: () => void }) {
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessions[0]?.id || '');
  const [scanned, setScanned] = useState<{ name: string; time: string; status: string; message?: string; success?: boolean }[]>([]);
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [found, setFound] = useState<Student | null>(null);
  const [enrollments, setEnrollments] = useState<GroupEnrollment[]>([]);
  const [existingAttendance, setExistingAttendance] = useState<Attendance[]>([]);
  const [scannerStatus, setScannerStatus] = useState<'initial' | 'loading' | 'active' | 'error'>('initial');

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);
  const lastScannedTimeRef = useRef<{ [code: string]: number }>({});

  // Audio beep feedback
  const playBeep = (freq = 800, duration = 0.15) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.error(e);
    }
  };

  const getFormattedTime = () => {
    return new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Load active students initially
  useEffect(() => {
    repo.getAll('students').then((allStudents: Student[]) => {
      setStudents(allStudents.filter((s) => s.status === 'نشط'));
    });
  }, []);

  // Load session group enrollments and existing attendance when session changes
  useEffect(() => {
    if (!selectedSessionId || !selectedSession) return;
    
    setEnrollments([]);
    setExistingAttendance([]);
    
    Promise.all([
      repo.where('group_enrollments', 'group_id', selectedSession.group_id),
      repo.where('attendance', 'session_id', selectedSessionId)
    ]).then(([enr, att]) => {
      setEnrollments(enr.filter((e) => e.status === 'نشط'));
      setExistingAttendance(att);
    });
  }, [selectedSessionId, selectedSession]);

  // Handle scans/lookups
  const handleQRScan = useCallback(async (code: string) => {
    if (!code) return;

    const now = Date.now();
    const lastTime = lastScannedTimeRef.current[code] || 0;
    if (now - lastTime < 3000) {
      return; // Ignore scan if it's within 3 seconds of the last scan
    }
    lastScannedTimeRef.current[code] = now;
    
    const student = students.find((s) => s.qr_code === code || s.id === code);
    if (!student) {
      playBeep(300, 0.4);
      setScanned((prev) => [{ name: code, time: getFormattedTime(), status: 'فشل', message: 'كود غير معروف', success: false }, ...prev]);
      return;
    }

    const isEnrolled = enrollments.some((e) => e.student_id === student.id);
    if (!isEnrolled) {
      playBeep(300, 0.4);
      setScanned((prev) => [{ name: student.name, time: getFormattedTime(), status: 'فشل', message: 'غير مسجل في هذه المجموعة', success: false }, ...prev]);
      return;
    }

    const isAlreadyPresent = existingAttendance.some((a) => a.student_id === student.id && a.status === 'حاضر');
    if (isAlreadyPresent) {
      playBeep(450, 0.25);
      setScanned((prev) => [{ name: student.name, time: getFormattedTime(), status: 'تنبيه', message: 'تم تسجيله مسبقاً', success: false }, ...prev]);
      return;
    }

    try {
      await repo.insert('attendance', {
        session_id: selectedSessionId,
        student_id: student.id,
        status: 'حاضر',
      });
      playBeep(800, 0.15);
      setScanned((prev) => [{ name: student.name, time: getFormattedTime(), status: 'حاضر', message: 'تم التسجيل بنجاح', success: true }, ...prev]);
      
      setExistingAttendance((prev) => [...prev, { student_id: student.id, status: 'حاضر' } as Attendance]);
      onSaved();
    } catch (err) {
      console.error(err);
      playBeep(300, 0.4);
    }
  }, [students, enrollments, existingAttendance, selectedSessionId, onSaved]);

  const scanHandlerRef = useRef(handleQRScan);
  useEffect(() => {
    scanHandlerRef.current = handleQRScan;
  }, [handleQRScan]);

  // Global keydown listener for USB HID Barcode/QR scanners
  useEffect(() => {
    let buffer: { key: string; time: number }[] = [];
    
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in a form input/textarea to allow manual search input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const now = Date.now();
      const key = e.key;

      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(key)) {
        return;
      }

      if (key === 'Enter') {
        if (buffer.length > 0) {
          const firstTime = buffer[0].time;
          const duration = now - firstTime;
          const avgTime = duration / buffer.length;

          // USB HID barcode scanners type extremely fast (< 50ms average per character)
          if (avgTime < 50 && buffer.length >= 3) {
            const code = buffer.map(b => b.key).join('');
            e.preventDefault();
            scanHandlerRef.current(code);
          }
        }
        buffer = [];
        return;
      }

      // Clean up keys older than 50ms (typing speed gap check)
      if (buffer.length > 0 && now - buffer[buffer.length - 1].time > 50) {
        buffer = [];
      }

      buffer.push({ key, time: now });
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, []);

  // Dynamically load html5-qrcode and initialize scanner
  useEffect(() => {
    let active = true;
    let scannerInstance: any = null;

    const startScanner = () => {
      if (!active) return;
      setScannerStatus('loading');
      try {
        const scanner = new (window as any).Html5Qrcode("qr-reader");
        scannerInstance = scanner;
        
        scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 }
          },
          (decodedText: string) => {
            scanHandlerRef.current(decodedText);
          },
          () => {}
        ).then(() => {
          if (active) setScannerStatus('active');
        }).catch((err: any) => {
          console.error("Scanner start failed:", err);
          if (active) setScannerStatus('error');
        });
      } catch (e) {
        console.error("Scanner initialization failed:", e);
        if (active) setScannerStatus('error');
      }
    };

    const scriptId = 'html5-qrcode-cdn';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/html5-qrcode';
      script.onload = startScanner;
      document.body.appendChild(script);
    } else if ((window as any).Html5Qrcode) {
      startScanner();
    }

    return () => {
      active = false;
      if (scannerInstance) {
        try {
          scannerInstance.stop().catch((e: any) => console.error("Error stopping scanner:", e));
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, [selectedSessionId]);

  // Handle USB scanner keyboard enter / search enter
  useEffect(() => {
    if (!search.trim()) { setFound(null); return; }
    const match = students.find((s) => s.qr_code === search || s.name === search || s.phone === search);
    setFound(match || null);
  }, [search, students]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && found) {
      handleQRScan(found.qr_code || found.id);
      setSearch('');
      setFound(null);
    }
  };

  return (
    <Dialog open onClose={onClose} title="مسح QR للحضور" size="lg" footer={<Button variant="secondary" onClick={onClose}>إغلاق</Button>}>
      <div className="space-y-4">
        {/* Select Session */}
        <div>
          <label className="label">اختر الحصة المراد تسجيل الحضور بها</label>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="input w-full"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.group?.name} — {s.session_date} {s.start_time?.slice(0, 5) || ''}
              </option>
            ))}
          </select>
        </div>

        {/* Scanner Area */}
        <div className="relative aspect-video bg-ink-900 rounded-xl overflow-hidden flex items-center justify-center">
          <div id="qr-reader" className="absolute inset-0 w-full h-full" />
          
          {scannerStatus !== 'active' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink-900 z-10 text-white gap-2">
              {scannerStatus === 'loading' ? (
                <>
                  <Spinner className="text-brand-400" />
                  <p className="text-xs text-white/70">جاري بدء الكاميرا...</p>
                </>
              ) : scannerStatus === 'error' ? (
                <p className="text-xs text-danger-400">فشل بدء الكاميرا. تحقق من الصلاحيات.</p>
              ) : (
                <p className="text-xs text-white/70">جاري تحميل قارئ الكود...</p>
              )}
            </div>
          )}

          {scannerStatus === 'active' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="w-48 h-48 border-2 border-brand-400 rounded-2xl relative">
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-brand-300 rounded-tr-lg" />
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-brand-300 rounded-tl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-brand-300 rounded-br-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-brand-300 rounded-tl-lg" />
                <div className="absolute left-0 right-0 h-0.5 bg-brand-400 animate-pulse" style={{ top: '50%' }} />
              </div>
            </div>
          )}
        </div>

        {/* Manual search fallback & USB hardware scanner listener */}
        <div>
          <label className="label">أو ابحث يدوياً / امسح باستخدام قارئ USB</label>
          <div className="relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              className="input pr-9"
              placeholder="ابحث بالاسم أو كود الـ QR أو رقم الهاتف واضغط Enter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyPress}
              autoFocus
            />
          </div>
          {found && (
            <div className="mt-2 p-3 rounded-lg border border-brand-200 bg-brand-50 flex items-center justify-between animate-slide-in">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-semibold">{found.name.charAt(0)}</div>
                <div>
                  <p className="text-sm font-medium text-ink-900">{found.name}</p>
                  <p className="text-xs text-ink-500">{found.grade} · {found.qr_code}</p>
                </div>
              </div>
              <Button size="sm" onClick={() => { handleQRScan(found.qr_code || found.id); setSearch(''); setFound(null); }}><Check size={14} /> تسجيل حضور</Button>
            </div>
          )}
        </div>

        {/* Recent scans */}
        {scanned.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-ink-600 mb-2">الحضور المسجل ({scanned.length})</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {scanned.map((s, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2.5 rounded-lg border animate-slide-in ${
                    s.success === true
                      ? 'bg-success-50 border-success-100'
                      : s.status === 'تنبيه'
                      ? 'bg-warning-50 border-warning-100'
                      : 'bg-danger-50 border-danger-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {s.success === true ? (
                      <Check size={14} className="text-success-600" />
                    ) : (
                      <X size={14} className={s.status === 'تنبيه' ? 'text-warning-600' : 'text-danger-600'} />
                    )}
                    <div>
                      <span className="text-sm font-medium text-ink-900">{s.name}</span>
                      {s.message && <p className="text-xs text-ink-500">{s.message}</p>}
                    </div>
                  </div>
                  <span className="text-xs text-ink-500 tabular">{s.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
