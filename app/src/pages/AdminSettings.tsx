// @ts-nocheck
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Euro, Trophy, Gavel, Bell, Truck, Building, Share2, Settings2,
  ChevronRight, Save, RotateCcw, Check, Star, TrendingUp,
  Moon, Sun, Monitor, Plus, Pencil, MapPin,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import GlassCard from '@/components/admin/GlassCard'
import GlassBadge from '@/components/admin/GlassBadge'
import { useToast } from '@/components/ui/ToastSystem'
import {
  roleRates, rankThresholds, penaltyRules, feeTiers, discountTiers,
  positivePoints, negativePoints, zoneRates, getHourlyRate,
} from '@/data/mockAdmin'

const categories = [
  { key: 'tariffe', label: 'Tariffe e Pagamenti', icon: Euro },
  { key: 'rank', label: 'Rank e Punti', icon: Trophy },
  { key: 'penali', label: 'Penali', icon: Gavel },
  { key: 'turni', label: 'Turni e Notifiche', icon: Bell },
  { key: 'navette', label: 'Navette', icon: Truck },
  { key: 'fee', label: 'Fee Strutture', icon: Building },
  { key: 'referral', label: 'Referral', icon: Share2 },
  { key: 'sistema', label: 'Sistema', icon: Settings2 },
]

const rankVisualColors = ['#94A3B8', '#5BB8F5', '#3AA3E8', '#1EC99A', '#F5B800']

const zoneColors: Record<string, string> = {
  'Centro': '#5BB8F5',
  'Periferia': '#3AA3E8',
  'Industriale': '#1EC99A',
  'Eventi': '#F5B800',
  'Resort': '#F04545',
}

const roleNames = ['Cameriere', 'Chef', 'Barista', 'Barman', 'Receptionist', 'SPA Staff']

