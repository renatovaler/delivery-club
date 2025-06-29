import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card(): void {
  return (
    <div className={`bg-white rounded-lg shadow border border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader(): void {
  return (
    <div className={`px-4 py-2 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent(): void {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle(): void {
  return (
    <h3 className={`text-lg font-semibold ${className}`}>
      {children}
    </h3>
  );
}
