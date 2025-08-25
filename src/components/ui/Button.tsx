import { JSX } from "preact";

interface ButtonProps {
  children: any;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  class?: string;
}

function clsx(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  onClick,
  class: className = "",
  ...props
}: ButtonProps & JSX.HTMLAttributes<HTMLButtonElement>) {
  const baseClasses = clsx(
    // Base layout and interactions
    "relative inline-flex items-center justify-center rounded-xl font-medium",
    // Keep transitions subtle to avoid bounce; animate glow
    "transition-colors transition-shadow duration-150 ease-out",
    // Glass effect base
    "backdrop-blur-md border border-white/20",
    // Focus-visible and disabled states (clear, accessible focus)
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white/10",
    disabled 
      ? "opacity-40 cursor-not-allowed" 
      : "",
    // Shadow and glass depth (no hover jump)
    "shadow-md"
  );
  
  const variants = {
    primary: clsx(
      "bg-gradient-to-r from-blue-500/80 to-indigo-600/80 text-white",
      // Simple, non-bouncy hover + glow
      "hover:opacity-95 hover:shadow-lg hover:ring-2 hover:ring-blue-400/50",
      "focus-visible:ring-blue-500/60"
    ),
    secondary: clsx(
      "bg-gradient-to-r from-gray-500/70 to-gray-600/70 text-white",
      "hover:opacity-95 hover:shadow-lg hover:ring-2 hover:ring-gray-400/50",
      "focus-visible:ring-gray-500/60"
    ),
    outline: clsx(
      "bg-white/10 text-gray-800 border-gray-300/50",
      // Keep hover very light
      "hover:bg-white/20 hover:shadow-lg hover:ring-2 hover:ring-blue-300/50",
      "focus-visible:ring-blue-500/60"
    ),
    ghost: clsx(
      "bg-transparent text-gray-700 border-transparent",
      "hover:bg-black/5 hover:text-gray-900 hover:shadow-lg hover:ring-2 hover:ring-gray-300/50",
      "focus-visible:ring-gray-500/60"
    ),
    danger: clsx(
      "bg-gradient-to-r from-red-500/80 to-red-600/80 text-white",
      "hover:opacity-95 hover:shadow-lg hover:ring-2 hover:ring-red-400/50",
      "focus-visible:ring-red-500/60"
    ),
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3 text-base",
  };

  const classes = clsx(baseClasses, variants[variant], sizes[size], className);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      class={classes}
      {...props}
    >
      {children}
    </button>
  );
}
