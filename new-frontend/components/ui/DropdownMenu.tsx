'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
}

export function DropdownMenu({ children, className }: DropdownMenuProps) {
  return (
    <div className={cn('relative inline-block text-left', className)}>
      {children}
    </div>
  );
}

interface DropdownMenuTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export function DropdownMenuTrigger({ children, asChild }: DropdownMenuTriggerProps) {
  if (asChild) {
    return <>{children}</>;
  }
  return (
    <button
      type="button"
      className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
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

export function DropdownMenuContent({ children, align = 'start', className }: DropdownMenuContentProps) {
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

export function DropdownMenuItem({ children, onClick, className }: DropdownMenuItemProps) {
  return (
    <div
      className={cn(
        'block px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100',
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
