import { JSX } from "preact";

interface ContainerProps {
  children: any;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
  center?: boolean;
  class?: string;
}

export default function Container({
  children,
  size = "lg",
  padding = "md",
  center = true,
  class: className = "",
  ...props
}: ContainerProps & JSX.HTMLAttributes<HTMLDivElement>) {
  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-full",
  };

  const paddings = {
    none: "",
    sm: "px-4 py-2",
    md: "px-6 py-4",
    lg: "px-8 py-6",
  };

  const centerClass = center ? "mx-auto" : "";

  const classes = `${sizes[size]} ${paddings[padding]} ${centerClass} ${className}`.trim();

  return (
    <div class={classes} {...props}>
      {children}
    </div>
  );
}