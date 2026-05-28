import { useEffect, useRef, useState } from 'react'
import {
  Upload, FileText, ExternalLink, Trash2, CheckCircle2, AlertTriangle, Loader2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/ToastSystem'

import { useAuth } from '@/context/AuthContext'
import { documentsService } from '@/services/documents'
import type { Document, DocumentType } from '@/lib/database.types'

const DOC_TYPE_LABELS: Record<DocumentType, string> = {
  id_card: 'Carta d’identità',
  tax_code: 'Codice fiscale / TS',
  iban_proof: 'IBAN (estratto/conto)',
  haccp: 'Attestato HACCP',
  health_cert: 'Idoneità sanitaria',
  contract: 'Contratto firmato',
  other: 'Altro',
}

const DOC_TYPE_ORDER: DocumentType[] = [
  'id_card',
  'tax_code',
  'iban_proof',
  'haccp',
  'health_cert',
  'contract',
  'other',
]

const MAX_SIZE_MB = 10
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

type Props = {
  employeeId: string
  /** Se true mostra azioni di "verifica" e "elimina" riservate all'admin. */
  canVerify?: boolean
  /** Se true permette upload (sempre true per il proprio profilo o per admin). */
  canUpload?: boolean
}

export default function EmployeeDocuments({
  employeeId,
  canVerify = false,
  canUpload = true,
}: Props) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [docType, setDocType] = useState<DocumentType>('id_card')
  const [expiresAt, setExpiresAt] = useState('')

  const fetchDocs = async () => {
    setLoading(true)
    try {
      const data = await documentsService.listByEmployee(employeeId)
      setDocuments(data)
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Errore',
        message: err instanceof Error ? err.message : 'Errore caricamento documenti',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (employeeId) void fetchDocs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId])

  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      addToast({
        type: 'error',
        title: 'File troppo grande',
        message: `Max ${MAX_SIZE_MB} MB. Questo file pesa ${(f.size / 1024 / 1024).toFixed(1)} MB.`,
      })
      return
    }
    if (!ALLOWED_MIME.includes(f.type)) {
      addToast({
        type: 'error',
        title: 'Formato non supportato',
        message: 'Carica JPG, PNG, WebP o PDF.',
      })
      return
    }
    setPendingFile(f)
    setUploadDialogOpen(true)
  }

  const confirmUpload = async () => {
    if (!pendingFile || !user) return
    setUploading(true)
    try {
      await documentsService.upload({
        employeeId,
        type: docType,
        file: pendingFile,
        expiresAt: expiresAt || null,
        uploadedBy: user.id,
      })
      addToast({ type: 'success', title: 'Caricato', message: pendingFile.name })
      setUploadDialogOpen(false)
      setPendingFile(null)
      setExpiresAt('')
      setDocType('id_card')
      if (fileInputRef.current) fileInputRef.current.value = ''
      await fetchDocs()
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Upload fallito',
        message: err instanceof Error ? err.message : 'Errore sconosciuto',
      })
    } finally {
      setUploading(false)
    }
  }

  const openDoc = async (doc: Document) => {
    try {
      const url = await documentsService.getSignedUrl(doc.file_path, 600)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Errore download',
        message: err instanceof Error ? err.message : 'Impossibile generare il link',
      })
    }
  }

  const verifyDoc = async (doc: Document) => {
    if (!user) return
    try {
      await documentsService.verify(doc.id, user.id)
      addToast({ type: 'success', title: 'Verificato', message: DOC_TYPE_LABELS[doc.type] })
      await fetchDocs()
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Errore',
        message: err instanceof Error ? err.message : 'Errore verifica',
      })
    }
  }

  const deleteDoc = async (doc: Document) => {
    if (!confirm(`Eliminare il documento "${doc.file_name || DOC_TYPE_LABELS[doc.type]}"?`)) return
    try {
      await documentsService.delete(doc.id)
      addToast({ type: 'success', title: 'Eliminato' })
      await fetchDocs()
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Errore',
        message: err instanceof Error ? err.message : 'Eliminazione fallita',
      })
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const in30days = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10)

  const isExpired = (d: Document) =>
    d.expires_at !== null && d.expires_at !== undefined && d.expires_at < today
  const isExpiringSoon = (d: Document) =>
    d.expires_at !== null && d.expires_at !== undefined &&
    d.expires_at >= today && d.expires_at <= in30days

  // Raggruppo per tipo, ordinato.
  const grouped = DOC_TYPE_ORDER.map((t) => ({
    type: t,
    docs: documents.filter((d) => d.type === t),
  }))

  return (
    <div className="space-y-4" data-testid={`employee-documents-${employeeId}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">Documenti</h3>
          <p className="text-xs text-muted-foreground">
            Formati supportati: JPG, PNG, WebP, PDF — max {MAX_SIZE_MB} MB per file.
          </p>
        </div>
        {canUpload && (
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            data-testid="document-upload-btn"
          >
            <Upload className="mr-2 h-4 w-4" />
            Carica documento
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={ALLOWED_MIME.join(',')}
          onChange={handleFileChosen}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">
          <Loader2 className="inline h-5 w-5 animate-spin" />
        </div>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nessun documento caricato.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {grouped.map(({ type, docs }) => {
            if (docs.length === 0) return null
            return (
              <Card key={type}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-sm">{DOC_TYPE_LABELS[type]}</h4>
                    <Badge variant="outline" className="text-xs">
                      {docs.length} file
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {docs.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between p-3 rounded-md border bg-muted/30"
                        data-testid={`document-row-${d.id}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">
                              {d.file_name ?? 'documento'}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>
                                {new Date(d.uploaded_at).toLocaleDateString('it-IT')}
                              </span>
                              {d.size_bytes != null && (
                                <span>· {(d.size_bytes / 1024).toFixed(0)} KB</span>
                              )}
                              {d.expires_at && (
                                <span>· scade {new Date(d.expires_at).toLocaleDateString('it-IT')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isExpired(d) ? (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Scaduto
                            </Badge>
                          ) : isExpiringSoon(d) ? (
                            <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs">
                              In scadenza
                            </Badge>
                          ) : null}
                          {d.verified_at ? (
                            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verificato
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">In attesa</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => void openDoc(d)}
                            title="Apri"
                            data-testid={`document-open-${d.id}`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          {canVerify && !d.verified_at && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => void verifyDoc(d)}
                              title="Marca come verificato"
                              data-testid={`document-verify-${d.id}`}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          {canVerify && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => void deleteDoc(d)}
                              title="Elimina"
                              data-testid={`document-delete-${d.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma caricamento</DialogTitle>
          </DialogHeader>
          {pendingFile && (
            <div className="space-y-4">
              <div className="p-3 rounded-md border bg-muted/40">
                <div className="text-sm font-medium">{pendingFile.name}</div>
                <div className="text-xs text-muted-foreground">
                  {(pendingFile.size / 1024).toFixed(0)} KB — {pendingFile.type}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tipo documento</Label>
                <Select value={docType} onValueChange={(v) => setDocType(v as DocumentType)}>
                  <SelectTrigger data-testid="document-type-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOC_TYPE_ORDER.map((t) => (
                      <SelectItem key={t} value={t}>
                        {DOC_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expires_at">Data di scadenza (opzionale)</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  data-testid="document-expires-input"
                />
                <p className="text-xs text-muted-foreground">
                  Utile per HACCP, idoneità sanitaria, carta d&apos;identità.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setUploadDialogOpen(false)
                setPendingFile(null)
              }}
            >
              Annulla
            </Button>
            <Button
              onClick={() => void confirmUpload()}
              disabled={uploading || !pendingFile}
              data-testid="document-upload-confirm"
            >
              {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Carica
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
