import { type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode, useState, useRef, useEffect } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  icon?: ReactNode;
};

export function Input({ label, hint, icon, className = '', ...props }: InputProps) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400">{icon}</span>}
        <input className={`input ${icon ? 'pr-9' : ''}`} {...props} />
      </div>
      {hint && <p className="text-xs text-ink-400 mt-1">{hint}</p>}
    </div>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
};

export function Select({ label, options, placeholder, className = '', ...props }: SelectProps) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <select className="input" {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export function Textarea({ label, className = '', ...props }: TextareaProps) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <textarea className="input min-h-[80px] py-2" {...props} />
    </div>
  );
}

type ComboboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'onSelect'> & {
  label?: string;
  options: string[];
  onSelect: (value: string) => void;
  hint?: string;
  icon?: ReactNode;
};

export function Combobox({ label, options, onSelect, className = '', value, onChange, hint, icon, ...props }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(String(value || '').toLowerCase()));

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <Input
        label={label}
        value={value}
        onChange={(e) => {
          if (onChange) onChange(e);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
        hint={hint}
        icon={icon}
        {...props}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-ink-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {filtered.map(o => (
            <li
              key={o}
              className="px-3 py-2 cursor-pointer hover:bg-ink-50 text-sm text-ink-700"
              onClick={() => {
                onSelect(o);
                setOpen(false);
              }}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
