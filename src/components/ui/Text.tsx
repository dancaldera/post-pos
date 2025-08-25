import { JSX } from "preact";

interface TextProps {
  children: any;
  variant?: "body" | "caption" | "small" | "lead";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?: "primary" | "secondary" | "muted" | "success" | "warning" | "danger" | "white";
  align?: "left" | "center" | "right" | "justify";
  decoration?: "none" | "underline" | "line-through";
  transform?: "none" | "uppercase" | "lowercase" | "capitalize";
  truncate?: boolean;
  as?: "p" | "span" | "div" | "small" | "strong" | "em";
  class?: string;
}

export default function Text({
  children,
  variant = "body",
  size,
  weight = "normal",
  color = "primary",
  align = "left",
  decoration = "none",
  transform = "none",
  truncate = false,
  as = "p",
  class: className = "",
  ...props
}: TextProps & JSX.HTMLAttributes<HTMLElement>) {  
  // Variant-based defaults
  const variantStyles = {
    body: { size: "md" as const, weight: "normal" as const },
    caption: { size: "sm" as const, weight: "normal" as const, color: "muted" as const },
    small: { size: "xs" as const, weight: "normal" as const },
    lead: { size: "lg" as const, weight: "normal" as const },
  };
  
  const variantStyle = variantStyles[variant];
  const actualSize = size || variantStyle.size;
  const defaultColor = "color" in variantStyle ? variantStyle.color : "primary";
  const actualColor = color === "primary" ? defaultColor : color;
  
  const sizes = {
    xs: "text-xs",
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
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
    white: "text-white",
  };

  const alignments = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
    justify: "text-justify",
  };

  const decorations = {
    none: "",
    underline: "underline",
    "line-through": "line-through",
  };

  const transforms = {
    none: "",
    uppercase: "uppercase",
    lowercase: "lowercase",
    capitalize: "capitalize",
  };

  const truncateClass = truncate ? "truncate" : "";

  const classes = `${sizes[actualSize]} ${weights[weight]} ${colors[actualColor as keyof typeof colors]} ${alignments[align]} ${decorations[decoration]} ${transforms[transform]} ${truncateClass} ${className}`.trim();

  const tagProps = props as any;

  if (as === "p") {
    return <p class={classes} {...tagProps}>{children}</p>;
  } else if (as === "span") {
    return <span class={classes} {...tagProps}>{children}</span>;
  } else if (as === "div") {
    return <div class={classes} {...tagProps}>{children}</div>;
  } else if (as === "small") {
    return <small class={classes} {...tagProps}>{children}</small>;
  } else if (as === "strong") {
    return <strong class={classes} {...tagProps}>{children}</strong>;
  } else if (as === "em") {
    return <em class={classes} {...tagProps}>{children}</em>;
  } else {
    return <p class={classes} {...tagProps}>{children}</p>;
  }
}