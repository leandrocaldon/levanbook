-- Allow anonymous readers to reach storage.objects for public books.
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;

GRANT SELECT ON storage.objects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

GRANT EXECUTE ON FUNCTION public.is_public_book_object(TEXT) TO anon, authenticated;
