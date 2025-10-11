"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type ToastType = 'default' | 'destructive';

interface Toast {
  id: string;
  title?: string;
  description: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: (props: Omit<Toast, 'id'>) => void;
  dismiss: (id: string) => void;
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = ({ title, description, type = 'default', duration = 5000 }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    setToasts((currentToasts) => [...currentToasts, { id, title, description, type }]);

    if (duration) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }

    return id;
  };

  const dismiss = (id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast, dismiss, toasts }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-md shadow-lg ${
              toast.type === 'destructive' 
                ? 'bg-red-500 text-white' 
                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            }`}
          >
            {toast.title && <h3 className="font-bold">{toast.title}</h3>}
            <p>{toast.description}</p>
            <button 
              onClick={() => dismiss(toast.id)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
