import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Shield,
  Building2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  ChevronRight,
  CreditCard,
  Landmark,
  Plus,
  Trash2,
  Video,
  CalendarDays,
  Clock,
  Phone,
  MapPin,
  Briefcase,
  Euro,
  Users,
  Shirt,
  Bus,
  Wrench,
  FileText,
  Award,
  AlertCircle,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useToast } from '@/components/ui/ToastSystem'
import GlassTooltip from '@/components/ui/GlassTooltip'
import Avatar from '@/components/Avatar'

import { supabase } from '@/lib/supabase'
import GlassRoleSelector, { type UserRole } from '@/components/auth/GlassRoleSelector'
import GlassStepIndicator from '@/components/auth/GlassStepIndicator'
import GlassOnboardingStep from '@/components/auth/GlassOnboardingStep'
import GlassVideoRecorder from '@/components/auth/GlassVideoRecorder'
import GlassDocumentUploader from '@/components/auth/GlassDocumentUploader'
import type { UploadedFile } from '@/components/auth/GlassDocumentUploader'
import type { EmployeeExperience, EmployeeCertification } from '@/lib/database.types'
import GlassCalendarPicker from '@/components/auth/GlassCalendarPicker'
import type { CalendarDay } from '@/components/auth/GlassCalendarPicker'
import GlassOTPInput from '@/components/auth/GlassOTPInput'
import GlassTagSelector from '@/components/auth/GlassTagSelector'
import type { Tag } from '@/components/auth/GlassTagSelector'
import ZoneSelector from '@/components/auth/ZoneSelector'

/* ─── easing ─── */
const easeOut = [0, 0, 0.2, 1] as [number, number, number, number]
const easeSpring = [0.34, 1.56, 0.64, 1] as [number, number, number, number]
const easeSmooth = [0.32, 0.72, 0, 1] as [number, number, number, number]

/* ─── Validatori formato (italiani) ─── */
// Tutti tornano `true` quando vuoto: i required vengono gestiti separatamente
// (così questi helper restano compositivi).
const isValidEmail = (v: string) => !v || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim())
// P.IVA italiana: 11 cifre. Accettiamo prefisso "IT" opzionale per UX.
const isValidPiva = (v: string) => !v || /^(IT)?\s*\d{11}$/i.test(v.trim().replace(/\s/g, ''))
// IBAN IT: 27 caratteri (IT + 2 check + 1 CIN + 5 ABI + 5 CAB + 12 conto).
// Accettiamo qualsiasi IBAN UE basico (IBAN inizia con 2 lettere + 2 cifre + 11-30 alfanum).
const isValidIban = (v: string) => !v || /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/i.test(v.trim().replace(/\s/g, ''))
// Scadenza carta MM/AA o MM/AAAA, mese 01-12.
const isValidCardExpiry = (v: string) => !v || /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(v.trim())
// Codice fiscale italiano: 16 caratteri alfanumerici. Pattern strutturale
// (6 lettere + 2 cifre + 1 lettera + 2 cifre + 1 lettera + 3 cifre + 1 lettera).
// Non verifichiamo il check digit (Y/X variabili) per non bloccare CF estere
// o casi limite — basta il formato corretto.
const isValidCf = (v: string) => !v ||
  /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i.test(v.trim().replace(/\s/g, ''))

/* ─── Structure Tags ─── */
const STRUCTURE_TAGS: Tag[] = [
  { id: 'puntualita', label: 'Puntualità' },
  { id: 'professionalita', label: 'Professionalità' },
  { id: 'pulizia', label: 'Pulizia personale' },
  { id: 'abbigliamento', label: 'Abbigliamento adeguato' },
  { id: 'velocita', label: 'Velocità' },
  { id: 'pressione', label: 'Lavoro sotto pressione' },
  { id: 'lingue', label: 'Lingue straniere' },
  { id: 'sorriso', label: 'Sorriso' },
  { id: 'attitudine', label: 'Attitudine cliente' },
]

