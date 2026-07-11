import { type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`card ${className}`}>{children}</div>;
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 h-12 border-b border-ink-200">
      <div>
        <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
        {subtitle && <p className="text-xs text-ink-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} size={16} />;
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-ink-300 mb-3">{icon}</div>}
      <p className="text-sm font-medium text-ink-600">{title}</p>
      {description && <p className="text-xs text-ink-400 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
