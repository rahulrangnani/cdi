-- Add media type columns to initiative_partners table
-- This enables support for audio and document files in addition to video

ALTER TABLE public.initiative_partners
ADD COLUMN IF NOT EXISTS media_type text DEFAULT 'video';

COMMENT ON COLUMN public.initiative_partners.media_type IS 'Type of media: video, audio, or document';

-- Rename video columns to be more generic (media)
-- We'll keep the existing columns but add new ones for flexibility
ALTER TABLE public.initiative_partners
RENAME COLUMN video_title TO media_title;

ALTER TABLE public.initiative_partners
RENAME COLUMN video_url TO media_url;

ALTER TABLE public.initiative_partners
RENAME COLUMN video_description TO media_description;

-- Drop the video_duration column as it's not needed for all media types
ALTER TABLE public.initiative_partners
DROP COLUMN IF EXISTS video_duration;