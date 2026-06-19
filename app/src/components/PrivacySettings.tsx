// PrivacySettings — sezione GDPR self-service riusabile per admin/structure/
// employee. Implementa 2 dei diritti del Regolamento UE 2016/679:
//   • Art. 15 + 20 (accesso/portabilità): scarica un JSON con tutti i dati
//   • Art. 17 (cancellazione): elimina definitivamente l'account
//
// Backend: 2 RPC SECURITY DEFINER (mig 26) — niente service_role richiesto.

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Download, Trash2, ShieldAlert, AlertTriangle, Loader2, X } from 'lucide-react'
import { useToast } from '@/components/ui/ToastSystem'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function PrivacySettings() {
  const { user, signOut } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [exporting, setExporting] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [confirmEmail, setConfirmEmail] = useState('')
  const [deleting, setDeleting] = useState(false)

  const userEmail = user?.email ?? ''

  const handleExport = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const { data, error } = await supabase.rpc('export_my_data')
      if (error) throw error
      // Crea Blob JSON + scarica come file.
      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ats-data-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      addToast({
        type: 'success',
        title: 'Dati scaricati',
        message: 'Il file JSON con i tuoi dati è stato scaricato.',
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore export'
      addToast({ type: 'error', title: 'Export fallito', message })
    } finally {
      setExporting(false)
    }
  }

  const handleDelete = async () => {
    if (deleting) return
    if (confirmEmail.trim().toLowerCase() !== userEmail.toLowerCase()) {
      addToast({
        type: 'warning',
        title: 'Email errata',
        message: 'L\'email di conferma non coincide con la tua.',
      })
      return
    }
    setDeleting(true)
    try {
      const { error } = await supabase.rpc('delete_my_account', {
        p_email_confirm: confirmEmail.trim(),
      })
      if (error) throw error
      // Account eliminato: la sessione è ancora attiva client-side ma il
      // backend non riconosce più l'utente. Sign out + redirect a landing.
      try { await signOut() } catch { /* ignore */ }
      addToast({
        type: 'success',
        title: 'Account eliminato',
        message: 'I tuoi dati sono stati rimossi. Arrivederci.',
      })
      navigate('/')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore'
      addToast({ type: 'error', title: 'Cancellazione fallita', message })
      setDeleting(false)
    }
  }

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-sky-primary" />
          Privacy e dati personali
        </h3>
        <p className="text-xs text-text-muted mt-1">
          GDPR (Reg. UE 2016/679): puoi scaricare una copia dei tuoi dati o eliminare definitivamente l'account.
        </p>
      </div>

      {/* Export */}
      <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(13,30,52,0.5)] p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[rgba(91,184,245,0.12)] border border-[rgba(91,184,245,0.25)] flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-sky-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">Scarica i tuoi dati</p>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              File JSON con profilo, documenti, turni, recensioni, chat, notifiche, punti rank.
              Formato portabile (Art. 20 GDPR).
            </p>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-text-inverse rounded-lg gradient-sky hover:brightness-110 transition-all disabled:opacity-60"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Preparazione…
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  Scarica JSON
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Delete */}
      <div className="rounded-xl border border-[rgba(240,69,69,0.20)] bg-[rgba(240,69,69,0.04)] p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[rgba(240,69,69,0.10)] border border-[rgba(240,69,69,0.25)] flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-[#F04545]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">Elimina account</p>
            <p className="text-xs text-text-muted mt-1 leading-relaxed">
              Rimuove definitivamente profilo, documenti, storico turni e chat. <strong className="text-[#F04545]">Operazione irreversibile.</strong>
            </p>
            <button
              type="button"
              onClick={() => { setConfirmEmail(''); setDeleteOpen(true) }}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#F04545] border border-[rgba(240,69,69,0.40)] rounded-lg hover:bg-[rgba(240,69,69,0.08)] transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Elimina account
            </button>
          </div>
        </div>
      </div>

      {/* Confirm dialog */}
      <AnimatePresence>
        {deleteOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !deleting && setDeleteOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[210]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-x-4 top-[15%] sm:top-[20%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:max-w-[460px] z-[220]"
            >
              <div className="rounded-2xl border border-[rgba(240,69,69,0.35)] bg-[#0D1E34] shadow-[0_24px_64px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="flex items-start gap-3 p-5 border-b border-[rgba(255,255,255,0.06)]">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-[rgba(240,69,69,0.15)] border border-[rgba(240,69,69,0.35)]">
                    <AlertTriangle className="w-5 h-5 text-[#F04545]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-white">Elimina definitivamente</h3>
                    <p className="text-xs text-text-muted mt-1 leading-relaxed">
                      Tutti i tuoi dati saranno cancellati e non potranno essere recuperati.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteOpen(false)}
                    disabled={deleting}
                    className="p-1 text-text-muted hover:text-white"
                    aria-label="Chiudi"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-sm text-text-secondary">
                    Per confermare, scrivi la tua email completa:
                  </p>
                  <p className="text-xs font-mono text-sky-primary bg-[rgba(91,184,245,0.06)] px-3 py-2 rounded-lg break-all">
                    {userEmail}
                  </p>
                  <input
                    type="email"
                    value={confirmEmail}
                    onChange={(e) => setConfirmEmail(e.target.value)}
                    placeholder="Riscrivi la tua email qui"
                    autoComplete="off"
                    className="w-full bg-[rgba(13,30,52,0.5)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2.5 text-sm text-white placeholder-text-muted focus:border-[#F04545] outline-none transition-colors"
                  />

                  <div className="flex items-center gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setDeleteOpen(false)}
                      disabled={deleting}
                      className="px-4 py-2 text-sm text-text-secondary hover:text-white transition-colors disabled:opacity-50"
                    >
                      Annulla
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting || confirmEmail.trim().toLowerCase() !== userEmail.toLowerCase()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white rounded-xl bg-[#F04545] hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      {deleting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Cancellazione…
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          Elimina definitivamente
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
}
