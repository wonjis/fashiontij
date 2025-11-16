# FashionFlat AI - Technical Documentation

## Overview

FashionFlat AI is a fashion design application that enables users to create fashion designs with AI-generated technical specifications. The platform provides design management tools, a resource library of fashion elements, an interactive design editor with tech pack generation capabilities, and an AI-powered Create feature that generates comprehensive tech packs from uploaded sketches.

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
- PostgreSQL database storage (DBStorage class) using Neon Serverless
- Interface-based design (IStorage) for potential database swapping
- Entity types: Users, Collections, Designs, Resources, TechPacks, AI Requests

**Object Storage**
- Replit App Storage (Google Cloud Storage backend) for image uploads
- ObjectStorageService for upload URL generation and file serving
- ACL system for access control (public/private visibility)
- Endpoints:
  - POST /api/objects/upload - Get presigned upload URL
  - GET /objects/:objectPath - Serve uploaded images
  - PUT /api/design-images - Set image ACL after upload

**Design Decisions**
- Demo user authentication ("demo-user" hardcoded) - placeholder for future auth system
- Separation of storage interface from implementation for flexibility
- UUID-based entity identification
- Public visibility for design images (accessible to all users)

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

**Database & Storage**
- Neon Serverless PostgreSQL (`@neondatabase/serverless`)
- Connection via `DATABASE_URL` environment variable
- Drizzle ORM for type-safe database queries
- Google Cloud Storage via `@google-cloud/storage` for file uploads
- Environment variables: `PUBLIC_OBJECT_SEARCH_PATHS`, `PRIVATE_OBJECT_DIR`, `DEFAULT_OBJECT_STORAGE_BUCKET_ID`

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
- Uppy for file uploads (@uppy/core, @uppy/react, @uppy/aws-s3, @uppy/dashboard)

**Styling & Utilities**
- Tailwind CSS with PostCSS processing
- Class Variance Authority (CVA) for variant-based component styling
- clsx and tailwind-merge for conditional class composition
- date-fns for date manipulation
- Embla Carousel for image galleries

**Font Loading**
- Google Fonts: Inter, Cormorant Upright, DM Sans, Fira Code, Geist Mono, Architects Daughter
- Self-hosted via HTML link tags

**AI Integration (OpenAI via Replit AI Integrations)**
- GPT-4 Vision for sketch image analysis (converts to technical description)
- DALL-E 3 for technical flat image generation from descriptions
- GPT-4 for tech spec generation from design metadata
- Zod schema validation for AI responses with fail-closed error handling
- NaN-safe numeric parsing with currency symbol stripping
- 422 status codes for validation errors (retryable) vs 500 for server errors
- No API key required - uses Replit AI Integrations (credits-based billing)
- Image handling: Internal `/objects/` URLs converted to base64 data URLs for OpenAI API compatibility

**Design Decisions**
- All UI components are client-side rendered (rsc: false)
- Shared schema between client/server prevents type drift
- Session management via connect-pg-simple (PostgreSQL session store)
- No authentication implemented yet - uses demo user placeholder

## Recent Changes

**November 16, 2025: Technical Flat Image Generation**
- Added two-step AI image generation workflow:
  - **Step 1**: GPT-4 Vision analyzes uploaded sketch → generates technical description
  - **Step 2**: DALL-E 3 generates technical flat PNG from description (transparent background)
- **POST /api/designs/create** endpoint now:
  1. Converts internal `/objects/` URLs to base64 data URLs for OpenAI compatibility
  2. Generates technical flat image via GPT-4 Vision + DALL-E
  3. Downloads generated image from OpenAI
  4. Uploads to Object Storage with public ACL
  5. Generates tech specs with GPT-4
  6. Saves design (with technical flat URL) and tech pack to database
- Added ObjectStorageService helper methods:
  - `getUploadUrl(objectPath, contentType)` - generates signed upload URL
  - `setObjectAcl(objectPath, visibility)` - sets object ACL policy
- Updated CreateDesignDialog UI:
  - Progressive loading messages: "Analyzing sketch..." → "Generating technical flat..." → "Creating tech specs..."
  - Time-based step estimation for better UX
- Comprehensive validation with Zod schemas:
  - BillOfMaterials items validated for required fields
  - Cost sheet numbers coerced from strings (handles "$12.50" format)
  - Total validation ensures sum matches components (fail-closed)
  - Missing fields rejected (no silent defaults)
- Error handling with typed responses:
  - 422 for AI validation/generation errors (user can retry)
  - 500 for server/system errors
  - Detailed error messages with field paths and step indicators
- Note: Two-step approach (image→text→image) used instead of true image-to-image due to API limitations