import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { structureStepSchemas, employeeStepSchemas } from '@/schemas/auth'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Shield,
  Building2,
  User,
  Mail,
  Check,
  CreditCard,
  Landmark,
  Plus,
  Trash2,
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

import GlassRoleSelector, { type UserRole } from '@/components/auth/GlassRoleSelector'
import GlassStepIndicator from '@/components/auth/GlassStepIndicator'
import GlassOnboardingStep from '@/components/auth/GlassOnboardingStep'
import GlassVideoRecorder from '@/components/auth/GlassVideoRecorder'
import GlassDocumentUploader from '@/components/auth/GlassDocumentUploader'
import type { UploadedFile } from '@/components/auth/GlassDocumentUploader'
import GlassCalendarPicker from '@/components/auth/GlassCalendarPicker'
import type { CalendarDay } from '@/components/auth/GlassCalendarPicker'
import GlassOTPInput from '@/components/auth/GlassOTPInput'
import GlassTagSelector from '@/components/auth/GlassTagSelector'
import type { Tag } from '@/components/auth/GlassTagSelector'
import ZoneSelector from '@/components/auth/ZoneSelector'

/* ─── easing ─── */
const easeOut = [0, 0, 0.2, 1] as [number, number, number, number]
const easeSpring = [0.34, 1.56, 0.64, 1] as [number, number, number, number]

/* ─── Structure Tags ─── */
const STRUCTURE_TAGS: Tag[] = [
  { id: 'puntualita', label: 'Puntualit\u00E0' },
  { id: 'professionalita', label: 'Professionalit\u00E0' },
  { id: 'pulizia', label: 'Pulizia personale' },
  { id: 'abbigliamento', label: 'Abbigliamento adeguato' },
  { id: 'velocita', label: 'Velocit\u00E0' },
  { id: 'pressione', label: 'Lavoro sotto pressione' },
  { id: 'lingue', label: 'Lingue straniere' },
  { id: 'sorriso', label: 'Sorriso' },
  { id: 'attitudine', label: 'Attitudine cliente' },
]

