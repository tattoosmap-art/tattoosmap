-- Migration: Add SGE (Search Generative Experience) and Conversational AI fields to designs table
ALTER TABLE designs ADD COLUMN IF NOT EXISTS sge_snippet TEXT;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS semantic_entities JSONB DEFAULT '[]'::jsonb;
ALTER TABLE designs ADD COLUMN IF NOT EXISTS conversational_faqs JSONB DEFAULT '[]'::jsonb;
