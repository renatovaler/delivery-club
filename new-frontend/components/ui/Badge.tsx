import React, { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
}

export function Badge({ children, className = '', variant = 'default' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium';
  const variantClasses =
    variant === 'outline'
      ? 'border border-gray-300 text-gray-700 bg-white'
      : 'bg-gray-200 text-gray-800';

  return (
    <span className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
}
