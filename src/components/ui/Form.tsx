import { JSX } from "preact";

interface FormProps {
  children: any;
  onSubmit?: (e: Event) => void;
  spacing?: "sm" | "md" | "lg";
  class?: string;
}

export default function Form({
  children,
  onSubmit,
  spacing = "md",
  class: className = "",
  ...props
}: FormProps & JSX.HTMLAttributes<HTMLFormElement>) {
  const spacings = {
    sm: "space-y-3",
    md: "space-y-4",
    lg: "space-y-6",
  };

  const classes = `${spacings[spacing]} ${className}`.trim();

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <form class={classes} onSubmit={handleSubmit} {...props}>
      {children}
    </form>
  );
}

// Form Field Component
interface FormFieldProps {
  children: any;
  class?: string;
}

export function FormField({
  children,
  class: className = "",
  ...props
}: FormFieldProps & JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div class={className} {...props}>
      {children}
    </div>
  );
}

// Form Group Component (for grouping related fields)
interface FormGroupProps {
  children: any;
  title?: string;
  description?: string;
  spacing?: "sm" | "md" | "lg";
  class?: string;
}

export function FormGroup({
  children,
  title,
  description,
  spacing = "md",
  class: className = "",
  ...props
}: FormGroupProps & JSX.HTMLAttributes<HTMLDivElement>) {
  const spacings = {
    sm: "space-y-2",
    md: "space-y-3",
    lg: "space-y-4",
  };

  const classes = `${spacings[spacing]} ${className}`.trim();

  return (
    <div class={classes} {...props}>
      {title && (
        <div class="mb-3">
          <h3 class="text-lg font-medium text-gray-900">{title}</h3>
          {description && (
            <p class="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// Form Actions Component (for buttons at the bottom)
interface FormActionsProps {
  children: any;
  align?: "left" | "right" | "center" | "between";
  spacing?: "sm" | "md" | "lg";
  class?: string;
}

export function FormActions({
  children,
  align = "right",
  spacing = "md",
  class: className = "",
  ...props
}: FormActionsProps & JSX.HTMLAttributes<HTMLDivElement>) {
  const alignments = {
    left: "justify-start",
    right: "justify-end",
    center: "justify-center",
    between: "justify-between",
  };

  const spacings = {
    sm: "gap-2",
    md: "gap-3",
    lg: "gap-4",
  };

  const classes = `flex items-center ${alignments[align]} ${spacings[spacing]} ${className}`.trim();

  return (
    <div class={classes} {...props}>
      {children}
    </div>
  );
}