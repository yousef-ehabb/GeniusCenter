import { type ReactNode, type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'icon';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const sizeClass: Record<Size, string> = {
  sm: 'btn-sm',
  md: '',
  icon: 'btn-icon',
};

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: Props) {
  return (
    <button className={`${variantClass[variant]} ${sizeClass[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
