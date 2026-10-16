import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
  toast: {
    success: () => {},
    error: () => {},
    info: () => {},
    warning: () => {},
  },
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ title, description, type = 'info', duration = 4500 }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, title, description, type, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = useCallback((options) => {
    if (typeof options === 'string') {
      return addToast({ title: options });
    }
    return addToast(options);
  }, [addToast]);

  toast.success = (title, description) => addToast({ title, description, type: 'success' });
  toast.error = (title, description) => addToast({ title, description, type: 'danger' });
  toast.info = (title, description) => addToast({ title, description, type: 'info' });
  toast.warning = (title, description) => addToast({ title, description, type: 'warning' });

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '380px',
        width: 'calc(100vw - 32px)',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          aria-live="polite"
          style={{
            pointerEvents: 'auto',
            background: 'var(--bg-surface)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            borderLeft: `4px solid ${
              t.type === 'success' ? 'var(--success)' :
              t.type === 'danger' ? 'var(--danger)' :
              t.type === 'warning' ? 'var(--warning)' : 'var(--accent)'
            }`,
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            animation: 'fadeInUp 200ms ease',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '13px', lineHeight: 1.4 }}>
              {t.title}
            </div>
            {t.description && (
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                {t.description}
              </div>
            )}
          </div>
          <button
            onClick={() => onRemove(t.id)}
            aria-label="Close notification"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '16px',
              lineHeight: 1,
              padding: '2px',
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  return context.toast;
}
