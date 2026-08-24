'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  onClose: () => void
}

export default function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 8000)
    return () => window.clearTimeout(timer)
  }, [onClose])

  return (
    <div className="ds-toast" role="status" aria-live="polite">
      <p className="ds-toast-text">{message}</p>
      <button type="button" className="chat-icon-btn" onClick={onClose} aria-label="Dismiss">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}
