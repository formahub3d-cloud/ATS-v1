import { supabase } from '@/lib/supabase'
import type {
  Employee,
  EmployeeInsert,
  EmployeeUpdate,
  EmployeeSkill,
  Profile,
} from '@/lib/database.types'

export type EmployeeWithProfile = Employee & {
  profile: Pick<Profile, 'id' | 'full_name' | 'phone' | 'avatar_url'>
}

export type EmployeeListFilters = {
  search?: string
  activeOnly?: boolean
  skill?: EmployeeSkill
}

export const employeesService = {
  async list(filters: EmployeeListFilters = {}): Promise<EmployeeWithProfile[]> {
    let query = supabase
      .from('employees')
      .select(
        `
          *,
          profile:profiles!employees_id_fkey ( id, full_name, phone, avatar_url )
        `,
      )
      .order('created_at', { ascending: false })

    if (filters.activeOnly !== false) {
      query = query.eq('active', true)
    }

    if (filters.skill) {
      query = query.contains('skills', [filters.skill])
    }

    const { data, error } = await query
    if (error) throw error

    let rows = (data ?? []) as unknown as EmployeeWithProfile[]

    if (filters.search?.trim()) {
      const term = filters.search.trim().toLowerCase()
      rows = rows.filter((r) =>
        [r.profile?.full_name, r.cf, r.home_city]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(term)),
      )
    }

    return rows
  },

  async getById(id: string): Promise<EmployeeWithProfile | null> {
    const { data, error } = await supabase
      .from('employees')
      .select(
        `
          *,
          profile:profiles!employees_id_fkey ( id, full_name, phone, avatar_url )
        `,
      )
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data as unknown as EmployeeWithProfile | null
  },

  // Crea il record employees per un profilo già esistente con role='employee'.
  // L'id deve essere quello del profilo (pk shared con profiles).
  async create(input: EmployeeInsert): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .insert(input)
      .select('*')
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, patch: EmployeeUpdate): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    return data
  },

  async deactivate(id: string, terminationDate?: string): Promise<Employee> {
    return this.update(id, {
      active: false,
      termination_date: terminationDate ?? new Date().toISOString().slice(0, 10),
    })
  },

  async reactivate(id: string): Promise<Employee> {
    return this.update(id, { active: true, termination_date: null })
  },

  async countActive(): Promise<number> {
    const { count, error } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)
    if (error) throw error
    return count ?? 0
  },
}