const EMPLOYEE_TAGS: Tag[] = [
  { id: 'flessibilita', label: 'Flessibilit\u00E0 orari' },
  { id: 'paga_equa', label: 'Paga equa' },
  { id: 'ambiente', label: 'Ambiente sereno' },
  { id: 'crescita', label: 'Crescita professionale' },
  { id: 'team', label: 'Lavoro di squadra' },
  { id: 'stabilita', label: 'Stabilit\u00E0' },
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
  const [view, setView] = useState<AuthView>('role-select')
  const [role, setRole] = useState<UserRole | null>(null)

  /* Login state */
  const [, setLoginError] = useState('')

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
  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole)
    setLoginError('')
    setView('login')
  }

  const handleDemo = (demoRole: UserRole) => {
    localStorage.setItem('ats_active_role', demoRole)
    addToast({
      type: 'success',
      title: 'Modalità demo attivata',
      message: `Navigazione come ${demoRole === 'admin' ? 'Admin' : demoRole === 'structure' ? 'Struttura' : 'Dipendente'}`,
    })
    if (demoRole === 'admin') navigate('/admin')
    else if (demoRole === 'structure') navigate('/structure')
    else navigate('/employee')
  }

  /* ─── Structure step validation ─── */
  const canProceedStructure = (): boolean => {
    // Step coperti da schema zod (validazione reale: email, P.IVA, ruoli, pagamento, contratto)
    const schema = structureStepSchemas[structStep]
    if (schema) return schema.safeParse(structData).success
    // Step non-schema (upload/asset)
    switch (structStep) {
      case 3:
        return !!structData.videoAttestazione
      default:
        return true
    }
  }

  /* ─── Employee step validation ─── */
  const canProceedEmployee = (): boolean => {
    // Step coperti da schema zod (anagrafica, ruoli/zona, slot colloquio)
    const schema = employeeStepSchemas[empStep]
    if (schema) return schema.safeParse(empData).success
    // Step non-schema (upload/asset, calendario, OTP)
    switch (empStep) {
      case 2:
        return (empData.fotoProfessionale as UploadedFile[]).length > 0
      case 3:
        return !!empData.videoAttestazione
      case 6:
        return (empData.calendarioGiorni as CalendarDay[]).filter((d) => d.status === 'available').length > 0
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
    await new Promise((r) => setTimeout(r, 2000))
    setIsSubmitting(false)
    addToast({ type: 'success', title: 'Candidatura inviata!', message: 'Ti contatteremo entro 48 ore per la verifica.' })
    setTimeout(() => {
      setView('login')
      setStructStep(1)
    }, 2500)
  }

  const handleEmployeeSubmit = async () => {
    setIsSubmitting(true)
    await new Promise((r) => setTimeout(r, 2000))
    setIsSubmitting(false)
    addToast({ type: 'success', title: 'Benvenuto nel network ATS!', message: "Scarica l'app e inizia a ricevere turni." })
    setTimeout(() => {
      setView('login')
      setEmpStep(1)
    }, 2500)
  }

  /* ─── Step labels ─── */
  const structureSteps = [
    'Dati aziendali',
    'Identit\u00E0 struttura',
    'Video attestazione',
    'Esigenze operative',
    'Tag valori',
    'Qualificazione',
    'Pagamento',
    'Conferma',
  ]

  const employeeSteps = [
    'Dati personali',
    'Foto professionale',
    'Video attestazione',
    'Storico lavorativo',
    'Preferenze',
    'Calendario',
    'Colloquio',
    'Firma contratto',
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
    { day: 'Luned\u00EC 16', slots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
    { day: 'Marted\u00EC 17', slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
    { day: 'Mercoled\u00EC 18', slots: ['10:00', '11:00', '14:00', '16:00'] },
    { day: 'Gioved\u00EC 19', slots: ['09:00', '11:00', '14:00', '15:00'] },
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
                  className="text-[40px] sm:text-[48px] font-playfair font-bold text-text-primary mb-2 text-center"
                  style={{ textShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                >
                  Accedi ad ATS
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15, ease: easeOut }}
                  className="text-base text-text-secondary mb-12 text-center"
                >
                  Seleziona il tuo profilo per continuare
                </motion.p>

                <GlassRoleSelector selectedRole={role} onSelect={handleRoleSelect} onDemo={handleDemo} />

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                  className="mt-12"
                >
                  <Link
                    to="/"
                    className="text-sm text-sky-primary hover:text-sky-blue transition-colors"
                  >
                    Torna alla home
                  </Link>
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
                  Accedi direttamente senza credenziali
                </p>

                <div className="w-full space-y-4">
                  {/* Accesso diretto */}
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(91,184,245,0.25)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => role && handleDemo(role)}
                    className="w-full py-3.5 text-sm font-semibold text-text-inverse rounded-xl transition-all duration-200 flex items-center justify-center gap-2 backdrop-blur-md gradient-sky hover:brightness-110"
                  >
                    <Check className="w-4 h-4" />
                    Entra come {role === 'admin' ? 'Admin' : role === 'structure' ? 'Struttura' : 'Dipendente'}
                  </motion.button>

                  {/* Links */}
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
                        onClick={() => setView('register-admin')}
                        className="text-sm text-sky-primary hover:text-sky-blue transition-colors"
                      >
                        Accesso su invito
                      </button>
                    ) : (
                      <p className="text-sm text-text-secondary">
                        Non hai un account?{' '}
                        <button
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
                </div>
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
                      >
                        <h2 className="text-xl font-semibold text-text-primary mb-1">Dati Aziendali</h2>
                        <p className="text-sm text-text-muted mb-6">Inserisci le informazioni della tua azienda</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2 space-y-1.5">
                            <Label>Ragione Sociale</Label>
                            <Input
                              placeholder="Ristorante Bella Vita S.r.l."
                              value={structData.ragioneSociale as string}
                              onChange={(e) => updateStruct('ragioneSociale', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary focus:shadow-[0_0_0_4px_rgba(91,184,245,0.1)] hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>P.IVA</Label>
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
                            <Label>Nome e Cognome</Label>
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
                            <Label>Email Aziendale</Label>
                            <Input
                              type="email"
                              placeholder="info@ristorante.it"
                              value={structData.referenteEmail as string}
                              onChange={(e) => updateStruct('referenteEmail', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
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
                            {['Luned\u00EC', 'Marted\u00EC', 'Mercoled\u00EC', 'Gioved\u00EC', 'Venerd\u00EC', 'Sabato', 'Domenica'].map(
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
                      >
                        <h2 className="text-xl font-semibold text-text-primary mb-1">Dati Personali</h2>
                        <p className="text-sm text-text-muted mb-6">Inserisci i tuoi dati anagrafici</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label>Nome</Label>
                            <Input
                              placeholder="Marco"
                              value={empData.nome as string}
                              onChange={(e) => updateEmp('nome', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Cognome</Label>
                            <Input
                              placeholder="Bianchi"
                              value={empData.cognome as string}
                              onChange={(e) => updateEmp('cognome', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Data di Nascita</Label>
                            <Input
                              type="date"
                              value={empData.dataNascita as string}
                              onChange={(e) => updateEmp('dataNascita', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label>Codice Fiscale</Label>
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
                              Email
                            </Label>
                            <Input
                              type="email"
                              placeholder="marco.bianchi@email.it"
                              value={empData.email as string}
                              onChange={(e) => updateEmp('email', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
                          </div>
                          <div className="sm:col-span-2 space-y-1.5">
                            <Label className="flex items-center gap-2">
                              <Landmark className="w-4 h-4 text-sky-primary" />
                              IBAN (per pagamenti mensili)
                            </Label>
                            <Input
                              placeholder="IT60 X054 2811 1010 0000 0123 456"
                              value={empData.iban as string}
                              onChange={(e) => updateEmp('iban', e.target.value)}
                              className="bg-[rgba(13,30,52,0.5)] backdrop-blur-md border-[rgba(255,255,255,0.08)] font-mono focus:border-sky-primary hover:border-[rgba(255,255,255,0.15)] transition-all"
                            />
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
                        onNext={() => setEmpStep(3)}
                        onPrev={() => setEmpStep(1)}
                        isFirst={false}
                        isLast={false}
                        canProceed={canProceedEmployee()}
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
