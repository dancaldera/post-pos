import { useState } from "preact/hooks";
import { JSX } from "preact";

interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  onClick?: () => void;
  active?: boolean;
  badge?: string | number;
}

interface SidebarProps {
  children?: any;
  width?: "sm" | "md" | "lg";
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  backgroundColor?: "dark" | "light" | "primary";
  class?: string;
}

export default function Sidebar({
  children,
  width = "md",
  collapsible = false,
  defaultCollapsed = false,
  backgroundColor = "dark",
  class: className = "",
  ...props
}: SidebarProps & JSX.HTMLAttributes<HTMLDivElement>) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const widths = {
    sm: isCollapsed ? "w-16" : "w-48",
    md: isCollapsed ? "w-16" : "w-64",
    lg: isCollapsed ? "w-16" : "w-80",
  };

  const backgrounds = {
    dark: "bg-gray-900 text-white",
    light: "bg-white text-gray-900 border-r border-gray-200",
    primary: "bg-blue-900 text-white",
  };

  const classes = `${widths[width]} ${backgrounds[backgroundColor]} transition-all duration-300 ${className}`.trim();

  return (
    <div class={classes} {...props}>
      {collapsible && (
        <div class="p-4">
          <div class="flex items-center justify-between">
            {!isCollapsed && (
              <h1 class="text-xl font-bold text-blue-400">Post POS</h1>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              class="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {isCollapsed ? "→" : "←"}
            </button>
          </div>
        </div>
      )}
      
      <div class="flex-1">
        {typeof children === "function" ? children({ isCollapsed }) : children}
      </div>
    </div>
  );
}

// Sidebar Header Component
interface SidebarHeaderProps {
  children?: any;
  logo?: string;
  title?: string;
  isCollapsed?: boolean;
  class?: string;
}

export function SidebarHeader({
  children,
  logo,
  title,
  isCollapsed = false,
  class: className = "",
  ...props
}: SidebarHeaderProps & JSX.HTMLAttributes<HTMLDivElement>) {
  if (children) {
    return (
      <div class={`p-4 ${className}`.trim()} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div class={`p-4 ${className}`.trim()} {...props}>
      <div class="flex items-center justify-between">
        {!isCollapsed && (
          <div class="flex items-center space-x-3">
            {logo && <img src={logo} alt="Logo" class="w-8 h-8" />}
            {title && <h1 class="text-xl font-bold text-blue-400">{title}</h1>}
          </div>
        )}
        {isCollapsed && logo && (
          <img src={logo} alt="Logo" class="w-8 h-8 mx-auto" />
        )}
      </div>
    </div>
  );
}

// Sidebar Navigation Component
interface SidebarNavProps {
  children: any;
  spacing?: "sm" | "md" | "lg";
  class?: string;
}

export function SidebarNav({
  children,
  spacing = "md",
  class: className = "",
  ...props
}: SidebarNavProps & JSX.HTMLAttributes<HTMLElement>) {
  const spacings = {
    sm: "space-y-1",
    md: "space-y-2",
    lg: "space-y-3",
  };

  const classes = `mt-8 ${className}`.trim();

  return (
    <nav class={classes} {...props}>
      <ul class={`${spacings[spacing]} px-3`}>
        {children}
      </ul>
    </nav>
  );
}

// Sidebar Item Component
interface SidebarItemProps {
  item: SidebarItem;
  isCollapsed?: boolean;
  variant?: "default" | "primary" | "success" | "warning" | "danger";
  class?: string;
}

export function SidebarItem({
  item,
  isCollapsed = false,
  variant = "default",
  class: className = "",
  ...props
}: SidebarItemProps & JSX.HTMLAttributes<HTMLLIElement>) {
  const variants = {
    default: item.active
      ? "bg-blue-600 text-white"
      : "text-gray-300 hover:bg-gray-800 hover:text-white",
    primary: item.active
      ? "bg-blue-600 text-white"
      : "text-blue-300 hover:bg-blue-800 hover:text-white",
    success: item.active
      ? "bg-green-600 text-white"
      : "text-green-300 hover:bg-green-800 hover:text-white",
    warning: item.active
      ? "bg-yellow-600 text-white"
      : "text-yellow-300 hover:bg-yellow-800 hover:text-white",
    danger: item.active
      ? "bg-red-600 text-white"
      : "text-red-300 hover:bg-red-800 hover:text-white",
  };

  const classes = `w-full flex items-center px-3 py-2.5 rounded-lg transition-colors ${
    isCollapsed ? "justify-center" : "space-x-3"
  } ${variants[variant]} ${className}`.trim();

  return (
    <li {...props}>
      <button onClick={item.onClick} class={classes}>
        <span class="text-xl">{item.icon}</span>
        {!isCollapsed && (
          <>
            <span class="font-medium flex-1 text-left">{item.label}</span>
            {item.badge && (
              <span class="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {item.badge}
              </span>
            )}
          </>
        )}
      </button>
    </li>
  );
}

// Sidebar Footer Component
interface SidebarFooterProps {
  children: any;
  isCollapsed?: boolean;
  class?: string;
}

export function SidebarFooter({
  children,
  isCollapsed = false,
  class: className = "",
  ...props
}: SidebarFooterProps & JSX.HTMLAttributes<HTMLDivElement>) {
  const classes = `mt-auto p-4 ${className}`.trim();

  return (
    <div class={classes} {...props}>
      {typeof children === "function" ? children({ isCollapsed }) : children}
    </div>
  );
}

// Sidebar Group Component (for organizing nav items)
interface SidebarGroupProps {
  title?: string;
  children: any;
  isCollapsed?: boolean;
  class?: string;
}

export function SidebarGroup({
  title,
  children,
  isCollapsed = false,
  class: className = "",
  ...props
}: SidebarGroupProps & JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div class={className} {...props}>
      {title && !isCollapsed && (
        <div class="px-3 mb-2">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {title}
          </h3>
        </div>
      )}
      <div class={isCollapsed ? "space-y-2" : ""}>
        {typeof children === "function" ? children({ isCollapsed }) : children}
      </div>
    </div>
  );
}