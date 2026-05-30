# TattoosMap Architecture — Read Before Every Change
Last updated: May 2026

## SAFE UPDATE RULES
Read every rule before making any change to this codebase.

RULE 1: Never add "use client" to a page-level component without
explicit reason. Client pages disable SSR for the entire route
hurting SEO and Lighthouse scores.

RULE 2: Never delete or rename columns in database.types.ts without
also updating every server action that reads or writes that column.
TypeScript cannot catch runtime mismatches with Supabase.

RULE 3: Never use localStorage or sessionStorage anywhere in this
codebase. They fail in certain environments and are explicitly
prohibited. Use Supabase for persistent state.

RULE 4: Every exported function in src/actions/admin.ts is a public
internet endpoint. Every function must call verifyAdminSession()
as its first line. No exceptions.

RULE 5: Never change revalidatePath calls in server actions without
understanding which pages depend on that cache invalidation.

RULE 6: ProductPostTemplate.tsx manages its own internal state.
The onChange callback is debounced at 300ms. Never add direct
state mutations from the parent.

RULE 7: The blog slug page has three rendering paths — VISUAL STEP
GUIDE, RECOMMEND AND SELL, and INFORM AND REFER. Any new template
type requires a conditional in both the slug page AND the publish
page. Adding one without the other means the template renders in
the editor but not on the live post.

RULE 8: All tool components must be imported with next/dynamic and
ssr: false. They use browser APIs that throw on the server.

RULE 9: The tool marker system (:::tool[TOOL_ID]:::) and the legacy
selected_tool + tool_position system must coexist. Never remove
the legacy fallback — old posts depend on it.

RULE 10: All Next.js Image components must include a sizes prop.
Without sizes Next.js downloads the largest image variant on every
device including mobile.

## CRITICAL ARCHITECTURAL DECISIONS

DECISION 1: Structured JSON fields over Markdown for blog content.
WHY: Template-driven rendering with consistent styling.
DO NOT REVERSE: Product cards, step cards, FAQ accordions all break.

DECISION 2: Three post template types — RECOMMEND AND SELL,
INFORM AND REFER, VISUAL STEP GUIDE.
WHY: Each type has a specific section order and CTA that maximizes
conversion for that content intent.
DO NOT REVERSE: Section order determined by Hook Model audit.

DECISION 3: Tool markers injected into body_content for placement.
WHY: Allows flexible tool positioning without rigid fixed positions.
DO NOT REVERSE: Both marker system and legacy system must coexist.

DECISION 4: Admin auth is email-whitelist based not role-based.
WHY: Single admin user. isAdmin() checks email against whitelist.
FUTURE: If multiple admins are needed migrate to a roles table.

DECISION 5: ISR revalidation intervals set per page type.
Homepage: 60s. Blog posts: 300s. Gallery: 300s. Design pages: 600s.
WHY: Balance between content freshness and server load.

DECISION 6: All API routes and server actions require admin auth.
WHY: Every exported server action is a public internet endpoint.
DO NOT RELAX: Adding a public server action requires explicit review.

## DATABASE COLUMNS ADDED POST-INITIAL MIGRATION

posts table:
- protocol_steps JSONB
- avoid_items JSONB
- faq_items JSONB
- pull_quote TEXT
- science_heading TEXT
- science_content TEXT
- tool_markers JSONB
- selected_tool TEXT
- tool_position TEXT
- visual_steps JSONB
- post_template_type TEXT
- short_answer TEXT

separate tables added:
- admin_drafts (user_id, draft_data JSONB, updated_at)

## KNOWN TECHNICAL DEBT
- admin.ts is 900+ lines — split into domain files when time allows
- High TypeScript any count in template components — replace
  incrementally with proper interfaces
- scratch/ directory contains test scripts — move to proper test
  suite when time allows

## SECURITY MODEL
- Middleware protects: /admin/*, /dashboard/os/*, /api/admin/*,
  /api/upload/*
- Server actions verify: verifyAdminSession() on every mutation
- Public routes: /, /gallery/*, /blog/*, /meaning/*
- Supabase RLS: enabled for public data reads
- Service role key: used only in server-side admin actions
