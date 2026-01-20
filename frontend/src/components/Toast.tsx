'use client';

import React, { useEffect } from 'react';
import { useToast, Toast as ToastType } from '@/contexts/ToastContext';
import { BiCheckCircle, BiErrorCircle, BiInfoCircle, BiX } from 'react-icons/bi';

const Toast: React.FC<{ toast: ToastType }> = ({ toast }) => {
  const { removeToast } = useToast();

  const getToastStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: <BiCheckCircle className="w-5 h-5 text-green-600" />,
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: <BiErrorCircle className="w-5 h-5 text-red-600" />,
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: <BiInfoCircle className="w-5 h-5 text-yellow-600" />,
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: <BiInfoCircle className="w-5 h-5 text-blue-600" />,
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={`
        ${styles.bg} ${styles.border} ${styles.text}
        border rounded-lg shadow-lg p-4 mb-3
        flex items-start gap-3
        min-w-[300px] max-w-[500px]
      `}
      role="alert"
      style={{
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
      <div className="flex-1">
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close toast"
      >
        <BiX className="w-5 h-5" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col items-end"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

