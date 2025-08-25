import { JSX } from "preact";

interface HeadingProps {
  children: any;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?: "primary" | "secondary" | "muted" | "success" | "warning" | "danger";
  align?: "left" | "center" | "right";
  class?: string;
}

export default function Heading({
  children,
  level = 1,
  size,
  weight,
  color = "primary",
  align = "left",
  class: className = "",
  ...props
}: HeadingProps & JSX.HTMLAttributes<HTMLHeadingElement>) {
  
  // Default sizes based on heading level
  const defaultSizes = {
    1: "3xl",
    2: "2xl",
    3: "xl",
    4: "lg",
    5: "md",
    6: "sm",
  };
  
  const actualSize = size || defaultSizes[level];
  
  const sizes = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
    "2xl": "text-2xl",
    "3xl": "text-3xl",
    "4xl": "text-4xl",
  };

  const weights = {
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  };

  const colors = {
    primary: "text-gray-900",
    secondary: "text-gray-700",
    muted: "text-gray-500",
    success: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600",
  };

  const alignments = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  // Default weight based on heading level
  const defaultWeight = level <= 2 ? "bold" : level <= 4 ? "semibold" : "medium";
  const actualWeight = weight || defaultWeight;

  const classes = `${sizes[actualSize as keyof typeof sizes]} ${weights[actualWeight]} ${colors[color]} ${alignments[align]} ${className}`;

  const tagProps = props as any;

  if (level === 1) {
    return <h1 class={classes} {...tagProps}>{children}</h1>;
  } else if (level === 2) {
    return <h2 class={classes} {...tagProps}>{children}</h2>;
  } else if (level === 3) {
    return <h3 class={classes} {...tagProps}>{children}</h3>;
  } else if (level === 4) {
    return <h4 class={classes} {...tagProps}>{children}</h4>;
  } else if (level === 5) {
    return <h5 class={classes} {...tagProps}>{children}</h5>;
  } else {
    return <h6 class={classes} {...tagProps}>{children}</h6>;
  }
}