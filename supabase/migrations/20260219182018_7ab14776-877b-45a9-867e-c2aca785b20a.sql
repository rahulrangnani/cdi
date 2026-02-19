
-- 1. Add parent_id to initiatives for category/sub-category hierarchy
ALTER TABLE public.initiatives 
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.initiatives(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_initiatives_parent_id ON public.initiatives(parent_id);

-- 2. Create partner_features table
CREATE TABLE IF NOT EXISTS public.partner_features (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  initiative_partner_id uuid NOT NULL REFERENCES public.initiative_partners(id) ON DELETE CASCADE,
  feature_name text NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view partner_features"
  ON public.partner_features FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert partner_features"
  ON public.partner_features FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update partner_features"
  ON public.partner_features FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete partner_features"
  ON public.partner_features FOR DELETE
  USING (is_admin(auth.uid()));

CREATE TRIGGER update_partner_features_updated_at
  BEFORE UPDATE ON public.partner_features
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Create api_documents table for multiple PDF uploads
CREATE TABLE IF NOT EXISTS public.api_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  initiative_partner_id uuid NOT NULL REFERENCES public.initiative_partners(id) ON DELETE CASCADE,
  title text NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.api_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view api_documents"
  ON public.api_documents FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert api_documents"
  ON public.api_documents FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update api_documents"
  ON public.api_documents FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete api_documents"
  ON public.api_documents FOR DELETE
  USING (is_admin(auth.uid()));

CREATE TRIGGER update_api_documents_updated_at
  BEFORE UPDATE ON public.api_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Add api_notes field to initiative_partners for free-text API details
ALTER TABLE public.initiative_partners
ADD COLUMN IF NOT EXISTS api_notes text;

-- 5. Create storage bucket for API documents (PDFs)
INSERT INTO storage.buckets (id, name, public)
VALUES ('api-documents', 'api-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS for api-documents bucket
CREATE POLICY "Authenticated users can view api documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'api-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can upload api documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'api-documents' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete api documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'api-documents' AND is_admin(auth.uid()));
