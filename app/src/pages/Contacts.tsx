// Contacts — pagina /contatti.
// Form pubblico (nome, email, oggetto, messaggio) che chiama la RPC
// public.submit_contact_message (SECURITY DEFINER): l'anonimo può scrivere
// senza avere policy INSERT diretta sulla tabella.
// Validazioni mirror di quelle SQL (length email, length body) per UX migliore.

import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, CheckCircle, Loader2, Building2, User, Wrench, Newspaper, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PageMeta from '@/components/PageMeta'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/components/ui/ToastSystem'

// Chip cliccabili (più moderne di una <select>): mostrano subito le opzioni
// e su mobile evitano il menu nativo che è sempre orribile.
const SUBJECTS: Array<{ value: string; label: string; icon: typeof Building2 }> = [
  { value: 'Sono una struttura HORECA e voglio info', label: 'Sono una struttura', icon: Building2 },
  { value: 'Cerco lavoro e voglio iscrivermi',         label: 'Cerco lavoro',       icon: User },
  { value: 'Problema tecnico / supporto',              label: 'Supporto',           icon: Wrench },
  { value: 'Stampa / partnership',                     label: 'Stampa',             icon: Newspaper },
  { value: 'Altro',                                    label: 'Altro',              icon: MoreHorizontal },
]

