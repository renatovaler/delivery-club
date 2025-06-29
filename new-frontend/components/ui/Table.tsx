'use client';

import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table(): void {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className='w-full border-collapse border border-slate-200'>{children}</table>
    </div>
  );
}

export function TableHeader(): void {
  return (
    <thead className={cn('bg-slate-50', className)}>
      {children}
    </thead>
  );
}

export function TableBody(): void {
  return (
    <tbody className={cn(className)}>
      {children}
    </tbody>
  );
}

export function TableRow(): void {
  return (
    <tr className={cn('border-b border-slate-200 hover:bg-slate-50', className)}>
      {children}
    </tr>
  );
}

export function TableHead(): void {
  return (
    <th
      scope='col'
      className={cn(
        'text-left text-sm font-semibold text-slate-900 px-4 py-2',
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableCell(): void {
  return (
    <td className={cn('text-sm text-slate-700 px-4 py-2', className)}>
      {children}
    </td>
  );
}
