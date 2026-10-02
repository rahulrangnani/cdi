ALTER TABLE public.support_details
ADD COLUMN escalation_matrix jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.support_details.escalation_matrix IS 'Optional partner support escalation contacts keyed by escalation level.';