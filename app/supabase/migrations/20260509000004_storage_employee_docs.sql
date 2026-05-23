-- ATS-v1 · Migrazione 5: bucket storage per documenti dipendenti
-- ----------------------------------------------------------------------------
-- Bucket privato (no public read). I file sono organizzati come:
--   employee-docs/{employee_uuid}/{document_uuid}.{ext}
-- La prima cartella deve essere l'uuid del dipendente — le policy controllano
-- esattamente questo per gating dell'accesso.
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'employee-docs',
  'employee-docs',
  false,
  10 * 1024 * 1024,           -- 10 MB per file
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]
)
on conflict (id) do nothing;

-- Admin: full access su tutto il bucket.
create policy "employee-docs: admin all"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'employee-docs'
    and public.current_user_role() = 'admin'
  )
  with check (
    bucket_id = 'employee-docs'
    and public.current_user_role() = 'admin'
  );

-- Employee: legge file della propria cartella ({uuid_dipendente}/...).
create policy "employee-docs: self read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'employee-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Employee: carica file solo nella propria cartella.
create policy "employee-docs: self insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'employee-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- (Niente UPDATE/DELETE per employee: una volta caricato il documento, solo
-- l'admin può rimuoverlo o sostituirlo. Garanzia di audit trail sui documenti
-- regolamentari come HACCP / idoneità.)
