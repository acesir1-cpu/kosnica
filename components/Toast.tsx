'use client';

import { useEffect, useState, useRef } from 'react';

type ToastProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
  onUndo?: () => void;
  showUndo?: boolean;
};

export default function Toast({ message, type = 'success', duration = 3000, onClose, onUndo, showUndo = false }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Slide in animation
    const slideInTimer = setTimeout(() => setIsVisible(true), 10);

    // Progress bar animation
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const decrement = (100 / duration) * 16; // ~60fps
        const newProgress = prev - decrement;
        if (newProgress <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return newProgress;
      });
    }, 16);

    // Auto close timer
    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for fade out animation before calling onClose
      closeTimerRef.current = setTimeout(() => {
        onClose();
        closeTimerRef.current = null;
      }, 350);
    }, duration);

    return () => {
      clearTimeout(slideInTimer);
      clearTimeout(timer);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [duration, onClose]);

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'var(--green-primary)',
          bgLight: 'rgba(132, 168, 122, 0.1)',
          iconBg: 'rgba(132, 168, 122, 0.15)',
          border: 'rgba(132, 168, 122, 0.2)',
        };
      case 'error':
        return {
          bg: '#dc2626',
          bgLight: 'rgba(220, 38, 38, 0.1)',
          iconBg: 'rgba(220, 38, 38, 0.15)',
          border: 'rgba(220, 38, 38, 0.2)',
        };
      case 'info':
        return {
          bg: '#d97706',
          bgLight: 'rgba(217, 119, 6, 0.1)',
          iconBg: 'rgba(217, 119, 6, 0.15)',
          border: 'rgba(217, 119, 6, 0.2)',
        };
      default:
        return {
          bg: 'var(--green-primary)',
          bgLight: 'rgba(132, 168, 122, 0.1)',
          iconBg: 'rgba(132, 168, 122, 0.15)',
          border: 'rgba(132, 168, 122, 0.2)',
        };
    }
  };

  const colors = getColors();

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Wait for fade out animation before calling onClose
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      onClose();
      closeTimerRef.current = null;
    }, 350);
  };

  const handleUndo = () => {
    if (onUndo) {
      onUndo();
      handleClose();
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl shadow-2xl backdrop-blur-sm transition-all duration-350 ease-out ${
        isVisible 
          ? 'opacity-100 translate-x-0 scale-100' 
          : 'opacity-0 translate-x-full scale-95 pointer-events-none'
      }`}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        border: `1px solid ${colors.border}`,
        minWidth: '320px',
        maxWidth: '420px',
        fontFamily: 'var(--font-inter)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Progress Bar */}
      <div
        className="absolute top-0 left-0 h-1 transition-all duration-75 ease-linear"
        style={{
          width: `${progress}%`,
          backgroundColor: colors.bg,
          boxShadow: `0 0 10px ${colors.bg}`,
        }}
      />

      {/* Content */}
      <div className="flex items-start gap-4 px-5 py-4">
        {/* Icon */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-0.5"
          style={{
            backgroundColor: colors.iconBg,
            color: colors.bg,
          }}
        >
          {getIcon()}
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0 pt-0.5">
          <p
            className="font-medium leading-snug"
            style={{
              color: 'var(--dark-text)',
              fontSize: '0.9375rem',
              fontFamily: 'var(--font-inter)',
            }}
          >
            {message}
          </p>
        </div>

        {/* Undo Button */}
        {showUndo && onUndo && (
          <button
            onClick={handleUndo}
            className="flex-shrink-0 px-3 py-1.5 rounded-lg transition-all duration-200 font-medium text-sm mt-0.5"
            style={{
              backgroundColor: colors.bg,
              color: 'white',
              fontFamily: 'var(--font-inter)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.bg;
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
            aria-label="Poništi"
          >
            Poništi
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-opacity-20 mt-0.5"
          style={{
            backgroundColor: 'transparent',
            color: 'var(--body-text)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.bgLight;
            e.currentTarget.style.color = colors.bg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--body-text)';
          }}
          aria-label="Zatvori"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
