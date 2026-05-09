// Tipi del database — rigenerati da Supabase CLI man mano che lo schema cresce.
// Per ora stub manuale che riflette le migrazioni:
//   20260508000001_init_auth.sql       → profiles, user_role
//   20260509000003_structures.sql      → structures, structure_photos, structure_status
// Quando lo schema sarà più ampio si passerà a:
//   supabase gen types typescript --project-id pvzbuitpgeowzgbognqa > src/lib/database.types.ts

export type UserRole = 'admin' | 'structure' | 'employee'

export type StructureStatus = 'pending_review' | 'approved' | 'rejected' | 'suspended'

export type PaymentMethod = 'carta' | 'sepa'

export type ContractType =
  | 'a_chiamata'
  | 'tempo_determinato'
  | 'tempo_indeterminato'
  | 'occasionale'

export type DocumentType =
  | 'id_card'
  | 'tax_code'
  | 'iban_proof'
  | 'haccp'
  | 'health_cert'
  | 'contract'
  | 'other'

export type ShiftStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type ShiftLikeAction = 'like' | 'skip'

export type EmployeeExperience = {
  id?: string
  ruolo?: string
  tipoStruttura?: string
  periodoDa?: string
  periodoA?: string
}

export type EmployeeCertification = {
  id?: string
  tipo?: string
  rilascio?: string
  scadenza?: string
}

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

type EmployeeInsert = {
  id: string
  cf?: string | null
  iban?: string | null
  birth_date?: string | null
  birth_place?: string | null
  contract_type?: ContractType | null
  hourly_rate?: number | null
  weekly_hours_max?: number | null
  hire_date?: string | null
  termination_date?: string | null
  active?: boolean
  skills?: unknown[]
  bio?: string | null
  home_address?: string | null
  home_city?: string | null
  home_province?: string | null
  // Aggiunte mig 7 (onboarding wizard)
  video_attestation_path?: string | null
  experiences?: EmployeeExperience[]
  certifications?: EmployeeCertification[]
  preferred_zone?: string | null
  min_hourly_rate?: number | null
  tag_valori?: string[]
  navetta_driver?: boolean
  onboarding_completed_at?: string | null
  created_at?: string
  updated_at?: string
}

type DocumentInsert = {
  id?: string
  employee_id: string
  type: DocumentType
  file_path: string
  file_name?: string | null
  mime_type?: string | null
  size_bytes?: number | null
  expires_at?: string | null
  uploaded_at?: string
  uploaded_by?: string | null
  verified_at?: string | null
  verified_by?: string | null
}

type ShiftInsert = {
  id?: string
  structure_id: string
  employee_id?: string | null
  status?: ShiftStatus
  shift_date: string
  time_start: string
  time_end: string
  role: string
  notes?: string | null
  hourly_rate: number
  estimated_hours?: number | null
  qr_token?: string | null
  check_in_at?: string | null
  check_out_at?: string | null
  check_in_lat?: number | null
  check_in_lng?: number | null
  no_show_reason?: string | null
  created_by?: string | null
  created_at?: string
  updated_at?: string
  assigned_at?: string | null
  cancelled_at?: string | null
  cancellation_reason?: string | null
}

type ShiftLikeInsert = {
  id?: string
  shift_id: string
  employee_id: string
  action: ShiftLikeAction
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
      employees: {
        Row: {
          id: string
          cf: string | null
          iban: string | null
          birth_date: string | null
          birth_place: string | null
          contract_type: ContractType | null
          hourly_rate: number | null
          weekly_hours_max: number | null
          hire_date: string | null
          termination_date: string | null
          active: boolean
          skills: unknown[]
          bio: string | null
          home_address: string | null
          home_city: string | null
          home_province: string | null
          video_attestation_path: string | null
          experiences: EmployeeExperience[]
          certifications: EmployeeCertification[]
          preferred_zone: string | null
          min_hourly_rate: number | null
          tag_valori: string[]
          navetta_driver: boolean
          onboarding_completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: EmployeeInsert
        Update: Partial<EmployeeInsert>
        Relationships: [
          {
            foreignKeyName: 'employees_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      documents: {
        Row: {
          id: string
          employee_id: string
          type: DocumentType
          file_path: string
          file_name: string | null
          mime_type: string | null
          size_bytes: number | null
          expires_at: string | null
          uploaded_at: string
          uploaded_by: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: DocumentInsert
        Update: Partial<DocumentInsert>
        Relationships: [
          {
            foreignKeyName: 'documents_employee_id_fkey'
            columns: ['employee_id']
            isOneToOne: false
            referencedRelation: 'employees'
            referencedColumns: ['id']
          },
        ]
      }
      shifts: {
        Row: {
          id: string
          structure_id: string
          employee_id: string | null
          status: ShiftStatus
          shift_date: string
          time_start: string
          time_end: string
          role: string
          notes: string | null
          hourly_rate: number
          estimated_hours: number | null
          qr_token: string | null
          check_in_at: string | null
          check_out_at: string | null
          check_in_lat: number | null
          check_in_lng: number | null
          no_show_reason: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          assigned_at: string | null
          cancelled_at: string | null
          cancellation_reason: string | null
        }
        Insert: ShiftInsert
        Update: Partial<ShiftInsert>
        Relationships: [
          {
            foreignKeyName: 'shifts_structure_id_fkey'
            columns: ['structure_id']
            isOneToOne: false
            referencedRelation: 'structures'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'shifts_employee_id_fkey'
            columns: ['employee_id']
            isOneToOne: false
            referencedRelation: 'employees'
            referencedColumns: ['id']
          },
        ]
      }
      shift_likes: {
        Row: {
          id: string
          shift_id: string
          employee_id: string
          action: ShiftLikeAction
          created_at: string
        }
        Insert: ShiftLikeInsert
        Update: Partial<ShiftLikeInsert>
        Relationships: [
          {
            foreignKeyName: 'shift_likes_shift_id_fkey'
            columns: ['shift_id']
            isOneToOne: false
            referencedRelation: 'shifts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'shift_likes_employee_id_fkey'
            columns: ['employee_id']
            isOneToOne: false
            referencedRelation: 'employees'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      generate_shift_qr_token: {
        Args: Record<string, never>
        Returns: string
      }
      shift_check_in: {
        Args: { p_qr_token: string; p_lat?: number | null; p_lng?: number | null }
        Returns: string
      }
      shift_check_out: {
        Args: { p_shift_id: string }
        Returns: number
      }
      current_user_role: {
        Args: Record<string, never>
        Returns: UserRole
      }
    }
    Enums: {
      user_role: UserRole
      structure_status: StructureStatus
      contract_type: ContractType
      document_type: DocumentType
      shift_status: ShiftStatus
      shift_like_action: ShiftLikeAction
    }
  }
}