const EMPLOYEE_TAGS: Tag[] = [
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

const ROLE_OPTIONS = [
  { value: 'Cameriere', label: 'Cameriere' },
  { value: 'Chef', label: 'Chef' },
  { value: 'Sous Chef', label: 'Sous Chef' },
  { value: 'Chef de Partie', label: 'Chef de Partie' },
  { value: 'Barista', label: 'Barista' },
  { value: 'Barman', label: 'Barman' },
  { value: 'Receptionist', label: 'Receptionist' },
  { value: 'SPA Staff', label: 'SPA Staff' },
  { value: 'Sommelier', label: 'Sommelier' },
  { value: 'Hostess', label: 'Hostess' },
]

/* ═══════════════════════════════════════════
   Auth Page
   ═══════════════════════════════════════════ */

type AuthView = 'role-select' | 'login' | 'register-admin' | 'register-structure' | 'register-employee'

export default function Auth() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const [searchParams] = useSearchParams()
  // ?mode=login da Navbar "Accedi" → salta direttamente al form login
  // invece di passare per la scelta ruolo (che ha senso solo per registrati nuovi).
  const initialView: AuthView = searchParams.get('mode') === 'login' ? 'login' : 'role-select'
  const [view, setView] = useState<AuthView>(initialView)
  const [role, setRole] = useState<UserRole | null>(null)

  /* Login state */
  const [email, setEmail] = useState(() => localStorage.getItem('ats_remembered_email') || '')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('ats_remembered_email'))
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  /* Onboarding: Structure */
  const [structStep, setStructStep] = useState(1)
  const [structData, setStructData] = useState<Record<string, unknown>>({
    ragioneSociale: '',
    piva: '',
    cf: '',
    sedeLegale: '',
    sedeOperativa: '',
    referenteNome: '',
    referenteRuolo: '',
    referenteTelefono: '',
    referenteEmail: '',
    password: '',
    passwordConfirm: '',
    tipoStruttura: '',
    zona: '',
    descrizione: '',
    fotoAmbienti: [] as UploadedFile[],
    videoAttestazione: null as Blob | null,
    ruoliCercati: [] as string[],
    fasceOrarie: {} as Record<string, string>,
    pagaMax: {} as Record<string, string>,
    personePerTurno: '1',
    serviziAggiuntivi: [] as string[],
    tagValori: [] as string[],
    eventiSettimana: '',
    dipendentiInterni: '',
    esperienzeEsterne: '',
    picchiStagionali: [] as string[],
    fatturato: '',
    oreEsternoMensili: '',
    metodoPagamento: 'carta',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardHolder: '',
    iban: '',
    sepaHolder: '',
    bic: '',
    accettatoContratto: false,
  })

  /* Onboarding: Employee */
  const [empStep, setEmpStep] = useState(1)
  const [empData, setEmpData] = useState<Record<string, unknown>>({
    nome: '',
    cognome: '',
    dataNascita: '',
    indirizzo: '',
    telefono: '',
    email: '',
    password: '',
    passwordConfirm: '',
    cf: '',
    documentoFiles: [] as UploadedFile[],
    iban: '',
    fotoProfessionale: [] as UploadedFile[],
    videoAttestazione: null as Blob | null,
    esperienze: [] as Array<{
      id: string
      ruolo: string
      tipoStruttura: string
      periodoDa: string
      periodoA: string
    }>,
    certificazioni: [] as Array<{
      id: string
      tipo: string
      rilascio: string
      scadenza: string
    }>,
    ruoloPrincipale: '',
    ruoliSecondari: [] as string[],
    zonaLavoro: '',
    tipoContratto: 'fulltime',
    pagaMinima: '8',
    tagValori: [] as string[],
    navettaDriver: false,
    calendarioGiorni: [] as CalendarDay[],
    slotColloquio: '',
    otpCode: '',
    otpVerified: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  /* ─── Auto-save draft to localStorage ─── */
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      if (view === 'register-structure') {
        localStorage.setItem('ats_draft_structure', JSON.stringify(structData))
        addToast({
          type: 'info',
          title: 'Bozza salvata',
          message: 'I tuoi dati sono stati salvati automaticamente',
        })
      }
      if (view === 'register-employee') {
        localStorage.setItem('ats_draft_employee', JSON.stringify(empData))
        addToast({
          type: 'info',
          title: 'Bozza salvata',
          message: 'I tuoi dati sono stati salvati automaticamente',
        })
      }
    }, 3000)
  }, [view, structData, empData, addToast])

  useEffect(() => {
    triggerAutoSave()
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [triggerAutoSave])

  /* ─── Role selection ─── */
  // Default: dopo aver scelto il ruolo si va al wizard di registrazione.
  // L'utente che ha già un account passa per il link "Accedi qui" o
  // dal Navbar (?mode=login) — entrambi bypassano questa funzione.
  // Eccezione: gli admin non si registrano da qui, vanno sempre al login.
  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole)
    setLoginError('')
    if (selectedRole === 'admin') {
      setView('login')
      return
    }
    setView(selectedRole === 'structure' ? 'register-structure' : 'register-employee')
  }

  /* handleDemo rimosso: l'accesso "diretto senza credenziali" non è più
     supportato. Ora si entra solo con un vero login Supabase via handleLogin. */

  /* ─── Login handler ─── */
  const handleLogin = async () => {
    setLoginError('')
    if (!email || !password) {
      setLoginError('Inserisci email e password')
      addToast({ type: 'error', title: 'Errore', message: 'Inserisci email e password' })
      return
    }
    setIsLoggingIn(true)
    try {
      // Login REALE su Supabase (era un setTimeout finto).
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })
      if (error) throw error

      // Recupera il ruolo reale dal profilo (la signUp ha già scritto profiles.role).
      const userId = data.user?.id
      let realRole: 'admin' | 'structure' | 'employee' = role || 'employee'
      if (userId) {
        const { data: profile, error: profErr } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .maybeSingle()
        if (!profErr && profile?.role) {
          realRole = profile.role
        }
      }

      // Mantiene allineato anche il "demo role" UI (RoleContext) per coerenza.
      localStorage.setItem('ats_active_role', realRole)

      // Ricorda email su questo dispositivo (solo l'email, MAI la password).
      if (rememberMe) {
        localStorage.setItem('ats_remembered_email', email.trim().toLowerCase())
      } else {
        localStorage.removeItem('ats_remembered_email')
      }

      addToast({ type: 'success', title: 'Accesso effettuato', message: 'Bentornato!' })
      if (realRole === 'admin') navigate('/admin')
      else if (realRole === 'structure') navigate('/structure')
      else navigate('/employee')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login fallito'
      setLoginError(message)
      addToast({ type: 'error', title: 'Errore login', message })
    } finally {
      setIsLoggingIn(false)
    }
  }

  /* ─── Structure step validation ─── */
  // Lista leggibile di "cosa manca" per lo step corrente. Mostrata sotto il
  // bottone Avanti quando disabilitato — l'utente sa subito cosa compilare
  // invece di guardare il bottone grigio chiedendosi perché.
  const getStructureMissingFields = (): string[] => {
    const missing: string[] = []
    switch (structStep) {
      case 1: {
        const pwd = structData.password as string
        const pwdConfirm = structData.passwordConfirm as string
        const piva = structData.piva as string
        const email = structData.referenteEmail as string
        if (!structData.ragioneSociale) missing.push('Ragione sociale')
        if (!piva) missing.push('P.IVA')
        else if (!isValidPiva(piva)) missing.push('P.IVA non valida (11 cifre)')
        if (!structData.referenteNome) missing.push('Nome referente')
        if (!email) missing.push('Email')
        else if (!isValidEmail(email)) missing.push('Email non valida')
        if (!pwd) missing.push('Password')
        else if (pwd.length < 8) missing.push('Password troppo corta (min 8)')
        else if (pwd !== pwdConfirm) missing.push('Le password non coincidono')
        break
      }
      case 2: {
        const photos = (structData.fotoAmbienti as UploadedFile[]) || []
        if (!structData.tipoStruttura) missing.push('Tipo struttura')
        if (!structData.zona) missing.push('Zona operativa')
        if (photos.length < 5) missing.push(`Foto ambienti (${photos.length}/5)`)
        break
      }
      case 3:
        if (!structData.videoAttestazione) missing.push('Video attestazione')
        break
      case 4:
        if ((structData.ruoliCercati as string[]).length === 0) missing.push('Almeno un ruolo cercato')
        break
      case 5:
        if ((structData.tagValori as string[]).length === 0) missing.push('Almeno un tag valore')
        break
      case 7:
        if (structData.metodoPagamento === 'carta') {
          if (!structData.cardNumber) missing.push('Numero carta')
          if (!structData.cardExpiry) missing.push('Scadenza')
          else if (!isValidCardExpiry(structData.cardExpiry as string)) missing.push('Scadenza non valida (MM/AA)')
          if (!structData.cardCvc) missing.push('CVC')
          if (!structData.cardHolder) missing.push('Titolare carta')
        } else {
          if (!structData.iban) missing.push('IBAN')
          else if (!isValidIban(structData.iban as string)) missing.push('IBAN non valido')
          if (!structData.sepaHolder) missing.push('Intestatario conto')
        }
        break
      case 8:
        if (!structData.accettatoContratto) missing.push('Accettazione contratto')
        break
    }
    return missing
  }

  const canProceedStructure = (): boolean => {
    switch (structStep) {
      case 1: {
        const pwd = structData.password as string
        const pwdConfirm = structData.passwordConfirm as string
        const piva = structData.piva as string
        const email = structData.referenteEmail as string
        return !!(
          structData.ragioneSociale &&
          piva && isValidPiva(piva) &&
          structData.referenteNome &&
          email && isValidEmail(email) &&
          pwd && pwd.length >= 8 &&
          pwd === pwdConfirm
        )
      }
      case 2: {
        // Foto ambienti: il copy promette "almeno 5", la validazione deve
        // riflettere il copy o l'utente passa con galleria vuota.
        const photos = (structData.fotoAmbienti as UploadedFile[]) || []
        return !!(structData.tipoStruttura && structData.zona && photos.length >= 5)
      }
      case 3:
        return !!structData.videoAttestazione
      case 4:
        return (structData.ruoliCercati as string[]).length > 0
      case 5:
        return (structData.tagValori as string[]).length > 0
      case 6:
        return true
      case 7:
        if (structData.metodoPagamento === 'carta') {
          return !!(
            structData.cardNumber &&
            structData.cardExpiry && isValidCardExpiry(structData.cardExpiry as string) &&
            structData.cardCvc &&
            structData.cardHolder
          )
        }
        return !!(
          structData.iban && isValidIban(structData.iban as string) &&
          structData.sepaHolder
        )
      case 8:
        return !!structData.accettatoContratto
      default:
        return true
    }
  }

  /* ─── Employee step validation ─── */
  // Lista leggibile dei campi mancanti per lo step lavoratore corrente.
  // Mostrata sotto il bottone Avanti via prop missingFields di GlassOnboardingStep.
  const getEmployeeMissingFields = (): string[] => {
    const missing: string[] = []
    switch (empStep) {
      case 1: {
        const pwd = empData.password as string
        const pwdConfirm = empData.passwordConfirm as string
        const email = empData.email as string
        const cf = empData.cf as string
        const docs = (empData.documentoFiles as UploadedFile[]) || []
        if (!empData.nome) missing.push('Nome')
        if (!empData.cognome) missing.push('Cognome')
        if (!empData.dataNascita) missing.push('Data di nascita')
        if (!empData.indirizzo) missing.push('Indirizzo di residenza')
        if (!email) missing.push('Email')
        else if (!isValidEmail(email)) missing.push('Email non valida')
        if (!cf) missing.push('Codice fiscale')
        else if (!isValidCf(cf)) missing.push('Codice fiscale non valido (16 caratteri)')
        if (!pwd) missing.push('Password')
        else if (pwd.length < 8) missing.push('Password troppo corta (min 8)')
        else if (pwd !== pwdConfirm) missing.push('Le password non coincidono')
        if (docs.length === 0) missing.push('Documento d\'identità')
        break
      }
      case 2: {
        const photos = (empData.fotoProfessionale as UploadedFile[]) || []
        if (photos.length === 0) missing.push('Foto professionale')
        break
      }
      case 3:
        if (!empData.videoAttestazione) missing.push('Video attestazione')
        break
      case 5:
        if (!empData.ruoloPrincipale) missing.push('Ruolo principale')
        if ((empData.tagValori as string[]).length === 0) missing.push('Almeno un tag valore')
        if (!empData.zonaLavoro) missing.push('Zona di lavoro')
        break
      case 6: {
        const days = (empData.calendarioGiorni as CalendarDay[]) || []
        const avail = days.filter((d) => d.status === 'available').length
        if (avail === 0) missing.push('Almeno un giorno di disponibilità')
        break
      }
      case 7:
        if (!empData.slotColloquio) missing.push('Slot colloquio')
        break
      case 8:
        if (!empData.otpVerified) missing.push('Verifica OTP')
        break
    }
    return missing
  }

  const canProceedEmployee = (): boolean => {
    switch (empStep) {
      case 1: {
        const pwd = empData.password as string
        const pwdConfirm = empData.passwordConfirm as string
        const email = empData.email as string
        const cf = empData.cf as string
        const docs = (empData.documentoFiles as UploadedFile[]) || []
        return !!(
          empData.nome &&
          empData.cognome &&
          empData.dataNascita &&
          empData.indirizzo &&
          email && isValidEmail(email) &&
          cf && isValidCf(cf) &&
          docs.length > 0 &&
          pwd && pwd.length >= 8 &&
          pwd === pwdConfirm
        )
      }
      case 2:
        return (empData.fotoProfessionale as UploadedFile[]).length > 0
      case 3:
        return !!empData.videoAttestazione
      case 4:
        return true
      case 5:
        return !!(empData.ruoloPrincipale && (empData.tagValori as string[]).length > 0 && empData.zonaLavoro)
      case 6:
        return (empData.calendarioGiorni as CalendarDay[]).filter((d) => d.status === 'available').length > 0
      case 7:
        return !!empData.slotColloquio
      case 8:
        return !!empData.otpVerified
      default:
        return true
    }
  }

  /* ─── Structure handlers ─── */
  const updateStruct = (key: string, value: unknown) => {
    setStructData((prev) => ({ ...prev, [key]: value }))
  }

  /* ─── Employee handlers ─── */
  const updateEmp = (key: string, value: unknown) => {
    setEmpData((prev) => ({ ...prev, [key]: value }))
  }

  const addEsperienza = () => {
    const list = empData.esperienze as Array<{ id: string; ruolo: string; tipoStruttura: string; periodoDa: string; periodoA: string }>
    updateEmp('esperienze', [
      ...list,
      { id: Date.now().toString(), ruolo: '', tipoStruttura: '', periodoDa: '', periodoA: '' },
    ])
  }

  const removeEsperienza = (id: string) => {
    const list = empData.esperienze as Array<{ id: string }>
    updateEmp('esperienze', list.filter((e) => e.id !== id))
  }

  const addCertificazione = () => {
    const list = empData.certificazioni as Array<{ id: string; tipo: string; rilascio: string; scadenza: string }>
    updateEmp('certificazioni', [
      ...list,
      { id: Date.now().toString(), tipo: '', rilascio: '', scadenza: '' },
    ])
  }

  const removeCertificazione = (id: string) => {
    const list = empData.certificazioni as Array<{ id: string }>
    updateEmp('certificazioni', list.filter((c) => c.id !== id))
  }

  const handleOTPComplete = (code: string) => {
    updateEmp('otpCode', code)
    setTimeout(() => {
      updateEmp('otpVerified', true)
      addToast({ type: 'success', title: 'Codice verificato', message: 'Contratto firmato con successo!' })
    }, 800)
  }

  /* ─── Submit handlers ─── */
  const handleStructureSubmit = async () => {
    setIsSubmitting(true)
    try {
      // 1. Crea l'account auth con role='structure' (il trigger handle_new_user
      //    crea automaticamente la riga in `profiles`).
      const email = (structData.referenteEmail as string).trim().toLowerCase()
      const password = structData.password as string
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: structData.referenteNome as string,
            role: 'structure',
          },
        },
      })

      if (signUpError) throw signUpError
      const userId = signUpData.user?.id
      if (!userId) throw new Error('SignUp riuscito ma user.id mancante.')

      // Se Supabase richiede email confirmation, signUp NON apre una sessione.
      // Senza sessione non possiamo soddisfare la RLS `auth.uid() = user_id`,
      // quindi non possiamo proseguire con insert/upload qui.
      if (!signUpData.session) {
        addToast({
          type: 'info',
          title: 'Conferma la tua email',
          message: `Ti abbiamo inviato un link a ${email}. Confermala e poi accedi per completare l'invio.`,
        })
        setView('login')
        return
      }

      // 2. Upload video di attestazione (Blob → Storage).
      let videoPath: string | null = null
      const videoBlob = structData.videoAttestazione as Blob | null
      if (videoBlob) {
        const ext = videoBlob.type.includes('mp4') ? 'mp4' : 'webm'
        videoPath = `${userId}/video-attestazione/${crypto.randomUUID()}.${ext}`
        const { error: videoErr } = await supabase.storage
          .from('structure-media')
          .upload(videoPath, videoBlob, {
            contentType: videoBlob.type || 'video/webm',
            upsert: false,
          })
        if (videoErr) throw videoErr
      }

      // 3. INSERT della struttura (status = 'pending_review' di default).
      const { data: structureRow, error: insertErr } = await supabase
        .from('structures')
        .insert({
          user_id: userId,
          ragione_sociale: structData.ragioneSociale as string,
          piva: structData.piva as string,
          codice_fiscale: (structData.cf as string) || null,
          sede_legale: (structData.sedeLegale as string) || null,
          sede_operativa: (structData.sedeOperativa as string) || null,
          referente_nome: (structData.referenteNome as string) || null,
          referente_ruolo: (structData.referenteRuolo as string) || null,
          referente_telefono: (structData.referenteTelefono as string) || null,
          referente_email: email,
          tipo_struttura: (structData.tipoStruttura as string) || null,
          zona: (structData.zona as string) || null,
          descrizione: (structData.descrizione as string) || null,
          ruoli_cercati: structData.ruoliCercati as string[],
          fasce_orarie: structData.fasceOrarie as Record<string, string>,
          persone_per_turno: structData.personePerTurno
            ? Number(structData.personePerTurno)
            : null,
          servizi_aggiuntivi: structData.serviziAggiuntivi as string[],
          tag_valori: structData.tagValori as string[],
          eventi_settimana: structData.eventiSettimana
            ? Number(structData.eventiSettimana)
            : null,
          dipendenti_interni: structData.dipendentiInterni
            ? Number(structData.dipendentiInterni)
            : null,
          esperienze_esterne: (structData.esperienzeEsterne as string) || null,
          fatturato: (structData.fatturato as string) || null,
          ore_esterno_mensili: structData.oreEsternoMensili
            ? Number(structData.oreEsternoMensili)
            : null,
          metodo_pagamento: structData.metodoPagamento as 'carta' | 'sepa',
          video_attestazione_path: videoPath,
          accettato_contratto: !!structData.accettatoContratto,
          accettato_contratto_at: structData.accettatoContratto ? new Date().toISOString() : null,
        })
        .select('id')
        .single()

      if (insertErr) throw insertErr

      // 4. Upload foto ambienti + insert in structure_photos.
      const photos = (structData.fotoAmbienti as UploadedFile[]) || []
      for (let i = 0; i < photos.length; i++) {
        const p = photos[i]
        if (!p.file) continue
        const ext = p.file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `${userId}/photos/${crypto.randomUUID()}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('structure-media')
          .upload(path, p.file, { contentType: p.file.type, upsert: false })
        if (upErr) throw upErr

        const { error: photoErr } = await supabase
          .from('structure_photos')
          .insert({ structure_id: structureRow.id, storage_path: path, sort_order: i })
        if (photoErr) throw photoErr
      }

      // 5. Pulizia bozza locale + redirect.
      localStorage.removeItem('ats_draft_structure')
      addToast({
        type: 'success',
        title: 'Candidatura inviata!',
        message: 'Ti contatteremo entro 48 ore per la verifica.',
      })
      setTimeout(() => {
        setView('login')
        setStructStep(1)
      }, 1800)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore sconosciuto'
      console.error('[register-structure] submit error', err)
      addToast({ type: 'error', title: 'Errore durante l\u2019invio', message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmployeeSubmit = async () => {
    setIsSubmitting(true)
    try {
      const email = (empData.email as string).trim().toLowerCase()
      const password = empData.password as string
      const fullName = `${(empData.nome as string).trim()} ${(empData.cognome as string).trim()}`.trim()

      // 1) signUp Supabase con role='employee'.
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role: 'employee' },
        },
      })
      if (signUpError) throw signUpError
      const userId = signUpData.user?.id
      if (!userId) throw new Error('SignUp riuscito ma user.id mancante.')

      if (!signUpData.session) {
        addToast({
          type: 'info',
          title: 'Conferma la tua email',
          message: `Ti abbiamo inviato un link a ${email}. Confermala e poi accedi per completare l'invio.`,
        })
        setView('login')
        return
      }

      // 2) Aggiorna profile con phone (full_name è già settato dal trigger).
      const phone = (empData.telefono as string).trim()
      if (phone) {
        const { error: pErr } = await supabase
          .from('profiles')
          .update({ phone })
          .eq('id', userId)
        if (pErr) console.warn('[register-employee] profile phone update warn', pErr)
      }

      // 3) INSERT employees: SOLO anagrafica base raccolta in registrazione.
      //    IBAN, video attestazione, storico, certificazioni, ruoli/zona/preferenze
      //    si compilano nella dashboard dipendente dopo il login; l'admin approva
      //    documento + video attestazione prima di sbloccare il colloquio.
      const { error: eErr } = await supabase.from('employees').insert({
        id: userId,
        cf: (empData.cf as string).trim() || null,
        birth_date: (empData.dataNascita as string) || null,
        home_address: (empData.indirizzo as string) || null,
        skills: [],
        experiences: [],
        certifications: [],
        tag_valori: [],
        navetta_driver: false,
        onboarding_completed_at: new Date().toISOString(),
      })
      if (eErr) throw eErr

      // 5) Upload documenti d'identità (1+ files), insert in `documents`.
      const docFiles = (empData.documentoFiles as UploadedFile[]) || []
      for (const d of docFiles) {
        if (!d.file) continue
        const ext = d.file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `${userId}/${crypto.randomUUID()}-id_card.${ext}`
        const { error: upErr } = await supabase.storage
          .from('employee-docs')
          .upload(path, d.file, { contentType: d.file.type, upsert: false })
        if (upErr) throw upErr
        const { error: docErr } = await supabase.from('documents').insert({
          employee_id: userId,
          type: 'id_card',
          file_path: path,
          file_name: d.file.name,
          mime_type: d.file.type,
          size_bytes: d.file.size,
          uploaded_by: userId,
        })
        if (docErr) throw docErr
      }

      // 6) Foto professionali → caricate come documenti type='other'; la prima
      //    diventa avatar_url del profilo (signed URL del bucket).
      const photoFiles = (empData.fotoProfessionale as UploadedFile[]) || []
      for (let i = 0; i < photoFiles.length; i++) {
        const p = photoFiles[i]
        if (!p.file) continue
        const ext = p.file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const path = `${userId}/${crypto.randomUUID()}-photo.${ext}`
        const { error: upErr } = await supabase.storage
          .from('employee-docs')
          .upload(path, p.file, { contentType: p.file.type, upsert: false })
        if (upErr) throw upErr
        const { error: docErr } = await supabase.from('documents').insert({
          employee_id: userId,
          type: 'other',
          file_path: path,
          file_name: p.file.name,
          mime_type: p.file.type,
          size_bytes: p.file.size,
          uploaded_by: userId,
        })
        if (docErr) throw docErr
      }

      // 7) Pulizia bozza locale + redirect.
      localStorage.removeItem('ats_draft_employee')
      addToast({
        type: 'success',
        title: 'Benvenuto nel network ATS!',
        message: 'Profilo creato. Accedi per iniziare a ricevere turni.',
      })
      setTimeout(() => {
        setView('login')
        setEmpStep(1)
      }, 1800)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore sconosciuto'
      console.error('[register-employee] submit error', err)
      addToast({ type: 'error', title: 'Errore durante l’invio', message })
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ─── Step labels ─── */
  const structureSteps = [
    'Dati aziendali',
    'Identità struttura',
    'Video attestazione',
    'Esigenze operative',
    'Tag valori',
    'Qualificazione',
    'Pagamento',
    'Conferma',
  ]

  // Registrazione dipendente snella: solo 2 step.
  // Video attestazione, IBAN, storico, certificazioni, ruoli/zona/preferenze e
  // prenotazione colloquio si gestiscono nella dashboard dipendente dopo il login.
  const employeeSteps = [
    'Dati personali',
    'Foto professionale',
  ]

  /* ─── Role badge helper ─── */
  const RoleBadge = ({ r }: { r: UserRole | null }) => {
    if (!r) return null
    const icons: Record<string, LucideIcon> = { admin: Shield, structure: Building2, employee: User }
    const labels: Record<string, string> = { admin: 'Admin ATS', structure: 'Struttura', employee: 'Dipendente' }
    const Icon = icons[r]
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[rgba(91,184,245,0.1)] border border-[rgba(91,184,245,0.2)] backdrop-blur-md">
        <Icon className="w-4 h-4 text-sky-primary" />
        <span className="text-sm font-medium text-sky-primary">{labels[r]}</span>
      </div>
    )
  }

  /* ─── Interview slots ─── */
  const interviewSlots = [
    { day: 'Lunedì 16', slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
    { day: 'Martedì 17', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    { day: 'Mercoledì 18', slots: ['10:00', '11:00', '14:00', '16:00'] },
    { day: 'Giovedì 19', slots: ['09:00', '11:00', '14:00', '15:00'] },
  ]

  /* ─── Glass Input wrapper ─── */
  const GlassInput = ({
    icon: Icon,
    label,
    tooltip,
    children,
  }: {
    icon?: LucideIcon
    label: string
    tooltip?: string
    children: React.ReactNode
  }) => (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 text-sky-primary" />}
        <Label className="text-sm text-text-secondary">{label}</Label>
        {tooltip && (
          <GlassTooltip content={tooltip} position="top">
            <AlertCircle className="w-3.5 h-3.5 text-text-muted cursor-help" />
          </GlassTooltip>
        )}
      </div>
      {children}
    </div>
  )

  /* ═══════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════ */

  return (
    <div className="min-h-[100dvh] bg-navy relative overflow-hidden">
      {/* Background animated gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle, #5BB8F5 0%, transparent 70%)',
            top: '-10%',
            left: '-10%',
            animation: 'gradient-shift 20s infinite ease-in-out',
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{
            background: 'radial-gradient(circle, #3AA3E8 0%, transparent 70%)',
            bottom: '-5%',
            right: '-5%',
            animation: 'gradient-shift 25s infinite ease-in-out reverse',
          }}
        />
      </div>
      <div className="absolute inset-0 opacity-[0.03] bg-[url('/hero-pattern.svg')] bg-repeat" />

      <div className="relative z-10 min-h-[100dvh] flex flex-col items-center justify-center px-4 py-12">
        {/* Back button (non-role-select views) */}
        <AnimatePresence>
          {view !== 'role-select' && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={() => {
                if (view === 'register-structure' && structStep > 1) {
                  setStructStep((s) => s - 1)
                } else if (view === 'register-employee' && empStep > 1) {
                  setEmpStep((s) => s - 1)
                } else {
                  // Stiamo per uscire dal wizard. Se l'utente ha compilato
                  // dei campi, chiedi conferma — il wizard non persiste e
                  // perdere 11 campi compilati per errore è frustrante.
                  const hasStructDraft =
                    view === 'register-structure' &&
                    !!(structData.ragioneSociale || structData.piva || structData.referenteEmail)
                  const hasEmpDraft =
                    view === 'register-employee' &&
                    !!(empData.nome || empData.cognome || empData.email)
                  if (hasStructDraft || hasEmpDraft) {
                    const ok = window.confirm(
                      'Sei sicuro di voler tornare indietro? I dati compilati andranno persi.',
                    )
                    if (!ok) return
                  }
                  setView('role-select')
                  setRole(null)
                  setLoginError('')
                }
              }}
              className="absolute top-6 left-6 flex items-center gap-2 text-sm text-text-secondary hover:text-sky-primary transition-colors z-20 backdrop-blur-md px-3 py-2 rounded-xl border border-transparent hover:border-[rgba(91,184,245,0.2)]"
            >
              <ArrowLeft className="w-4 h-4" />
              {view.startsWith('register-') && (view === 'register-structure' ? structStep > 1 : empStep > 1)
                ? 'Indietro'
                : 'Torna indietro'}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Content container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: easeOut }}
          className="w-full max-w-[720px] flex flex-col items-center"
        >
          {/* ─── ROLE SELECTION ─── */}
          <AnimatePresence mode="wait">
            {view === 'role-select' && (
              <motion.div
                key="role-select"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center"
              >
                {/* Logo */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: easeOut }}
                  className="mb-10"
                >
                  <div className="w-[160px] h-[48px] bg-[rgba(91,184,245,0.1)] rounded-xl flex items-center justify-center border border-[rgba(91,184,245,0.15)] backdrop-blur-md">
                    <span className="font-playfair text-2xl font-bold text-white">ATS</span>
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1, ease: easeOut }}
                  className="text-[28px] sm:text-[36px] font-playfair font-bold text-text-primary mb-3 text-center"
                  style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                >
                  Iniziamo. Da che parte sei?
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15, ease: easeOut }}
                  className="text-base text-text-secondary mb-3 text-center max-w-[460px] mx-auto"
                >
                  Scegli il tuo profilo: ti porteremo subito a un onboarding rapido,
                  poi il nostro team verifica i dati e ti attiva entro 48h.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: easeOut }}
                  className="flex items-center justify-center gap-2 mb-10 text-[11px] text-text-muted"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-status-pulse" />
                  Già attivi a Benevento e provincia
                  <span className="mx-1.5 opacity-50">·</span>
                  Risposta entro 48h lavorative
                </motion.div>

                <GlassRoleSelector selectedRole={role} onSelect={handleRoleSelect} />

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="mt-12 flex flex-col items-center gap-6"
                >
                  <p className="text-xs text-text-muted text-center max-w-[380px]">
                    Hai già un account?{' '}
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="text-sky-primary hover:underline font-medium"
                    >
                      Accedi qui
                    </button>
                  </p>

                  <Link
                    to="/"
                    className="text-sm text-text-muted hover:text-sky-primary transition-colors"
                  >
                    ← Torna alla home
                  </Link>

                  {/* Footer discreto: accesso amministrativo riservato. */}
                  <div className="pt-6 border-t border-[rgba(255,255,255,0.04)] w-full max-w-[400px] text-center">
                    <button
                      type="button"
                      onClick={() => { setRole('admin'); setView('login') }}
                      className="text-[11px] text-text-muted hover:text-sky-primary transition-colors uppercase tracking-wider font-medium"
                    >
                      Accedi come amministratore →
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* ─── LOGIN FORM ─── */}
            {view === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: easeOut }}
                className="w-full max-w-[440px] flex flex-col items-center"
              >
                <RoleBadge r={role} />

                <h1 className="text-[32px] font-playfair font-bold text-text-primary mt-6 mb-1">
                  Bentornato
                </h1>
                <p className="text-base text-text-secondary mb-8">
                  Inserisci email e password per accedere
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!isLoggingIn) handleLogin()
                  }}
                  className="w-full space-y-4"
                >
                  {/* Email */}
                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="login-email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-sky-primary" />
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      placeholder={
                        role === 'structure'
                          ? 'es. info@miastruttura.it'
                          : role === 'admin'
                          ? 'es. admin@ats.it'
                          : 'es. mario.rossi@gmail.com'
                      }
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5 text-left">
                    <Label htmlFor="login-password" className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-sky-primary" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="La tua password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-text-muted hover:text-white"
                        aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Ricorda email */}
                  <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none">
                    <Checkbox
                      checked={rememberMe}
                      onCheckedChange={(v) => setRememberMe(v === true)}
                    />
                    Ricorda la mia email su questo dispositivo
                  </label>

                  {/* Errore */}
                  {loginError && (
                    <p className="text-sm text-error text-left">{loginError}</p>
                  )}

                  {/* Pulsante Accedi */}
                  <motion.button
                    type="submit"
                    disabled={isLoggingIn}
                    whileHover={!isLoggingIn ? { scale: 1.02, boxShadow: '0 8px 24px rgba(91,184,245,0.25)' } : {}}
                    whileTap={!isLoggingIn ? { scale: 0.98 } : {}}
                    className="w-full py-3.5 text-sm font-semibold text-text-inverse rounded-xl transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-md gradient-sky hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoggingIn ? (
                      <>
                        <div className="w-4 h-4 border-2 border-text-inverse border-t-transparent rounded-full animate-spin" />
                        Accesso in corso…
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Accedi
                      </>
                    )}
                  </motion.button>

                  {/* Links sotto */}
                  <div className="text-center space-y-3 pt-2">
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[rgba(255,255,255,0.06)]" />
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="px-3 bg-navy text-text-muted">oppure</span>
                      </div>
                    </div>

                    {role === 'admin' ? (
                      <button
                        type="button"
                        onClick={() => setView('register-admin')}
                        className="text-sm text-sky-primary hover:text-sky-blue transition-colors"
                      >
                        Accesso su invito
                      </button>
                    ) : (
                      <p className="text-sm text-text-secondary">
                        Non hai un account?{' '}
                        <button
                          type="button"
                          onClick={() =>
                            setView(role === 'structure' ? 'register-structure' : 'register-employee')
                          }
                          className="text-sky-primary hover:text-sky-blue transition-colors font-medium"
                        >
                          Registrati
                        </button>
                      </p>
                    )}
                  </div>
                </form>
              </motion.div>
            )}

            {/* ─── ADMIN REGISTRATION ─── */}
            {view === 'register-admin' && (
              <motion.div
                key="register-admin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: easeOut }}
                className="w-full max-w-[440px] flex flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, ease: easeSpring }}
                  className="w-20 h-20 rounded-2xl bg-[rgba(91,184,245,0.08)] flex items-center justify-center mb-6 border border-[rgba(91,184,245,0.15)] backdrop-blur-md"
                >
                  <Mail className="w-10 h-10 text-sky-primary" />
                </motion.div>
                <h1 className="text-[28px] font-playfair font-bold text-text-primary mb-4">
                  Accesso su invito
                </h1>
                <p className="text-base text-text-secondary mb-8 leading-relaxed">
                  L&apos;accesso admin &egrave; riservato ai gestori della piattaforma ATS. Se sei un
                  amministratore, contatta il team per ricevere le credenziali di accesso.
                </p>
                <motion.a
                  whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(91,184,245,0.25)' }}
                  whileTap={{ scale: 0.97 }}
                  href="mailto:admin@ats.it"
                  className="px-8 py-3.5 text-sm font-semibold text-text-inverse gradient-sky rounded-xl hover:brightness-110 transition-all"
                >
                  Contatta il team
                </motion.a>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── STRUCTURE ONBOARDING WIZARD ─── */}
          <AnimatePresence>
            {view === 'register-structure' && (
              <motion.div
                key="register-structure"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: easeOut }}
                className="w-full max-w-[680px]"
              >
                <div className="text-center mb-6">
                  <RoleBadge r={role} />
                  <h1 className="text-[28px] font-playfair font-bold text-text-primary mt-4">
                    Registrazione Struttura
                  </h1>
                </div>

                <GlassStepIndicator steps={structureSteps} currentStep={structStep} />

                <div className="rounded-xl border border-[rgba(91,184,245,0.12)] p-6 sm:p-8 backdrop-blur-[20px] bg-[rgba(13,30,52,0.72)]"
                  style={{
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                  }}
                >
                  <AnimatePresence mode="wait">
                    {/* Step 1: Dati Aziendali */}
                    {structStep === 1 && (
                      <GlassOnboardingStep
                        key="s1"
                        onNext={() => setStructStep(2)}
                        onPrev={() => setStructStep(1)}
                        isFirst={true}
                        isLast={false}
                        canProceed={canProceedStructure()}
                        missingFields={getStructureMissingFields()}
                      >
                        <h2 className="text-xl font-semibold text-text-primary mb-1">Dati Aziendali</h2>
                        <p className="text-sm text-text-muted mb-6">Inserisci le informazioni della tua azienda</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2 space-y-1.5">
                            <Label>Ragione Sociale <span className="text-[#F04545]">*</span></Label>
                            <Input
                              placeholder="Ristorante Bella Vita S.r.l."
                              value={structData.ragioneSociale as string}
                              onChange={(e) => updateStruct('ragioneSociale', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary focus:shadow-[0_0_0_4px_rgba(91,184,245,0.1)] hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>P.IVA <span className="text-[#F04545]">*</span></Label>
                            <Input
                              placeholder="12345678901"
                              maxLength={11}
                              value={structData.piva as string}
                              onChange={(e) => updateStruct('piva', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Codice Fiscale</Label>
                            <Input
                              placeholder="RSSMRA80A01H501Z"
                              value={structData.cf as string}
                              onChange={(e) => updateStruct('cf', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-1.5">
                            <Label>Sede Legale</Label>
                            <Input
                              placeholder="Via Roma 123, 00100 Roma (RM)"
                              value={structData.sedeLegale as string}
                              onChange={(e) => updateStruct('sedeLegale', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-1.5">
                            <Label>Sede Operativa (se diversa)</Label>
                            <Input
                              placeholder="Via Milano 45, 00100 Roma (RM)"
                              value={structData.sedeOperativa as string}
                              onChange={(e) => updateStruct('sedeOperativa', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                          </div>
                          <div className="sm:col-span-2 border-t border-[rgba(255,255,255,0.06)] pt-4 mt-2">
                            <p className="text-sm font-medium text-sky-primary mb-3">Referente Principale</p>
                          </div>
                          <div className="space-y-1.5">
                            <Label>Nome e Cognome <span className="text-[#F04545]">*</span></Label>
                            <Input
                              placeholder="Mario Rossi"
                              value={structData.referenteNome as string}
                              onChange={(e) => updateStruct('referenteNome', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Ruolo</Label>
                            <Input
                              placeholder="Direttore Operativo"
                              value={structData.referenteRuolo as string}
                              onChange={(e) => updateStruct('referenteRuolo', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Telefono Aziendale</Label>
                            <Input
                              placeholder="+39 06 12345678"
                              value={structData.referenteTelefono as string}
                              onChange={(e) => updateStruct('referenteTelefono', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Email Aziendale <span className="text-[#F04545]">*</span></Label>
                            <Input
                              type="email"
                              placeholder="info@ristorante.it"
                              value={structData.referenteEmail as string}
                              onChange={(e) => updateStruct('referenteEmail', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                            <p className="text-xs text-text-muted">
                              Sarà l'email di accesso al portale.
                            </p>
                          </div>
                          <div className="sm:col-span-2 border-t border-[rgba(255,255,255,0.06)] pt-4 mt-2">
                            <p className="text-sm font-medium text-sky-primary mb-3 flex items-center gap-2">
                              <Lock className="w-4 h-4" />
                              Credenziali di accesso
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <Label>Password <span className="text-[#F04545]">*</span></Label>
                            <Input
                              type="password"
                              placeholder="Almeno 8 caratteri"
                              value={structData.password as string}
                              onChange={(e) => updateStruct('password', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Conferma password <span className="text-[#F04545]">*</span></Label>
                            <Input
                              type="password"
                              placeholder="Ripeti la password"
                              value={structData.passwordConfirm as string}
                              onChange={(e) => updateStruct('passwordConfirm', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                            {(structData.passwordConfirm as string) &&
                              structData.password !== structData.passwordConfirm && (
                                <p className="text-xs text-error">Le password non coincidono</p>
                              )}
                          </div>
                        </div>
                      </GlassOnboardingStep>
                    )}

                    {/* Step 2: Identita Struttura */}
                    {structStep === 2 && (
                      <GlassOnboardingStep
                        key="s2"
                        onNext={() => setStructStep(3)}
                        onPrev={() => setStructStep(1)}
                        isFirst={false}
                        isLast={false}
                        canProceed={canProceedStructure()}
                        missingFields={getStructureMissingFields()}
                      >
                        <h2 className="text-xl font-semibold text-text-primary mb-1">Identit&agrave; della Struttura</h2>
                        <p className="text-sm text-text-muted mb-6">Descrivi il tuo tipo di attivit&agrave;</p>

                        <div className="space-y-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label>Tipo Struttura</Label>
                              <Select
                                value={structData.tipoStruttura as string}
                                onValueChange={(v) => updateStruct('tipoStruttura', v)}
                              >
                                <SelectTrigger className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] transition-all">
                                  <SelectValue placeholder="Seleziona tipo" />
                                </SelectTrigger>
                                <SelectContent className="backdrop-blur-xl bg-[rgba(13,30,52,0.95)] border-[rgba(91,184,245,0.15)]">
                                  {['Bar', 'Ristorante', 'Hotel', 'Resort', 'Location eventi', 'SPA', 'Altro'].map(
                                    (t) => (
                                      <SelectItem key={t} value={t}>
                                        {t}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-sky-primary" />
                                Zona Operativa
                                <GlassTooltip content="La zona determina la tariffa oraria applicata" position="top">
                                  <AlertCircle className="w-3.5 h-3.5 text-text-muted cursor-help" />
                                </GlassTooltip>
                              </Label>
                              <Select
                                value={structData.zona as string}
                                onValueChange={(v) => updateStruct('zona', v)}
                              >
                                <SelectTrigger className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] transition-all">
                                  <SelectValue placeholder="Seleziona zona" />
                                </SelectTrigger>
                                <SelectContent className="backdrop-blur-xl bg-[rgba(13,30,52,0.95)] border-[rgba(91,184,245,0.15)]">
                                  {['Centro', 'Periferia', 'Industriale', 'Eventi', 'Resort', 'Fuori citt&agrave;'].map((z) => (
                                    <SelectItem key={z} value={z}>
                                      {z}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label>Descrizione Breve</Label>
                            <Textarea
                              placeholder="Descrivi la tua struttura, specialit&agrave;, atmosfera..."
                              maxLength={500}
                              value={structData.descrizione as string}
                              onChange={(e) => updateStruct('descrizione', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all min-h-[100px] resize-none"
                            />
                            <p className="text-xs text-text-muted text-right">
                              {(structData.descrizione as string)?.length || 0}/500
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label>Foto Ambienti</Label>
                            <p className="text-xs text-text-muted">Carica almeno 5 foto dei tuoi ambienti</p>
                            <GlassDocumentUploader
                              onFilesChange={(files) => updateStruct('fotoAmbienti', files)}
                              maxFiles={10}
                              description="Trascina o clicca per caricare foto degli ambienti"
                            />
                          </div>
                        </div>
                      </GlassOnboardingStep>
                    )}

                    {/* Step 3: Video Attestazione */}
                    {structStep === 3 && (
                      <GlassOnboardingStep
                        key="s3"
                        onNext={() => setStructStep(4)}
                        onPrev={() => setStructStep(2)}
                        isFirst={false}
                        isLast={false}
                        canProceed={canProceedStructure()}
                        missingFields={getStructureMissingFields()}
                      >
                        <h2 className="text-xl font-semibold text-text-primary mb-1">Video di Attestazione</h2>
                        <p className="text-sm text-text-muted mb-6">Registra un breve video per verificare la tua identit&agrave;</p>

                        <GlassVideoRecorder
                          onRecordComplete={(blob) => updateStruct('videoAttestazione', blob)}
                          instructions="Registra un breve video — guarda in camera, dicendo nome, ruolo e data. Attesta di aver letto e accettato il contratto di servizio."
                        />
                      </GlassOnboardingStep>
                    )}

                    {/* Step 4: Esigenze Operative */}
                    {structStep === 4 && (
                      <GlassOnboardingStep
                        key="s4"
                        onNext={() => setStructStep(5)}
                        onPrev={() => setStructStep(3)}
                        isFirst={false}
                        isLast={false}
                        canProceed={canProceedStructure()}
                        missingFields={getStructureMissingFields()}
                      >
                        <h2 className="text-xl font-semibold text-text-primary mb-1">Esigenze Operative</h2>
                        <p className="text-sm text-text-muted mb-6">Indica quali figure cerchi e i tuoi fabbisogni</p>

                        <div className="space-y-6">
                          {/* Ruoli cercati */}
                          <div className="space-y-2">
                            <Label>Ruoli Cercati</Label>
                            <p className="text-xs text-text-muted mb-2">Seleziona uno o pi&ugrave; ruoli</p>
                            <div className="flex flex-wrap gap-2">
                              {ROLE_OPTIONS.map((r) => {
                                const selected = (structData.ruoliCercati as string[]).includes(r.value)
                                return (
                                  <motion.button
                                    key={r.value}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                      const curr = structData.ruoliCercati as string[]
                                      updateStruct(
                                        'ruoliCercati',
                                        selected ? curr.filter((v) => v !== r.value) : [...curr, r.value]
                                      )
                                    }}
                                    className={cn(
                                      'px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 backdrop-blur-sm',
                                      selected
                                        ? 'bg-[rgba(91,184,245,0.15)] border-sky-primary text-sky-primary shadow-[0_0_12px_rgba(91,184,245,0.1)]'
                                        : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-text-secondary hover:border-[rgba(91,184,245,0.3)] hover:text-text-primary'
                                    )}
                                  >
                                    {r.label}
                                  </motion.button>
                                )
                              })}
                            </div>
                          </div>

                          {/* Fasce orarie */}
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-sky-primary" />
                              Fasce Orarie Tipiche
                            </Label>
                            {['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'].map(
                              (day) => (
                                <div key={day} className="flex items-center gap-3">
                                  <span className="text-sm text-text-secondary w-28">{day}</span>
                                  <Input
                                    placeholder="Es. 19:00 - 23:00"
                                    value={(structData.fasceOrarie as Record<string, string>)?.[day] || ''}
                                    onChange={(e) =>
                                      updateStruct('fasceOrarie', {
                                        ...(structData.fasceOrarie as Record<string, string>),
                                        [day]: e.target.value,
                                      })
                                    }
                                    className="flex-1 bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] text-sm hover:border-[rgba(255,255,255,0.15)] transition-all"
                                  />
                                </div>
                              )
                            )}
                          </div>

                          {/* Persone per turno */}
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-sky-primary" />
                              Numero Medio Persone per Turno
                            </Label>
                            <Input
                              type="number"
                              min={1}
                              max={50}
                              value={structData.personePerTurno as string}
                              onChange={(e) => updateStruct('personePerTurno', e.target.value)}
                              className="w-32 bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                          </div>

                          {/* Servizi aggiuntivi */}
                          <div className="space-y-2">
                            <Label>Servizi Aggiuntivi Offerti</Label>
                            <div className="flex flex-wrap gap-3">
                              {[
                                { id: 'divise', label: 'Divise', icon: Shirt },
                                { id: 'navetta', label: 'Navetta', icon: Bus },
                                { id: 'attrezzature', label: 'Attrezzature', icon: Wrench },
                              ].map((s) => {
                                const selected = (structData.serviziAggiuntivi as string[]).includes(s.id)
                                const Icon = s.icon
                                return (
                                  <motion.button
                                    key={s.id}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => {
                                      const curr = structData.serviziAggiuntivi as string[]
                                      updateStruct(
                                        'serviziAggiuntivi',
                                        selected ? curr.filter((v) => v !== s.id) : [...curr, s.id]
                                      )
                                    }}
                                    className={cn(
                                      'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm transition-all backdrop-blur-sm',
                                      selected
                                        ? 'bg-[rgba(91,184,245,0.1)] border-sky-primary text-sky-primary shadow-[0_0_12px_rgba(91,184,245,0.08)]'
                                        : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-text-secondary hover:border-[rgba(255,255,255,0.15)]'
                                    )}
                                  >
                                    <Icon className="w-4 h-4" />
                                    {s.label}
                                  </motion.button>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </GlassOnboardingStep>
                    )}

                    {/* Step 5: Tag Valori */}
                    {structStep === 5 && (
                      <GlassOnboardingStep
                        key="s5"
                        onNext={() => setStructStep(6)}
                        onPrev={() => setStructStep(4)}
                        isFirst={false}
                        isLast={false}
                        canProceed={canProceedStructure()}
                        missingFields={getStructureMissingFields()}
                      >
                        <h2 className="text-xl font-semibold text-text-primary mb-1">Tag di Valori Richiesti</h2>
                        <p className="text-sm text-text-muted mb-6">Seleziona le qualit&agrave; che cerchi nei tuoi collaboratori</p>

                        <GlassTagSelector
                          tags={STRUCTURE_TAGS}
                          selectedIds={structData.tagValori as string[]}
                          onChange={(ids) => updateStruct('tagValori', ids)}
                        />
                      </GlassOnboardingStep>
                    )}

                    {/* Step 6: Qualificazione */}
                    {structStep === 6 && (
                      <GlassOnboardingStep
                        key="s6"
                        onNext={() => setStructStep(7)}
                        onPrev={() => setStructStep(5)}
                        isFirst={false}
                        isLast={false}
                        canProceed={canProceedStructure()}
                        missingFields={getStructureMissingFields()}
                      >
                        <h2 className="text-xl font-semibold text-text-primary mb-1">Domande di Qualificazione</h2>
                        <p className="text-sm text-text-muted mb-6">Aiutaci a capire meglio le tue esigenze</p>

                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <GlassInput label="Eventi / Coperti a settimana">
                                <Input
                                  type="number"
                                  placeholder="5"
                                  value={structData.eventiSettimana as string}
                                  onChange={(e) => updateStruct('eventiSettimana', e.target.value)}
                                  className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                                />
                              </GlassInput>
                            </div>
                            <div className="space-y-1.5">
                              <GlassInput label="Dipendenti interni">
                                <Input
                                  type="number"
                                  placeholder="12"
                                  value={structData.dipendentiInterni as string}
                                  onChange={(e) => updateStruct('dipendentiInterni', e.target.value)}
                                  className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                                />
                              </GlassInput>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <GlassInput label="Esperienze precedenti con servizi esterni" tooltip="Descrivi esperienze con agenzie o staffing">
                              <Textarea
                                placeholder="Descrivi eventuali esperienze con agenzie o servizi di staffing..."
                                value={structData.esperienzeEsterne as string}
                                onChange={(e) => updateStruct('esperienzeEsterne', e.target.value)}
                                className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] min-h-[80px] resize-none focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                              />
                            </GlassInput>
                          </div>

                          <div className="space-y-1.5">
                            <Label>Volume fatturato a fasce</Label>
                            <Select
                              value={structData.fatturato as string}
                              onValueChange={(v) => updateStruct('fatturato', v)}
                            >
                              <SelectTrigger className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] transition-all">
                                <SelectValue placeholder="Seleziona fascia" />
                              </SelectTrigger>
                              <SelectContent className="backdrop-blur-xl bg-[rgba(13,30,52,0.95)] border-[rgba(91,184,245,0.15)]">
                                {['< 100K', '100K - 500K', '500K - 1M', '1M - 5M', '> 5M'].map((f) => (
                                  <SelectItem key={f} value={f}>
                                    &euro; {f}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <GlassInput label="Stima ore personale esterno mensile">
                              <Input
                                type="number"
                                placeholder="160"
                                value={structData.oreEsternoMensili as string}
                                onChange={(e) => updateStruct('oreEsternoMensili', e.target.value)}
                                className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                              />
                            </GlassInput>
                          </div>
                        </div>
                      </GlassOnboardingStep>
                    )}

                    {/* Step 7: Metodo di Pagamento */}
                    {structStep === 7 && (
                      <GlassOnboardingStep
                        key="s7"
                        onNext={() => setStructStep(8)}
                        onPrev={() => setStructStep(6)}
                        isFirst={false}
                        isLast={false}
                        canProceed={canProceedStructure()}
                        missingFields={getStructureMissingFields()}
                      >
                        <h2 className="text-xl font-semibold text-text-primary mb-1">Metodo di Pagamento</h2>
                        <p className="text-sm text-text-muted mb-6">Configura il metodo di pagamento per i servizi</p>

                        {/* Info banner */}
                        <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(30,201,154,0.08)] border border-[rgba(30,201,154,0.15)] mb-6 backdrop-blur-md">
                          <AlertCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-success">
                            Nessun addebito ora. Il metodo serve solo per verifica.
                          </p>
                        </div>

                        {/* Payment method toggle */}
                        <div className="flex gap-3 mb-6">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateStruct('metodoPagamento', 'carta')}
                            className={cn(
                              'flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border text-sm font-medium transition-all backdrop-blur-md',
                              structData.metodoPagamento === 'carta'
                                ? 'bg-[rgba(91,184,245,0.1)] border-sky-primary text-sky-primary shadow-[0_0_16px_rgba(91,184,245,0.1)]'
                                : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-text-secondary hover:border-[rgba(255,255,255,0.15)]'
                            )}
                          >
                            <CreditCard className="w-4 h-4" />
                            Carta di Credito
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateStruct('metodoPagamento', 'sepa')}
                            className={cn(
                              'flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border text-sm font-medium transition-all backdrop-blur-md',
                              structData.metodoPagamento === 'sepa'
                                ? 'bg-[rgba(91,184,245,0.1)] border-sky-primary text-sky-primary shadow-[0_0_16px_rgba(91,184,245,0.1)]'
                                : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-text-secondary hover:border-[rgba(255,255,255,0.15)]'
                            )}
                          >
                            <Landmark className="w-4 h-4" />
                            Addebito SEPA
                          </motion.button>
                        </div>

                        {structData.metodoPagamento === 'carta' ? (
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <Label>Numero Carta</Label>
                              <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <Input
                                  placeholder="4242 4242 4242 4242"
                                  value={structData.cardNumber as string}
                                  onChange={(e) => updateStruct('cardNumber', e.target.value)}
                                  className="pl-10 bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] font-mono focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <Label>Scadenza</Label>
                                <Input
                                  placeholder="MM/AA"
                                  value={structData.cardExpiry as string}
                                  onChange={(e) => updateStruct('cardExpiry', e.target.value)}
                                  className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] font-mono focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                                />
                              </div>
                              <div className="space-y-1.5">
                                <Label>CVC</Label>
                                <Input
                                  type="password"
                                  placeholder="123"
                                  maxLength={4}
                                  value={structData.cardCvc as string}
                                  onChange={(e) => updateStruct('cardCvc', e.target.value)}
                                  className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] font-mono focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <Label>Titolare Carta</Label>
                              <Input
                                placeholder="MARIO ROSSI"
                                value={structData.cardHolder as string}
                                onChange={(e) => updateStruct('cardHolder', e.target.value)}
                                className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] uppercase focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <Label>IBAN</Label>
                              <Input
                                placeholder="IT60 X054 2811 1010 0000 0123 456"
                                value={structData.iban as string}
                                onChange={(e) => updateStruct('iban', e.target.value)}
                                className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] font-mono focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label>Intestatario Conto</Label>
                              <Input
                                placeholder="Ristorante Bella Vita S.r.l."
                                value={structData.sepaHolder as string}
                                onChange={(e) => updateStruct('sepaHolder', e.target.value)}
                                className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label>BIC/SWIFT (opzionale)</Label>
                              <Input
                                placeholder="UNCRITMM"
                                value={structData.bic as string}
                                onChange={(e) => updateStruct('bic', e.target.value)}
                                className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] font-mono focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                              />
                            </div>
                          </div>
                        )}
                      </GlassOnboardingStep>
                    )}

                    {/* Step 8: Riepilogo */}
                    {structStep === 8 && (
                      <GlassOnboardingStep
                        key="s8"
                        onNext={handleStructureSubmit}
                        onPrev={() => setStructStep(7)}
                        isFirst={false}
                        isLast={true}
                        canProceed={canProceedStructure()}
                        isSubmitting={isSubmitting}
                        nextLabel="Invia candidatura"
                      >
                        <h2 className="text-xl font-semibold text-text-primary mb-1">Riepilogo e Conferma</h2>
                        <p className="text-sm text-text-muted mb-6">Verifica i dati inseriti prima di inviare</p>

                        <div className="space-y-4 mb-6 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(13,30,52,0.4)] backdrop-blur-md p-5"
                          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
                        >
                          <SummaryRow label="Ragione Sociale" value={structData.ragioneSociale as string} />
                          <SummaryRow label="P.IVA" value={structData.piva as string} />
                          <SummaryRow label="Tipo" value={structData.tipoStruttura as string} />
                          <SummaryRow label="Zona" value={structData.zona as string} />
                          <SummaryRow
                            label="Ruoli cercati"
                            value={(structData.ruoliCercati as string[]).join(', ')}
                          />
                          <SummaryRow
                            label="Tag valori"
                            value={(structData.tagValori as string[])
                              .map((id) => STRUCTURE_TAGS.find((t) => t.id === id)?.label || id)
                              .join(', ')}
                          />
                          <SummaryRow
                            label="Metodo pagamento"
                            value={structData.metodoPagamento === 'carta' ? 'Carta di Credito' : 'Addebito SEPA'}
                          />
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] backdrop-blur-md">
                          <Checkbox
                            id="accetta-struttura"
                            checked={!!structData.accettatoContratto}
                            onCheckedChange={(v) => updateStruct('accettatoContratto', v === true)}
                          />
                          <Label htmlFor="accetta-struttura" className="text-sm text-text-secondary leading-relaxed cursor-pointer">
                            Dichiaro di aver letto e accettato il contratto di servizio, la clausola
                            antibypass e le penali.
                          </Label>
                        </div>
                      </GlassOnboardingStep>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ─── EMPLOYEE ONBOARDING WIZARD ─── */}
          <AnimatePresence>
            {view === 'register-employee' && (
              <motion.div
                key="register-employee"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: easeOut }}
                className="w-full max-w-[680px]"
              >
                <div className="text-center mb-6">
                  <RoleBadge r={role} />
                  <h1 className="text-[28px] font-playfair font-bold text-text-primary mt-4">
                    Registrazione Dipendente
                  </h1>
                </div>

                <GlassStepIndicator steps={employeeSteps} currentStep={empStep} />

                <div className="rounded-xl border border-[rgba(91,184,245,0.12)] p-6 sm:p-8 backdrop-blur-[20px] bg-[rgba(13,30,52,0.72)]"
                  style={{
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                  }}
                >
                  <AnimatePresence mode="wait">
                    {/* Step 1: Dati Personali */}
                    {empStep === 1 && (
                      <GlassOnboardingStep
                        key="e1"
                        onNext={() => setEmpStep(2)}
                        onPrev={() => setEmpStep(1)}
                        isFirst={true}
                        isLast={false}
                        canProceed={canProceedEmployee()}
                        missingFields={getEmployeeMissingFields()}
                      >
                        <h2 className="text-xl font-semibold text-text-primary mb-1">Dati Personali</h2>
                        <p className="text-sm text-text-muted mb-6">Inserisci i tuoi dati anagrafici</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label>Nome <span className="text-[#F04545]">*</span></Label>
                            <Input
                              placeholder="Marco"
                              value={empData.nome as string}
                              onChange={(e) => updateEmp('nome', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Cognome <span className="text-[#F04545]">*</span></Label>
                            <Input
                              placeholder="Bianchi"
                              value={empData.cognome as string}
                              onChange={(e) => updateEmp('cognome', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Data di Nascita <span className="text-[#F04545]">*</span></Label>
                            <Input
                              type="date"
                              value={empData.dataNascita as string}
                              onChange={(e) => updateEmp('dataNascita', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Codice Fiscale <span className="text-[#F04545]">*</span></Label>
                            <Input
                              placeholder="BNCMRC85A01H501Z"
                              value={empData.cf as string}
                              onChange={(e) => updateEmp('cf', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] font-mono focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-1.5">
                            <Label className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-sky-primary" />
                              Indirizzo Completo
                            </Label>
                            <Input
                              placeholder="Via Garibaldi 45, 00100 Roma (RM)"
                              value={empData.indirizzo as string}
                              onChange={(e) => updateEmp('indirizzo', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-sky-primary" />
                              Telefono
                            </Label>
                            <Input
                              type="tel"
                              placeholder="+39 333 1234567"
                              value={empData.telefono as string}
                              onChange={(e) => updateEmp('telefono', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-sky-primary" />
                              Email <span className="text-[#F04545]">*</span>
                            </Label>
                            <Input
                              type="email"
                              placeholder="marco.bianchi@email.it"
                              value={empData.email as string}
                              onChange={(e) => updateEmp('email', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                            <p className="text-xs text-text-muted">Sarà la tua email di accesso.</p>
                          </div>
                          <div className="sm:col-span-2 border-t border-[rgba(255,255,255,0.06)] pt-4 mt-2">
                            <p className="text-sm font-medium text-sky-primary mb-3 flex items-center gap-2">
                              <Lock className="w-4 h-4" />
                              Credenziali di accesso
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            <Label>Password <span className="text-[#F04545]">*</span></Label>
                            <Input
                              type="password"
                              placeholder="Almeno 8 caratteri"
                              value={empData.password as string}
                              onChange={(e) => updateEmp('password', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Conferma password <span className="text-[#F04545]">*</span></Label>
                            <Input
                              type="password"
                              placeholder="Ripeti la password"
                              value={empData.passwordConfirm as string}
                              onChange={(e) => updateEmp('passwordConfirm', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                            {(empData.passwordConfirm as string) &&
                              empData.password !== empData.passwordConfirm && (
                                <p className="text-xs text-error">Le password non coincidono</p>
                              )}
                          </div>
                          <div className="sm:col-span-2 space-y-2 pt-2">
                            <Label>Documento d&apos;Identit&agrave;</Label>
                            <p className="text-xs text-text-muted">Carica fronte e retro del documento</p>
                            <GlassDocumentUploader
                              onFilesChange={(files) => updateEmp('documentoFiles', files)}
                              maxFiles={2}
                              description="Carica fronte e retro del documento d'identità"
                            />
                          </div>
                        </div>
                      </GlassOnboardingStep>
                    )}

                    {/* Step 2: Foto Professionale */}
                    {empStep === 2 && (
                      <GlassOnboardingStep
                        key="e2"
                        onNext={handleEmployeeSubmit}
                        onPrev={() => setEmpStep(1)}
                        isFirst={false}
                        isLast={true}
                        isSubmitting={isSubmitting}
                        canProceed={canProceedEmployee()}
                        missingFields={getEmployeeMissingFields()}
                      >
                        <h2 className="text-xl font-semibold text-text-primary mb-1">Foto Professionale</h2>
                        <p className="text-sm text-text-muted mb-6">Carica una foto in contesto lavorativo</p>

                        <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(91,184,245,0.08)] border border-[rgba(91,184,245,0.15)] mb-6 backdrop-blur-md">
                          <AlertCircle className="w-5 h-5 text-sky-primary flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-text-secondary leading-relaxed">
                            Una foto in contesto lavorativo — divisa, grembiule, ambiente operativo.
                            Non foto casual o da social.
                          </p>
                        </div>

                        {/* Avatar preview */}
                        {(empData.fotoProfessionale as UploadedFile[]).length > 0 && (
                          <div className="flex justify-center mb-6">
                            <Avatar
                              src={(empData.fotoProfessionale as UploadedFile[])[0]?.url}
                              alt="Foto professionale"
                              size={120}
                              borderColor="rgba(91,184,245,0.3)"
                            />
                          </div>
                        )}

                        <GlassDocumentUploader
                          onFilesChange={(files) => updateEmp('fotoProfessionale', files)}
                          maxFiles={3}
                          acceptedTypes="image/*"
                          label="Foto professionale"
                          description="Carica fino a 3 foto professionali"
                          variant="avatar"
                        />
                      </GlassOnboardingStep>
                    )}

                    {/* Step 3: Video Attestazione */}
                    {empStep === 3 && (
                      <GlassOnboardingStep
                        key="e3"
                        onNext={() => setEmpStep(4)}
                        onPrev={() => setEmpStep(2)}
                        isFirst={false}
                        isLast={false}
                        canProceed={canProceedEmployee()}
                        missingFields={getEmployeeMissingFields()}
                      >
                        <h2 className="text-xl font-semibold text-text-primary mb-1">Video di Attestazione</h2>
                        <p className="text-sm text-text-muted mb-6">Registra un breve video per il contratto</p>

                        <GlassVideoRecorder
                          onRecordComplete={(blob) => updateEmp('videoAttestazione', blob)}
                          instructions="Registra un breve video — guarda in camera, dicendo nome completo, data di nascita e data odierna. Dichiara di accettare il contratto di lavoro con ATS."
                        />
                      </GlassOnboardingStep>
                    )}

                    {/* Step 4: Storico Lavorativo */}
                    {empStep === 4 && (
                      <GlassOnboardingStep
                        key="e4"
                        onNext={() => setEmpStep(5)}
                        onPrev={() => setEmpStep(3)}
                        isFirst={false}
                        isLast={false}
                        canProceed={canProceedEmployee()}
                        missingFields={getEmployeeMissingFields()}
                      >
                        <h2 className="text-xl font-semibold text-text-primary mb-1">Storico Lavorativo</h2>
                        <p className="text-sm text-text-muted mb-6">Aggiungi le tue esperienze e certificazioni</p>

                        {/* Esperienze */}
                        <div className="space-y-4 mb-6">
                          <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2">
                              <Briefcase className="w-4 h-4 text-sky-primary" />
                              Esperienze Lavorative
                            </Label>
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={addEsperienza}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-sky-primary bg-[rgba(91,184,245,0.08)] border border-[rgba(91,184,245,0.12)] rounded-lg hover:bg-[rgba(91,184,245,0.12)] transition-colors backdrop-blur-md"
                            >
                              <Plus className="w-3 h-3" />
                              Aggiungi
                            </motion.button>
                          </div>

                          <AnimatePresence>
                            {(empData.esperienze as Array<{
                              id: string
                              ruolo: string
                              tipoStruttura: string
                              periodoDa: string
                              periodoA: string
                            }>).map((esp, idx) => (
                              <motion.div
                                key={esp.id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(13,30,52,0.4)] space-y-3 backdrop-blur-md"
                                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-text-muted">Esperienza {idx + 1}</span>
                                  <button
                                    onClick={() => removeEsperienza(esp.id)}
                                    className="text-error hover:text-error/80 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <Input
                                    placeholder="Ruolo"
                                    value={esp.ruolo}
                                    onChange={(e) => {
                                      const list = [...(empData.esperienze as Array<{ id: string; ruolo: string; tipoStruttura: string; periodoDa: string; periodoA: string }>)]
                                      list[idx] = { ...esp, ruolo: e.target.value }
                                      updateEmp('esperienze', list)
                                    }}
                                    className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] text-sm focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                                  />
                                  <Input
                                    placeholder="Tipo struttura"
                                    value={esp.tipoStruttura}
                                    onChange={(e) => {
                                      const list = [...(empData.esperienze as Array<typeof esp>)]
                                      list[idx] = { ...esp, tipoStruttura: e.target.value }
                                      updateEmp('esperienze', list)
                                    }}
                                    className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] text-sm focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                                  />
                                  <Input
                                    type="month"
                                    placeholder="Da"
                                    value={esp.periodoDa}
                                    onChange={(e) => {
                                      const list = [...(empData.esperienze as Array<typeof esp>)]
                                      list[idx] = { ...esp, periodoDa: e.target.value }
                                      updateEmp('esperienze', list)
                                    }}
                                    className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] text-sm focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                                  />
                                  <Input
                                    type="month"
                                    placeholder="A"
                                    value={esp.periodoA}
                                    onChange={(e) => {
                                      const list = [...(empData.esperienze as Array<typeof esp>)]
                                      list[idx] = { ...esp, periodoA: e.target.value }
                                      updateEmp('esperienze', list)
                                    }}
                                    className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] text-sm focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                                  />
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          {(empData.esperienze as unknown[]).length === 0 && (
                            <p className="text-sm text-text-muted text-center py-4">
                              Nessuna esperienza aggiunta. Clicca &quot;Aggiungi&quot; per inserirne una.
                            </p>
                          )}
                        </div>

                        {/* Certificazioni */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-sky-primary" />
                              Certificazioni
                            </Label>
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={addCertificazione}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-sky-primary bg-[rgba(91,184,245,0.08)] border border-[rgba(91,184,245,0.12)] rounded-lg hover:bg-[rgba(91,184,245,0.12)] transition-colors backdrop-blur-md"
                            >
                              <Plus className="w-3 h-3" />
                              Aggiungi
                            </motion.button>
                          </div>

                          <AnimatePresence>
                            {(empData.certificazioni as Array<{
                              id: string
                              tipo: string
                              rilascio: string
                              scadenza: string
                            }>).map((cert, idx) => (
                              <motion.div
                                key={cert.id}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(13,30,52,0.4)] space-y-3 backdrop-blur-md"
                                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-text-muted">Certificazione {idx + 1}</span>
                                  <button
                                    onClick={() => removeCertificazione(cert.id)}
                                    className="text-error hover:text-error/80 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                  <Select
                                    value={cert.tipo}
                                    onValueChange={(v) => {
                                      const list = [...(empData.certificazioni as Array<typeof cert>)]
                                      list[idx] = { ...cert, tipo: v }
                                      updateEmp('certificazioni', list)
                                    }}
                                  >
                                    <SelectTrigger className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] text-sm hover:border-[rgba(255,255,255,0.15)] transition-all">
                                      <SelectValue placeholder="Tipo" />
                                    </SelectTrigger>
                                    <SelectContent className="backdrop-blur-xl bg-[rgba(13,30,52,0.95)] border-[rgba(91,184,245,0.15)]">
                                      <SelectItem value="HACCP">HACCP</SelectItem>
                                      <SelectItem value="Sicurezza">Sicurezza sul lavoro</SelectItem>
                                      <SelectItem value="Primo soccorso">Primo soccorso</SelectItem>
                                      <SelectItem value="Altro">Altro</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    type="date"
                                    placeholder="Rilascio"
                                    value={cert.rilascio}
                                    onChange={(e) => {
                                      const list = [...(empData.certificazioni as Array<typeof cert>)]
                                      list[idx] = { ...cert, rilascio: e.target.value }
                                      updateEmp('certificazioni', list)
                                    }}
                                    className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] text-sm focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                                  />
                                  <Input
                                    type="date"
                                    placeholder="Scadenza"
                                    value={cert.scadenza}
                                    onChange={(e) => {
                                      const list = [...(empData.certificazioni as Array<typeof cert>)]
                                      list[idx] = { ...cert, scadenza: e.target.value }
                                      updateEmp('certificazioni', list)
                                    }}
                                    className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] text-sm focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                                  />
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          {(empData.certificazioni as unknown[]).length === 0 && (
                            <p className="text-sm text-text-muted text-center py-4">
                              Nessuna certificazione aggiunta. Opzionale.
                            </p>
                          )}
                        </div>
                      </GlassOnboardingStep>
                    )}

                    {/* Step 5: Preferenze */}
                    {empStep === 5 && (
                      <GlassOnboardingStep
                        key="e5"
                        onNext={() => setEmpStep(6)}
                        onPrev={() => setEmpStep(4)}
                        isFirst={false}
                        isLast={false}
                        canProceed={canProceedEmployee()}
                        missingFields={getEmployeeMissingFields()}
                      >
                        <h2 className="text-xl font-semibold text-text-primary mb-1">Preferenze e Disponibilit&agrave;</h2>
                        <p className="text-sm text-text-muted mb-6">Configura le tue preferenze di lavoro</p>

                        <div className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label>Ruolo Principale</Label>
                              <Select
                                value={empData.ruoloPrincipale as string}
                                onValueChange={(v) => updateEmp('ruoloPrincipale', v)}
                              >
                                <SelectTrigger className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] transition-all">
                                  <SelectValue placeholder="Seleziona ruolo" />
                                </SelectTrigger>
                                <SelectContent className="backdrop-blur-xl bg-[rgba(13,30,52,0.95)] border-[rgba(91,184,245,0.15)]">
                                  {ROLE_OPTIONS.map((r) => (
                                    <SelectItem key={r.value} value={r.value}>
                                      {r.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-sky-primary" />
                                Zona di Lavoro
                              </Label>
                              <Select
                                value={empData.zonaLavoro as string}
                                onValueChange={(v) => updateEmp('zonaLavoro', v)}
                              >
                                <SelectTrigger className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)] transition-all">
                                  <SelectValue placeholder="Seleziona zona" />
                                </SelectTrigger>
                                <SelectContent className="backdrop-blur-xl bg-[rgba(13,30,52,0.95)] border-[rgba(91,184,245,0.15)]">
                                  {['Centro', 'Periferia', 'Industriale', 'Eventi', 'Resort'].map(
                                    (z) => (
                                      <SelectItem key={z} value={z}>
                                        {z}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Zone Selector Cards */}
                          <ZoneSelector
                            selectedId={empData.zonaLavoro as string}
                            onChange={(z) => updateEmp('zonaLavoro', z)}
                          />

                          {/* Ruoli secondari */}
                          <div className="space-y-2">
                            <Label>Ruoli Secondari</Label>
                            <p className="text-xs text-text-muted">Seleziona ruoli che sai svolgere</p>
                            <div className="flex flex-wrap gap-2">
                                            {ROLE_OPTIONS.map((r) => {
                                const selected = (empData.ruoliSecondari as string[]).includes(r.value)
                                return (
                                  <motion.button
                                    key={r.value}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                      const curr = empData.ruoliSecondari as string[]
                                      updateEmp(
                                        'ruoliSecondari',
                                        selected ? curr.filter((v) => v !== r.value) : [...curr, r.value]
                                      )
                                    }}
                                    className={cn(
                                      'px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 backdrop-blur-sm',
                                      selected
                                        ? 'bg-[rgba(91,184,245,0.15)] border-sky-primary text-sky-primary shadow-[0_0_12px_rgba(91,184,245,0.1)]'
                                        : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-text-secondary hover:border-[rgba(91,184,245,0.3)]'
                                    )}
                                  >
                                    {r.label}
                                  </motion.button>
                                )
                              })}
                            </div>
                          </div>

                          {/* Contract type */}
                          <div className="space-y-2">
                            <Label>Tipo Contratto</Label>
                            <div className="flex gap-3">
                              {[
                                { id: 'fulltime', label: 'Full-time' },
                                { id: 'parttime', label: 'Part-time' },
                                { id: 'turni', label: 'Solo Turni' },
                              ].map((c) => {
                                const isActive = empData.tipoContratto === c.id
                                return (
                                  <motion.button
                                    key={c.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => updateEmp('tipoContratto', c.id)}
                                    className={cn(
                                      'flex-1 py-3 rounded-xl border text-sm font-medium transition-all backdrop-blur-md',
                                      isActive
                                        ? 'bg-[rgba(91,184,245,0.1)] border-sky-primary text-sky-primary shadow-[0_0_16px_rgba(91,184,245,0.1)]'
                                        : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-text-secondary hover:border-[rgba(255,255,255,0.15)]'
                                    )}
                                  >
                                    {c.label}
                                  </motion.button>
                                )
                              })}
                            </div>
                          </div>

                          {/* Paga minima */}
                          <div className="space-y-1.5">
                            <GlassInput label="Paga Minima Oraria Accettabile" tooltip="Tariffa minima oraria accettata">
                              <div className="relative">
                                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                                <Input
                                  type="number"
                                  min={8}
                                  step={0.5}
                                  placeholder="8"
                                  value={empData.pagaMinima as string}
                                  onChange={(e) => updateEmp('pagaMinima', e.target.value)}
                                  className="pl-10 bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                                />
                              </div>
                            </GlassInput>
                          </div>

                          {/* Tag valori */}
                          <div className="space-y-2">
                            <Label>Tag Valori</Label>
                            <GlassTagSelector
                              tags={EMPLOYEE_TAGS}
                              selectedIds={empData.tagValori as string[]}
                              onChange={(ids) => updateEmp('tagValori', ids)}
                            />
                          </div>

                          {/* Navetta driver toggle */}
                          <div className="flex items-center gap-3 p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] backdrop-blur-md">
                            <Checkbox
                              id="navetta"
                              checked={empData.navettaDriver as boolean}
                              onCheckedChange={(v) => updateEmp('navettaDriver', v === true)}
                            />
                            <Label htmlFor="navetta" className="text-sm text-text-secondary cursor-pointer flex items-center gap-2">
                              <Bus className="w-4 h-4 text-sky-primary" />
                              Disponibile come navetta driver
                            </Label>
                          </div>
                        </div>
                      </GlassOnboardingStep>
                    )}

                    {/* Step 6: Calendario Disponibilità */}
                    {empStep === 6 && (
                      <GlassOnboardingStep
                        key="e6"
                        onNext={() => setEmpStep(7)}
                        onPrev={() => setEmpStep(5)}
                        isFirst={false}
                        isLast={false}
                        canProceed={canProceedEmployee()}
                        missingFields={getEmployeeMissingFields()}
                      >
                        <h2 className="text-xl font-semibold text-text-primary mb-1">Calendario Disponibilit&agrave;</h2>
                        <p className="text-sm text-text-muted mb-6">
                          Clicca sui giorni per segnare disponibilit&agrave; (verde) o indisponibilit&agrave; (grigio)
                        </p>

                        <div className="flex items-center gap-2 mb-4">
                          <CalendarDays className="w-5 h-5 text-sky-primary" />
                          <span className="text-sm font-medium text-text-secondary">Selezione disponibilit&agrave; mensile</span>
                        </div>

                        <GlassCalendarPicker
                          onChange={(days) => updateEmp('calendarioGiorni', days)}
                        />
                      </GlassOnboardingStep>
                    )}

                    {/* Step 7: Colloquio Video */}
                    {empStep === 7 && (
                      <GlassOnboardingStep
                        key="e7"
                        onNext={() => setEmpStep(8)}
                        onPrev={() => setEmpStep(6)}
                        isFirst={false}
                        isLast={false}
                        canProceed={canProceedEmployee()}
                        missingFields={getEmployeeMissingFields()}
                      >
                        <h2 className="text-xl font-semibold text-text-primary mb-1">Colloquio Video</h2>
                        <p className="text-sm text-text-muted mb-6">Prenota il tuo colloquio di benvenuto</p>

                        {/* Success banner */}
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(30,201,154,0.1)] border border-[rgba(30,201,154,0.2)] mb-6 backdrop-blur-md"
                        >
                          <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-success">Documenti approvati!</p>
                            <p className="text-xs text-text-secondary mt-1">
                              Scegli uno slot per il colloquio di benvenuto. Durer&agrave; circa 15 minuti.
                            </p>
                          </div>
                        </motion.div>

                        <div className="space-y-4">
                          <Label className="flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-sky-primary" />
                            Seleziona uno slot disponibile
                          </Label>

                          <div className="space-y-3">
                            {interviewSlots.map((day) => (
                              <div
                                key={day.day}
                                className="p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(13,30,52,0.4)] backdrop-blur-md"
                              >
                                <p className="text-sm font-medium text-text-primary mb-3">{day.day}</p>
                                <div className="flex flex-wrap gap-2">
                                  {day.slots.map((slot) => {
                                    const value = `${day.day} ${slot}`
                                    const isSelected = empData.slotColloquio === value
                                    return (
                                      <motion.button
                                        key={slot}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => updateEmp('slotColloquio', value)}
                                        className={cn(
                                          'px-3 py-2 rounded-lg text-sm font-medium border transition-all backdrop-blur-sm',
                                          isSelected
                                            ? 'bg-[rgba(91,184,245,0.15)] border-sky-primary text-sky-primary shadow-[0_0_12px_rgba(91,184,245,0.1)]'
                                            : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-text-secondary hover:border-[rgba(91,184,245,0.3)]'
                                        )}
                                      >
                                        {slot}
                                      </motion.button>
                                    )
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>

                          {(empData.slotColloquio as string) && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(91,184,245,0.08)] border border-[rgba(91,184,245,0.15)]"
                            >
                              <Check className="w-4 h-4 text-sky-primary" />
                              <span className="text-sm text-sky-primary">Slot selezionato: {empData.slotColloquio as string}</span>
                            </motion.div>
                          )}
                        </div>
                      </GlassOnboardingStep>
                    )}

                    {/* Step 8: OTP Firma */}
                    {empStep === 8 && (
                      <GlassOnboardingStep
                        key="e8"
                        onNext={handleEmployeeSubmit}
                        onPrev={() => setEmpStep(7)}
                        isFirst={false}
                        isLast={true}
                        canProceed={canProceedEmployee()}
                        isSubmitting={isSubmitting}
                        nextLabel="Firma contratto"
                      >
                        <h2 className="text-xl font-semibold text-text-primary mb-1">Attivazione e Firma</h2>
                        <p className="text-sm text-text-muted mb-6">Inserisci il codice OTP per firmare il contratto</p>

                        {/* Contract preview */}
                        <div className="p-5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(13,30,52,0.4)] mb-6 backdrop-blur-md max-h-[200px] overflow-y-auto"
                          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <FileText className="w-4 h-4 text-sky-primary" />
                            <span className="text-sm font-medium text-text-primary">Anteprima Contratto</span>
                          </div>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            Contratto di lavoro intermittente — Al TuO Servizio S.r.l. Dichiaro di aver letto
                            integralmente il contratto, di accettare le condizioni di pagamento, le penali per
                            no-show, e il sistema di ranking ATS. Dichiaro inoltre di non essere iscritto ad altre
                            agenzie di lavoro intermittente nel settore hospitality (clausola antibypass).
                          </p>
                        </div>

                        <div className="text-center space-y-4">
                          <p className="text-sm text-text-secondary">
                            Inserisci il codice a 6 cifre inviato al tuo cellulare
                          </p>

                          <GlassOTPInput
                            length={6}
                            onComplete={handleOTPComplete}
                            onChange={(code) => updateEmp('otpCode', code)}
                            disabled={empData.otpVerified as boolean}
                          />

                          <AnimatePresence>
                            {(empData.otpVerified as boolean) && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center justify-center gap-2 text-success"
                              >
                                <Check className="w-5 h-5" />
                                <span className="text-sm font-medium">Codice verificato</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </GlassOnboardingStep>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   Helper Components
   ═══════════════════════════════════════════ */

function SummaryRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-[rgba(255,255,255,0.04)] last:border-0">
      <span className="text-xs text-text-muted shrink-0">{label}</span>
      <span className="text-sm text-text-secondary text-right">{value}</span>
    </div>
  )
}
