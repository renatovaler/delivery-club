import React from 'react';
import { cn } from '../../lib/utils';
import type { ProgressProps } from './Progress.types';

export default function Progress(): void {
  const percentage = Math.min(Math.max(value, 0), max) / max * 100;

  return (
    <div
      role='progressbar'
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn('w-full h-2 rounded-full bg-gray-200 overflow-hidden', className)}
      {...props}
    >
      <div
        className='h-full bg-blue-600 transition-all duration-300'
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
