'use client';

import React from 'react';
import { cn } from '../../lib/utils';

interface SeparatorProps extends React.HTMLAttributes<HTMLHRElement> {
  className?: string;
}

export function Separator(): void {
  return (
    <hr
      className={cn('border-t border-gray-200 my-4', className)}
      {...props}
    />
  );
}
