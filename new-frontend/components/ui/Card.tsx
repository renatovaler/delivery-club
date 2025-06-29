import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps): JSX.Element {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white shadow ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardProps): JSX.Element {
  return <div className={`border-b border-gray-200 px-4 py-2 ${className}`}>{children}</div>;
}

export function CardContent({ children, className = '' }: CardProps): JSX.Element {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: CardProps): JSX.Element {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
}
