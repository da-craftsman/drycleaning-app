-- Storage bucket RLS policies — run against the real Supabase project in the SQL editor.
-- Safe to run more than once (each policy is dropped first, if it exists).
--
-- Root cause of "new row violates row-level security policy" on thumbnail upload: the
-- `thumbnails` and `stain_photos` buckets exist, but supabase/schema.sql only ever documented
-- their RLS policies as a comment (a "create the buckets first, then apply" note) — they were
-- never actually run against the real project, so storage.objects had no INSERT policy for either
-- bucket and every upload was denied by the default-deny RLS behavior.
--
-- Prerequisite: both buckets ('thumbnails', 'stain_photos') must already exist — create them from
-- the Dashboard (Storage → New bucket) first if they don't.

-- thumbnails bucket: public read, admin write.
drop policy if exists "thumbnails_public_read" on storage.objects;
create policy "thumbnails_public_read" on storage.objects for select
  using (bucket_id = 'thumbnails');

drop policy if exists "thumbnails_admin_write" on storage.objects;
create policy "thumbnails_admin_write" on storage.objects for insert
  with check (bucket_id = 'thumbnails' and is_admin());

drop policy if exists "thumbnails_admin_update" on storage.objects;
create policy "thumbnails_admin_update" on storage.objects for update
  using (bucket_id = 'thumbnails' and is_admin())
  with check (bucket_id = 'thumbnails' and is_admin());

drop policy if exists "thumbnails_admin_delete" on storage.objects;
create policy "thumbnails_admin_delete" on storage.objects for delete
  using (bucket_id = 'thumbnails' and is_admin());

-- stain_photos bucket: owner read/write (path prefixed with their own uid), admin read.
drop policy if exists "stain_photos_own_rw" on storage.objects;
create policy "stain_photos_own_rw" on storage.objects for all
  using (bucket_id = 'stain_photos' and (auth.uid()::text = (storage.foldername(name))[1] or is_admin()))
  with check (bucket_id = 'stain_photos' and auth.uid()::text = (storage.foldername(name))[1]);
