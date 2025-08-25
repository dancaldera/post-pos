import { JSX } from "preact";

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "search";
  value?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  size?: "sm" | "md" | "lg";
  onInput?: (e: Event) => void;
  onChange?: (e: Event) => void;
  onFocus?: (e: Event) => void;
  onBlur?: (e: Event) => void;
  class?: string;
  id?: string;
}

export default function Input({
  label,
  placeholder,
  type = "text",
  value,
  disabled = false,
  required = false,
  error,
  helperText,
  size = "md",
  onInput,
  onChange,
  onFocus,
  onBlur,
  class: className = "",
  id,
  ...props
}: InputProps & Omit<JSX.HTMLAttributes<HTMLInputElement>, 'size'>) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseClasses = "w-full rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  const stateClasses = error
    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500";

  const classes = `${baseClasses} ${sizes[size]} ${stateClasses} ${className}`;

  return (
    <div class="w-full">
      {label && (
        <label 
          for={inputId}
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span class="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        required={required}
        onInput={onInput}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        class={classes}
        {...props}
      />
      
      {error && (
        <p class="mt-1 text-sm text-red-600 flex items-center">
          <span class="mr-1">⚠️</span>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p class="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}