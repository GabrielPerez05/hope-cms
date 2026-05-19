import { useCallback, useEffect, useRef, useState } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const show = useCallback((message, type = "success") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const success = useCallback((msg) => show(msg, "success"), [show]);
  const error = useCallback((msg) => show(msg, "error"), [show]);

  return { toasts, success, error };
}

export function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} />
      ))}
    </div>
  );
}

function Toast({ message, type }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 10);
    const hide = setTimeout(() => setVisible(false), 3000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, []);

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      } ${
        type === "success"
          ? "bg-emerald-700 text-white"
          : "bg-red-600 text-white"
      }`}
    >
      <span>{type === "success" ? "✓" : "✕"}</span>
      <span>{message}</span>
    </div>
  );
}
