import React from 'react';

const toneClasses = {
  success: 'border-green-200 bg-green-50 text-green-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  info: 'border-slate-200 bg-white text-slate-800'
};

export const ToastContainer = ({ toasts = [], onDismiss }) => {
  if (!toasts.length) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm ${toneClasses[toast.type] || toneClasses.info}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {toast.title && (
                <p className="text-sm font-semibold">{toast.title}</p>
              )}
              <p className="whitespace-pre-line text-sm">{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="text-xs font-semibold opacity-70 hover:opacity-100"
            >
              닫기
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
