// EmployeeDocuments — pagina per il dipendente: upload e lista documenti
// (HACCP, idoneità sanitaria, carta d'identità, contratti, ecc.).
// I file vivono nel bucket Storage `employee-docs/{user_id}/...`.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, Upload, AlertCircle, CheckCircle, Clock, X,
  Trash2, Calendar, RefreshCw, ShieldCheck, Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import GlassBottomNav from '@/components/employee/GlassBottomNav'
import StatusScreen from '@/components/structure/StatusScreen'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/ToastSystem'
import { supabase } from '@/lib/supabase'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAuth } from '@/context/AuthContext'
import type { Database, DocumentType } from '@/lib/database.types'

type DocumentRow = Database['public']['Tables']['documents']['Row']

const DOC_TYPES: { value: DocumentType; label: string; description: string }[] = [
  { value: 'haccp',       label: 'Attestato HACCP', description: 'Obbligatorio per la somministrazione alimentare.' },
  { value: 'health_cert', label: 'Idoneità sanitaria', description: 'Visita medica con scadenza annuale.' },
  { value: 'id_card',     label: "Carta d'identità", description: "Documento d'identità in corso di validità." },
  { value: 'tax_code',    label: 'Codice fiscale / Tessera sanitaria', description: '' },
  { value: 'iban_proof',  label: 'Prova IBAN', description: 'Estratto conto o documento bancario con IBAN.' },
  { value: 'contract',    label: 'Contratto firmato', description: 'Contratto di lavoro firmato (PDF).' },
  { value: 'other',       label: 'Altro', description: 'Qualsiasi altro documento utile.' },
]

const DOC_TYPE_LABEL = Object.fromEntries(DOC_TYPES.map((d) => [d.value, d.label])) as Record<DocumentType, string>

/** Stato di scadenza visivo. */
function expiryStatus(expiresAt: string | null): 'expired' | 'soon' | 'ok' | 'none' {
  if (!expiresAt) return 'none'
  const now = Date.now()
  const exp = new Date(expiresAt).getTime()
  const days = (exp - now) / (1000 * 60 * 60 * 24)
  if (days < 0) return 'expired'
  if (days < 30) return 'soon'
  return 'ok'
}

