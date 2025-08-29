import type { ComponentChildren } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import Button from './Button'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ComponentChildren
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

interface DialogHeaderProps {
  children: ComponentChildren
  onClose?: () => void
}

interface DialogBodyProps {
  children: ComponentChildren
}

interface DialogFooterProps {
  children: ComponentChildren
}

interface DialogConfirmProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
}

function clsx(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(' ')
}

function DialogHeader({ children, onClose }: DialogHeaderProps) {
  return (
    <div class="flex items-center justify-between p-6 border-b-2 border-gray-300">
      <h3 class="text-lg font-semibold text-gray-800">{children}</h3>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          class="p-2 text-gray-600 border border-gray-300 rounded-lg bg-white/40 backdrop-blur-sm hover:bg-white/60 hover:border-gray-400 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            role="img"
            aria-label="Close dialog"
          >
            <title>Close</title>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}

function DialogBody({ children }: DialogBodyProps) {
  return <div class="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
}

function DialogFooter({ children }: DialogFooterProps) {
  return <div class="flex justify-end space-x-3 p-6 border-t-2 border-gray-300">{children}</div>
}

function Dialog({ isOpen, onClose, title, children, size = 'md' }: DialogProps) {
  // Keep the dialog mounted for close animation
  const [shouldRender, setShouldRender] = useState(isOpen)

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true)
      return
    }
    const timeout = setTimeout(() => setShouldRender(false), 300)
    return () => clearTimeout(timeout)
  }, [isOpen])
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[95vw] max-h-[95vh]',
  }

  if (!shouldRender) return null

  return (
    <div
      class={clsx(
        'fixed inset-0 z-50 overflow-y-auto',
        // Overlay with visible frame border and added transparency
        'bg-black/40 backdrop-blur-sm transition-all duration-300 ease-out border-2 border-white/20',
        isOpen ? 'opacity-100' : 'opacity-0',
      )}
      role="presentation"
    >
      <button
        type="button"
        aria-label="Close dialog"
        class="absolute inset-0 w-full h-full cursor-default"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') onClose()
        }}
      />
      <div class="relative flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 z-10">
        <div
          class={clsx(
            // Dialog card with added transparency and refined border
            'relative w-full bg-white/60 backdrop-blur-xl border-2 border-white/50 rounded-2xl shadow-2xl',
            'transition-all duration-300 ease-out transform will-change-transform will-change-opacity',
            'my-8 overflow-hidden text-left align-middle sm:my-8',
            isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
            sizeClasses[size],
          )}
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {title && <DialogHeader onClose={onClose}>{title}</DialogHeader>}
          {children}
        </div>
      </div>
    </div>
  )
}

function DialogConfirm({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
}: DialogConfirmProps) {
  if (!isOpen) return null

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <DialogBody>
        <div class="p-4 bg-gray-50 border-2 border-gray-300 rounded-lg">
          <p class="text-gray-700 leading-relaxed">{message}</p>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm}>
          {confirmText}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

export default Dialog
export { DialogHeader, DialogBody, DialogFooter, DialogConfirm }