export default function Contacts() {
  const { addToast } = useToast()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: SUBJECTS[0].value,
    body: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({})

  const validate = () => {
    const next: typeof errors = {}
    if (form.name.trim().length < 2) next.name = 'Inserisci almeno 2 caratteri.'
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) next.email = 'Email non valida.'
    if (form.subject.trim().length < 3) next.subject = 'Oggetto troppo corto.'
    const len = form.body.trim().length
    if (len < 10) next.body = 'Almeno 10 caratteri.'
    if (len > 4000) next.body = 'Massimo 4000 caratteri.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!validate() || submitting) return
    setSubmitting(true)
    try {
      // Telefono opzionale: se fornito lo prepongo al body per non cambiare lo
      // schema SQL (la RPC non ha p_phone). In futuro si può aggiungere.
      const bodyWithPhone = form.phone.trim()
        ? `[Tel: ${form.phone.trim()}]\n\n${form.body.trim()}`
        : form.body.trim()
      const { error } = await supabase.rpc('submit_contact_message', {
        p_name: form.name.trim(),
        p_email: form.email.trim(),
        p_subject: form.subject.trim(),
        p_body: bodyWithPhone,
        p_source: '/contatti',
      })
      if (error) throw error
      setDone(true)
      addToast({
        type: 'success',
        title: 'Messaggio inviato',
        message: 'Ti rispondiamo entro 48h lavorative.',
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Errore sconosciuto'
      addToast({
        type: 'error',
        title: 'Invio fallito',
        message: msg.includes('troppi messaggi')
          ? 'Hai già scritto più volte oggi. Riprova domani.'
          : msg,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-navy">
      <PageMeta
        title="Contatti"
        description="Scrivici per info su ATS — strutture HORECA, lavoratori, partnership o stampa. Rispondiamo entro 48h lavorative."
        path="/contatti"
      />
      <Navbar />
      <main className="pt-24 pb-16">
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1100px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(91,184,245,0.25)] bg-[rgba(91,184,245,0.08)] mb-6">
              <Mail className="w-4 h-4 text-sky-primary" />
              <span className="text-xs font-medium text-sky-primary uppercase tracking-wider">Contatti</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-playfair font-bold text-white mb-4">
              Parliamone.
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Sei una struttura, un dipendente o un curioso? Scrivici qui — leggiamo tutto e rispondiamo entro 48h lavorative.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
            {/* FORM */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-6 sm:p-8"
            >
              {done ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[rgba(30,201,154,0.1)] border border-[rgba(30,201,154,0.3)] flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Ricevuto, grazie</h3>
                  <p className="text-text-secondary">
                    Ti rispondiamo all'email <strong className="text-white">{form.email}</strong> entro 48h lavorative.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setDone(false)
                      setForm({ name: '', email: '', phone: '', subject: SUBJECTS[0].value, body: '' })
                    }}
                    className="mt-6 text-sm text-sky-primary hover:underline"
                  >
                    Invia un altro messaggio
                  </button>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="space-y-5">
                  <Field label="Nome e cognome" error={errors.name}>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Mario Rossi"
                      autoComplete="name"
                      className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-text-muted focus:border-sky-primary focus:outline-none transition-colors"
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Email" error={errors.email}>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="mario@esempio.it"
                        autoComplete="email"
                        className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-text-muted focus:border-sky-primary focus:outline-none transition-colors"
                      />
                    </Field>

                    <Field label="Telefono (opzionale)">
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+39 ..."
                        autoComplete="tel"
                        className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-text-muted focus:border-sky-primary focus:outline-none transition-colors"
                      />
                    </Field>
                  </div>

                  <Field label="Di cosa parliamo?" error={errors.subject}>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECTS.map((s) => {
                        const SIcon = s.icon
                        const active = form.subject === s.value
                        return (
                          <button
                            key={s.value}
                            type="button"
                            onClick={() => setForm({ ...form, subject: s.value })}
                            className={cn(
                              'inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition-all',
                              active
                                ? 'bg-[rgba(91,184,245,0.15)] border-sky-primary text-sky-primary'
                                : 'bg-white/[0.03] border-white/10 text-text-secondary hover:bg-white/[0.06] hover:text-white',
                            )}
                          >
                            <SIcon className="w-3.5 h-3.5" />
                            {s.label}
                          </button>
                        )
                      })}
                    </div>
                  </Field>

                  <Field
                    label="Messaggio"
                    error={errors.body}
                    hint={
                      <span className={cn(
                        'tabular-nums',
                        form.body.length > 3800 ? 'text-[#F5B800]' : 'text-text-muted',
                      )}>
                        {form.body.length} / 4000
                      </span>
                    }
                  >
                    <textarea
                      value={form.body}
                      onChange={(e) => setForm({ ...form, body: e.target.value })}
                      placeholder="Raccontaci di cosa hai bisogno..."
                      rows={6}
                      maxLength={4000}
                      className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-text-muted focus:border-sky-primary focus:outline-none transition-colors resize-none"
                    />
                  </Field>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 gradient-sky text-text-inverse font-semibold text-base rounded-xl hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 disabled:hover:scale-100 shadow-lg shadow-sky-primary/20"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Invio…
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Invia messaggio
                      </>
                    )}
                  </button>

                  <p className="text-xs text-text-muted">
                    Inviando dichiari di aver letto la nostra{' '}
                    <a href="/privacy" className="text-sky-primary hover:underline">Privacy Policy</a>.
                  </p>
                </form>
              )}
            </motion.div>

            {/* INFO BOX laterale */}
            <motion.aside
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-4"
            >
              <InfoCard
                icon={Mail}
                title="Email diretta"
                text="info@ats-servizio.it"
                href="mailto:info@ats-servizio.it"
              />
              <InfoCard
                icon={Phone}
                title="Telefono"
                text="+39 0824 XXX XXX"
                hint="Lun-Ven, 9:00-18:00"
                href="tel:+390824000000"
              />
              <InfoCard
                icon={MapPin}
                title="Sede"
                text="Benevento, Italia"
                hint="Operiamo in tutta la provincia di Benevento."
              />
            </motion.aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-text-primary">{label}</span>
        {hint && <span className="text-xs text-text-muted">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </label>
  )
}

function InfoCard({
  icon: Icon,
  title,
  text,
  hint,
  href,
}: {
  icon: typeof Mail
  title: string
  text: string
  hint?: string
  href?: string
}) {
  const content = (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5 hover:bg-[rgba(255,255,255,0.04)] transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[rgba(91,184,245,0.1)] flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-sky-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-text-muted">{title}</p>
          <p className="text-white font-medium mt-0.5 break-all">{text}</p>
          {hint && <p className="text-xs text-text-muted mt-1">{hint}</p>}
        </div>
      </div>
    </div>
  )
  return href ? (
    <a href={href} className="block">
      {content}
    </a>
  ) : (
    content
  )
}
