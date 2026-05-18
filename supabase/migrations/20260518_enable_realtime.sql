-- Enable Supabase Realtime for all transactional tables.
-- Run this in Supabase Dashboard -> SQL Editor.
--
-- Note: user_roles is intentionally excluded because it is read once at auth
-- time and does not need a live channel.

-- Ensure REPLICA IDENTITY FULL so UPDATE/DELETE payloads include the old row.
-- Without this, realtime payloads for UPDATE/DELETE only contain the primary key.
ALTER TABLE public.students            REPLICA IDENTITY FULL;
ALTER TABLE public.matkul              REPLICA IDENTITY FULL;
ALTER TABLE public.clos                REPLICA IDENTITY FULL;
ALTER TABLE public.student_clos        REPLICA IDENTITY FULL;
ALTER TABLE public.prodi               REPLICA IDENTITY FULL;
ALTER TABLE public.admin_users         REPLICA IDENTITY FULL;
ALTER TABLE public.jobs                REPLICA IDENTITY FULL;
ALTER TABLE public.job_skills          REPLICA IDENTITY FULL;
ALTER TABLE public.requirements        REPLICA IDENTITY FULL;
ALTER TABLE public.applications        REPLICA IDENTITY FULL;
ALTER TABLE public.talent_invitations  REPLICA IDENTITY FULL;

-- Add tables to the supabase_realtime publication.
-- Using DO block so re-running the migration is safe (skips tables already in
-- the publication instead of erroring out).
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'students',
    'matkul',
    'clos',
    'student_clos',
    'prodi',
    'admin_users',
    'jobs',
    'job_skills',
    'requirements',
    'applications',
    'talent_invitations'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END
$$;

-- Verify: this SELECT should return all 11 tables above.
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
