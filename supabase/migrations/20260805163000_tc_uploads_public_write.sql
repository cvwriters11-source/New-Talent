-- Allow checkout/admin uploads into tc-uploads when service role is unavailable.
-- Bucket already enforces a 10MB file_size_limit.

DROP POLICY IF EXISTS "tc_uploads_public_insert" ON storage.objects;
CREATE POLICY "tc_uploads_public_insert"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'tc-uploads'
  AND (storage.foldername(name))[1] IN ('checkout', 'invoice', 'orders', 'interview')
);

DROP POLICY IF EXISTS "tc_uploads_public_update" ON storage.objects;
CREATE POLICY "tc_uploads_public_update"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'tc-uploads'
  AND (storage.foldername(name))[1] IN ('checkout', 'invoice', 'orders', 'interview')
)
WITH CHECK (
  bucket_id = 'tc-uploads'
  AND (storage.foldername(name))[1] IN ('checkout', 'invoice', 'orders', 'interview')
);
