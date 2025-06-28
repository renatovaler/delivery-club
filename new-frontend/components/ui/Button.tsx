import React, { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'outline';
  className?: string;
}

export function Button({ children, variant = 'default', className = '', ...props }: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variantClasses =
    variant === 'outline'
      ? 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
      : 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-blue-500';

  return (
    <button className={`${baseClasses} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
}
