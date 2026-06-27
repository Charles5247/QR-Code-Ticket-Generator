// ============================================================
// MC FABS EXCLUSIVE MASTERCLASS — Toast Notification System
// ============================================================

const { useState, useEffect, useCallback, useRef, createContext, useContext } =
  React;

// Toast Context
const ToastContext = createContext(null);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, "success", dur),
    error: (msg, dur) => addToast(msg, "error", dur),
    warning: (msg, dur) => addToast(msg, "warning", dur),
    info: (msg, dur) => addToast(msg, "info", dur),
    loading: (msg, dur) => addToast(msg, "loading", dur || 30000),
  };

  return React.createElement(
    ToastContext.Provider,
    { value: toast },
    children,
    React.createElement(ToastContainer, { toasts, onRemove: removeToast }),
  );
}

function useToast() {
  return useContext(ToastContext);
}

function ToastContainer({ toasts, onRemove }) {
  return React.createElement(
    "div",
    {
      style: {
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "flex-end",
        maxWidth: "400px",
      },
    },
    toasts.map((t) =>
      React.createElement(ToastItem, { key: t.id, toast: t, onRemove }),
    ),
  );
}

function ToastItem({ toast, onRemove }) {
  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
    loading: "⏳",
  };
  const colors = {
    success: "rgba(102,103,171,0.15)",
    error: "rgba(239,68,68,0.15)",
    warning: "rgba(245,213,224,0.15)",
    info: "rgba(102,103,171,0.15)",
    loading: "rgba(102,103,171,0.15)",
  };
  const borders = {
    success: "rgba(102,103,171,0.4)",
    error: "rgba(239,68,68,0.4)",
    warning: "rgba(245,213,224,0.4)",
    info: "rgba(102,103,171,0.4)",
    loading: "rgba(102,103,171,0.4)",
  };

  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: colors[toast.type] || colors.info,
        backdropFilter: "blur(20px)",
        border: `1px solid ${borders[toast.type] || borders.info}`,
        borderRadius: "12px",
        padding: "14px 18px",
        color: "white",
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
        animation: "slideUp 0.3s ease",
        maxWidth: "380px",
        wordBreak: "break-word",
        cursor: "pointer",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      },
      onClick: () => onRemove(toast.id),
    },
    React.createElement(
      "span",
      { style: { fontSize: "18px", flexShrink: 0 } },
      icons[toast.type],
    ),
    React.createElement(
      "span",
      { style: { flex: 1, lineHeight: "1.4" } },
      toast.message,
    ),
    React.createElement(
      "span",
      {
        style: {
          opacity: 0.5,
          marginLeft: "8px",
          cursor: "pointer",
          flexShrink: 0,
        },
        onClick: () => onRemove(toast.id),
      },
      "✕",
    ),
  );
}
window.ToastProvider = ToastProvider;
window.useToast = useToast;
