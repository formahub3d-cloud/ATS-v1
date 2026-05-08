// Tipi del database — rigenerati da Supabase CLI man mano che lo schema cresce.
// Per ora stub minimale che riflette la migrazione 20260508000001_init_auth.sql.
// Quando lo schema sarà completo si potrà sostituire con l'output di:
//   supabase gen types typescript --project-id pvzbuitpgeowzgbognqa > src/lib/database.types.ts

export type UserRole = 'admin' | 'structure' | 'employee'

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
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: UserRole
    }
  }
}
