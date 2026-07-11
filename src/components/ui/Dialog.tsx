import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
};

const sizeClass = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Dialog({ open, onClose, title, children, footer, size = 'md' }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-ink-950/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`relative card w-full ${sizeClass[size]} max-h-[90vh] flex flex-col shadow-pop animate-slide-up`}>
        <div className="flex items-center justify-between px-5 h-14 border-b border-ink-200 shrink-0">
          <h2 className="text-base font-semibold text-ink-900">{title}</h2>
          <button onClick={onClose} className="btn-ghost btn-icon -me-2">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 px-5 h-14 border-t border-ink-200 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
