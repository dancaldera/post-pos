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

function clsx(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

function DialogHeader({ children, onClose }: DialogHeaderProps) {
  return (
    <div class="flex items-center justify-between p-6 border-b border-gray-200">
      <h3 class="text-lg font-semibold text-gray-800">
        {children}
      </h3>
      {onClose && (
        <button
          onClick={onClose}
          class="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
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
    <div class="flex justify-end space-x-3 p-6 border-t border-gray-200">
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
    <div 
      class={clsx(
        "fixed inset-0 flex items-center justify-center z-50 p-4",
        "bg-black/50 backdrop-blur-sm transition-all duration-300 ease-out",
        isOpen ? "opacity-100" : "opacity-0"
      )}
      onClick={onClose}
    >
      <div 
        class={clsx(
          "w-full bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl",
          "transition-all duration-300 ease-out transform",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0",
          sizeClasses[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
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
        <div class="p-4 bg-gray-50 border border-gray-200">
          <p class="text-gray-700 leading-relaxed">
            {message}
          </p>
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
  );
}

export default Dialog;
export { DialogHeader, DialogBody, DialogFooter, DialogConfirm };