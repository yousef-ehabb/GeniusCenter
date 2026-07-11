import { Card, CardHeader } from '../components/ui/Card';

export function Backup() {
  return (
    <div className="max-w-3xl space-y-5">
      <Card>
        <CardHeader title="النسخ الاحتياطي" subtitle="نظام النسخ الاحتياطي" />
        <div className="p-4">
          <p className="text-sm text-ink-600">
            النسخ الاحتياطي تتم إدارته عبر الخادم (Server) وقاعدة بيانات SQLite.
          </p>
        </div>
      </Card>
    </div>
  );
}
