
# Vector Logo Hub – Project Documentation

Vector Logo Hub is a Next.js application designed to provide a robust platform for searching, browsing, and downloading vector logos (SVG & PNG). It integrates with Supabase for database operations, uses ShadCN UI for styled components, and applies caching (Redis or Node-Cache) to accelerate performance. The front-end is powered by Next.js App Router, TypeScript, and Tailwind CSS.

## Key Features
1. **Next.js App Router**  
   Organized by the app directory, facilitating nested routing and improved layouts.
2. **ShadCN UI & Tailwind CSS**  
   Unified component styling from ShadCN UI with Tailwind CSS for building clean and consistent interfaces.
3. **TypeScript**  
   Ensures type safety across the application, reducing runtime errors.
4. **Supabase Integration**  
   Database operations for storing, searching, and retrieving logos with associated metadata.
5. **Caching Layer**  
   - Redis-based caching (`lib/redis.ts`) for logos if the environment supports it.  
   - Node-Cache fallback (`lib/cache.ts`) for ephemeral caching.
6. **API Routes**  
   Custom endpoints for on-demand logo transformations, downloads, and searching.
7. **Sitemap Generation**  
   Automated large-scale sitemap generation with pagination for SEO purposes.
8. **Deployment & Configuration**  
   - `next.config.mjs` and `nginx.conf` for optimized production settings.  
   - `dev.sh` for local development start-up script.

## Project Folder Structure & Explanation

Below is an overview of the complete directory tree with inline comments:

```
vishnuhimself-vectorlogohub/                    // Root directory
├── components.json                             // ShadCN UI configuration file
├── dev.sh                                      // Bash script to clean and start local dev server
├── next-env.d.ts                               // Next.js type declarations (auto-generated)
├── next.config.js                              // Next.js config (commonJS format)
├── next.config.mjs                             // Next.js config (ES module format, includes CSP headers)
├── nginx.conf                                  // Sample Nginx configuration for caching, compression
├── package.json                                // Project dependencies and npm scripts
├── postcss.config.js                           // PostCSS configuration (commonJS format)
├── postcss.config.mjs                          // PostCSS configuration (ES module format)
├── tailwind.config.ts                          // Tailwind CSS configuration in TypeScript
├── tsconfig.json                               // TypeScript config for the project
├── .eslintrc.json                              // ESLint configuration for Next.js + TypeScript
├── app/                                        // Next.js App Router directory
│   ├── globals.css                             // Global Tailwind and style reset
│   ├── layout.tsx                              // Main root layout (Header, Footer, Toast)
│   ├── loading.tsx                             // Root-level loading component for SSR fallback
│   ├── page.tsx                                // Home page (features hero section and popular logos)
│   ├── robots.ts                               // Exports `robots.txt` route configuration
│   ├── about/                                  // `/about` page route
│   │   └── page.tsx                           // About us content
│   ├── alphabet/                               // Directory for listing logos by alphabet
│   │   └── [letter]/                           // Dynamic route for each letter
│   │       └── page.tsx                       // Page logic to fetch & display logos starting with a letter
│   ├── api/                                    // Custom API endpoints
│   │   ├── download/                           // Handles on-demand SVG/PNG file generation
│   │   │   └── [slug]/                        // Dynamic route for download slug
│   │   │       └── route.ts                   // GET route for fetching/converting requested logo
│   │   ├── png/                               // Fallback PNG endpoint
│   │   │   └── [slug]/                        // Dynamic route for PNG downloads
│   │   │       └── route.ts                   // Converts logo from SVG to PNG with Sharp
│   │   └── search/                            // Search endpoint
│   │       └── route.ts                       // GET route to query Supabase for matching logos
│   ├── contact/                               // `/contact` page route
│   │   └── page.tsx                           // Contact page content
│   ├── download/                              // `/download` route for downloading
│   │   └── [slug]/                            // Dynamic route for direct download
│   │       └── page.tsx                       // UI countdown & triggers to download the file
│   ├── fonts/                                 // Directory hosting local font files
│   │   ├── GeistMonoVF.woff                   // Font file
│   │   └── GeistVF.woff                       // Font file
│   ├── logo/                                  // Individual logo pages
│   │   └── [slug]/                            // Dynamic route for each logo detail page
│   │       └── page.tsx                       // Displays a single logo, with related and random logos
│   ├── privacy/                               // `/privacy` page route
│   │   └── page.tsx                           // Privacy policy content
│   ├── search/                                // `/search` page route
│   │   └── page.tsx                           // Front-end search page handling results pagination
│   ├── sitemap/                               // Dynamic sitemap generation
│   │   └── [id]/                              // Generates chunked sitemap sub-files
│   │       └── route.ts                       // GET route to produce a subset of the sitemap
│   ├── sitemap.xml/                           // Main sitemap index route
│   │   └── route.ts                           // GET route for generating the sitemap index
│   ├── tag/                                   // Displays logos by tag
│   │   └── [tag]/                             // Dynamic route for each tag
│   │       └── page.tsx                       // Tag listing logic and pagination
│   ├── terms/                                 // `/terms` page route
│   │   └── page.tsx                           // Terms of use content
│   └── upload/                                // `/upload` page route
│       └── page.tsx                           // Upload form (iframe to external form service)
├── components/                                // UI components
│   ├── download-page.tsx                      // Countdown-based download UI
│   ├── google-analytics.tsx                   // Client-side GA integration
│   ├── loading.tsx                            // Loading placeholder for data fetch states
│   ├── logo-download-page.tsx                 // Component to display logo details, download links, related logos
│   ├── logo-grid.tsx                          // Reusable grid for displaying multiple logos
│   ├── pagination.tsx                         // Client-side pagination component
│   ├── search.tsx                             // Search box UI with Next router navigation
│   ├── layout/                                // Layout components for structure
│   │   ├── footer.tsx                         // Global footer
│   │   ├── header.tsx                         // Global header with brand & nav
│   │   ├── root-layout-wrapper.tsx            // Wraps main content; adds top-level scroll reset, search header
│   │   └── search-header.tsx                  // Search bar shown on specific pages
│   └── ui/                                    // ShadCN UI-based components
│       ├── button.tsx                         // Button component with variants (default, outline, etc.)
│       ├── dialog.tsx                         // Dialog component (Radix)
│       ├── dropdown-menu.tsx                  // Dropdown menu (Radix)
│       ├── input.tsx                          // Input component
│       ├── progress.tsx                       // Progress bar component
│       ├── sheet.tsx                          // Slide-in panel (Radix Sheet)
│       ├── toast.tsx                          // Toast component
│       ├── toaster.tsx                        // Toast provider for displaying notifications
│       └── use-toast.ts                       // Hook for firing toasts
├── data/                                      // Local data files
│   └── popular-logos.ts                       // List of popular logo paths used on the home page
├── hooks/                                     // Custom React hooks
│   ├── use-debounce.ts                        // Debounce hook for search inputs
│   └── use-toast.ts                           // Alternative toast hook (similar to components/ui)
├── lib/                                       // Backend and utility logic
│   ├── cache.ts                               // Node-Cache-based caching for fallback
│   ├── constants.ts                           // Constants such as caching durations
│   ├── db.ts                                  // Supabase data fetching, searching, and transformations
│   ├── get-related-logos.ts                   // Utility for scoring and finding related logos
│   ├── redis.ts                               // ioredis-based caching logic for environment that supports Redis
│   ├── supabase.ts                            // Creates the Supabase client
│   └── utils.ts                               // Helper functions (e.g. `cn`, `toTitleCase`)
├── migration/                                 // Python migration scripts for populating the Supabase DB
│   ├── config.py                              // Configuration for connecting to Supabase
│   ├── migrate.py                             // Main migration script reading from JSON + inserting records
│   ├── recover.py                             // Recovery script for reprocessing failed logs
│   └── requirements.txt                       // Python dependencies for migration scripts
├── public/                                    // Static files (images, SVGs, etc.)
└── types/                                     // Shared TypeScript type definitions
    └── logo.ts                                // `LogoData` interface definition
```

