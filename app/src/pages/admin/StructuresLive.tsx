import { useEffect, useMemo, useState } from 'react'
import { Loader2, Plus, RefreshCw, Search, Pencil, Power, PowerOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/ToastSystem'

import { useAuth } from '@/context/AuthContext'
import { structuresService } from '@/services/structures'
import type { Structure, StructureInsert } from '@/lib/database.types'

const structureSchema = z.object({
  ragione_sociale: z.string().min(2, 'Minimo 2 caratteri'),
  piva: z.string().optional().or(z.literal('')),
  cf: z.string().optional().or(z.literal('')),
  sdi: z.string().optional().or(z.literal('')),
  email: z.string().email('Email non valida').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  website: z.string().url('URL non valido').optional().or(z.literal('')),
  indirizzo: z.string().optional().or(z.literal('')),
  cap: z.string().optional().or(z.literal('')),
  citta: z.string().optional().or(z.literal('')),
  provincia: z.string().max(2, 'Sigla 2 caratteri').optional().or(z.literal('')),
  contact_name: z.string().optional().or(z.literal('')),
  contact_role: z.string().optional().or(z.literal('')),
  contact_phone: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})

type StructureFormValues = z.infer<typeof structureSchema>

const emptyForm: StructureFormValues = {
  ragione_sociale: '',
  piva: '',
  cf: '',
  sdi: '',
  email: '',
  phone: '',
  website: '',
  indirizzo: '',
  cap: '',
  citta: '',
  provincia: '',
  contact_name: '',
  contact_role: '',
  contact_phone: '',
  notes: '',
}

function toInsertPayload(values: StructureFormValues): StructureInsert {
  // I campi vuoti li mandiamo come NULL per non inquinare il DB con stringhe vuote.
  const clean = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : null)
  return {
    ragione_sociale: values.ragione_sociale.trim(),
    piva: clean(values.piva),
    cf: clean(values.cf),
    sdi: clean(values.sdi),
    email: clean(values.email),
    phone: clean(values.phone),
    website: clean(values.website),
    indirizzo: clean(values.indirizzo),
    cap: clean(values.cap),
    citta: clean(values.citta),
    provincia: clean(values.provincia)?.toUpperCase() ?? null,
    contact_name: clean(values.contact_name),
    contact_role: clean(values.contact_role),
    contact_phone: clean(values.contact_phone),
    notes: clean(values.notes),
  }
}

