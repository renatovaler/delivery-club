'use client';

import React, { LabelHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  className?: string;
}

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  );
}
