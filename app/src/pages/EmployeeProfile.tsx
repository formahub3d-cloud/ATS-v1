import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Landmark, Plus, Trash2, Briefcase, Award, Video,
  CheckCircle2, Clock, MapPin, Euro, Bus, Save, IdCard, Car,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/ToastSystem'
import GlassVideoRecorder from '@/components/auth/GlassVideoRecorder'
import GlassBottomNav from '@/components/employee/GlassBottomNav'
import { SkeletonCard } from '@/components/ui/skeleton'
import { usePageTitle } from '@/hooks/usePageTitle'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Database, EmployeeExperience, EmployeeCertification } from '@/lib/database.types'
import { cn } from '@/lib/utils'

type EmployeeRow = Database['public']['Tables']['employees']['Row']

const ROLE_OPTIONS = [
  'Cameriere', 'Chef', 'Sous Chef', 'Chef de Partie', 'Barista',
  'Barman', 'Receptionist', 'SPA Staff', 'Sommelier', 'Hostess',
]

const VALORI_OPTIONS = [
  { id: 'flessibilita', label: 'Flessibilità orari' },
  { id: 'paga_equa', label: 'Paga equa' },
  { id: 'ambiente', label: 'Ambiente sereno' },
  { id: 'crescita', label: 'Crescita professionale' },
  { id: 'team', label: 'Lavoro di squadra' },
  { id: 'stabilita', label: 'Stabilità' },
  { id: 'vicinanza', label: 'Vicinanza casa' },
  { id: 'mensa', label: 'Mensa inclusa' },
  { id: 'trasporto', label: 'Navetta/Trasporto' },
]

const SERVICE_ZONES = [
  { id: 'centro', label: 'Centro città' },
  { id: 'periferia', label: 'Periferia' },
  { id: 'eventi', label: 'Eventi privati' },
  { id: 'navetta', label: 'Spostamento con navetta' },
]

const AVAILABILITY = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'on_call', label: 'A chiamata' },
]

const PAGA_OPTIONS = ['7', '8', '9', '10']

// IBAN UE basico: 2 lettere + 2 cifre + 11-30 alfanumerici. Opzionale → valido se vuoto.
const isValidIban = (v: string) =>
  !v || /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/i.test(v.trim().replace(/\s/g, ''))

const SKY = '#5BB8F5'
const cardCls = 'rounded-2xl p-5 border backdrop-blur-[16px] bg-[rgba(13,30,52,0.6)] border-[rgba(255,255,255,0.06)]'
const inputCls =
  'bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all'

