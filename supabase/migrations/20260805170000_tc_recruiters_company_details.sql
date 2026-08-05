-- Recruiter company verification details + logo upload folder support

ALTER TABLE public.tc_recruiters
  ADD COLUMN IF NOT EXISTS registration_number text,
  ADD COLUMN IF NOT EXISTS website text;

DROP POLICY IF EXISTS "tc_uploads_public_insert" ON storage.objects;
CREATE POLICY "tc_uploads_public_insert"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'tc-uploads'
  AND (storage.foldername(name))[1] IN ('checkout', 'invoice', 'orders', 'interview', 'recruiters')
);

DROP POLICY IF EXISTS "tc_uploads_public_update" ON storage.objects;
CREATE POLICY "tc_uploads_public_update"
ON storage.objects
FOR UPDATE
TO public
USING (
  bucket_id = 'tc-uploads'
  AND (storage.foldername(name))[1] IN ('checkout', 'invoice', 'orders', 'interview', 'recruiters')
)
WITH CHECK (
  bucket_id = 'tc-uploads'
  AND (storage.foldername(name))[1] IN ('checkout', 'invoice', 'orders', 'interview', 'recruiters')
);
