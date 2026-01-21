'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast from './Toast';

type ToastMessage = {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onUndo?: () => void;
  showUndo?: boolean;
};

type ToastContextType = {
  showToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number, onUndo?: () => void) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const MAX_TOASTS = 5; // Maximum number of toasts to show at once

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success', duration = 3000, onUndo?: () => void) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => {
      // If we're at max, remove the oldest toast
      const newToasts = prev.length >= MAX_TOASTS 
        ? [...prev.slice(1), { id, message, type, duration, onUndo, showUndo: !!onUndo }]
        : [...prev, { id, message, type, duration, onUndo, showUndo: !!onUndo }];
      return newToasts;
    });
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div 
        className="fixed top-20 right-4 md:right-6 z-50 max-w-sm w-[calc(100%-2rem)] md:w-auto"
        style={{
          fontFamily: 'var(--font-inter)',
          maxHeight: 'calc(100vh - 6rem)',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent',
          paddingRight: '0.5rem',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast, index) => (
          <div 
            key={toast.id} 
            className="pointer-events-auto animate-slide-in flex-shrink-0"
            style={{
              animationDelay: `${index * 50}ms`,
            }}
          >
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
              onUndo={toast.onUndo}
              showUndo={toast.showUndo}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