export default function AdminSettings() {
  const { addToast } = useToast()
  const [activeCategory, setActiveCategory] = useState('tariffe')
  const [hasChanges, setHasChanges] = useState(false)
  const [saved, setSaved] = useState(false)
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    pushNotif: true,
    smsUrgent: true,
    autoNoShow: true,
    autoPool: true,
    navettaActive: true,
    maintenance: false,
  })
  const [rates, setRates] = useState(roleRates)
  const [ranks, setRanks] = useState(rankThresholds)
  const [penalties, setPenalties] = useState(penaltyRules)
  const [zoneRateData, setZoneRateData] = useState(zoneRates)
  const [customZoneRates, setCustomZoneRates] = useState<Record<string, Record<string, number>>>({})

  const handleSave = () => {
    setSaved(true)
    setHasChanges(false)
    addToast({ type: 'success', title: 'Impostazioni salvate', message: 'Tutte le modifiche sono state salvate con successo.' })
    setTimeout(() => setSaved(false), 2000)
  }

  const handleToggle = (key: string) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }))
    setHasChanges(true)
  }

  const updateRate = (index: number, field: string, value: string) => {
    const newRates = [...rates]
    newRates[index] = { ...newRates[index], [field]: field === 'role' ? value : parseFloat(value) || 0 }
    setRates(newRates)
    setHasChanges(true)
  }

  const updateRank = (index: number, field: string, value: string) => {
    const newRanks = [...ranks]
    newRanks[index] = { ...newRanks[index], [field]: field === 'name' || field === 'benefits' ? value : parseFloat(value) || 0 }
    setRanks(newRanks)
    setHasChanges(true)
  }

  const updateZoneRate = (zone: string, role: string, value: number) => {
    setCustomZoneRates(prev => ({
      ...prev,
      [zone]: { ...prev[zone], [role]: value }
    }))
    setHasChanges(true)
  }

  const getZoneRate = (zone: string, role: string) => {
    return customZoneRates[zone]?.[role] ?? getHourlyRate(role === 'Cameriere' ? 'Affidabile' : role === 'Chef' ? 'Senior' : 'Rookie', zone)
  }

  const Toggle = ({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-white">{label}</span>
      <button
        onClick={onChange}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors duration-200',
          value ? 'bg-success' : 'bg-[rgba(255,255,255,0.1)]'
        )}
      >
        <motion.div
          animate={{ x: value ? 20 : 2 }}
          transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full"
        />
      </button>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-semibold text-white">Impostazioni Globali</h1>
        <motion.button
          animate={hasChanges ? { boxShadow: '0 0 20px rgba(91,184,245,0.3)' } : {}}
          onClick={handleSave}
          disabled={!hasChanges}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300',
            saved
              ? 'bg-success text-text-inverse'
              : hasChanges
              ? 'gradient-sky text-text-inverse hover:brightness-110'
              : 'bg-white/5 text-text-muted cursor-not-allowed'
          )}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Salvato!' : 'Salva modifiche'}
        </motion.button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Settings Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:w-[220px] flex-shrink-0"
        >
          <nav className="space-y-1">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  'flex items-center w-full h-10 px-4 rounded-xl text-sm font-medium transition-all duration-200',
                  activeCategory === cat.key
                    ? 'bg-[rgba(91,184,245,0.1)] text-sky-primary border-l-[3px] border-l-sky-primary'
                    : 'text-text-secondary hover:bg-white/[0.04] hover:text-white'
                )}
              >
                <cat.icon className="w-4 h-4 mr-3" />
                {cat.label}
              </motion.button>
            ))}
          </nav>
        </motion.div>

        {/* Settings Content */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {/* Tariffe e Pagamenti */}
            {activeCategory === 'tariffe' && (
              <motion.div
                key="tariffe"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* ZONAL HOURLY RATE TABLE — Prominent */}
                <GlassCard>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-5 h-5 text-sky-primary" />
                        <h2 className="text-xl font-semibold text-white">Tariffe orarie zonali</h2>
                      </div>
                      <p className="text-sm text-text-muted">Matrix zona × ruolo con moltiplicatori di rank. Clicca una cella per modificare.</p>
                    </div>
                    <button
                      onClick={() => { setCustomZoneRates({}); addToast({ type: 'info', title: 'Reset', message: 'Le tariffe zonali sono state ripristinate.' }) }}
                      className="text-xs text-text-muted hover:text-white transition-colors flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Reset default
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[rgba(255,255,255,0.06)]">
                          <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase">Zona / Ruolo</th>
                          {roleNames.map(role => (
                            <th key={role} className="text-center px-3 py-3 text-xs font-medium text-text-muted uppercase">{role}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(zoneRateData).map(([zone, baseRate], zi) => (
                          <motion.tr
                            key={zone}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: zi * 0.05 }}
                            className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(91,184,245,0.03)]"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ background: zoneColors[zone] || '#5BB8F5' }} />
                                <span className="text-sm text-white font-medium">{zone}</span>
                                <GlassBadge variant="zone" className="text-[10px] px-1.5 py-0.5">
                                  €{baseRate}/h base
                                </GlassBadge>
                              </div>
                            </td>
                            {roleNames.map(role => {
                              const rate = getZoneRate(zone, role)
                              return (
                                <td key={role} className="px-3 py-3 text-center">
                                  <input
                                    type="number"
                                    value={rate}
                                    onChange={e => updateZoneRate(zone, role, parseFloat(e.target.value) || 0)}
                                    step="0.5"
                                    className="w-16 bg-[rgba(6,16,30,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg px-2 py-1.5 text-sm text-center text-white outline-none focus:border-sky-primary focus:shadow-[0_0_8px_rgba(91,184,245,0.2)] transition-all backdrop-blur-sm"
                                  />
                                </td>
                              )
                            })}
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>

                {/* Role Rates */}
                <GlassCard>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Tariffe orarie base per ruolo</h2>
                      <p className="text-sm text-text-muted mt-1">Questi sono i default. Ogni struttura può avere tariffe sovrascritte individualmente.</p>
                    </div>
                    <button onClick={() => setRates(roleRates)} className="text-xs text-text-muted hover:text-white transition-colors flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> Reset default
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[rgba(255,255,255,0.06)]">
                          <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase">Ruolo</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase">Tariffa base (€/h)</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase">Festivo</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase">Notturno</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase">Straordinario</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rates.map((r, i) => (
                          <motion.tr
                            key={r.role}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(91,184,245,0.03)]"
                          >
                            <td className="px-4 py-3 text-sm text-white font-medium">{r.role}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <span className="text-text-muted text-sm">€</span>
                                <input
                                  type="number"
                                  value={r.baseRate}
                                  onChange={e => { updateRate(i, 'baseRate', e.target.value); setHasChanges(true) }}
                                  step="0.5"
                                  min="0"
                                  className="w-20 bg-[rgba(6,16,30,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-sky-primary backdrop-blur-sm"
                                />
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={r.holiday}
                                  onChange={e => { updateRate(i, 'holiday', e.target.value); setHasChanges(true) }}
                                  className="w-16 bg-[rgba(6,16,30,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-sky-primary backdrop-blur-sm"
                                />
                                <span className="text-text-muted text-sm">%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={r.night}
                                  onChange={e => { updateRate(i, 'night', e.target.value); setHasChanges(true) }}
                                  className="w-16 bg-[rgba(6,16,30,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-sky-primary backdrop-blur-sm"
                                />
                                <span className="text-text-muted text-sm">%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={r.overtime}
                                  onChange={e => { updateRate(i, 'overtime', e.target.value); setHasChanges(true) }}
                                  className="w-16 bg-[rgba(6,16,30,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-sky-primary backdrop-blur-sm"
                                />
                                <span className="text-text-muted text-sm">%</span>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h3 className="text-lg font-semibold text-white mt-8 mb-4">Impostazioni pagamenti</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Tariffa minima struttura (€/h)', value: '15.00' },
                      { label: 'Margine minimo richiesto (%)', value: '30' },
                      { label: 'Addebito struttura: ore dalla fine turno', value: '4' },
                      { label: 'Bonifico dipendente: giorno del mese', value: '27' },
                    ].map((field, i) => (
                      <motion.div
                        key={field.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.05 }}
                      >
                        <label className="text-xs text-text-muted mb-1 block">{field.label}</label>
                        <div className="flex items-center gap-1">
                          {field.label.includes('€') && <span className="text-text-muted text-sm">€</span>}
                          <input
                            type="text"
                            defaultValue={field.value}
                            onChange={() => setHasChanges(true)}
                            className="w-full bg-[rgba(6,16,30,0.6)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-primary backdrop-blur-sm"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Rank e Punti */}
            {activeCategory === 'rank' && (
              <motion.div
                key="rank"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Rank Thresholds */}
                <GlassCard>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Soglie Rank</h2>
                    <button onClick={() => setRanks(rankThresholds)} className="text-xs text-text-muted hover:text-white flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  </div>
                  <div className="relative space-y-3 mb-6">
                    {ranks.map((rank, i) => (
                      <motion.div
                        key={rank.level}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-4"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${rankVisualColors[i]}20`, border: `1px solid ${rankVisualColors[i]}40` }}
                        >
                          <Star className="w-5 h-5" style={{ color: rankVisualColors[i] }} />
                        </div>
                        <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                          <div>
                            <p className="text-xs text-text-muted">Livello {rank.level}</p>
                            <p className="text-sm font-semibold" style={{ color: rankVisualColors[i] }}>{rank.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-text-muted">Punti</p>
                            <input
                              type="number"
                              value={rank.points}
                              onChange={e => { updateRank(i, 'points', e.target.value); setHasChanges(true) }}
                              className="w-20 bg-[rgba(6,16,30,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-sky-primary backdrop-blur-sm"
                            />
                          </div>
                          <div>
                            <p className="text-xs text-text-muted">Bonus €/h</p>
                            <input
                              type="number"
                              value={rank.bonus}
                              step="0.5"
                              onChange={e => { updateRank(i, 'bonus', e.target.value); setHasChanges(true) }}
                              className="w-20 bg-[rgba(6,16,30,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-sky-primary backdrop-blur-sm"
                            />
                          </div>
                          <div>
                            <p className="text-xs text-text-muted">Vantaggi</p>
                            <input
                              type="text"
                              value={rank.benefits}
                              onChange={e => { updateRank(i, 'benefits', e.target.value); setHasChanges(true) }}
                              className="w-full bg-[rgba(6,16,30,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-sky-primary backdrop-blur-sm"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>

                {/* Points Rules */}
                <GlassCard>
                  <h3 className="text-lg font-semibold text-white mb-4">Regole punti — Positivi</h3>
                  <div className="space-y-2 mb-6">
                    {positivePoints.map((p, i) => (
                      <motion.div
                        key={p.action}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.04)]"
                      >
                        <span className="text-sm text-white">{p.action}</span>
                        <input
                          type="number"
                          defaultValue={p.points}
                          onChange={() => setHasChanges(true)}
                          className="w-16 bg-[rgba(6,16,30,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg px-2 py-1 text-sm text-success text-center outline-none focus:border-success backdrop-blur-sm"
                        />
                      </motion.div>
                    ))}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-4">Regole punti — Negativi</h3>
                  <div className="space-y-2">
                    {negativePoints.map((p, i) => (
                      <motion.div
                        key={p.action}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.04)]"
                      >
                        <span className="text-sm text-white">{p.action}</span>
                        <input
                          type="number"
                          defaultValue={p.points}
                          onChange={() => setHasChanges(true)}
                          className="w-16 bg-[rgba(6,16,30,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg px-2 py-1 text-sm text-error text-center outline-none focus:border-error backdrop-blur-sm"
                        />
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Penali */}
            {activeCategory === 'penali' && (
              <motion.div
                key="penali"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <GlassCard>
                  <h2 className="text-xl font-semibold text-white mb-4">Penali strutture</h2>
                  <div className="space-y-3">
                    {penalties.map((p, i) => (
                      <motion.div
                        key={p.penalty}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl border border-white/5 hover:border-[rgba(240,69,69,0.3)] hover:-translate-y-0.5 transition-all backdrop-blur-sm bg-white/[0.02]"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{p.penalty}</p>
                          <p className="text-xs text-text-muted">{p.condition}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-semibold text-error">{p.amount}</span>
                          {p.editable && (
                            <button className="text-xs text-text-muted hover:text-white">
                              <Pencil className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <label className="text-xs text-text-muted mb-1 block">Periodo lookback antibypass (mesi)</label>
                    <input
                      type="number"
                      defaultValue={24}
                      onChange={() => setHasChanges(true)}
                      className="w-32 bg-[rgba(6,16,30,0.6)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-primary backdrop-blur-sm"
                    />
                  </div>
                </GlassCard>

                <GlassCard>
                  <h2 className="text-xl font-semibold text-white mb-4">Penali dipendenti</h2>
                  <div className="space-y-3">
                    {[
                      { penalty: 'Rinuncia 24-48h', consequence: '-Punti rank + nota profilo' },
                      { penalty: 'No-show', consequence: 'Decurtazione paga ore turno' },
                      { penalty: 'Abbandono pre-rimborso', consequence: 'Rimborso costi attivazione' },
                      { penalty: 'Contatto diretto struttura', consequence: '€500+' },
                    ].map((p, i) => (
                      <motion.div
                        key={p.penalty}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl border border-white/5 backdrop-blur-sm bg-white/[0.02]"
                      >
                        <p className="text-sm font-medium text-white">{p.penalty}</p>
                        <p className="text-sm text-text-muted">{p.consequence}</p>
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Turni e Notifiche */}
            {activeCategory === 'turni' && (
              <motion.div
                key="turni"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <GlassCard>
                  <h2 className="text-xl font-semibold text-white mb-4">Timing turni</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {[
                      { label: 'Tempo risposta turno normale (ore)', value: '48' },
                      { label: 'Tempo risposta turno urgente (ore)', value: '2' },
                      { label: 'Tempo risposta emergenza (min)', value: '30' },
                      { label: 'Numero profili notificati per turno', value: '5' },
                      { label: 'Preavviso indirizzo struttura (ore)', value: '2' },
                      { label: 'Finestra check-in no-show (min)', value: '15' },
                    ].map((field, i) => (
                      <motion.div
                        key={field.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <label className="text-xs text-text-muted mb-1 block">{field.label}</label>
                        <input
                          type="text"
                          defaultValue={field.value}
                          onChange={() => setHasChanges(true)}
                          className="w-full bg-[rgba(6,16,30,0.6)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-primary backdrop-blur-sm"
                        />
                      </motion.div>
                    ))}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Notifiche</h3>
                  <div className="border-t border-[rgba(255,255,255,0.06)]">
                    <Toggle label="Notifica push turni dipendenti" value={toggles.pushNotif} onChange={() => handleToggle('pushNotif')} />
                    <Toggle label="Notifica SMS turni urgenti" value={toggles.smsUrgent} onChange={() => handleToggle('smsUrgent')} />
                    <Toggle label="Alert automatico no-show" value={toggles.autoNoShow} onChange={() => handleToggle('autoNoShow')} />
                    <Toggle label="Protocollo reperibili automatico" value={toggles.autoPool} onChange={() => handleToggle('autoPool')} />
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Navette */}
            {activeCategory === 'navette' && (
              <motion.div
                key="navette"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <GlassCard>
                  <h2 className="text-xl font-semibold text-white mb-4">Configurazione navette</h2>
                  <Toggle label="Navetta ATS attiva" value={toggles.navettaActive} onChange={() => handleToggle('navettaActive')} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                    {[
                      { label: 'Costo navetta ATS per tratta (€)', value: '3.50' },
                      { label: 'Rimborso driver per km (€)', value: '0.40' },
                      { label: 'Quota passeggero navetta (€)', value: '2.00' },
                      { label: 'Max km per tratta', value: '15' },
                    ].map((field, i) => (
                      <motion.div
                        key={field.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <label className="text-xs text-text-muted mb-1 block">{field.label}</label>
                        <input
                          type="text"
                          defaultValue={field.value}
                          onChange={() => setHasChanges(true)}
                          className="w-full bg-[rgba(6,16,30,0.6)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-primary backdrop-blur-sm"
                        />
                      </motion.div>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Fee Strutture */}
            {activeCategory === 'fee' && (
              <motion.div
                key="fee"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <GlassCard>
                  <h2 className="text-xl font-semibold text-white mb-4">Fee annuali per tipo struttura</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[rgba(255,255,255,0.06)]">
                          <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase">Tipo struttura</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase">Fee annuale (€)</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase">Volume stimato</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeTiers.map((f, i) => (
                          <motion.tr
                            key={f.type}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(91,184,245,0.03)]"
                          >
                            <td className="px-4 py-3 text-sm text-white">{f.type}</td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                defaultValue={f.fee}
                                onChange={() => setHasChanges(true)}
                                className="w-24 bg-[rgba(6,16,30,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-sky-primary backdrop-blur-sm"
                              />
                            </td>
                            <td className="px-4 py-3 text-sm text-text-muted">{f.volume}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>

                <GlassCard>
                  <h2 className="text-xl font-semibold text-white mb-4">Sconti progressivi fee</h2>
                  <p className="text-sm text-text-muted mb-4">Sconto sulla fee annuale in base al volume di turni pianificati.</p>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[rgba(255,255,255,0.06)]">
                          <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase">Turni pianificati annuali</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase">Sconto fee</th>
                        </tr>
                      </thead>
                      <tbody>
                        {discountTiers.map((d, i) => (
                          <motion.tr
                            key={d.range}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(91,184,245,0.03)]"
                          >
                            <td className="px-4 py-3 text-sm text-white">{d.range}</td>
                            <td className="px-4 py-3">
                              <GlassBadge variant="sky">
                                {d.discount}
                              </GlassBadge>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Referral */}
            {activeCategory === 'referral' && (
              <motion.div
                key="referral"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <GlassCard>
                  <h2 className="text-xl font-semibold text-white mb-4">Commissioni referral</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-xs text-text-muted mb-1 block">Commissione referral struttura (%)</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          defaultValue="5"
                          onChange={() => setHasChanges(true)}
                          className="w-full bg-[rgba(6,16,30,0.6)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-primary backdrop-blur-sm"
                        />
                        <span className="text-text-muted">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-text-muted mb-1 block">Bonus dipendente segnalazione bypass (€)</label>
                      <div className="flex items-center gap-1">
                        <span className="text-text-muted">€</span>
                        <input
                          type="number"
                          defaultValue="200"
                          onChange={() => setHasChanges(true)}
                          className="w-full bg-[rgba(6,16,30,0.6)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-primary backdrop-blur-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setHasChanges(true)}
                    className="px-4 py-2 text-sm text-text-inverse gradient-sky rounded-xl hover:brightness-110 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Genera nuovo codice commerciale
                  </button>

                  <h3 className="text-lg font-semibold text-white mt-8 mb-4">Commerciali attivi</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[rgba(255,255,255,0.06)]">
                          <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase">Nome</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase">Codice</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase">Strutture</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase">Fatturato</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-text-muted uppercase">Provvigioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { name: 'Marco Rossi', code: 'ATS-COMM-0012', structures: 8, revenue: 45000, commission: 2250 },
                          { name: 'Laura Bianchi', code: 'ATS-COMM-0034', structures: 5, revenue: 28000, commission: 1400 },
                          { name: 'Giuseppe Verdi', code: 'ATS-COMM-0056', structures: 3, revenue: 12000, commission: 600 },
                        ].map((c, i) => (
                          <motion.tr
                            key={c.code}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(91,184,245,0.03)]"
                          >
                            <td className="px-4 py-3 text-sm text-white font-medium">{c.name}</td>
                            <td className="px-4 py-3 font-mono text-xs text-sky-primary">{c.code}</td>
                            <td className="px-4 py-3 text-sm text-text-secondary">{c.structures}</td>
                            <td className="px-4 py-3 text-sm text-text-secondary">€{c.revenue.toLocaleString('it-IT')}</td>
                            <td className="px-4 py-3 text-sm text-success">€{c.commission.toLocaleString('it-IT')}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Sistema */}
            {activeCategory === 'sistema' && (
              <motion.div
                key="sistema"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <GlassCard>
                  <h2 className="text-xl font-semibold text-white mb-4">Impostazioni piattaforma</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-text-muted mb-1 block">Nome piattaforma</label>
                      <input
                        type="text"
                        defaultValue="ATS — Al TuO Servizio"
                        onChange={() => setHasChanges(true)}
                        className="w-full bg-[rgba(6,16,30,0.6)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-primary backdrop-blur-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted mb-1 block">Email supporto</label>
                      <input
                        type="email"
                        defaultValue="supporto@ats-servizio.it"
                        onChange={() => setHasChanges(true)}
                        className="w-full bg-[rgba(6,16,30,0.6)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-primary backdrop-blur-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-text-muted mb-1 block">Telefono supporto</label>
                      <input
                        type="tel"
                        defaultValue="+39 0824 123456"
                        onChange={() => setHasChanges(true)}
                        className="w-full bg-[rgba(6,16,30,0.6)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-primary backdrop-blur-sm"
                      />
                    </div>
                  </div>
                </GlassCard>

                <GlassCard>
                  <h2 className="text-xl font-semibold text-white mb-4">Manutenzione</h2>
                  <Toggle label="Modalità manutenzione" value={toggles.maintenance} onChange={() => handleToggle('maintenance')} />
                  <div className="mt-4">
                    <label className="text-xs text-text-muted mb-1 block">Messaggio manutenzione</label>
                    <textarea
                      rows={3}
                      defaultValue="ATS è in manutenzione. Torneremo presto online."
                      onChange={() => setHasChanges(true)}
                      className="w-full bg-[rgba(6,16,30,0.6)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-sky-primary resize-none backdrop-blur-sm"
                    />
                  </div>
                </GlassCard>

                <GlassCard>
                  <h2 className="text-xl font-semibold text-white mb-4">Backup e ripristino</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setHasChanges(true)}
                      className="px-4 py-2 text-sm text-text-secondary border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      Esporta configurazione
                    </button>
                    <button
                      onClick={() => setHasChanges(true)}
                      className="px-4 py-2 text-sm text-text-secondary border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      Importa configurazione
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
