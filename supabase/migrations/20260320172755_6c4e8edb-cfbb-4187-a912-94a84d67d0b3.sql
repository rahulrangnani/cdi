
-- Add custom commercial fields as JSONB to initiative_partners
ALTER TABLE public.initiative_partners
ADD COLUMN custom_commercial_fields jsonb DEFAULT '[]'::jsonb;

-- Add comment for clarity
COMMENT ON COLUMN public.initiative_partners.custom_commercial_fields IS 'Array of {label, value, unit} objects for additional commercial details';
