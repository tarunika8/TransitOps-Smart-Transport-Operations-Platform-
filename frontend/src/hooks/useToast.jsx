import { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const push = useCallback((toast) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type: 'info', ...toast }]);
    setTimeout(() => remove(id), toast.duration || 3500);
  }, []);

  const api = {
    success: (msg) => push({ type: 'success', message: msg }),
    error:   (msg) => push({ type: 'error',   message: msg }),
    info:    (msg) => push({ type: 'info',    message: msg }),
    warn:    (msg) => push({ type: 'warn',    message: msg }),
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
    error:   <XCircle      className="w-5 h-5 text-red-500" />,
    info:    <Info         className="w-5 h-5 text-brand-500" />,
    warn:    <AlertTriangle className="w-5 h-5 text-amber-500" />,
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[320px]">
        {toasts.map((t) => (
          <div key={t.id} className="card flex items-start gap-3 p-3 shadow-soft animate-[slideIn_.25s_ease]">
            {icons[t.type]}
            <div className="flex-1 text-sm text-slate-700">{t.message}</div>
            <button onClick={() => remove(t.id)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
