import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type?: 'success' | 'info' | 'error';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-[#0058c3] shrink-0" />,
  };

  return (
    <div className="pointer-events-auto bg-white border border-[#e2e8f0] shadow-xl rounded-xl p-3.5 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
      {icons[toast.type || 'success']}
      <div className="flex-1 text-[13px]">
        <div className="font-semibold text-[#0b1c30]">{toast.title}</div>
        {toast.message && <div className="text-[12px] text-[#727785] mt-0.5">{toast.message}</div>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-[#94a3b8] hover:text-[#424754] transition-colors p-0.5 cursor-pointer"
        type="button"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
