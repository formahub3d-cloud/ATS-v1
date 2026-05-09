// AdminSettings — configurazioni globali persistite su DB.
// Versione MVP: 3 categorie (tariffe per zona, fee struttura, soglie rank)
// salvate come JSON in `public.app_settings`. UI snella con form.
//
// La vecchia versione (47KB) era pura UI POC con state in-memory; persa
// ad ogni refresh. Questa salva davvero.

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Save, AlertCircle, Check, Euro, Trophy, Building2, RefreshCw } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import GlassCard from '@/components/admin/GlassCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/ToastSystem'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface HourlyRates { [zone: string]: number }
interface StructureFee { annual: number; currency: string; discount_threshold_shifts: number; discount_percent: number }
interface RankThresholds { rookie: number; affidabile: number; senior: number; elite: number; ambassador: number }

const DEFAULT_RATES: HourlyRates = {
  Centro: 18, Periferia: 14, Industriale: 13, Eventi: 16, Resort: 14, 'Fuori città': 12,
}
const DEFAULT_FEE: StructureFee = { annual: 900, currency: 'EUR', discount_threshold_shifts: 100, discount_percent: 10 }
const DEFAULT_RANK: RankThresholds = { rookie: 0, affidabile: 500, senior: 1200, elite: 2000, ambassador: 3500 }

export default function AdminSettings() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [rates, setRates] = useState<HourlyRates>(DEFAULT_RATES)
  const [fee, setFee] = useState<StructureFee>(DEFAULT_FEE)
  const [rank, setRank] = useState<RankThresholds>(DEFAULT_RANK)

  const load = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const { data, error } = await supabase.from('app_settings').select('key, value').in('key', ['hourly_rates_by_zone', 'structure_fee', 'rank_thresholds'])
      if (error) throw error
      for (const row of data ?? []) {
        if (row.key === 'hourly_rates_by_zone') setRates(row.value as HourlyRates)
        if (row.key === 'structure_fee') setFee(row.value as StructureFee)
        if (row.key === 'rank_thresholds') setRank(row.value as RankThresholds)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore caricamento impostazioni'
      console.error('[AdminSettings] fetch error', err)
      setFetchError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const payloads: Array<{ key: string; value: unknown; updated_by: string }> = [
        { key: 'hourly_rates_by_zone', value: rates, updated_by: user.id },
        { key: 'structure_fee', value: fee, updated_by: user.id },
        { key: 'rank_thresholds', value: rank, updated_by: user.id },
      ]
      // upsert in parallelo.
      const results = await Promise.all(payloads.map((p) => supabase.from('app_settings').upsert(p)))
      for (const r of results) { if (r.error) throw r.error }
      addToast({ type: 'success', title: 'Impostazioni salvate', message: 'Le modifiche sono attive immediatamente.' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore salvataggio'
      addToast({ type: 'error', title: 'Errore', message })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-60 rounded" />
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Impostazioni"
        subtitle="Configurazioni globali della piattaforma. Le modifiche sono immediate."
        actions={
          <>
            <button
              onClick={load}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Ricarica impostazioni"
            >
              <RefreshCw className="w-5 h-5 text-text-muted" />
            </button>
            <motion.button
              type="button"
              onClick={handleSave}
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-text-inverse rounded-xl gradient-sky hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? 'Salvataggio…' : 'Salva modifiche'}
            </motion.button>
          </>
        }
      />

      {fetchError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(240,69,69,0.08)] border border-[rgba(240,69,69,0.2)] text-sm text-[#F04545]">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {fetchError}
        </div>
      )}

      {/* Tariffe orarie per zona */}
      <SettingsBlock icon={Euro} color="#5BB8F5" title="Tariffe orarie per zona" subtitle="Default in € per ora. Le strutture possono offrire di più sui singoli turni.">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.keys(rates).map((zone) => (
            <div key={zone} className="space-y-1.5">
              <Label className="text-xs">{zone}</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.50"
                  min="0"
                  value={rates[zone]}
                  onChange={(e) => setRates((prev) => ({ ...prev, [zone]: Number(e.target.value) || 0 }))}
                  className="bg-[rgba(13,30,52,0.6)] border-[rgba(255,255,255,0.08)] pr-10 font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">€/h</span>
              </div>
            </div>
          ))}
        </div>
      </SettingsBlock>

      {/* Fee strutture */}
      <SettingsBlock icon={Building2} color="#3AA3E8" title="Fee strutture" subtitle="Quota annuale e sconto fedeltà.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Quota annuale" suffix="€" type="number">
            <Input type="number" min="0" value={fee.annual} onChange={(e) => setFee((p) => ({ ...p, annual: Number(e.target.value) || 0 }))} className="bg-[rgba(13,30,52,0.6)] border-[rgba(255,255,255,0.08)] font-mono" />
          </Field>
          <Field label="Soglia turni per sconto">
            <Input type="number" min="0" value={fee.discount_threshold_shifts} onChange={(e) => setFee((p) => ({ ...p, discount_threshold_shifts: Number(e.target.value) || 0 }))} className="bg-[rgba(13,30,52,0.6)] border-[rgba(255,255,255,0.08)] font-mono" />
          </Field>
          <Field label="Sconto" suffix="%">
            <Input type="number" min="0" max="100" value={fee.discount_percent} onChange={(e) => setFee((p) => ({ ...p, discount_percent: Number(e.target.value) || 0 }))} className="bg-[rgba(13,30,52,0.6)] border-[rgba(255,255,255,0.08)] font-mono" />
          </Field>
        </div>
      </SettingsBlock>

      {/* Soglie rank */}
      <SettingsBlock icon={Trophy} color="#F5B800" title="Soglie rank dipendenti" subtitle="Punti minimi per ogni livello del sistema rank.">
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {(['rookie', 'affidabile', 'senior', 'elite', 'ambassador'] as const).map((lvl) => (
            <Field key={lvl} label={lvl[0].toUpperCase() + lvl.slice(1)} suffix="punti">
              <Input type="number" min="0" value={rank[lvl]} onChange={(e) => setRank((p) => ({ ...p, [lvl]: Number(e.target.value) || 0 }))} className="bg-[rgba(13,30,52,0.6)] border-[rgba(255,255,255,0.08)] font-mono" />
            </Field>
          ))}
        </div>
      </SettingsBlock>

      <p className="text-xs text-text-muted text-center pt-4">
        Altre impostazioni (penali, navette, referral) verranno aggiunte progressivamente.
      </p>
    </motion.div>
  )
}

function SettingsBlock({
  icon: Icon, color, title, subtitle, children,
}: {
  icon: typeof Euro; color: string; title: string; subtitle: string; children: React.ReactNode
}) {
  return (
    <GlassCard>
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}18`, border: `1px solid ${color}30` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </GlassCard>
  )
}

function Field({ label, suffix, children }: { label: string; suffix?: string; type?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <div className="relative">
        {children}
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">{suffix}</span>}
      </div>
    </div>
  )
}

