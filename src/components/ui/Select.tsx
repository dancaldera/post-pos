import type { JSX } from "preact";

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

  // Unify with Input styles: glass border on the element, accessible focus-visible ring
  const baseClasses = clsx(
    'relative w-full appearance-none rounded-xl transition-colors duration-150',
    'backdrop-blur-md bg-white/10 border border-white/20',
    'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:ring-offset-white/10',
    'shadow-lg',
    disabled && 'opacity-40 cursor-not-allowed'
  );

  const stateClasses = error
    ? clsx(
        'border-red-400/50',
        'bg-red-50/10',
        'focus-visible:ring-red-500/60'
      )
    : clsx(
        'border-white/20',
        'focus-visible:ring-blue-500/60'
      );

  const paddingClasses = multiple
    ? 'px-4 py-2.5 text-sm'
    : 'pl-4 pr-10 py-2.5 text-sm';

  return (
    <div class="w-full">
      {label && (
        <label
          for={selectId}
          class="block text-sm font-medium text-gray-700 mb-2 drop-shadow-sm"
        >
          {label}
          {required && <span class="text-red-500 ml-1 drop-shadow-sm">*</span>}
        </label>
      )}

      <div class="relative">
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
            baseClasses,
            paddingClasses,
            // Match Input: no explicit text color/placeholder styling
            stateClasses,
            className
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
          </span>
        )}

        {/* Glass highlight overlay */}
        <div
          class={clsx(
            'absolute inset-0 rounded-xl pointer-events-none',
            'bg-gradient-to-b from-white/10 via-transparent to-transparent',
            'opacity-60'
          )}
        />
      </div>

      {error && (
        <div class="mt-2 p-2 rounded-lg bg-red-500/10 backdrop-blur-sm border border-red-400/20">
          <p class="text-sm text-red-600 flex items-center drop-shadow-sm">
            <span class="mr-2">⚠️</span>
            {error}
          </p>
        </div>
      )}

      {helperText && !error && (
        <p class="mt-1 text-sm text-gray-600 drop-shadow-sm">{helperText}</p>
      )}
    </div>
  );
}
