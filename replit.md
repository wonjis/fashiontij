# FashionFlat AI - Technical Documentation

## Overview

FashionFlat AI is a fashion design application that enables users to transform rough sketches into professional flat sketches using AI. The platform provides design management tools, a resource library of fashion elements, and an interactive design editor with tech pack generation capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Routing**
- React 18 with TypeScript for type-safe component development
- Wouter for lightweight client-side routing
- Vite as the build tool and development server

**UI Framework**
- Shadcn UI components built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- New York style variant for component aesthetics

**State Management**
- TanStack Query (React Query) for server state management with infinite stale time
- Local React state for UI-specific interactions
- Query invalidation pattern for optimistic updates

**Design Decisions**
- Component-based architecture with reusable UI primitives
- Path aliases (@/, @shared/, @assets/) for cleaner imports
- Custom hooks (use-mobile, use-toast) for cross-cutting concerns

### Backend Architecture

**Server Framework**
- Express.js running on Node.js
- ESM (ES Modules) for modern JavaScript syntax
- Middleware-based request/response handling

**API Design**
- RESTful endpoints under `/api` prefix
- JSON request/response format
- Centralized error handling middleware
- Request logging with duration tracking

**Storage Layer**
- In-memory storage implementation (MemStorage class)
- Interface-based design (IStorage) for potential database swapping
- Entity types: Users, Collections, Designs, Resources, TechPacks, AI Requests

**Design Decisions**
- Demo user authentication ("demo-user" hardcoded) - placeholder for future auth system
- Separation of storage interface from implementation for flexibility
- UUID-based entity identification

### Database Schema

**PostgreSQL with Drizzle ORM**
- Schema defined in `shared/schema.ts` for type safety across frontend/backend
- Drizzle Kit for migrations in `./migrations` directory

**Core Tables**
- `users`: User accounts with username/password
- `collections`: User-created design collections
- `designs`: Individual fashion designs with sketch URLs, layers (JSONB), and properties
- `resource_categories`: Categorized fashion elements (fabrics, buttons, etc.)
- `resource_items`: Individual resources with design data (JSONB)
- `tech_packs`: Technical specification documents linked to designs
- `ai_requests`: AI generation request tracking with status and metadata

**Schema Design Decisions**
- JSONB fields for flexible nested data (layers, properties, design_data)
- Foreign key relationships with cascade behavior
- Timestamps for audit trails (createdAt, updatedAt)
- UUID primary keys with `gen_random_uuid()` default

### External Dependencies

**Database**
- Neon Serverless PostgreSQL (`@neondatabase/serverless`)
- Connection via `DATABASE_URL` environment variable
- Drizzle ORM for type-safe database queries

**UI Component Library**
- Radix UI primitives for accessible, unstyled components
- Comprehensive component set (dialogs, dropdowns, accordions, etc.)
- Shadcn UI configuration for consistent theming

**State & Data Fetching**
- TanStack Query for caching, synchronization, and background updates
- React Hook Form with Zod resolvers for form validation
- Drizzle-Zod integration for schema-based validation

**Development Tools**
- Replit-specific plugins for runtime error handling and cartographer integration
- TSX for TypeScript execution in development
- ESBuild for production bundling

**Styling & Utilities**
- Tailwind CSS with PostCSS processing
- Class Variance Authority (CVA) for variant-based component styling
- clsx and tailwind-merge for conditional class composition
- date-fns for date manipulation
- Embla Carousel for image galleries

**Font Loading**
- Google Fonts: Inter, Cormorant Upright, DM Sans, Fira Code, Geist Mono, Architects Daughter
- Self-hosted via HTML link tags

**Design Decisions**
- All UI components are client-side rendered (rsc: false)
- Shared schema between client/server prevents type drift
- Session management via connect-pg-simple (PostgreSQL session store)
- No authentication implemented yet - uses demo user placeholder