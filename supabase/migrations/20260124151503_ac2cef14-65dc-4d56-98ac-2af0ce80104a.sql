-- Fix storage bucket to require authentication instead of being public
UPDATE storage.buckets 
SET public = false 
WHERE id = 'partner-videos';

-- Drop the public policy
DROP POLICY IF EXISTS "Public can view partner videos" ON storage.objects;

-- Create new policy that requires authentication
CREATE POLICY "Authenticated users can view partner videos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'partner-videos');