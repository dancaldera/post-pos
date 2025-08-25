# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Post POS is a modern Point of Sale (POS) application built as a cross-platform desktop application using Tauri framework. It combines a Rust backend with a Preact + TypeScript frontend, styled with Tailwind CSS.

## Technology Stack

- **Frontend**: Preact + TypeScript with Tailwind CSS
- **Backend**: Tauri v2 (Rust)
- **State Management**: Preact Signals
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Common Development Commands

### Development
- `pnpm tauri dev` - Start full development environment (frontend + backend)
- `pnpm dev` - Start Vite development server (frontend only, runs on port 1420)
- `pnpm preview` - Preview built application

### Build & Deploy
- `pnpm build` - Build frontend only
- `pnpm tauri build` - Build complete application for production
- `pnpm tauri bundle` - Generate platform-specific installers

### Tauri Commands
- `pnpm tauri info` - Show environment information
- `pnpm tauri android` - Android development commands
- `pnpm tauri ios` - iOS development commands

## Architecture Overview

### Frontend Structure
```
src/
├── components/
│   ├── Layout.tsx        # Main layout with sidebar navigation
│   └── ui/               # Reusable UI components (Button, Input, etc.)
├── pages/                # Application pages (Dashboard, Sales, Products, etc.)
├── hooks/                # Custom hooks (useAuth)
├── services/             # API services (auth, products)
├── stores/               # State management (authStore, authActions)
└── main.tsx              # Application entry point
```

### Backend Structure
```
src-tauri/
├── src/
│   ├── main.rs          # Application entry point
│   └── lib.rs           # Tauri commands and setup
├── capabilities/         # Security capabilities
└── tauri.conf.json      # Tauri configuration
```

## Key Architecture Patterns

### State Management
- **Preact Signals** for reactive state management
- **Store pattern** with separate store and action files
- **Singleton pattern** for services (AuthService, ProductService)

### Authentication & Authorization
- Role-based access control (admin, manager, user)
- Permission-based feature access
- Mock authentication with localStorage persistence
- Route protection based on authentication status

### Component Architecture
- Reusable UI components in `src/components/ui/`
- Page components in `src/pages/`
- Layout component handling navigation and role-based menu items

### Service Layer
- Singleton services for business logic
- Mock data with async operations
- CRUD operations for products and users

## Configuration Details

### Development Server
- Frontend runs on `http://localhost:1420`
- HMR enabled with WebSocket on `ws://localhost:1421`
- Tauri expects fixed port 1420, will fail if not available

### TypeScript Configuration
- Target: ES2020
- Strict mode enabled
- JSX support with Preact
- Module resolution: bundler

### Tauri Configuration
- Window size: 800x600 (resizable)
- Security: CSP disabled (for development)
- Bundle targets: all platforms

## Key Features & Current State

### Authentication System
- Three roles: admin, manager, user
- Role-based permissions and menu visibility
- Mock users with predefined credentials

### Product Management
- CRUD operations for products
- Categories and inventory tracking
- Form validation and error handling

### UI/UX
- Glass morphism design with Tailwind CSS
- Responsive design patterns
- Consistent styling system
- Loading states and error handling

## Development Guidelines

### Code Organization
- Keep components small and focused
- Use TypeScript for type safety
- Separate business logic into services
- Follow the existing naming conventions

### State Management
- Use Preact Signals for reactive state
- Keep state updates immutable
- Separate state and actions in store pattern

### UI Components
- Use existing UI components from `src/components/ui/`
- Follow the established design system
- Ensure responsive design with Tailwind classes

### Authentication Flow
- Always check authentication status before protected routes
- Use the useAuth hook for authentication state
- Implement role-based UI rendering

## Testing & Quality

Currently no formal testing framework is configured. The project uses TypeScript strict mode for type safety but lacks ESLint, Prettier, or automated testing setup.