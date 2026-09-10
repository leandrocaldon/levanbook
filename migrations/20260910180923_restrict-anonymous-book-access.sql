-- Public reading no longer goes through PostgREST as anon.
-- Shared books are served only by the Next.js admin proxy.

DROP POLICY IF EXISTS books_public_select ON public.books;
REVOKE SELECT ON public.books FROM anon;

DROP POLICY IF EXISTS books_storage_public_select ON storage.objects;
REVOKE SELECT ON storage.objects FROM anon;
REVOKE USAGE ON SCHEMA storage FROM anon;

REVOKE EXECUTE ON FUNCTION public.is_public_book_object(TEXT) FROM anon;
