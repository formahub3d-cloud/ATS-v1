import { supabase } from '@/lib/supabase'
import type {
  Document,
  DocumentInsert,
  DocumentType,
} from '@/lib/database.types'

const BUCKET = 'employee-docs'

export type DocumentUploadInput = {
  employeeId: string
  type: DocumentType
  file: File
  expiresAt?: string | null
  uploadedBy: string
}

export type DocumentExpiryFilter = 'all' | 'expiring_30d' | 'expired'

export const documentsService = {
  async listByEmployee(employeeId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('employee_id', employeeId)
      .order('uploaded_at', { ascending: false })
    if (error) throw error
    return data ?? []
  },

  async upload(input: DocumentUploadInput): Promise<Document> {
    const ext = input.file.name.split('.').pop()?.toLowerCase() || 'bin'
    const docId = crypto.randomUUID()
    const filePath = `${input.employeeId}/${docId}.${ext}`

    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, input.file, {
        contentType: input.file.type,
        upsert: false,
      })
    if (uploadErr) throw uploadErr

    const insert: DocumentInsert = {
      id: docId,
      employee_id: input.employeeId,
      type: input.type,
      file_path: filePath,
      file_name: input.file.name,
      mime_type: input.file.type,
      size_bytes: input.file.size,
      expires_at: input.expiresAt ?? null,
      uploaded_by: input.uploadedBy,
    }

    const { data, error } = await supabase
      .from('documents')
      .insert(insert)
      .select('*')
      .single()

    if (error) {
      // best-effort cleanup del file orfano
      await supabase.storage.from(BUCKET).remove([filePath])
      throw error
    }
    return data
  },

  // Restituisce un signed URL temporaneo per scaricare/visualizzare il file.
  // Default 10 minuti — sufficiente per preview, scadenza per evitare leak.
  async getSignedUrl(filePath: string, expiresInSeconds = 600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(filePath, expiresInSeconds)
    if (error) throw error
    return data.signedUrl
  },

  async verify(documentId: string, verifierId: string): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update({
        verified_at: new Date().toISOString(),
        verified_by: verifierId,
      })
      .eq('id', documentId)
      .select('*')
      .single()
    if (error) throw error
    return data
  },

  async delete(documentId: string): Promise<void> {
    const { data: doc, error: fetchErr } = await supabase
      .from('documents')
      .select('file_path')
      .eq('id', documentId)
      .single()
    if (fetchErr) throw fetchErr

    await supabase.storage.from(BUCKET).remove([doc.file_path])
    const { error } = await supabase.from('documents').delete().eq('id', documentId)
    if (error) throw error
  },

  async countExpiringSoon(days = 30): Promise<number> {
    const limit = new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10)
    const today = new Date().toISOString().slice(0, 10)
    const { count, error } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true })
      .lte('expires_at', limit)
      .gte('expires_at', today)
    if (error) throw error
    return count ?? 0
  },
}
