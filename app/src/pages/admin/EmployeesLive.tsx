import { useEffect, useState } from 'react'
import { Loader2, RefreshCw, Search, Pencil, Power, PowerOff } from 'lucide-react'
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/ToastSystem'

import { useAuth } from '@/context/AuthContext'
import { employeesService } from '@/services/employees'
import type { EmployeeWithProfile } from '@/services/employees'
import type {
  EmployeeUpdate,
  ContractType,
  EmployeeSkill,
} from '@/lib/database.types'

const ALL_SKILLS: EmployeeSkill[] = [
  'cameriere',
  'cuoco',
  'barista',
  'runner',
  'lavapiatti',
  'capo_servizio',
]

const CONTRACT_TYPES: { value: ContractType; label: string }[] = [
  { value: 'a_chiamata', label: 'A chiamata' },
  { value: 'tempo_determinato', label: 'Tempo determinato' },
  { value: 'tempo_indeterminato', label: 'Tempo indeterminato' },
  { value: 'occasionale', label: 'Prestazione occasionale' },
]

const employeeSchema = z.object({
  cf: z.string().optional().or(z.literal('')),
  iban: z.string().optional().or(z.literal('')),
  birth_date: z.string().optional().or(z.literal('')),
  birth_place: z.string().optional().or(z.literal('')),
  contract_type: z.string().optional().or(z.literal('')),
  hourly_rate: z.string().optional().or(z.literal('')),
  weekly_hours_max: z.string().optional().or(z.literal('')),
  hire_date: z.string().optional().or(z.literal('')),
  skills: z.array(z.string()).optional(),
  bio: z.string().optional().or(z.literal('')),
  home_address: z.string().optional().or(z.literal('')),
  home_city: z.string().optional().or(z.literal('')),
  home_province: z.string().max(2).optional().or(z.literal('')),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

const emptyForm: EmployeeFormValues = {
  cf: '',
  iban: '',
  birth_date: '',
  birth_place: '',
  contract_type: '',
  hourly_rate: '',
  weekly_hours_max: '',
  hire_date: '',
  skills: [],
  bio: '',
  home_address: '',
  home_city: '',
  home_province: '',
}

function toUpdatePayload(values: EmployeeFormValues): EmployeeUpdate {
  const clean = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : null)
  return {
    cf: clean(values.cf),
    iban: clean(values.iban),
    birth_date: clean(values.birth_date),
    birth_place: clean(values.birth_place),
    contract_type: (clean(values.contract_type) as ContractType | null) ?? null,
    hourly_rate: values.hourly_rate ? Number(values.hourly_rate) : null,
    weekly_hours_max: values.weekly_hours_max ? Number(values.weekly_hours_max) : null,
    hire_date: clean(values.hire_date),
    skills: (values.skills as EmployeeSkill[]) ?? [],
    bio: clean(values.bio),
    home_address: clean(values.home_address),
    home_city: clean(values.home_city),
    home_province: clean(values.home_province)?.toUpperCase() ?? null,
  }
}

export default function EmployeesLive() {
  const { profile, status } = useAuth()
  const { addToast } = useToast()

  const [items, setItems] = useState<EmployeeWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [skillFilter, setSkillFilter] = useState<EmployeeSkill | 'all'>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<EmployeeWithProfile | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: emptyForm,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await employeesService.list({
        search,
        activeOnly: !showInactive,
        skill: skillFilter !== 'all' ? skillFilter : undefined,
      })
      setItems(data)
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Errore',
        message: err instanceof Error ? err.message : 'Errore caricamento dipendenti',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') void fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, showInactive, skillFilter])

  useEffect(() => {
    if (status !== 'authenticated') return
    const t = setTimeout(() => void fetchData(), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const openEdit = (e: EmployeeWithProfile) => {
    setEditing(e)
    form.reset({
      cf: e.cf ?? '',
      iban: e.iban ?? '',
      birth_date: e.birth_date ?? '',
      birth_place: e.birth_place ?? '',
      contract_type: e.contract_type ?? '',
      hourly_rate: e.hourly_rate?.toString() ?? '',
      weekly_hours_max: e.weekly_hours_max?.toString() ?? '',
      hire_date: e.hire_date ?? '',
      skills: e.skills ?? [],
      bio: e.bio ?? '',
      home_address: e.home_address ?? '',
      home_city: e.home_city ?? '',
      home_province: e.home_province ?? '',
    })
    setDialogOpen(true)
  }

  const onSubmit = async (values: EmployeeFormValues) => {
    if (!editing) return
    const payload = toUpdatePayload(values)
    setSubmitting(true)
    try {
      await employeesService.update(editing.id, payload)
      addToast({ type: 'success', title: 'Salvato', message: 'Dipendente aggiornato.' })
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

  const toggleActive = async (e: EmployeeWithProfile) => {
    try {
      if (e.active) await employeesService.deactivate(e.id)
      else await employeesService.reactivate(e.id)
      await fetchData()
      addToast({
        type: 'success',
        title: e.active ? 'Disattivato' : 'Riattivato',
        message: e.profile?.full_name ?? e.id,
      })
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Errore',
        message: err instanceof Error ? err.message : 'Operazione fallita',
      })
    }
  }

  const toggleSkill = (skill: EmployeeSkill) => {
    const current = form.getValues('skills') as EmployeeSkill[]
    const next = current.includes(skill)
      ? current.filter((s) => s !== skill)
      : [...current, skill]
    form.setValue('skills', next, { shouldDirty: true })
  }

  if (status !== 'authenticated' || profile?.role !== 'admin') {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Accesso riservato</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Questa pagina è riservata agli amministratori.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const watchedSkills = (form.watch('skills') as EmployeeSkill[]) ?? []

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="admin-employees-live">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dipendenti ATS</h1>
          <p className="text-sm text-muted-foreground">
            I dipendenti compaiono qui non appena si registrano. Tu completi i dati
            contrattuali (CCNL, paga oraria, mansioni) e li attivi.
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => void fetchData()} title="Ricarica">
          <RefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cerca per nome, CF o città…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
                data-testid="employees-search"
              />
            </div>
            <Select
              value={skillFilter}
              onValueChange={(v) => setSkillFilter(v as EmployeeSkill | 'all')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Mansione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le mansioni</SelectItem>
                {ALL_SKILLS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch
                id="show-inactive-emp"
                checked={showInactive}
                onCheckedChange={setShowInactive}
              />
              <Label htmlFor="show-inactive-emp" className="cursor-pointer">
                Disattivati
              </Label>
            </div>
            <div className="text-sm text-muted-foreground ml-auto">
              {items.length} risultati
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Mansioni</TableHead>
                  <TableHead>Contratto</TableHead>
                  <TableHead>€/h</TableHead>
                  <TableHead>Città</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="w-[120px] text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Loader2 className="inline h-5 w-5 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      Nessun dipendente. Invita le persone a registrarsi e compariranno qui.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((e) => (
                    <TableRow key={e.id} data-testid={`employee-row-${e.id}`}>
                      <TableCell className="font-medium">
                        {e.profile?.full_name ?? <span className="text-muted-foreground">— senza nome —</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {e.skills && e.skills.length > 0 ? (
                            e.skills.slice(0, 3).map((s) => (
                              <Badge key={s} variant="secondary" className="text-xs">
                                {s}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                          {e.skills && e.skills.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{e.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {e.contract_type ? (
                          CONTRACT_TYPES.find((c) => c.value === e.contract_type)?.label
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {e.hourly_rate != null ? `€${e.hourly_rate.toFixed(2)}` : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {e.home_city ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {e.active ? (
                          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                            Attivo
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Disattivo</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(e)}
                          title="Modifica"
                          data-testid={`employee-edit-${e.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => void toggleActive(e)}
                          title={e.active ? 'Disattiva' : 'Riattiva'}
                          data-testid={`employee-toggle-${e.id}`}
                        >
                          {e.active ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
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
              Modifica dipendente: {editing?.profile?.full_name ?? '—'}
            </DialogTitle>
            <DialogDescription>
              Completa dati contrattuali e anagrafica. La password e l'email
              le gestisce direttamente il dipendente dal suo account.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <h3 className="font-medium mb-3 text-sm">Anagrafica</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Codice fiscale</FormLabel>
                        <FormControl>
                          <Input placeholder="RSSMRA80A01H501U" maxLength={16} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="iban"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>IBAN</FormLabel>
                        <FormControl>
                          <Input placeholder="IT60X0542811101000000123456" maxLength={34} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birth_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data di nascita</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birth_place"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Luogo di nascita</FormLabel>
                        <FormControl>
                          <Input placeholder="Benevento" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3 text-sm">Contratto</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="contract_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo contratto</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona…" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CONTRACT_TYPES.map((c) => (
                              <SelectItem key={c.value} value={c.value}>
                                {c.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="hourly_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Paga oraria (€)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.50" placeholder="10.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="weekly_hours_max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max ore/sett.</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="40" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="hire_date"
                  render={({ field }) => (
                    <FormItem className="mt-3">
                      <FormLabel>Data di assunzione</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3 text-sm">Mansioni</h3>
                <div className="flex flex-wrap gap-2">
                  {ALL_SKILLS.map((s) => {
                    const selected = watchedSkills.includes(s)
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggleSkill(s)}
                        className={
                          selected
                            ? 'px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground transition-colors'
                            : 'px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/70 transition-colors'
                        }
                        data-testid={`skill-toggle-${s}`}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3 text-sm">Residenza</h3>
                <FormField
                  control={form.control}
                  name="home_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Indirizzo</FormLabel>
                      <FormControl>
                        <Input placeholder="Via Roma 12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <FormField
                    control={form.control}
                    name="home_city"
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
                    name="home_province"
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

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note interne</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Esperienze, specializzazioni, vincoli, preferenze…"
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
                <Button type="submit" disabled={submitting} data-testid="employees-submit">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salva modifiche
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
