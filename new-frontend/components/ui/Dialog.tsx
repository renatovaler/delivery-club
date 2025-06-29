'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog(): void {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50',
        open ? 'block' : 'hidden'
      )}
      onClick={() => onOpenChange(false)}
      {...props}
    >
      <div
        className='bg-white rounded-lg shadow-lg max-w-lg w-full p-6'
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogContent(): void {
  return (
    <div className={cn('p-4', className)} {...props}>
      {children}
    </div>
  );
}

export function DialogHeader(): void {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function DialogTitle(): void {
  return (
    <h2 className={cn('text-lg font-semibold', className)} {...props}>
      {children}
    </h2>
  );
}

export function DialogFooter(): void {
  return (
    <div className={cn('mt-4 flex justify-end space-x-2', className)} {...props}>
      {children}
    </div>
  );
}
