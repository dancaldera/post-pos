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
          // Basic layout with glass effect
          'group relative block w-full',
          // Glass morphism container
          'before:absolute before:inset-0 before:rounded-xl before:backdrop-blur-md before:bg-white/10 before:border before:border-white/20 before:shadow-lg',
          // Focus ring with glass effect
          'after:pointer-events-none after:absolute after:inset-0 after:rounded-xl after:ring-transparent after:ring-inset focus-within:after:ring-2',
          // Hover state
          'hover:before:bg-white/15',
          // Disabled state
          disabled && 'opacity-40 before:bg-gray-200/5 before:shadow-none',
          // Error and focus states
          error 
            ? 'focus-within:after:ring-red-500/30 before:border-red-400/30'
            : 'focus-within:after:ring-blue-500/30 hover:before:border-white/30'
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
            // Basic layout with glass effect
            'relative block w-full appearance-none rounded-xl transition-all duration-200',
            'py-2.5 sm:py-2 bg-transparent border-none',
            // Horizontal padding
            multiple
              ? 'px-4 sm:px-3.5'
              : 'pr-10 pl-4 sm:pr-9 sm:pl-3.5',
            // Typography with glass styling
            'text-base text-gray-800 placeholder:text-gray-500 sm:text-sm',
            'backdrop-blur-sm',
            // Focus styles
            'focus:outline-none focus:ring-0',
            // Disabled state
            disabled && 'cursor-not-allowed'
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
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 z-10">
            <div class="p-1 rounded-md bg-white/20 backdrop-blur-sm">
              <svg
                class={clsx(
                  'w-4 h-4 stroke-gray-600 sm:w-3.5 sm:h-3.5 drop-shadow-sm',
                  disabled && 'stroke-gray-400'
                )}
                viewBox="0 0 16 16"
                aria-hidden="true"
                fill="none"
              >
                <path d="M5.75 10.75L8 13L10.25 10.75" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10.25 5.25L8 3L5.75 5.25" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </span>
        )}
        
        {/* Glass highlight overlay */}
        <div class={clsx(
          "absolute inset-0 rounded-xl pointer-events-none z-0",
          "bg-gradient-to-b from-white/10 via-transparent to-transparent",
          "opacity-60"
        )} />
      </span>
      
      {error && (
        <div class="mt-2 p-2 rounded-lg bg-red-500/10 backdrop-blur-sm border border-red-400/20">
          <p class="text-sm text-red-600 flex items-center drop-shadow-sm">
            <span class="mr-2">⚠️</span>
            {error}
          </p>
        </div>
      )}
      
      {helperText && !error && (
        <p class="mt-1 text-sm text-gray-600 drop-shadow-sm">
          {helperText}
        </p>
      )}
    </div>
  );
}