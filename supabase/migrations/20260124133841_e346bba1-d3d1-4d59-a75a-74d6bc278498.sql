-- Add integration_cost and annual_cost columns to initiative_partners
-- Remove sla_percentage (we'll keep the column but it won't be used in UI)
ALTER TABLE public.initiative_partners 
ADD COLUMN IF NOT EXISTS integration_cost numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS annual_cost numeric DEFAULT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.initiative_partners.integration_cost IS 'One-time integration/setup cost';
COMMENT ON COLUMN public.initiative_partners.annual_cost IS 'Recurring annual cost';