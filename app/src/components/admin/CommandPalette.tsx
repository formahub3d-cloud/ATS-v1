// CommandPalette — barra di ricerca globale stile Cmd+K (Mac) / Ctrl+K (Win).
// Cerca strutture, dipendenti, turni, link rapidi alle pagine admin.
// Si apre con Cmd/Ctrl+K, ESC per chiudere, frecce per navigare, Enter per
// aprire. Per ora attiva solo su rotte /admin/*.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Building2, User as UserIcon, Calendar, FileText, Trophy,
  Settings, ShieldCheck, Euro, MessageCircle, LayoutDashboard, Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface PaletteItem {
  id: string
  label: string
  hint?: string
  icon: LucideIcon
  color: string
  section: 'page' | 'structure' | 'employee'
  onSelect: () => void
}

const PAGE_SHORTCUTS: Omit<PaletteItem, 'onSelect'>[] = [
  { id: 'p-dashboard',  label: 'Dashboard',     icon: LayoutDashboard, color: '#5BB8F5', section: 'page', hint: '/admin' },
  { id: 'p-structures', label: 'Strutture',     icon: Building2,       color: '#5BB8F5', section: 'page', hint: '/admin/structures' },
  { id: 'p-employees',  label: 'Dipendenti',    icon: Users,           color: '#3AA3E8', section: 'page', hint: '/admin/employees' },
  { id: 'p-shifts',     label: 'Turni',         icon: Calendar,        color: '#F5B800', section: 'page', hint: '/admin/shifts' },
  { id: 'p-calendar',   label: 'Calendario',    icon: Calendar,        color: '#F5B800', section: 'page', hint: '/admin/calendar' },
  { id: 'p-chat',       label: 'Chat',          icon: MessageCircle,   color: '#3AA3E8', section: 'page', hint: '/admin/chat' },
  { id: 'p-payroll',    label: 'Payroll',       icon: Euro,            color: '#1EC99A', section: 'page', hint: '/admin/payroll' },
  { id: 'p-invoices',   label: 'Fatture',       icon: FileText,        color: '#5BB8F5', section: 'page', hint: '/admin/invoices' },
  { id: 'p-leaderboard', label: 'Leaderboard',  icon: Trophy,          color: '#F5B800', section: 'page', hint: '/admin/leaderboard' },
  { id: 'p-audit',      label: 'Audit log',     icon: ShieldCheck,     color: '#3AA3E8', section: 'page', hint: '/admin/audit' },
  { id: 'p-settings',   label: 'Impostazioni',  icon: Settings,        color: '#94A3B8', section: 'page', hint: '/admin/settings' },
]

export default function CommandPalette() {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const [structResults, setStructResults] = useState<PaletteItem[]>([])
  const [empResults, setEmpResults] = useState<PaletteItem[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Cmd+K / Ctrl+K → toggle.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Reset stato quando si chiude o si naviga.
  useEffect(() => {
    if (!open) { setQuery(''); setActiveIdx(0); return }
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => { setOpen(false) }, [location.pathname])

  // Search remoto su strutture/dipendenti (debounced 200ms).
  useEffect(() => {
    if (!open) return
    const q = query.trim()
    if (q.length < 2) { setStructResults([]); setEmpResults([]); return }

    const handle = setTimeout(async () => {
      try {
        const [{ data: structs }, { data: profs }] = await Promise.all([
          supabase.from('structures').select('id, ragione_sociale, status, zona').ilike('ragione_sociale', `%${q}%`).limit(8),
          supabase.from('profiles').select('id, full_name, avatar_url').eq('role', 'employee').ilike('full_name', `%${q}%`).limit(8),
        ])

        setStructResults((structs ?? []).map((s) => ({
          id: 'st-' + s.id,
          label: s.ragione_sociale,
          hint: `${s.zona ?? '—'} · ${s.status}`,
          icon: Building2,
          color: '#5BB8F5',
          section: 'structure',
          onSelect: () => navigate('/admin/structures'),
        })))
        setEmpResults((profs ?? []).map((p) => ({
          id: 'em-' + p.id,
          label: p.full_name ?? '—',
          hint: 'Dipendente',
          icon: UserIcon,
          color: '#3AA3E8',
          section: 'employee',
          onSelect: () => navigate('/admin/employees'),
        })))
      } catch {
        // Best-effort
      }
    }, 200)
    return () => clearTimeout(handle)
  }, [query, open, navigate])

  // Tutti gli items combinati (filtrati per query).
  const allItems = useMemo<PaletteItem[]>(() => {
    const q = query.trim().toLowerCase()
    const pages: PaletteItem[] = PAGE_SHORTCUTS.map((p) => ({
      ...p,
      onSelect: () => navigate(p.hint!),
    }))
    const filteredPages = q
      ? pages.filter((p) => p.label.toLowerCase().includes(q))
      : pages
    return [...filteredPages, ...structResults, ...empResults]
  }, [query, structResults, empResults, navigate])

  // Reset activeIdx quando lista cambia.
  useEffect(() => { setActiveIdx(0) }, [allItems.length])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, allItems.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      allItems[activeIdx]?.onSelect()
    }
  }, [activeIdx, allItems])

  // Visibile solo se siamo su /admin/*
  if (!location.pathname.startsWith('/admin')) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300]"
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="fixed top-[20vh] left-1/2 -translate-x-1/2 w-full max-w-[560px] z-[301] px-4 pointer-events-none"
          >
            <div className="rounded-2xl border border-[rgba(91,184,245,0.30)] bg-[rgba(13,30,52,0.96)] backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.5)] overflow-hidden pointer-events-auto">
              {/* Search bar */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                <Search className="w-5 h-5 text-text-muted flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Cerca pagine, strutture, dipendenti..."
                  className="flex-1 bg-transparent text-base text-white placeholder-text-muted outline-none"
                />
                <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-text-muted font-mono">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {allItems.length === 0 ? (
                  <div className="py-10 text-center text-text-muted text-sm">
                    {query.trim().length < 2 ? 'Inizia a scrivere per cercare…' : 'Nessun risultato.'}
                  </div>
                ) : (
                  <ul>
                    {allItems.map((item, i) => {
                      const Icon = item.icon
                      const isActive = i === activeIdx
                      return (
                        <li key={item.id}>
                          <button
                            type="button"
                            onMouseEnter={() => setActiveIdx(i)}
                            onClick={() => item.onSelect()}
                            className={cn(
                              'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                              isActive ? 'bg-[rgba(91,184,245,0.08)]' : 'hover:bg-[rgba(91,184,245,0.04)]',
                            )}
                          >
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${item.color}18`, border: `1px solid ${item.color}30` }}
                            >
                              <Icon className="w-4 h-4" style={{ color: item.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{item.label}</p>
                              {item.hint && <p className="text-[10px] text-text-muted truncate font-mono">{item.hint}</p>}
                            </div>
                            <span className="text-[10px] text-text-muted uppercase tracking-wider">{item.section}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              {/* Footer help */}
              <div className="flex items-center justify-between gap-3 px-4 py-2 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(6,16,30,0.5)] text-[10px] text-text-muted">
                <div className="flex items-center gap-3">
                  <span><kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">↑↓</kbd> naviga</span>
                  <span><kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">↵</kbd> apri</span>
                </div>
                <span>⌘K per riaprire</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
