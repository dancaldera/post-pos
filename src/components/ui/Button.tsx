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
    "transition-all duration-200 ease-out",
    // Glass effect base
    "backdrop-blur-md border border-white/20",
    // Focus and disabled states
    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent",
    disabled 
      ? "opacity-40 cursor-not-allowed" 
      : "",
    // Shadow and glass depth
    "shadow-lg hover:shadow-xl"
  );
  
  const variants = {
    primary: clsx(
      "bg-gradient-to-r from-blue-500/80 to-indigo-600/80 text-white",
      "hover:bg-blue-600/20 hover:border-blue-400/60 hover:from-blue-600/90 hover:to-indigo-700/90",
      "focus:ring-blue-500/50"
    ),
    secondary: clsx(
      "bg-gradient-to-r from-gray-500/70 to-gray-600/70 text-white",
      "hover:bg-gray-600/20 hover:border-gray-400/60 hover:from-gray-600/80 hover:to-gray-700/80",
      "focus:ring-gray-500/50"
    ),
    outline: clsx(
      "bg-white/10 text-gray-800 border-gray-300/50",
      "hover:bg-white/20 hover:border-gray-400/60",
      "focus:ring-blue-500/50"
    ),
    ghost: clsx(
      "bg-transparent text-gray-700 border-transparent",
      "hover:bg-white/20 hover:border-gray-300/40 hover:text-gray-900",
      "focus:ring-gray-500/50"
    ),
    danger: clsx(
      "bg-gradient-to-r from-red-500/80 to-red-600/80 text-white",
      "hover:bg-red-600/20 hover:border-red-400/60 hover:from-red-600/90 hover:to-red-700/90",
      "focus:ring-red-500/50"
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