export default function EmployeeDocuments() {
  usePageTitle('Documenti')
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { user, status: authStatus } = useAuth()
  const [docs, setDocs] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [type, setType] = useState<DocumentType>('haccp')
  const [expiresAt, setExpiresAt] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setFetchError(null)
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('employee_id', user.id)
        .order('uploaded_at', { ascending: false })
      if (error) throw error
      setDocs(data ?? [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore caricamento documenti'
      console.error('[EmployeeDocuments] fetch error', err)
      setFetchError(message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (authStatus === 'loading') return
    if (authStatus === 'anonymous' || !user) {
      navigate('/auth')
      return
    }
    void load()
  }, [authStatus, user, load, navigate])

  const handleUpload = async (file: File) => {
    if (!user) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf'
      const path = `${user.id}/${crypto.randomUUID()}-${type}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('employee-docs')
        .upload(path, file, { contentType: file.type, upsert: false })
      if (upErr) throw upErr

      const { error: docErr } = await supabase.from('documents').insert({
        employee_id: user.id,
        type,
        file_path: path,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        expires_at: expiresAt || null,
        uploaded_by: user.id,
      })
      if (docErr) throw docErr

      addToast({ type: 'success', title: 'Documento caricato', message: DOC_TYPE_LABEL[type] })
      setExpiresAt('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      await load()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload fallito'
      addToast({ type: 'error', title: 'Errore', message })
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (doc: DocumentRow) => {
    try {
      const { data, error } = await supabase.storage
        .from('employee-docs')
        .createSignedUrl(doc.file_path, 60)
      if (error || !data) throw error ?? new Error('No URL')
      window.open(data.signedUrl, '_blank')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore'
      addToast({ type: 'error', title: 'Download fallito', message })
    }
  }

  // Raggruppa per tipo per il rendering.
  const byType = useMemo(() => {
    const m = new Map<DocumentType, DocumentRow[]>()
    for (const d of docs) {
      const arr = m.get(d.type) ?? []
      arr.push(d)
      m.set(d.type, arr)
    }
    return m
  }, [docs])

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#06101E] pb-24">
        <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(6,16,30,0.9)] backdrop-blur-xl">
          <div className="max-w-[640px] mx-auto px-4 h-16 flex items-center">
            <h1 className="text-xl font-bold text-white">I miei documenti</h1>
          </div>
        </header>
        <div className="max-w-[640px] mx-auto px-4 py-6 space-y-3">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
        <GlassBottomNav />
      </div>
    )
  }

  if (fetchError) {
    return (
      <>
        <StatusScreen
          icon={AlertCircle}
          iconColor="#F04545"
          title="Impossibile caricare i documenti"
          description={fetchError}
          primaryAction={{ label: 'Riprova', onClick: () => void load() }}
        />
        <GlassBottomNav />
      </>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#06101E] pb-24">
      <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(6,16,30,0.9)] backdrop-blur-xl">
        <div className="max-w-[640px] mx-auto px-4 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">I miei documenti</h1>
            <p className="text-xs text-text-muted">{docs.length} document{docs.length === 1 ? 'o' : 'i'} caricat{docs.length === 1 ? 'o' : 'i'}</p>
          </div>
          <button
            onClick={() => void load()}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Aggiorna"
          >
            <RefreshCw className="w-5 h-5 text-text-muted" />
          </button>
        </div>
      </header>

      <div className="max-w-[640px] mx-auto px-4 py-6 space-y-6">
        {/* Upload form */}
        <div className="rounded-2xl border border-[rgba(91,184,245,0.2)] bg-[rgba(13,30,52,0.7)] backdrop-blur-md p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-sky-primary" />
            Carica un nuovo documento
          </h2>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Tipo documento</Label>
              <Select value={type} onValueChange={(v) => setType(v as DocumentType)}>
                <SelectTrigger className="bg-[rgba(13,30,52,0.6)] border-[rgba(255,255,255,0.08)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[rgba(13,30,52,0.95)] border-[rgba(91,184,245,0.15)]">
                  {DOC_TYPES.map((d) => (
                    <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {DOC_TYPES.find((d) => d.value === type)?.description && (
                <p className="text-xs text-text-muted">{DOC_TYPES.find((d) => d.value === type)?.description}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-primary" />
                Scadenza (opzionale)
              </Label>
              <Input
                type="date"
                value={expiresAt}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="bg-[rgba(13,30,52,0.6)] border-[rgba(255,255,255,0.08)]"
              />
            </div>

            <div className="space-y-1.5">
              <Label>File (PDF, JPG, PNG)</Label>
              <Input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) void handleUpload(f)
                }}
                disabled={uploading}
                className="bg-[rgba(13,30,52,0.6)] border-[rgba(255,255,255,0.08)] cursor-pointer"
              />
              <p className="text-xs text-text-muted">{uploading ? 'Caricamento in corso…' : 'Max 10 MB'}</p>
            </div>
          </div>
        </div>

        {/* Lista documenti raggruppati per tipo */}
        {docs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
            <EmptyState
              icon={FileText}
              title="Nessun documento ancora"
              description="Carica i tuoi documenti (HACCP, idoneità, ID) per essere abilitato a tutti i tipi di turno."
            />
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from(byType.entries()).map(([t, list]) => (
              <section key={t}>
                <h3 className="text-xs uppercase tracking-wider text-sky-primary font-semibold mb-2">
                  {DOC_TYPE_LABEL[t]}
                </h3>
                <div className="space-y-2">
                  {list.map((d) => {
                    const status = expiryStatus(d.expires_at)
                    return (
                      <DocItem key={d.id} doc={d} status={status} onDownload={() => void handleDownload(d)} />
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <GlassBottomNav />
    </div>
  )
}

function DocItem({
  doc, status, onDownload,
}: {
  doc: DocumentRow
  status: 'expired' | 'soon' | 'ok' | 'none'
  onDownload: () => void
}) {
  return (
    <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(13,30,52,0.5)] p-3 flex items-center gap-3">
      <div className={cn(
        'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
        status === 'expired' ? 'bg-[rgba(240,69,69,0.12)] border border-[rgba(240,69,69,0.3)]' :
        status === 'soon'    ? 'bg-[rgba(245,184,0,0.12)] border border-[rgba(245,184,0,0.3)]' :
                               'bg-[rgba(91,184,245,0.12)] border border-[rgba(91,184,245,0.3)]',
      )}>
        <FileText className={cn(
          'w-4 h-4',
          status === 'expired' ? 'text-[#F04545]' :
          status === 'soon'    ? 'text-[#F5B800]' :
                                 'text-sky-primary',
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{doc.file_name ?? doc.file_path.split('/').pop()}</p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-text-muted">
          <span>{new Date(doc.uploaded_at).toLocaleDateString('it-IT')}</span>
          {doc.expires_at && (
            <>
              <span>·</span>
              <span className={cn(
                'flex items-center gap-1',
                status === 'expired' ? 'text-[#F04545] font-medium' :
                status === 'soon'    ? 'text-[#F5B800] font-medium' :
                                       'text-text-muted',
              )}>
                <Clock className="w-3 h-3" />
                {status === 'expired' ? 'Scaduto il ' : 'Scade il '}
                {new Date(doc.expires_at).toLocaleDateString('it-IT')}
              </span>
            </>
          )}
          {doc.verified_at && (
            <>
              <span>·</span>
              <span className="text-[#1EC99A] flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Verificato
              </span>
            </>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onDownload}
        className="p-1.5 rounded-lg text-text-muted hover:text-sky-primary hover:bg-white/5 transition-colors"
        aria-label="Scarica"
      >
        <Download className="w-4 h-4" />
      </button>
    </div>
  )
}
