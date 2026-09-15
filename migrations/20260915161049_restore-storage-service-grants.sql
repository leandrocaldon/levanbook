-- Best-effort re-grant of the storage grants that the hardening migration
-- tried to revoke. Note: on InsForge the storage schema is owned by postgres,
-- so both the earlier REVOKEs and these GRANTs are silent no-ops for
-- project_admin — the platform baseline (authenticated: full access, anon:
-- none) was never actually changed. Kept for migration-history consistency.

GRANT USAGE ON SCHEMA storage TO anon;
GRANT SELECT ON storage.objects TO anon;
