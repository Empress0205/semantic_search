import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { IconAlert, IconCheck, IconClose } from '../components/Icons.jsx'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback(
    (message, tone = 'success') => {
      const id = Date.now() + Math.random()
      setToasts((current) => [...current, { id, message, tone }])
      setTimeout(() => dismiss(id), 3800)
    },
    [dismiss]
  )

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.tone}`}>
            <span className="toast-mark row">
              {toast.tone === 'success' ? (
                <IconCheck size={17} />
              ) : (
                <IconAlert size={17} />
              )}
            </span>
            <span>{toast.message}</span>
            <button
              type="button"
              className="btn btn-ghost btn-icon"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <IconClose size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
