import { type ReactNode } from 'react';

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

const toneClass: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-700',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-600',
  danger: 'bg-danger-100 text-danger-700',
  info: 'bg-info-100 text-info-600',
  brand: 'bg-brand-50 text-brand-700',
};

export function Badge({ tone = 'neutral', children, className = '' }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={`badge ${toneClass[tone]} ${className}`}>{children}</span>;
}

const statusToneMap: Record<string, Tone> = {
  'نشط': 'success',
  'غير نشط': 'neutral',
  'متوقف': 'warning',
  'خرج': 'danger',
  'مدفوع': 'success',
  'جزئي': 'warning',
  'غير مدفوع': 'danger',
  'مسترد': 'neutral',
  'حاضر': 'success',
  'غائب': 'danger',
  'متأخر': 'warning',
  'بعذر': 'info',
  'مجدولة': 'info',
  'تمت': 'success',
  'ملغاة': 'danger',
  'غائبة': 'warning',
  'مكتمل': 'neutral',
  'ملغى': 'danger',
  'مرسل': 'success',
  'فشل': 'danger',
  'مجدول': 'warning',
  'مسودة': 'neutral',
  'سلم': 'success',
  'لم يسلم': 'warning',
  'مرفوض': 'danger',
};

export function StatusBadge({ status }: { status: string }) {
  const tone = statusToneMap[status] ?? 'neutral';
  return <Badge tone={tone}>{status}</Badge>;
}
