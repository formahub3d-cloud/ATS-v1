// Tipi del database — rigenerabili da Supabase CLI man mano che lo schema cresce.
// Riflettono le migrazioni 20260508000001..20260509000004.
// Quando lo schema si stabilizza, sostituire con l'output di:
//   supabase gen types typescript --project-id pvzbuitpgeowzgbognqa > src/lib/database.types.ts

export type UserRole = 'admin' | 'structure' | 'employee'

export type DocumentType =
  | 'id_card'
  | 'tax_code'
  | 'iban_proof'
  | 'haccp'
  | 'health_cert'
  | 'contract'
  | 'other'

export type ContractType =
  | 'a_chiamata'
  | 'tempo_determinato'
  | 'tempo_indeterminato'
  | 'occasionale'

export type EmployeeSkill =
  | 'cameriere'
  | 'cuoco'
  | 'barista'
  | 'runner'
  | 'lavapiatti'
  | 'capo_servizio'

type Timestamps = {
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Timestamps & {
          id: string
          role: UserRole
          full_name: string | null
          phone: string | null
          avatar_url: string | null
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
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }

      structures: {
        Row: Timestamps & {
          id: string
          owner_id: string | null
          ragione_sociale: string
          piva: string | null
          cf: string | null
          sdi: string | null
          email: string | null
          phone: string | null
          website: string | null
          indirizzo: string | null
          cap: string | null
          citta: string | null
          provincia: string | null
          paese: string
          contact_name: string | null
          contact_role: string | null
          contact_phone: string | null
          notes: string | null
          active: boolean
        }
        Insert: {
          id?: string
          owner_id?: string | null
          ragione_sociale: string
          piva?: string | null
          cf?: string | null
          sdi?: string | null
          email?: string | null
          phone?: string | null
          website?: string | null
          indirizzo?: string | null
          cap?: string | null
          citta?: string | null
          provincia?: string | null
          paese?: string
          contact_name?: string | null
          contact_role?: string | null
          contact_phone?: string | null
          notes?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['structures']['Insert']>
        Relationships: []
      }

      employees: {
        Row: Timestamps & {
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
          skills: EmployeeSkill[]
          bio: string | null
          home_address: string | null
          home_city: string | null
          home_province: string | null
        }
        Insert: {
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
          skills?: EmployeeSkill[]
          bio?: string | null
          home_address?: string | null
          home_city?: string | null
          home_province?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['employees']['Insert']>
        Relationships: []
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
        Insert: {
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
        Update: Partial<Database['public']['Tables']['documents']['Insert']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
      document_type: DocumentType
    }
    CompositeTypes: Record<string, never>
  }
}

// Type aliases ergonomici per il codice applicativo.
export type Profile    = Database['public']['Tables']['profiles']['Row']
export type Structure  = Database['public']['Tables']['structures']['Row']
export type Employee   = Database['public']['Tables']['employees']['Row']
export type Document   = Database['public']['Tables']['documents']['Row']

export type StructureInsert = Database['public']['Tables']['structures']['Insert']
export type StructureUpdate = Database['public']['Tables']['structures']['Update']
export type EmployeeInsert  = Database['public']['Tables']['employees']['Insert']
export type EmployeeUpdate  = Database['public']['Tables']['employees']['Update']
export type DocumentInsert  = Database['public']['Tables']['documents']['Insert']
