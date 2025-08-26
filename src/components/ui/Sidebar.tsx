import type { ComponentChildren, JSX } from 'preact'
import { useState } from 'preact/hooks'

interface SidebarItem {
  id: string
  label: string
  icon: string
  onClick?: () => void
  active?: boolean
  badge?: string | number
}

interface SidebarProps {
  children?: ComponentChildren | ((args: { isCollapsed: boolean }) => ComponentChildren)
  width?: 'sm' | 'md' | 'lg'
  collapsible?: boolean
  defaultCollapsed?: boolean
  backgroundColor?: 'dark' | 'light' | 'primary'
  class?: string
}

function clsx(...classes: (string | undefined | boolean)[]): string {
  return classes.filter(Boolean).join(' ')
}

export default function Sidebar({
  children,
  width = 'md',
  collapsible = false,
  defaultCollapsed = false,
  backgroundColor = 'dark',
  class: className = '',
  ...props
}: SidebarProps & JSX.HTMLAttributes<HTMLDivElement>) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  const widths = {
    sm: isCollapsed ? 'w-16' : 'w-48',
    md: isCollapsed ? 'w-16' : 'w-64',
    lg: isCollapsed ? 'w-16' : 'w-80',
  }

  const backgrounds = {
    dark: clsx('backdrop-blur-xl bg-gray-900/80 text-white', 'border-r border-white/10 shadow-2xl'),
    light: clsx('backdrop-blur-xl bg-white/80 text-gray-900', 'border-r border-gray-200/50 shadow-2xl'),
    primary: clsx('backdrop-blur-xl bg-blue-900/80 text-white', 'border-r border-blue-400/20 shadow-2xl'),
  }

  const classes = clsx(widths[width], backgrounds[backgroundColor], 'relative transition-all duration-300', className)

  return (
    <div class={classes} {...props}>
      {/* Glass morphism overlay */}
      <div class="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/10 pointer-events-none" />
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

      {/* Content */}
      <div class="relative z-10 h-full flex flex-col">
        {collapsible && (
          <div class="p-4">
            <div class="flex items-center justify-between">
              {!isCollapsed && <h1 class="text-xl font-bold text-blue-300 drop-shadow-lg">Post POS</h1>}
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                class={clsx(
                  'p-2.5 rounded-xl transition-colors duration-200 ease-out group relative',
                  'bg-white/10 hover:bg-white/20 backdrop-blur-sm',
                  'border border-white/20 hover:border-white/40',
                  'text-white/80 hover:text-white',
                  'focus:outline-none focus:ring-2 focus:ring-blue-400/40',
                )}
              >
                <svg
                  class={clsx(
                    'w-4 h-4 transition-colors duration-200 ease-out relative z-10',
                    'drop-shadow-sm',
                    isCollapsed && 'rotate-180',
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  role="img"
                  aria-label="Toggle sidebar"
                >
                  <title>Toggle sidebar</title>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div class="flex-1">{typeof children === 'function' ? children({ isCollapsed }) : children}</div>
      </div>
    </div>
  )
}

// Sidebar Header Component
interface SidebarHeaderProps {
  children?: ComponentChildren
  logo?: string
  title?: string
  isCollapsed?: boolean
  class?: string
}

export function SidebarHeader({
  children,
  logo,
  title,
  isCollapsed = false,
  class: className = '',
  ...props
}: SidebarHeaderProps & JSX.HTMLAttributes<HTMLDivElement>) {
  if (children) {
    return (
      <div class={clsx('p-4 backdrop-blur-sm', className)} {...props}>
        <div class="bg-white/10 rounded-xl p-3 border border-white/20">{children}</div>
      </div>
    )
  }

  return (
    <div class={clsx('p-4 backdrop-blur-sm', className)} {...props}>
      <div class="bg-white/10 rounded-xl p-3 border border-white/20">
        <div class="flex items-center justify-between">
          {!isCollapsed && (
            <div class="flex items-center space-x-3">
              {logo && <img src={logo} alt="Logo" class="w-8 h-8 drop-shadow-lg" />}
              {title && <h1 class="text-xl font-bold text-blue-300 drop-shadow-lg">{title}</h1>}
            </div>
          )}
          {isCollapsed && logo && <img src={logo} alt="Logo" class="w-8 h-8 mx-auto drop-shadow-lg" />}
        </div>
      </div>
    </div>
  )
}

// Sidebar Navigation Component
interface SidebarNavProps {
  children: ComponentChildren
  spacing?: 'sm' | 'md' | 'lg'
  class?: string
}

export function SidebarNav({
  children,
  spacing = 'md',
  class: className = '',
  ...props
}: SidebarNavProps & JSX.HTMLAttributes<HTMLElement>) {
  const spacings = {
    sm: 'space-y-1',
    md: 'space-y-2',
    lg: 'space-y-3',
  }

  const classes = `mt-8 ${className}`.trim()

  return (
    <nav class={classes} {...props}>
      <ul class={`${spacings[spacing]} px-3`}>{children}</ul>
    </nav>
  )
}

// Sidebar Item Component
interface SidebarItemProps {
  item: SidebarItem
  isCollapsed?: boolean
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  class?: string
}

export function SidebarItem({
  item,
  isCollapsed = false,
  variant = 'default',
  class: className = '',
  ...props
}: SidebarItemProps & JSX.HTMLAttributes<HTMLLIElement>) {
  const variants = {
    default: item.active
      ? clsx(
          'bg-gradient-to-r from-blue-500/80 to-blue-600/80 text-white',
          'backdrop-blur-sm border border-blue-400/30 shadow-lg',
        )
      : clsx(
          'text-gray-300 hover:text-white',
          'hover:bg-white/15 hover:border-white/25',
          'border border-transparent',
          'transition-colors duration-200 ease-out',
        ),
    primary: item.active
      ? clsx(
          'bg-gradient-to-r from-blue-500/80 to-blue-600/80 text-white',
          'backdrop-blur-sm border border-blue-400/30 shadow-lg',
        )
      : clsx(
          'text-blue-300 hover:text-white',
          'hover:bg-blue-500/20 hover:border-blue-400/25',
          'border border-transparent',
          'transition-colors duration-200 ease-out',
        ),
    success: item.active
      ? clsx(
          'bg-gradient-to-r from-green-500/80 to-green-600/80 text-white',
          'backdrop-blur-sm border border-green-400/30 shadow-lg',
        )
      : clsx(
          'text-green-300 hover:text-white',
          'hover:bg-green-500/20 hover:border-green-400/25',
          'border border-transparent',
          'transition-colors duration-200 ease-out',
        ),
    warning: item.active
      ? clsx(
          'bg-gradient-to-r from-yellow-500/80 to-yellow-600/80 text-white',
          'backdrop-blur-sm border border-yellow-400/30 shadow-lg',
        )
      : clsx(
          'text-yellow-300 hover:text-white',
          'hover:bg-yellow-500/20 hover:border-yellow-400/25',
          'border border-transparent',
          'transition-colors duration-200 ease-out',
        ),
    danger: item.active
      ? clsx(
          'bg-gradient-to-r from-red-500/80 to-red-600/80 text-white',
          'backdrop-blur-sm border border-red-400/30 shadow-lg',
        )
      : clsx(
          'text-red-300 hover:text-white',
          'hover:bg-red-500/20 hover:border-red-400/25',
          'border border-transparent',
          'transition-colors duration-200 ease-out',
        ),
  }

  const classes = clsx(
    'w-full flex items-center px-3 py-2.5 rounded-xl transition-colors duration-200 ease-out',
    'relative group overflow-hidden',
    isCollapsed ? 'justify-center' : 'space-x-3',
    variants[variant],
    className,
  )

  return (
    <li {...props}>
      <button type="button" onClick={item.onClick} class={classes}>
        {/* Glass highlight overlay for active state */}
        {item.active && (
          <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-60 pointer-events-none" />
        )}

        {/* Simplified: removed shimmer overlay */}

        <span class={clsx('relative text-xl drop-shadow-sm transition-colors duration-200', 'group-hover:opacity-90')}>
          {item.icon}
        </span>
        {!isCollapsed && (
          <>
            <span class="relative font-medium flex-1 text-left drop-shadow-sm">{item.label}</span>
            {item.badge && (
              <span
                class={clsx(
                  'relative bg-gradient-to-r from-red-500 to-red-600 text-white text-xs',
                  'rounded-full px-2 py-1 min-w-[20px] text-center drop-shadow-lg',
                  'border border-red-400/50 backdrop-blur-sm',
                  'transition-colors duration-200 group-hover:opacity-90',
                )}
              >
                {item.badge}
              </span>
            )}
          </>
        )}
      </button>
    </li>
  )
}

// Sidebar Footer Component
interface SidebarFooterProps {
  children: ComponentChildren | ((args: { isCollapsed: boolean }) => ComponentChildren)
  isCollapsed?: boolean
  class?: string
}

export function SidebarFooter({
  children,
  isCollapsed = false,
  class: className = '',
  ...props
}: SidebarFooterProps & JSX.HTMLAttributes<HTMLDivElement>) {
  const classes = clsx(
    'mt-auto p-4',
    'border-t border-white/10 backdrop-blur-sm',
    'bg-gradient-to-t from-black/10 to-transparent',
    className,
  )

  return (
    <div class={classes} {...props}>
      {typeof children === 'function' ? children({ isCollapsed }) : children}
    </div>
  )
}

// Sidebar Group Component (for organizing nav items)
interface SidebarGroupProps {
  title?: string
  children: ComponentChildren | ((args: { isCollapsed: boolean }) => ComponentChildren)
  isCollapsed?: boolean
  class?: string
}

export function SidebarGroup({
  title,
  children,
  isCollapsed = false,
  class: className = '',
  ...props
}: SidebarGroupProps & JSX.HTMLAttributes<HTMLDivElement>) {
  return (
    <div class={className} {...props}>
      {title && !isCollapsed && (
        <div class="px-3 mb-3">
          <div class={clsx('p-2 rounded-lg backdrop-blur-sm', 'border border-white/10')}>
            <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider drop-shadow-sm">{title}</h3>
          </div>
        </div>
      )}
      <div class={clsx('space-y-1', isCollapsed && 'space-y-2')}>
        {typeof children === 'function' ? children({ isCollapsed }) : children}
      </div>
    </div>
  )
}
