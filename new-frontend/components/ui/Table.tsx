'use client';

import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full border-collapse border border-slate-200">{children}</table>
    </div>
  );
}

export function TableHeader({ children, className }: TableProps) {
  return (
    <thead className={cn('bg-slate-50', className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className }: TableProps) {
  return (
    <tbody className={cn(className)}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className }: TableProps) {
  return (
    <tr className={cn('border-b border-slate-200 hover:bg-slate-50', className)}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className }: TableProps) {
  return (
    <th
      scope="col"
      className={cn(
        'text-left text-sm font-semibold text-slate-900 px-4 py-2',
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className }: TableProps) {
  return (
    <td className={cn('text-sm text-slate-700 px-4 py-2', className)}>
      {children}
    </td>
  );
}
