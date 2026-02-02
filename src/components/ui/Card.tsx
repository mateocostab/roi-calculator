import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'highlight' | 'dark';
  hover?: boolean;
}

export function Card({
  children,
  className = '',
  variant = 'default',
  hover = false,
}: CardProps) {
  const baseClasses = 'rounded-xl p-5 transition-all duration-200';

  const variantClasses = {
    default: 'bg-gray-900 border border-gray-800',
    highlight: 'bg-gradient-to-br from-gray-900 to-gray-800 border border-primary/20',
    dark: 'bg-gray-950 border border-gray-900',
  };

  const hoverClasses = hover
    ? 'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5'
    : '';

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-semibold text-white ${className}`}>
      {children}
    </h3>
  );
}

interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-gray-400 ${className}`}>
      {children}
    </p>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}
