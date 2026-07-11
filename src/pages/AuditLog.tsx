import { useEffect, useState } from 'react';
import { repo } from '../lib/repo';
import type { AuditLog } from '../lib/types';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Badge } from '../components/ui/Badge';
import { EmptyState, Spinner } from '../components/ui/Card';
import { ClipboardList, Plus, Edit2, Trash2, Settings, Database, LogIn } from 'lucide-react';

const actionIcons: Record<string, React.ReactNode> = {
  'إضافة': <Plus size={14} />,
  'تعديل': <Edit2 size={14} />,
  'حذف': <Trash2 size={14} />,
  'تهيئة': <Database size={14} />,
  'تسجيل دخول': <LogIn size={14} />,
  'إعدادات': <Settings size={14} />,
};

const actionTones: Record<string, 'success' | 'info' | 'danger' | 'warning' | 'neutral'> = {
  'إضافة': 'success',
  'تعديل': 'info',
  'حذف': 'danger',
  'تهيئة': 'neutral',
  'تسجيل دخول': 'info',
  'إعدادات': 'warning',
};

export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
    const items = await repo.getAll('audit_log');
    items.sort((a, b) => b.created_at.localeCompare(a.created_at));
    const data = items.slice(0, 100);
    setLogs(data);
    setLoading(false);
    })();
  }, []);

  const columns: Column<AuditLog>[] = [
    {
      key: 'action', header: 'الإجراء',
      render: (l) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-ink-100 flex items-center justify-center text-ink-500">{actionIcons[l.action] || <ClipboardList size={14} />}</div>
          <Badge tone={actionTones[l.action] || 'neutral'}>{l.action}</Badge>
        </div>
      ),
    },
    { key: 'entity_type', header: 'النوع', render: (l) => <span className="text-ink-600">{l.entity_type || '—'}</span> },
    { key: 'actor', header: 'المستخدم', render: (l) => <span className="text-ink-700 font-medium">{l.actor || 'النظام'}</span> },
    {
      key: 'details', header: 'التفاصils',
      render: (l) => l.details ? <span className="text-ink-500 text-xs font-mono">{JSON.stringify(l.details).slice(0, 60)}</span> : <span className="text-ink-300">—</span>,
    },
    {
      key: 'time', header: 'الوقت', sortable: true, sortValue: (l) => l.created_at,
      render: (l) => <span className="text-ink-500 text-xs tabular">{new Date(l.created_at).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}</span>,
    },
  ];

  if (loading) return <div className="flex items-center justify-center h-96"><Spinner className="text-brand-600" /></div>;

  return (
    <DataTable
      columns={columns}
      data={logs}
      rowKey={(l) => l.id}
      emptyState={<EmptyState icon={<ClipboardList size={40} />} title="لا يوجد سجل عمليات" />}
    />
  );
}
