import { useState, useCallback } from 'react';
import { ToastContext } from './ToastContext'; // Importamos el objeto separado
import ToastItem from '../components/ToastItem';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => removeToast(id), 5000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 z-9999 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-end">
          {toasts.map((t) => (
            <ToastItem key={t.id} t={t} removeToast={removeToast} />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}