ALTER TABLE public.initiative_partners
  ADD COLUMN IF NOT EXISTS uat_api_key text,
  ADD COLUMN IF NOT EXISTS production_api_key text,
  ADD COLUMN IF NOT EXISTS api_request_sample text,
  ADD COLUMN IF NOT EXISTS api_response_sample text,
  ADD COLUMN IF NOT EXISTS partner_rank integer;