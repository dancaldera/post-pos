import { JSX } from "preact";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helperText?: string;
  multiple?: boolean;
  options: SelectOption[];
  onChange?: (e: Event) => void;
  onFocus?: (e: Event) => void;
  onBlur?: (e: Event) => void;
  class?: string;
  id?: string;
}

function clsx(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default function Select({
  label,
  placeholder,
  value,
  disabled = false,
  required = false,
  error,
  helperText,
  multiple = false,
  options = [],
  onChange,
  onFocus,
  onBlur,
  class: className = "",
  id,
  ...props
}: SelectProps & Omit<JSX.HTMLAttributes<HTMLSelectElement>, 'size'>) {
  const selectId = id || `select-${Math.random().toString(36).substring(2, 11)}`;

  return (
    <div class="w-full">
      {label && (
        <label 
          for={selectId}
          class="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span class="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <span
        data-slot="control"
        class={clsx(
          className,
          // Basic layout
          'group relative block w-full',
          // Background color + shadow applied to inset pseudo element
          'before:absolute before:inset-px before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-white before:shadow-sm',
          // Focus ring
          'after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset focus-within:after:ring-2 focus-within:after:ring-blue-500',
          // Disabled state
          disabled && 'opacity-50 before:bg-gray-950/5 before:shadow-none',
          // Error state
          error && 'focus-within:after:ring-red-500'
        )}
      >
        <select
          id={selectId}
          value={value}
          disabled={disabled}
          required={required}
          multiple={multiple}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          class={clsx(
            // Basic layout
            'relative block w-full appearance-none rounded-lg py-2.5 sm:py-1.5',
            // Horizontal padding
            multiple
              ? 'px-3.5 sm:px-3'
              : 'pr-10 pl-3.5 sm:pr-9 sm:pl-3',
            // Typography
            'text-base text-gray-950 placeholder:text-gray-500 sm:text-sm',
            // Border
            'border border-gray-950/10 hover:border-gray-950/20',
            error 
              ? 'border-red-500 hover:border-red-500'
              : 'border-gray-950/10 hover:border-gray-950/20',
            // Background color
            'bg-transparent',
            // Hide default focus styles
            'focus:outline-none',
            // Disabled state
            disabled && 'border-gray-950/20 opacity-100'
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {!multiple && (
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <svg
              class={clsx(
                'w-5 h-5 stroke-gray-500 sm:w-4 sm:h-4',
                disabled && 'stroke-gray-600'
              )}
              viewBox="0 0 16 16"
              aria-hidden="true"
              fill="none"
            >
              <path d="M5.75 10.75L8 13L10.25 10.75" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10.25 5.25L8 3L5.75 5.25" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </span>
      
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