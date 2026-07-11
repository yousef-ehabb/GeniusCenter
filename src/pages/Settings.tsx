import { useEffect, useState } from 'react';
import { repo } from '../lib/repo';
import type { Settings as SettingsType } from '../lib/types';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Card, CardHeader, Spinner } from '../components/ui/Card';
import { Save, Bell, Shield, Clock } from 'lucide-react';

export function SettingsPage() {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    repo.getSettings().then((data) => {
      setSettings(data as SettingsType);
      setLoading(false);
    });
  }, []);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    await repo.upsertSettings({
      ...settings,
      center_name: settings.center_name,
      center_phone: settings.center_phone,
      center_address: settings.center_address,
      currency: settings.currency,
      academic_year: settings.academic_year,
      default_payment_type: settings.default_payment_type,
      enable_qr: settings.enable_qr,
      enable_notifications: settings.enable_notifications,
      session_timeout_min: settings.session_timeout_min,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
  };

  if (loading || !settings) return <div className="flex items-center justify-center h-96"><Spinner className="text-brand-600" /></div>;

  return (
    <div className="max-w-3xl space-y-5">
      <Card>
        <CardHeader title="بيانات المركز" subtitle="المعلومات الأساسية للمركز التعليمي" />
        <div className="p-4 grid grid-cols-2 gap-4">
          <Input label="اسم المركز" value={settings.center_name} onChange={(e) => setSettings({ ...settings, center_name: e.target.value })} className="col-span-2" />
          <Input label="الهاتف" value={settings.center_phone || ''} onChange={(e) => setSettings({ ...settings, center_phone: e.target.value })} />
          <Input label="العنوان" value={settings.center_address || ''} onChange={(e) => setSettings({ ...settings, center_address: e.target.value })} />
        </div>
      </Card>

      <Card>
        <CardHeader title="الإعدادات المالية" />
        <div className="p-4 grid grid-cols-2 gap-4">
          <Input label="العملة" value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} />
          <Input label="السنة الدراسية" value={settings.academic_year} onChange={(e) => setSettings({ ...settings, academic_year: e.target.value })} />
          <Select label="نوع الدفع الافتراضي" value={settings.default_payment_type} onChange={(e) => setSettings({ ...settings, default_payment_type: e.target.value })} options={[
            { value: 'شهري', label: 'شهري' }, { value: 'بالجلسة', label: 'بالجلسة' }, { value: 'دورة', label: 'دورة' }, { value: 'أقساط', label: 'أقساط' },
          ]} />
        </div>
      </Card>

      <Card>
        <CardHeader title="الميزات" />
        <div className="p-4 space-y-3">
          <ToggleRow icon={<Shield size={16} />} label="تفعيل نظام QR للحضور" checked={settings.enable_qr} onChange={(v) => setSettings({ ...settings, enable_qr: v })} />
          <ToggleRow icon={<Bell size={16} />} label="تفعيل الإشعارات" checked={settings.enable_notifications} onChange={(v) => setSettings({ ...settings, enable_notifications: v })} />
          <div className="flex items-center justify-between p-3 rounded-lg border border-ink-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-ink-100 flex items-center justify-center text-ink-500"><Clock size={16} /></div>
              <span className="text-sm text-ink-700">مدة انتهاء الجلسة (دقيقة)</span>
            </div>
            <Input className="w-24" type="number" value={settings.session_timeout_min} onChange={(e) => setSettings({ ...settings, session_timeout_min: Number(e.target.value) })} />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>{saving ? <Spinner /> : <><Save size={16} /> حفظ الإعدادات</>}</Button>
      </div>
    </div>
  );
}

function ToggleRow({ icon, label, checked, onChange }: { icon: React.ReactNode; label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-ink-200">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-ink-100 flex items-center justify-center text-ink-500">{icon}</div>
        <span className="text-sm text-ink-700">{label}</span>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-colors relative ${checked ? 'bg-brand-600' : 'bg-ink-300'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? 'right-0.5' : 'right-5'}`} />
      </button>
    </div>
  );
}
