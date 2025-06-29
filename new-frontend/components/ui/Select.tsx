'use client';

import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export function Select({ value, onValueChange, children, className }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className={cn(
        'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      {children}
    </select>
  );
}

interface SelectItemProps {
  value: string;
  children: ReactNode;
}

export function SelectItem({ value, children }: SelectItemProps) {
  return <option value={value}>{children}</option>;
}
