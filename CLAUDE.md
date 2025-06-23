# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.3.4 application with TypeScript and sql.js, designed for SQL training purposes. It uses the App Router architecture and Tailwind CSS v4 for styling.

## Essential Commands

```bash
# Development
npm run dev          # Start development server with Turbopack

# Production
npm run build        # Create production build
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint checks
```

## Architecture

### Technology Stack
- **Framework**: Next.js 15.3.4 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Database**: sql.js (WebAssembly-based SQL engine)
- **React**: v19.0.0

### Project Structure
- `/app`: Next.js App Router pages and components
  - `layout.tsx`: Root layout with Geist fonts
  - `page.tsx`: Main application entry point
  - `globals.css`: Tailwind CSS configuration
- `/public`: Static assets

### Key Configuration
- **TypeScript**: Strict mode enabled with path aliases (`@/*`)
- **ESLint**: Next.js Core Web Vitals rules
- **Turbopack**: Enabled for faster development builds
- **CSS Variables**: Configured for light/dark mode support

## Development Notes

When developing SQL training features:
1. sql.js runs entirely in the browser via WebAssembly
2. Use TypeScript strict mode - all variables must be properly typed
3. Follow the existing App Router patterns for new pages
4. Tailwind CSS v4 is configured - use utility classes for styling

## UI Components

This project uses **shadcn/ui** for UI components:
- Components are installed in `/components/ui`
- Add new components with: `npx shadcn@latest add [component-name]`
- Utility function `cn()` available in `/lib/utils.ts` for className merging
- Configuration in `components.json` (New York style, Neutral color scheme)