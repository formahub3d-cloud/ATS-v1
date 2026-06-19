-- ATS-v1 · Migrazione 7: bucket Supabase Storage per le strutture
-- ----------------------------------------------------------------------------
-- Bucket privato `structure-media` che ospita sia le foto ambienti che i
-- video di attestazione delle strutture. Le RLS policy su storage.objects
-- garantiscono che ogni struttura veda/scriva SOLO la propria cartella,
-- mentre admin ha accesso completo per fare review delle candidature.
--
-- Convenzione path (il client deve rispettarla):
--   {auth.uid()}/photos/{uuid}.jpg
--   {auth.uid()}/video-attestazione/{uuid}.webm
--
-- Le policy estraggono il primo segmento con `(storage.foldername(name))[1]`.
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'structure-media',
  'structure-media',
  false,                                                     -- privato
  52428800,                                                  -- 50 MB per file (video attestazione)
  array['image/jpeg', 'image/png', 'image/webp', 'video/webm', 'video/mp4']
)
on conflict (id) do nothing;

-- INSERT: l'utente carica solo dentro la propria cartella.
create policy "structure-media: own insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'structure-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- SELECT: l'utente legge solo i propri file.
create policy "structure-media: own select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'structure-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- SELECT (admin): legge tutto il bucket per review candidature.
create policy "structure-media: admin select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'structure-media'
    and public.current_user_role() = 'admin'
  );

-- UPDATE: l'utente sovrascrive solo i propri file.
create policy "structure-media: own update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'structure-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'structure-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE: l'utente cancella solo i propri file.
create policy "structure-media: own delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'structure-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- DELETE (admin): per moderazione contenuti.
create policy "structure-media: admin delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'structure-media'
    and public.current_user_role() = 'admin'
  );
