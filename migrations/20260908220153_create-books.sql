CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  storage_url TEXT,
  cover_key TEXT,
  cover_url TEXT,
  page_count INTEGER NOT NULL DEFAULT 0,
  file_size BIGINT,
  share_slug TEXT UNIQUE,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX books_owner_id_idx ON public.books (owner_id);
CREATE INDEX books_share_slug_idx ON public.books (share_slug);
CREATE INDEX books_is_public_idx ON public.books (is_public) WHERE is_public = true;

CREATE TRIGGER books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION system.update_updated_at();

ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

CREATE POLICY books_owner_select ON public.books
  FOR SELECT TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY books_public_select ON public.books
  FOR SELECT TO anon, authenticated
  USING (is_public = true);

CREATE POLICY books_owner_insert ON public.books
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY books_owner_update ON public.books
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY books_owner_delete ON public.books
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.books TO authenticated;
GRANT SELECT ON public.books TO anon;

CREATE OR REPLACE FUNCTION public.is_public_book_object(object_key TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.books
    WHERE is_public = true
      AND (storage_key = object_key OR cover_key = object_key)
  );
$$;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS storage_objects_owner_select ON storage.objects;
DROP POLICY IF EXISTS storage_objects_owner_insert ON storage.objects;
DROP POLICY IF EXISTS storage_objects_owner_update ON storage.objects;
DROP POLICY IF EXISTS storage_objects_owner_delete ON storage.objects;

CREATE POLICY books_storage_owner_select ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket = 'books'
    AND uploaded_by = (SELECT auth.jwt() ->> 'sub')
  );

CREATE POLICY books_storage_public_select ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (
    bucket = 'books'
    AND public.is_public_book_object(key)
  );

CREATE POLICY books_storage_owner_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket = 'books'
    AND uploaded_by = (SELECT auth.jwt() ->> 'sub')
    AND (storage.foldername(key))[1] = (SELECT auth.jwt() ->> 'sub')
  );

CREATE POLICY books_storage_owner_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket = 'books'
    AND uploaded_by = (SELECT auth.jwt() ->> 'sub')
  )
  WITH CHECK (
    bucket = 'books'
    AND uploaded_by = (SELECT auth.jwt() ->> 'sub')
  );

CREATE POLICY books_storage_owner_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket = 'books'
    AND uploaded_by = (SELECT auth.jwt() ->> 'sub')
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO anon;
