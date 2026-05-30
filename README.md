# TattoosMap

A minimalist, high-performance tattoo inspiration and culture platform built with Next.js 14, Tailwind CSS, and Supabase.

## Features

- **Pinterest-Style Gallery:** Masonry layout with high-resolution image support, client-side URL filtering, and SVG BlurHash placeholders.
- **Blogging Platform:** Long-form editorial capabilities with dynamic metadata and performant typography.
- **Design System:** Strict adherence to Dieter Rams' 10 principles of design (monochrome palette with single red accent, precise spacing, typography-first approach).
- **Core Web Vitals Optimized:** Aggressive Next.js `<Image/>` pipeline and React Server Components.

## Getting Started

First, install dependencies:

```bash
npm install
```

### Environment Variables

You need to connect the application to a Supabase project. Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="your-project-url.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Production URL (used for Sitemap generation)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### Running the Development Server

Start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Setup

This project requires four tables in Supabase: `authors`, `posts`, `designs`, and `user_saves`. 
The SQL migration script is located at `supabase/migrations/0001_initial_schema.sql`. Run this script in your Supabase SQL Editor to initialize the tables.

## Image Upload API

The application includes an API route (`/api/upload`) designed to process images with `sharp` and extract BlurHash payloads. In production, this route should be connected to your Supabase Storage bucket.

## Deployment

This project is optimized for Vercel. Connect your repository to Vercel and ensure the environment variables are copied over to the project settings.
