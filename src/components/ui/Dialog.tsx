import { JSX } from "preact";
import Button from "./Button";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: any;
  size?: "sm" | "md" | "lg" | "xl";
}

interface DialogHeaderProps {
  children: any;
  onClose?: () => void;
}

interface DialogBodyProps {
  children: any;
}

interface DialogFooterProps {
  children: any;
}

interface DialogConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
}

function DialogHeader({ children, onClose }: DialogHeaderProps) {
  return (
    <div class="flex items-center justify-between p-6 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-gray-900">
        {children}
      </h3>
      {onClose && (
        <button
          onClick={onClose}
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span class="text-xl">✕</span>
        </button>
      )}
    </div>
  );
}

function DialogBody({ children }: DialogBodyProps) {
  return (
    <div class="p-6">
      {children}
    </div>
  );
}

function DialogFooter({ children }: DialogFooterProps) {
  return (
    <div class="flex justify-end space-x-2 p-6 border-t border-gray-200">
      {children}
    </div>
  );
}

function Dialog({ isOpen, onClose, title, children, size = "md" }: DialogProps) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl"
  };

  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class={`bg-white rounded-lg w-full ${sizeClasses[size]} mx-4`}>
        {title && (
          <DialogHeader onClose={onClose}>
            {title}
          </DialogHeader>
        )}
        {children}
      </div>
    </div>
  );
}

function DialogConfirm({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  variant = "primary"
}: DialogConfirmProps) {
  if (!isOpen) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <DialogBody>
        <p class="text-gray-600">
          {message}
        </p>
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
  );
}

export default Dialog;
export { DialogHeader, DialogBody, DialogFooter, DialogConfirm };