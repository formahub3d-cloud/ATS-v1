-- ATS-v1 · Migrazione 21: 2 strutture demo in stato pending_review
-- ============================================================================
-- Aggiunge 2 candidature pendenti alla pagina /admin/structures così l'admin
-- può esercitare il flusso approva/rifiuta. Idempotente.
-- ============================================================================

do $$
begin
  perform public._seed_demo_user(md5('seed:user:struct:pend1')::uuid, 'demo-pending1@ats-demo.local', 'structure', 'Osteria del Marchese');
  perform public._seed_demo_user(md5('seed:user:struct:pend2')::uuid, 'demo-pending2@ats-demo.local', 'structure', 'Beach Club Solanto');
end $$;

insert into public.structures (
  id, user_id, status, ragione_sociale, piva, sede_legale,
  referente_nome, referente_ruolo, referente_telefono, referente_email,
  tipo_struttura, zona, descrizione,
  ruoli_cercati, persone_per_turno, tag_valori,
  accettato_contratto, accettato_contratto_at,
  created_at
) values
  (md5('seed:struct:pend1')::uuid, md5('seed:user:struct:pend1')::uuid, 'pending_review',
   'Osteria del Marchese S.a.s.', '11122233344', 'Via San Pasquale 18, 82100 Benevento (BN)',
   'Lorenzo Marchesi', 'Titolare', '+39 0824 999111', 'demo-pending1@ats-demo.local',
   'Osteria', 'Benevento centro', 'Osteria con cucina di territorio. 50 coperti, abbiamo bisogno di personale weekend.',
   array['Cameriere', 'Aiuto Cuoco'], 3, array['Tradizione', 'Famiglia'],
   true, now() - interval '6 hours', now() - interval '6 hours'),

  (md5('seed:struct:pend2')::uuid, md5('seed:user:struct:pend2')::uuid, 'pending_review',
   'Beach Club Solanto S.r.l.', '22233344455', 'Lungomare di Solanto, 82100 Benevento (BN)',
   'Valeria Costa', 'Direttrice', '+39 0824 555888', 'demo-pending2@ats-demo.local',
   'Beach Club', 'Benevento periferia', 'Beach club con ristorante e bar. Stagione estiva, cerchiamo barman e camerieri esperti.',
   array['Barman', 'Cameriere', 'Hostess'], 8, array['Eventi', 'Stagionalità'],
   true, now() - interval '2 days', now() - interval '2 days')
on conflict (id) do nothing;