export default function StructuresLive() {
  const { profile, status } = useAuth()
  const { addToast } = useToast()

  const [items, setItems] = useState<Structure[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Structure | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<StructureFormValues>({
    resolver: zodResolver(structureSchema),
    defaultValues: emptyForm,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await structuresService.list({
        search,
        activeOnly: !showInactive,
      })
      setItems(data)
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Errore',
        message: err instanceof Error ? err.message : 'Errore caricamento strutture',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') void fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, showInactive])

  // Debounce della ricerca: aspettiamo 300ms di idle prima di rifare la query.
  useEffect(() => {
    if (status !== 'authenticated') return
    const t = setTimeout(() => void fetchData(), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const openCreate = () => {
    setEditing(null)
    form.reset(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (s: Structure) => {
    setEditing(s)
    form.reset({
      ragione_sociale: s.ragione_sociale,
      piva: s.piva ?? '',
      cf: s.cf ?? '',
      sdi: s.sdi ?? '',
      email: s.email ?? '',
      phone: s.phone ?? '',
      website: s.website ?? '',
      indirizzo: s.indirizzo ?? '',
      cap: s.cap ?? '',
      citta: s.citta ?? '',
      provincia: s.provincia ?? '',
      contact_name: s.contact_name ?? '',
      contact_role: s.contact_role ?? '',
      contact_phone: s.contact_phone ?? '',
      notes: s.notes ?? '',
    })
    setDialogOpen(true)
  }

  const onSubmit = async (values: StructureFormValues) => {
    const payload = toInsertPayload(values)
    setSubmitting(true)
    try {
      if (editing) {
        await structuresService.update(editing.id, payload)
        addToast({ type: 'success', title: 'Salvato', message: 'Struttura aggiornata.' })
      } else {
        await structuresService.create(payload)
        addToast({ type: 'success', title: 'Creata', message: 'Nuova struttura aggiunta.' })
      }
      setDialogOpen(false)
      await fetchData()
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Errore salvataggio',
        message: err instanceof Error ? err.message : 'Errore sconosciuto',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (s: Structure) => {
    try {
      if (s.active) await structuresService.deactivate(s.id)
      else await structuresService.reactivate(s.id)
      await fetchData()
      addToast({
        type: 'success',
        title: s.active ? 'Disattivata' : 'Riattivata',
        message: s.ragione_sociale,
      })
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Errore',
        message: err instanceof Error ? err.message : 'Operazione fallita',
      })
    }
  }

  const counts = useMemo(
    () => ({
      total: items.length,
      active: items.filter((i) => i.active).length,
    }),
    [items],
  )

  if (status !== 'authenticated' || profile?.role !== 'admin') {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Accesso riservato</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Questa pagina è riservata agli amministratori. Effettua il login con un account admin.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="admin-structures-live">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Strutture (clienti)</h1>
          <p className="text-sm text-muted-foreground">
            Anagrafica clienti che richiedono servizi catering. Dati live da Supabase.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => void fetchData()} title="Ricarica">
            <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
          </Button>
          <Button onClick={openCreate} data-testid="structures-new-btn">
            <Plus className="mr-2 h-4 w-4" /> Nuova struttura
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per nome, città o P.IVA…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="structures-search"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="show-inactive"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <Label htmlFor="show-inactive" className="cursor-pointer">
                Mostra disattivate
              </Label>
            </div>
            <div className="text-sm text-muted-foreground ml-auto">
              {counts.active}/{counts.total} attive
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ragione sociale</TableHead>
                  <TableHead>Città</TableHead>
                  <TableHead>P.IVA</TableHead>
                  <TableHead>Referente</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="w-[120px] text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <Loader2 className="inline h-5 w-5 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                      Nessuna struttura trovata. Premi "Nuova struttura" per iniziare.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((s) => (
                    <TableRow key={s.id} data-testid={`structure-row-${s.id}`}>
                      <TableCell className="font-medium">{s.ragione_sociale}</TableCell>
                      <TableCell>
                        {s.citta ? (
                          <span>
                            {s.citta} {s.provincia ? `(${s.provincia})` : ''}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {s.piva ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {s.contact_name ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {s.active ? (
                          <Badge variant="default" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                            Attiva
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Disattivata</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(s)}
                          title="Modifica"
                          data-testid={`structure-edit-${s.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => void toggleActive(s)}
                          title={s.active ? 'Disattiva' : 'Riattiva'}
                          data-testid={`structure-toggle-${s.id}`}
                        >
                          {s.active ? (
                            <PowerOff className="h-4 w-4" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Modifica struttura' : 'Nuova struttura'}
            </DialogTitle>
            <DialogDescription>
              I campi obbligatori sono contrassegnati con *. P.IVA e CF si possono compilare in seguito.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="ragione_sociale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ragione sociale *</FormLabel>
                    <FormControl>
                      <Input placeholder="Hotel Palazzo SRL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="piva"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>P.IVA</FormLabel>
                      <FormControl>
                        <Input placeholder="IT01234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Codice fiscale</FormLabel>
                      <FormControl>
                        <Input placeholder="01234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sdi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Codice SDI</FormLabel>
                      <FormControl>
                        <Input placeholder="0000000" maxLength={7} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="info@hotel.it" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefono</FormLabel>
                      <FormControl>
                        <Input placeholder="+39 0824 123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sito web</FormLabel>
                      <FormControl>
                        <Input placeholder="https://hotel.it" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3 text-sm">Indirizzo</h3>
                <FormField
                  control={form.control}
                  name="indirizzo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Via, n.</FormLabel>
                      <FormControl>
                        <Input placeholder="Via Roma, 12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <FormField
                    control={form.control}
                    name="cap"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CAP</FormLabel>
                        <FormControl>
                          <Input placeholder="82100" maxLength={5} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="citta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Città</FormLabel>
                        <FormControl>
                          <Input placeholder="Benevento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="provincia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prov.</FormLabel>
                        <FormControl>
                          <Input placeholder="BN" maxLength={2} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3 text-sm">Referente operativo</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Mario Rossi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact_role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ruolo</FormLabel>
                        <FormControl>
                          <Input placeholder="Direttore" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefono</FormLabel>
                        <FormControl>
                          <Input placeholder="+39 333 1234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note interne</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Allergie note, preferenze, vincoli operativi…"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" disabled={submitting} data-testid="structures-submit">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editing ? 'Salva modifiche' : 'Crea struttura'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
