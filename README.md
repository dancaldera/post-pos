# Post POS - Point of Sale Application

A modern Point of Sale (POS) application built with Tauri, Preact, TypeScript, and Tailwind CSS.

## Tech Stack

- **Frontend**: Preact + TypeScript
- **Backend**: Tauri (Rust)
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [pnpm](https://pnpm.io/) (recommended package manager)
- [Rust](https://rustup.rs/) (for Tauri backend)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd post-pos
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm tauri dev
   ```

## Available Scripts

- `pnpm tauri dev` - Start the development server
- `pnpm tauri build` - Build the application for production
- `pnpm dev` - Start Vite development server (frontend only)
- `pnpm build` - Build the frontend
- `pnpm preview` - Preview the built frontend

## Project Structure

```
├── src/                 # Frontend source code
│   ├── assets/         # Static assets
│   ├── components/     # Preact components
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
├── src-tauri/          # Tauri/Rust backend
└── public/             # Public assets
```

## Features

- Modern desktop application with native performance
- Responsive UI with Tailwind CSS
- Cross-platform compatibility (Windows, macOS, Linux)
- Secure Rust backend with Tauri

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
