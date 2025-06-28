import React, { forwardRef } from 'react';
import { cn } from '../../lib/lib';
import { ButtonProps, ButtonRef } from './Button.types';
import { LoadingSpinner } from './LoadingSpinner';

const Button = forwardRef<ButtonRef, ButtonProps>(({
  className,
  variant = 'default',
  size = 'default',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background';

  const variants = {
    default: 'bg-slate-900 text-slate-50 hover:bg-slate-900/90',
    destructive: 'bg-red-500 text-slate-50 hover:bg-red-500/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-100/80',
    ghost: 'hover:bg-slate-100 hover:text-slate-900',
    link: 'text-slate-900 underline-offset-4 hover:underline',
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };

  const loadingStyles = isLoading ? 'cursor-not-allowed' : '';
  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      ref={ref}
      disabled={isLoading || disabled}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        loadingStyles,
        widthStyles,
        className
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" light={variant === 'default' || variant === 'destructive'} />
          <span className="ml-2">{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export { Button };
