import { createContext, ReactNode, useContext, useState } from 'react';

interface Toast {
  id: number;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

interface ToastContextType {
  toasts: Toast[];
  toast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: number) => void;
}

interface ToastProviderProps {
  children: ReactNode;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: ToastProviderProps): JSX.Element => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (newToast: Omit<Toast, 'id'>): void => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...newToast, id }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: number): void => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(({ id, title, description, variant }) => (
          <div
            key={id}
            className={`w-full max-w-sm rounded-md border bg-white p-4 shadow-lg ${
              variant === 'destructive' ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          >
            <strong className="block font-semibold">{title}</strong>
            {description && <p className="text-sm">{description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