## Workflow Overview
1. **Local Development**  
   - Run `dev.sh` or `npm run dev` to start the local server.  
   - This script also triggers a cache clean before spinning up Next.js.
2. **Data Flow**  
   - Frontend Pages query data from `db.ts` using server components.  
   - Supabase stores logo metadata (title, URL path, tags).  
   - Caching checks for existing entries in Redis or Node-Cache to quickly return results and reduce database hits.
3. **Searching & Browsing**  
   - Alphabet route (`/alphabet/[letter]`) lists logos starting with a particular letter.  
   - Tags route (`/tag/[tag]`) categorizes logos under a specific tag.  
   - Search route (`/search`) uses a custom scoring system to rank results by relevance.
4. **Downloads**  
   - `/api/download/[slug]`:  
     - Serves original SVG, or optionally converts to PNG of multiple sizes using Sharp.  
   - `/api/png/[slug]`:  
     - Alternative route for PNG conversion from an existing JSON reference file.
5. **Sitemap Generation**  
   - Large sets of URLs are chunked into multiple sitemaps under `/sitemap/sitemap-0.xml`, `/sitemap/sitemap-1.xml`, etc.  
   - The main sitemap index is at `/sitemap.xml`.
6. **Deployment**  
   - Production builds rely on `nginx.conf` for caching, compression.  
   - The `next.config.mjs` includes additional security headers and typed routes.

## References
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase](https://supabase.com)
- [Radix UI](https://radix-ui.com)
- [ShadCN UI](https://shadcn.dev)
- [Node-Cache GitHub](https://github.com/node-cache/node-cache)
- [ioredis GitHub](https://github.com/luin/ioredis)

This concludes the overview and structural documentation for Vector Logo Hub.
