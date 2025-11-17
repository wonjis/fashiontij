# FashionTIJ

A full-stack fashion design application that enables designers to create, manage, and organize fashion designs with AI-powered features and tech pack generation.

## Tech Stack

### Frontend

#### Core Framework & Build Tools
- **React** 18.3.1 - UI library for building the user interface
- **TypeScript** 5.6.3 - Type-safe JavaScript for better development experience
- **Vite** 5.4.20 - Fast build tool and development server
- **Wouter** 3.3.5 - Lightweight routing library for navigation

#### UI Components & Styling
- **Tailwind CSS** 3.4.17 with **@tailwindcss/vite** 4.1.3 - Utility-first CSS framework
- **Radix UI** - Comprehensive collection of accessible, unstyled UI primitives including:
  - Dialog, Dropdown Menu, Select, Toast, Tabs, Accordion
  - Avatar, Checkbox, Radio Group, Slider, Switch
  - Navigation Menu, Popover, Tooltip, and more
- **Framer Motion** 11.13.1 - Animation library for smooth UI transitions
- **Lucide React** 0.453.0 - Beautiful icon library
- **React Icons** 5.4.0 - Additional icon sets

#### State Management & Data Fetching
- **TanStack Query** (@tanstack/react-query) 5.60.5 - Powerful data synchronization and caching
- **React Hook Form** 7.55.0 - Performant form management with validation
- **Zod** 3.24.2 - TypeScript-first schema validation

#### Specialized UI Libraries
- **Recharts** 2.15.2 - Charting library for data visualization
- **React Day Picker** 8.10.1 - Date picker component
- **Embla Carousel React** 8.6.0 - Carousel/slider functionality
- **Uppy** - File upload components (Dashboard, AWS S3, XHR Upload)
- **CMDK** 1.1.1 - Command palette/menu functionality

#### Utility Libraries
- **class-variance-authority** 0.7.1 - Component variant management
- **clsx** 2.1.1 - Conditional className composition
- **tailwind-merge** 2.6.0 - Merge Tailwind classes intelligently
- **date-fns** 3.6.0 - Date manipulation and formatting

### Backend

#### Server Framework
- **Express** 4.21.2 - Fast, minimalist web framework for Node.js
- **TypeScript** 5.6.3 - Type-safe server-side code
- **tsx** 4.20.5 - TypeScript execution for development

#### Database & ORM
- **PostgreSQL** (via Neon) - Serverless PostgreSQL database
- **Drizzle ORM** 0.39.1 - TypeScript ORM for type-safe database queries
- **Drizzle Kit** 0.31.4 - Database migrations and schema management
- **Drizzle Zod** 0.7.0 - Automatic schema validation from database models
- **@neondatabase/serverless** 0.10.4 - Neon database client

#### Authentication & Session Management
- **Passport** 0.7.0 - Authentication middleware
- **Passport Local** 1.0.0 - Username/password authentication strategy
- **Express Session** 1.18.1 - Session management
- **connect-pg-simple** 10.0.0 - PostgreSQL session store
- **memorystore** 1.6.7 - In-memory session store

#### File Storage
- **Google Cloud Storage** (@google-cloud/storage) 7.17.3 - Cloud object storage
- **Sharp** 0.34.5 - High-performance image processing

#### AI Integration
- **OpenAI** 6.9.0 - AI features for design generation and assistance

#### Real-time Communication
- **WebSocket** (ws) 8.18.0 - Real-time bidirectional communication

#### Validation & Error Handling
- **Zod** 3.24.2 - Runtime validation
- **zod-validation-error** 3.4.0 - Better error messages for validation failures

### Database Schema

The application uses PostgreSQL with the following main entities:

- **Users** - User authentication and profile management
- **Collections** - Design collection organization
- **Designs** - Core design data with sketch and image URLs, layers, and properties
- **Resource Categories** - Categorization for design resources
- **Resource Items** - Individual design resources (patterns, materials, etc.)
- **Tech Packs** - Technical specification documents with:
  - Design descriptions
  - Specification sheets
  - Bill of materials (BOM)
  - Construction details
  - Pattern notes
  - Cost sheets
- **AI Requests** - Tracking AI-powered feature requests and results

### Development Tools

#### Build & Bundling
- **esbuild** 0.25.0 - Fast JavaScript bundler
- **Vite** 5.4.20 - Next-generation frontend tooling
- **PostCSS** 8.4.47 - CSS transformation tool
- **Autoprefixer** 10.4.20 - CSS vendor prefixing

#### Type Checking
- **TypeScript** 5.6.3 - Static type checking
- Type definitions for Node, Express, React, Passport, WebSocket

#### Replit Integration
- **@replit/vite-plugin-cartographer** 0.3.1 - Development navigation
- **@replit/vite-plugin-dev-banner** 0.1.1 - Development environment banner
- **@replit/vite-plugin-runtime-error-modal** 0.0.3 - Runtime error overlay

## Project Structure

```
fashiontij/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions
│   │   ├── App.tsx      # Root component
│   │   └── main.tsx     # Application entry point
│   └── index.html       # HTML template
├── server/              # Backend Express server
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API route definitions
│   ├── db.ts            # Database connection
│   ├── storage.ts       # File storage logic
│   ├── openai.ts        # AI integration
│   └── seed.ts          # Database seeding
├── shared/              # Shared code between client and server
│   └── schema.ts        # Database schema and types
├── migrations/          # Database migration files
├── public/              # Static assets
└── attached_assets/     # Design and resource assets
```

## Scripts

```bash
# Development
npm run dev              # Start development server with hot reload

# Production
npm run build            # Build frontend and backend for production
npm start                # Run production server

# Database
npm run db:push          # Push database schema changes

# Type Checking
npm run check            # Run TypeScript type checking
```

## Environment Variables

Required environment variables:

```bash
DATABASE_URL            # PostgreSQL connection string (Neon)
GOOGLE_CLOUD_CREDENTIALS # Google Cloud Storage credentials
OPENAI_API_KEY         # OpenAI API key for AI features
SESSION_SECRET         # Secret for session encryption
```

## Key Features

- Full-stack TypeScript application with type safety across frontend and backend
- Serverless PostgreSQL database with Drizzle ORM
- Session-based authentication with Passport.js
- Cloud file storage with Google Cloud Storage
- AI-powered design features using OpenAI
- Real-time updates via WebSocket
- Comprehensive UI component library with Radix UI
- Type-safe API routes and database queries
- Tech pack generation for manufacturing specifications

## Development

This project is configured for development on Replit with specialized Vite plugins for an enhanced development experience. The application uses a monorepo structure with shared TypeScript types between client and server for end-to-end type safety.

## License

MIT
