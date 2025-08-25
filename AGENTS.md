# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Post POS is a modern Point of Sale (POS) application built as a cross-platform desktop application using Tauri framework. It combines a Rust backend with a Preact + TypeScript frontend, styled with Tailwind CSS.

## Technology Stack

- **Frontend**: Preact + TypeScript with Tailwind CSS
- **Backend**: Tauri v2 (Rust)
- **Database**: SQLite with Tauri SQL Plugin
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
│   └── lib.rs           # Tauri commands, setup, and SQLite migrations
├── capabilities/         # Security capabilities (includes SQL permissions)
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
- SQLite-based authentication with localStorage persistence
- Route protection based on authentication status
- Default test users seeded in database

### Component Architecture
- Reusable UI components in `src/components/ui/`
- Page components in `src/pages/`
- Layout component handling navigation and role-based menu items

### Service Layer
- Singleton services for business logic
- SQLite database with persistent storage
- Full CRUD operations with database transactions
- Search and filtering capabilities
- Database migrations and seeding

### Database Architecture
- **SQLite Database**: Local-first storage with `postpos.db`
- **Migration System**: Versioned database schema updates
- **Seeded Data**: Default users, customers, and products for development
- **Tables**: 
  - `users` - Authentication and role management
  - `customers` - Customer information and loyalty tracking
  - `products` - Product catalog with inventory and pricing

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
- SQL Plugin: Enabled with SQLite support
- Permissions: Core, opener, and SQL operations allowed

## Key Features & Current State

### Authentication System
- Three roles: admin, manager, user
- Role-based permissions and menu visibility
- SQLite-stored users with encrypted data
- Default test accounts:
  - admin@postpos.com / admin123
  - manager@postpos.com / manager123
  - user@postpos.com / user123

### Customer Management
- Full CRUD operations with SQLite persistence
- Customer information and contact details
- Loyalty points and purchase history tracking
- Search and filtering capabilities
- Customer relationship management features

### Product Management
- Full CRUD operations with SQLite persistence
- Categories and inventory tracking
- Real-time search across multiple fields
- Stock level monitoring and alerts
- Pricing and cost management
- Barcode support for product identification

### UI/UX
- Glass morphism design with Tailwind CSS
- Responsive design patterns
- Consistent styling system
- Loading states and error handling
- Modal dialogs for confirmation actions
- Real-time search and filtering
- Data tables with pagination support

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

### Database Operations
- Use the service layer (`*-sqlite.ts`) for all database interactions
- Follow the established patterns for CRUD operations
- Handle errors gracefully with user-friendly messages
- Use transactions for complex operations
- Implement proper validation before database writes

### Service Architecture
- Prefer SQLite services over mock services for new features
- Use the singleton pattern for service instances
- Implement proper error handling and logging
- Follow async/await patterns for database operations
- Convert between database and UI data types appropriately

## File Structure & Naming Conventions

### Services
- **Mock Services**: `src/services/{entity}.ts` (legacy, being phased out)
- **SQLite Services**: `src/services/{entity}-sqlite.ts` (preferred for new development)
- **Pattern**: Always export both the service class and singleton instance

### Database Files
- **Location**: SQLite database stored in app config directory
- **Name**: `postpos.db`
- **Migrations**: Defined in `src-tauri/src/lib.rs`
- **Access**: Via `@tauri-apps/plugin-sql`

## Testing & Quality

Currently no formal testing framework is configured. The project uses TypeScript strict mode for type safety but lacks ESLint, Prettier, or automated testing setup.

### Database Testing
- Manual testing with seeded data
- Database migrations tested on application startup
- CRUD operations validated through UI interactions