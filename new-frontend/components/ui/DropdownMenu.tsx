'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownMenu({ children, className }: DropdownMenuProps): JSX.Element {
  return <div className={cn('relative inline-block text-left', className)}>{children}</div>;
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps): JSX.Element {
  if (asChild) {
    return <>{children}</>;
  }
  return (
    <button
      type="button"
      className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
      aria-haspopup="true"
      aria-expanded="false"
    >
      {children}
    </button>
  );
}

interface DropdownMenuContentProps {
  children: React.ReactNode;
  align?: 'start' | 'end';
  className?: string;
}

export function DropdownMenuContent({
  children,
  align,
  className,
}: DropdownMenuContentProps): JSX.Element {
  return (
    <div
      className={cn(
        'absolute z-50 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
        align === 'end' ? 'right-0' : 'left-0',
        className
      )}
      role="menu"
    >
      {children}
    </div>
  );
}

interface DropdownMenuItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function DropdownMenuItem({
  children,
  onClick,
  className,
}: DropdownMenuItemProps): JSX.Element {
  return (
    <div
      className={cn(
        'block cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100',
        className
      )}
      role="menuitem"
      tabIndex={-1}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
