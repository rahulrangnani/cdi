-- Create storage bucket for partner videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partner-videos', 
  'partner-videos', 
  true,
  104857600, -- 100MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
);

-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'partner-videos');

-- Allow public read access to videos
CREATE POLICY "Public can view partner videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'partner-videos');

-- Allow admins to delete videos
CREATE POLICY "Admins can delete partner videos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'partner-videos' AND public.is_admin(auth.uid()));