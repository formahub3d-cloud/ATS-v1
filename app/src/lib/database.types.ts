// Tipi del database — rigenerati da Supabase CLI man mano che lo schema cresce.
// Per ora stub manuale che riflette le migrazioni:
//   20260508000001_init_auth.sql       → profiles, user_role
//   20260509000003_structures.sql      → structures, structure_photos, structure_status
// Quando lo schema sarà più ampio si passerà a:
//   supabase gen types typescript --project-id pvzbuitpgeowzgbognqa > src/lib/database.types.ts

export type UserRole = 'admin' | 'structure' | 'employee'

export type StructureStatus = 'pending_review' | 'approved' | 'rejected' | 'suspended'

export type PaymentMethod = 'carta' | 'sepa'

// Estratti come alias per poterli riusare in Update senza self-reference dentro
// Database (TypeScript fatica a risolvere ricorsive in object literal types).
type StructureInsert = {
  id?: string
  user_id: string
  status?: StructureStatus
  ragione_sociale: string
  piva: string
  codice_fiscale?: string | null
  sede_legale?: string | null
  sede_operativa?: string | null
  referente_nome?: string | null
  referente_ruolo?: string | null
  referente_telefono?: string | null
  referente_email?: string | null
  tipo_struttura?: string | null
  zona?: string | null
  descrizione?: string | null
  ruoli_cercati?: string[]
  fasce_orarie?: Record<string, string>
  persone_per_turno?: number | null
  servizi_aggiuntivi?: string[]
  tag_valori?: string[]
  eventi_settimana?: number | null
  dipendenti_interni?: number | null
  esperienze_esterne?: string | null
  fatturato?: string | null
  ore_esterno_mensili?: number | null
  metodo_pagamento?: PaymentMethod | null
  video_attestazione_path?: string | null
  accettato_contratto?: boolean
  accettato_contratto_at?: string | null
  approved_at?: string | null
  approved_by?: string | null
  rejection_reason?: string | null
  created_at?: string
  updated_at?: string
}

type StructurePhotoInsert = {
  id?: string
  structure_id: string
  storage_path: string
  sort_order?: number
  created_at?: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      structures: {
        Row: {
          id: string
          user_id: string
          status: StructureStatus
          ragione_sociale: string
          piva: string
          codice_fiscale: string | null
          sede_legale: string | null
          sede_operativa: string | null
          referente_nome: string | null
          referente_ruolo: string | null
          referente_telefono: string | null
          referente_email: string | null
          tipo_struttura: string | null
          zona: string | null
          descrizione: string | null
          ruoli_cercati: string[]
          fasce_orarie: Record<string, string>
          persone_per_turno: number | null
          servizi_aggiuntivi: string[]
          tag_valori: string[]
          eventi_settimana: number | null
          dipendenti_interni: number | null
          esperienze_esterne: string | null
          fatturato: string | null
          ore_esterno_mensili: number | null
          metodo_pagamento: PaymentMethod | null
          video_attestazione_path: string | null
          accettato_contratto: boolean
          accettato_contratto_at: string | null
          approved_at: string | null
          approved_by: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: StructureInsert
        Update: Partial<StructureInsert>
        Relationships: [
          {
            foreignKeyName: 'structures_user_id_fkey'
            columns: ['user_id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'structures_approved_by_fkey'
            columns: ['approved_by']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      structure_photos: {
        Row: {
          id: string
          structure_id: string
          storage_path: string
          sort_order: number
          created_at: string
        }
        Insert: StructurePhotoInsert
        Update: Partial<StructurePhotoInsert>
        Relationships: [
          {
            foreignKeyName: 'structure_photos_structure_id_fkey'
            columns: ['structure_id']
            isOneToOne: false
            referencedRelation: 'structures'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      structure_status: StructureStatus
    }
  }
}