export default function EmployeeProfile() {
  usePageTitle('Il mio profilo')
  const navigate = useNavigate()
  const { user, status: authStatus } = useAuth()
  const { addToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [employee, setEmployee] = useState<EmployeeRow | null>(null)
  const [hasIdDoc, setHasIdDoc] = useState(false)
  const [docVerified, setDocVerified] = useState(false)

  // Form state
  const [iban, setIban] = useState('')
  const [ruoloPrincipale, setRuoloPrincipale] = useState('')
  const [ruoliSecondari, setRuoliSecondari] = useState<string[]>([])
  const [zona, setZona] = useState('')
  const [pagaMinima, setPagaMinima] = useState('')
  const [tagValori, setTagValori] = useState<string[]>([])
  const [navetta, setNavetta] = useState(false)
  const [hasVehicle, setHasVehicle] = useState(false)
  const [serviceZones, setServiceZones] = useState<string[]>([])
  const [availabilityPref, setAvailabilityPref] = useState('')
  const [esperienze, setEsperienze] = useState<EmployeeExperience[]>([])
  const [certificazioni, setCertificazioni] = useState<EmployeeCertification[]>([])
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)

  useEffect(() => {
    if (authStatus === 'loading') return
    if (authStatus === 'anonymous' || !user) {
      navigate('/auth')
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const [{ data: emp, error: empErr }, { data: docs }] = await Promise.all([
          supabase.from('employees').select('*').eq('id', user.id).maybeSingle(),
          supabase.from('documents').select('type, verified_at').eq('employee_id', user.id).eq('type', 'id_card'),
        ])
        if (cancelled) return
        if (empErr) throw empErr
        setEmployee(emp)
        if (emp) {
          const skills = (emp.skills as string[]) ?? []
          setIban(emp.iban ?? '')
          setRuoloPrincipale(skills[0] ?? '')
          setRuoliSecondari(skills.slice(1))
          setZona(emp.preferred_zone ?? '')
          setPagaMinima(emp.min_hourly_rate != null ? String(emp.min_hourly_rate) : '')
          setTagValori((emp.tag_valori as string[]) ?? [])
          setNavetta(!!emp.navetta_driver)
          setHasVehicle(!!emp.has_vehicle)
          setServiceZones((emp.service_zones as string[]) ?? [])
          setAvailabilityPref(emp.availability_pref ?? '')
          setEsperienze((emp.experiences as EmployeeExperience[]) ?? [])
          setCertificazioni((emp.certifications as EmployeeCertification[]) ?? [])
        }
        const idDocs = docs ?? []
        setHasIdDoc(idDocs.length > 0)
        setDocVerified(idDocs.some((d) => !!d.verified_at))
      } catch (err) {
        console.error('[EmployeeProfile] load error', err)
        addToast({ type: 'error', title: 'Errore', message: 'Impossibile caricare il profilo' })
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [authStatus, user, navigate, addToast])

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

  const addEsperienza = () =>
    setEsperienze((l) => [...l, { id: crypto.randomUUID(), ruolo: '', tipoStruttura: '', periodoDa: '', periodoA: '' }])
  const updEsperienza = (id: string, patch: Partial<EmployeeExperience>) =>
    setEsperienze((l) => l.map((e) => (e.id === id ? { ...e, ...patch } : e)))
  const delEsperienza = (id: string) => setEsperienze((l) => l.filter((e) => e.id !== id))

  const addCert = () =>
    setCertificazioni((l) => [...l, { id: crypto.randomUUID(), tipo: '', rilascio: '', scadenza: '' }])
  const updCert = (id: string, patch: Partial<EmployeeCertification>) =>
    setCertificazioni((l) => l.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  const delCert = (id: string) => setCertificazioni((l) => l.filter((c) => c.id !== id))

  const handleSave = useCallback(async () => {
    if (!user) return
    if (iban && !isValidIban(iban)) {
      addToast({ type: 'error', title: 'IBAN non valido', message: 'Controlla il formato dell’IBAN.' })
      return
    }
    setSaving(true)
    try {
      // 1) Carica la nuova video attestazione (se registrata in questa sessione).
      let videoPath: string | null = null
      if (videoBlob) {
        const ext = videoBlob.type.includes('mp4') ? 'mp4' : 'webm'
        videoPath = `${user.id}/${crypto.randomUUID()}-attestation.${ext}`
        const { error: vErr } = await supabase.storage
          .from('employee-docs')
          .upload(videoPath, videoBlob, { contentType: videoBlob.type || 'video/webm', upsert: false })
        if (vErr) throw vErr
      }

      // 2) Aggiorna l'anagrafica employee con i campi della dashboard.
      const skills = [ruoloPrincipale, ...ruoliSecondari].filter(Boolean)
      const { error: upErr } = await supabase
        .from('employees')
        .update({
          iban: iban.trim() || null,
          skills,
          preferred_zone: zona.trim() || null,
          min_hourly_rate: pagaMinima ? Number(pagaMinima) : null,
          tag_valori: tagValori,
          navetta_driver: hasVehicle ? navetta : false,
          has_vehicle: hasVehicle,
          service_zones: serviceZones,
          availability_pref: availabilityPref || null,
          experiences: esperienze,
          certifications: certificazioni,
          ...(videoPath ? { video_attestation_path: videoPath } : {}),
        })
        .eq('id', user.id)
      if (upErr) throw upErr

      if (videoPath) {
        setEmployee((e) => (e ? { ...e, video_attestation_path: videoPath } : e))
        setVideoBlob(null)
      }
      addToast({ type: 'success', title: 'Profilo aggiornato', message: 'Le tue informazioni sono state salvate.' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore sconosciuto'
      console.error('[EmployeeProfile] save error', err)
      addToast({ type: 'error', title: 'Errore salvataggio', message })
    } finally {
      setSaving(false)
    }
  }, [user, iban, videoBlob, ruoloPrincipale, ruoliSecondari, zona, pagaMinima, tagValori, navetta, hasVehicle, serviceZones, availabilityPref, esperienze, certificazioni, addToast])

  const hasVideo = !!employee?.video_attestation_path || !!videoBlob

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#06101E] pb-24">
        <div className="max-w-[560px] mx-auto px-4 pt-6 space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <GlassBottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#06101E] pb-28 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(6,16,30,0.9)] backdrop-blur-[20px]">
        <div className="flex items-center gap-3 h-16 px-4 max-w-5xl mx-auto">
          <button
            type="button"
            onClick={() => navigate('/employee')}
            className="p-2 -ml-2 rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all"
            aria-label="Torna alla dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-semibold">Completa il tuo profilo</h1>
            <p className="text-xs text-[#94A3B8]">Questi dati servono per turni, paga e colloquio</p>
          </div>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-[560px] lg:max-w-5xl mx-auto px-4 pt-5 space-y-5 lg:space-y-0 lg:columns-2 lg:gap-5 lg:[&>section]:mb-5 lg:[&>section]:break-inside-avoid"
      >
        {/* Stato verifica admin (documento + video attestazione) */}
        <section className={cn(cardCls, 'border-[rgba(91,184,245,0.18)]')}>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-sky-primary" />
            <h2 className="text-sm font-semibold">Verifica per il colloquio</h2>
          </div>
          <p className="text-xs text-[#94A3B8] mb-4">
            Per prenotare il colloquio, l’admin deve approvare il tuo <strong>documento d’identità</strong> e
            la tua <strong>video attestazione</strong>.
          </p>
          <div className="space-y-2">
            <StatusRow
              icon={IdCard}
              label="Documento d’identità"
              done={hasIdDoc}
              verified={docVerified}
              missingText="Caricato in registrazione"
            />
            <StatusRow
              icon={Video}
              label="Video attestazione"
              done={hasVideo}
              verified={false}
              missingText="Da registrare qui sotto"
            />
          </div>
        </section>

        {/* Ruoli e preferenze */}
        <section className={cardCls}>
          <SectionTitle icon={Briefcase} title="Ruoli e preferenze" />
          <div className="space-y-5">
            <div className="space-y-1.5">
              <Label>Ruolo principale</Label>
              <Select value={ruoloPrincipale} onValueChange={setRuoloPrincipale}>
                <SelectTrigger className={inputCls}><SelectValue placeholder="Scegli il tuo ruolo" /></SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Altri ruoli che sai fare</Label>
              <div className="flex flex-wrap gap-2">
                {ROLE_OPTIONS.filter((r) => r !== ruoloPrincipale).map((r) => (
                  <Chip key={r} active={ruoliSecondari.includes(r)} onClick={() => toggle(ruoliSecondari, setRuoliSecondari, r)}>{r}</Chip>
                ))}
              </div>
            </div>

            {/* Città di lavoro — geolocalizzata (OpenStreetMap) */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-2"><MapPin className="w-4 h-4 text-sky-primary" />Città di lavoro</Label>
              <CityAutocomplete value={zona} onChange={setZona} />
              {zona && <p className="text-xs text-[#1EC99A]">Selezionata: {zona}</p>}
            </div>

            {/* Tipo di zona / servizio (no prezzi) */}
            <div className="space-y-1.5">
              <Label>Tipo di zona / servizio</Label>
              <div className="flex flex-wrap gap-2">
                {SERVICE_ZONES.map((z) => (
                  <Chip key={z.id} active={serviceZones.includes(z.id)} onClick={() => toggle(serviceZones, setServiceZones, z.id)}>{z.label}</Chip>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-sky-primary" />Impiego che cerchi</Label>
                <Select value={availabilityPref} onValueChange={setAvailabilityPref}>
                  <SelectTrigger className={inputCls}><SelectValue placeholder="Scegli" /></SelectTrigger>
                  <SelectContent>
                    {AVAILABILITY.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="flex items-center gap-2"><Euro className="w-4 h-4 text-sky-primary" />Paga minima (€/h)</Label>
                <Select value={pagaMinima} onValueChange={setPagaMinima}>
                  <SelectTrigger className={inputCls}><SelectValue placeholder="Scegli" /></SelectTrigger>
                  <SelectContent>
                    {PAGA_OPTIONS.map((p) => <SelectItem key={p} value={p}>{p} €/h</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-[#6e6e6e] -mt-2">La paga minima è solo indicativa: non è la paga che riceverai, ma quanto ti aspetti come minimo.</p>

            <div className="space-y-1.5">
              <Label>Cosa cerchi in un lavoro</Label>
              <div className="flex flex-wrap gap-2">
                {VALORI_OPTIONS.map((t) => (
                  <Chip key={t.id} active={tagValori.includes(t.id)} onClick={() => toggle(tagValori, setTagValori, t.id)}>{t.label}</Chip>
                ))}
              </div>
            </div>

            {/* Auto munito → navetta driver */}
            <div className="space-y-2 pt-1">
              <Label className="flex items-center gap-2"><Car className="w-4 h-4 text-sky-primary" />Sei automunito?</Label>
              <div className="flex gap-2">
                <Chip active={hasVehicle} onClick={() => setHasVehicle(true)}>Sì</Chip>
                <Chip active={!hasVehicle} onClick={() => { setHasVehicle(false); setNavetta(false) }}>No</Chip>
              </div>
              {hasVehicle && (
                <label className="flex items-center gap-3 cursor-pointer pt-1">
                  <Checkbox checked={navetta} onCheckedChange={(v) => setNavetta(!!v)} />
                  <span className="flex items-center gap-2 text-sm text-[#CBD5E1]"><Bus className="w-4 h-4 text-sky-primary" />Disponibile come navetta driver</span>
                </label>
              )}
            </div>
          </div>
        </section>

        {/* IBAN */}
        <section className={cardCls}>
          <SectionTitle icon={Landmark} title="IBAN per lo stipendio" />
          <div className="space-y-1.5">
            <Label>IBAN</Label>
            <Input
              className={cn(inputCls, 'font-mono')}
              placeholder="IT60 X054 2811 1010 0000 0123 456"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
            />
            <p className="text-xs text-[#6e6e6e]">Su questo conto riceverai lo stipendio. Solo tu e l’amministrazione lo vedete.</p>
          </div>
        </section>

        {/* Storico lavorativo */}
        <section className={cardCls}>
          <SectionTitle icon={Briefcase} title="Storico lavorativo" />
          <div className="space-y-3">
            {esperienze.length === 0 && (
              <p className="text-xs text-[#94A3B8]">Aggiungi le tue esperienze precedenti per dare più valore al tuo profilo.</p>
            )}
            {esperienze.map((e) => (
              <div key={e.id} className="rounded-xl border border-[rgba(255,255,255,0.08)] p-3 space-y-2 bg-[rgba(255,255,255,0.02)]">
                <div className="grid sm:grid-cols-2 gap-2">
                  <Input className={inputCls} placeholder="Ruolo (es. Cameriere)" value={e.ruolo ?? ''} onChange={(ev) => updEsperienza(e.id!, { ruolo: ev.target.value })} />
                  <Input className={inputCls} placeholder="Tipo struttura (es. Hotel)" value={e.tipoStruttura ?? ''} onChange={(ev) => updEsperienza(e.id!, { tipoStruttura: ev.target.value })} />
                  <Input className={inputCls} placeholder="Dal (es. 2022)" value={e.periodoDa ?? ''} onChange={(ev) => updEsperienza(e.id!, { periodoDa: ev.target.value })} />
                  <Input className={inputCls} placeholder="Al (es. 2024 o Oggi)" value={e.periodoA ?? ''} onChange={(ev) => updEsperienza(e.id!, { periodoA: ev.target.value })} />
                </div>
                <button type="button" onClick={() => delEsperienza(e.id!)} className="flex items-center gap-1.5 text-xs text-[#F04545] hover:underline">
                  <Trash2 className="w-3.5 h-3.5" />Rimuovi
                </button>
              </div>
            ))}
            <button type="button" onClick={addEsperienza} className="flex items-center gap-2 text-sm text-sky-primary hover:underline">
              <Plus className="w-4 h-4" />Aggiungi esperienza
            </button>
          </div>
        </section>

        {/* Certificazioni */}
        <section className={cardCls}>
          <SectionTitle icon={Award} title="Certificazioni" />
          <div className="space-y-3">
            {certificazioni.length === 0 && (
              <p className="text-xs text-[#94A3B8]">Es. HACCP, corso sicurezza, attestati professionali.</p>
            )}
            {certificazioni.map((c) => (
              <div key={c.id} className="rounded-xl border border-[rgba(255,255,255,0.08)] p-3 space-y-2 bg-[rgba(255,255,255,0.02)]">
                <Input className={inputCls} placeholder="Tipo (es. HACCP)" value={c.tipo ?? ''} onChange={(ev) => updCert(c.id!, { tipo: ev.target.value })} />
                <div className="grid sm:grid-cols-2 gap-2">
                  <Input className={inputCls} placeholder="Rilascio (es. 2023)" value={c.rilascio ?? ''} onChange={(ev) => updCert(c.id!, { rilascio: ev.target.value })} />
                  <Input className={inputCls} placeholder="Scadenza (es. 2028)" value={c.scadenza ?? ''} onChange={(ev) => updCert(c.id!, { scadenza: ev.target.value })} />
                </div>
                <button type="button" onClick={() => delCert(c.id!)} className="flex items-center gap-1.5 text-xs text-[#F04545] hover:underline">
                  <Trash2 className="w-3.5 h-3.5" />Rimuovi
                </button>
              </div>
            ))}
            <button type="button" onClick={addCert} className="flex items-center gap-2 text-sm text-sky-primary hover:underline">
              <Plus className="w-4 h-4" />Aggiungi certificazione
            </button>
          </div>
        </section>

        {/* Video attestazione */}
        <section className={cardCls}>
          <SectionTitle icon={Video} title="Video attestazione" />
          {employee?.video_attestation_path && !videoBlob ? (
            <div className="flex items-center gap-2 text-sm text-[#1EC99A] mb-3">
              <CheckCircle2 className="w-4 h-4" />Video caricato — in attesa di verifica dall’admin.
            </div>
          ) : (
            <p className="text-xs text-[#94A3B8] mb-3">
              Registra un breve video (max ~30s) in cui ti presenti: nome, ruolo ed esperienza.
            </p>
          )}
          <GlassVideoRecorder onRecordComplete={(b) => setVideoBlob(b)} />
          {employee?.video_attestation_path && (
            <p className="text-xs text-[#6e6e6e] mt-2">Registrando un nuovo video sostituirai quello attuale dopo il salvataggio.</p>
          )}
        </section>
      </motion.div>

      {/* Barra salvataggio sticky */}
      <div className="fixed bottom-[72px] left-0 right-0 z-40 px-4">
        <div className="max-w-5xl mx-auto">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all shadow-[0_8px_24px_rgba(91,184,245,0.3)]',
              saving ? 'bg-[rgba(255,255,255,0.08)] text-[#94A3B8] cursor-not-allowed' : 'text-[#06101E] bg-sky-primary hover:brightness-110 active:scale-[0.99]'
            )}
            style={saving ? undefined : { background: SKY }}
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-[#94A3B8] border-t-transparent rounded-full animate-spin" />Salvataggio…</>
            ) : (
              <><Save className="w-4 h-4" />Salva profilo</>
            )}
          </button>
        </div>
      </div>

      <GlassBottomNav />
    </div>
  )
}

/* ─── UI helpers ─── */

function SectionTitle({ icon: Icon, title }: { icon: typeof Briefcase; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 text-sky-primary" />
      <h2 className="text-sm font-semibold">{title}</h2>
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
        active
          ? 'bg-[rgba(91,184,245,0.15)] border-sky-primary text-sky-primary'
          : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.1)] text-[#94A3B8] hover:border-[rgba(91,184,245,0.3)]'
      )}
    >
      {children}
    </button>
  )
}

function CityAutocomplete({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [q, setQ] = useState(value)
  const [results, setResults] = useState<Array<{ name: string; label: string }>>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { setQ(value) }, [value])

  useEffect(() => {
    if (!open) return
    const term = q.trim()
    if (term.length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      try {
        setLoading(true)
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&countrycodes=it&limit=6&accept-language=it&q=${encodeURIComponent(term)}`,
        )
        const data = (await res.json()) as Array<{ display_name: string; name?: string }>
        setResults(data.map((d) => ({ name: d.name || d.display_name.split(',')[0], label: d.display_name })))
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => clearTimeout(t)
  }, [q, open])

  return (
    <div className="relative">
      <Input
        className={inputCls}
        placeholder="Cerca città… (es. Benevento)"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
      />
      {open && q.trim().length >= 2 && (
        <div className="absolute z-30 mt-1 w-full rounded-xl border border-[rgba(255,255,255,0.12)] bg-[#0d1e34] shadow-xl max-h-56 overflow-auto">
          {loading && <div className="px-3 py-2 text-xs text-[#94A3B8]">Ricerca…</div>}
          {!loading && results.length === 0 && <div className="px-3 py-2 text-xs text-[#94A3B8]">Nessun risultato</div>}
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { onChange(r.name); setQ(r.name); setOpen(false) }}
              className="block w-full text-left px-3 py-2 text-sm text-[#CBD5E1] hover:bg-[rgba(91,184,245,0.12)]"
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusRow({
  icon: Icon, label, done, verified, missingText,
}: { icon: typeof IdCard; label: string; done: boolean; verified: boolean; missingText: string }) {
  const state = verified ? 'verified' : done ? 'pending' : 'missing'
  const color = state === 'verified' ? '#1EC99A' : state === 'pending' ? '#F5B800' : '#94A3B8'
  const text = state === 'verified' ? 'Approvato' : state === 'pending' ? 'In attesa di verifica' : missingText
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5">
      <Icon className="w-4 h-4" style={{ color }} />
      <span className="text-sm text-[#CBD5E1] flex-1">{label}</span>
      <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color }}>
        {state === 'verified' && <CheckCircle2 className="w-3.5 h-3.5" />}
        {state === 'pending' && <Clock className="w-3.5 h-3.5" />}
        {text}
      </span>
    </div>
  )
}
