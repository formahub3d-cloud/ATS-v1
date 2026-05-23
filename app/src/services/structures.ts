import { supabase } from '@/lib/supabase'
import type {
  Structure,
  StructureInsert,
  StructureUpdate,
} from '@/lib/database.types'

export type StructureListFilters = {
  search?: string
  activeOnly?: boolean
}

export const structuresService = {
  async list(filters: StructureListFilters = {}): Promise<Structure[]> {
    let query = supabase
      .from('structures')
      .select('*')
      .order('ragione_sociale', { ascending: true })

    if (filters.activeOnly !== false) {
      query = query.eq('active', true)
    }

    if (filters.search?.trim()) {
      const term = `%${filters.search.trim()}%`
      query = query.or(
        `ragione_sociale.ilike.${term},citta.ilike.${term},piva.ilike.${term}`,
      )
    }

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  },

  async getById(id: string): Promise<Structure | null> {
    const { data, error } = await supabase
      .from('structures')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    return data
  },

  async create(input: StructureInsert): Promise<Structure> {
    const { data, error } = await supabase
      .from('structures')
      .insert(input)
      .select('*')
      .single()
    if (error) throw error
    return data
  },

  async update(id: string, patch: StructureUpdate): Promise<Structure> {
    const { data, error } = await supabase
      .from('structures')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    return data
  },

  // Soft-delete: preferiamo deattivare. La hard-delete resta esclusivamente
  // amministrativa e si fa via dashboard / SQL Editor quando serve.
  async deactivate(id: string): Promise<Structure> {
    return this.update(id, { active: false })
  },

  async reactivate(id: string): Promise<Structure> {
    return this.update(id, { active: true })
  },

  async countActive(): Promise<number> {
    const { count, error } = await supabase
      .from('structures')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)
    if (error) throw error
    return count ?? 0
  },
}
