// @ts-nocheck
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Star, Award, TrendingUp, TrendingDown, FileText, Clock, CheckCircle, HelpCircle, AlertCircle, Upload } from 'lucide-react';
import Avatar from '@/components/Avatar';
import GlassBottomNav from '@/components/employee/GlassBottomNav';
import GlassTooltip from '@/components/ui/GlassTooltip';
import PayCounter from '@/components/employee/PayCounter';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { usePageTitle } from '@/hooks/usePageTitle'
import { useAuth } from '@/context/AuthContext';

// ---- Types ----
interface RankLevel {
  name: string;
  color: string;
  glow: string;
  minPoints: number;
  benefits: string[];
}

interface PointsEntry {
  id: string;
  label: string;
  points: number;
  date: string;
  type: 'earned' | 'spent' | 'bonus';
}

// ---- Data ----
const rankLevels: RankLevel[] = [
  { name: 'Rookie', color: '#94A3B8', glow: 'rgba(148,163,184,0.2)', minPoints: 0, benefits: ['Accesso base', 'Tariffa standard'] },
  { name: 'Affidabile', color: '#5BB8F5', glow: 'rgba(91,184,245,0.3)', minPoints: 500, benefits: ['Pool turni', 'Accesso preferenze'] },
  { name: 'Senior', color: '#3AA3E8', glow: 'rgba(58,163,232,0.3)', minPoints: 1200, benefits: ['Pool reperibili', '+€1/h bonus'] },
  { name: 'Elite', color: '#1EC99A', glow: 'rgba(30,201,154,0.3)', minPoints: 2000, benefits: ['Turni premium', '+€2/h bonus'] },
  { name: 'Ambassador', color: '#F5B800', glow: 'rgba(245,184,0,0.3)', minPoints: 3500, benefits: ['Tutti i benefit', '+€3/h bonus'] },
];

// Mock pointsHistory rimosso: ora popolato da `employee_points` reali
// dentro il componente (vedi useEffect → setRealHistory).

// Etichetta italiana per i tipi di documento (sezione "I tuoi documenti").
const DOC_TYPE_LABEL: Record<string, string> = {
  haccp:       'Attestato HACCP',
  health_cert: 'Idoneità sanitaria',
  id_card:     "Carta d'identità",
  tax_code:    'Codice fiscale',
  iban_proof:  'Prova IBAN',
  contract:    'Contratto firmato',
  other:       'Altro',
}

const payBreakdown = [
  { zone: 'Centro', base: '€15,00/h', rankBonus: '+€1,00/h', total: '€16,00/h', premiumDays: 'Festivi +50%' },
  { zone: 'Periferia', base: '€13,00/h', rankBonus: '+€1,00/h', total: '€14,00/h', premiumDays: 'Festivi +50%' },
  { zone: 'Industriale', base: '€12,00/h', rankBonus: '+€1,00/h', total: '€13,00/h', premiumDays: 'Festivi +50%' },
  { zone: 'Eventi', base: '€16,00/h', rankBonus: '+€1,00/h', total: '€17,00/h', premiumDays: 'Sempre +50%' },
  { zone: 'Resort', base: '€14,00/h', rankBonus: '+€1,00/h', total: '€15,00/h', premiumDays: 'Festivi +100%' },
];

// Helper: trova indice del livello rank in base ai punti totali.
function levelIdxFromPoints(points: number): number {
  if (points >= 3500) return 4; // ambassador
  if (points >= 2000) return 3; // elite
  if (points >= 1200) return 2; // senior
  if (points >= 500)  return 1; // affidabile
  return 0;                     // rookie
}

export default function EmployeeRank() {
  usePageTitle('Il tuo rank')
  const navigate = useNavigate();
  const [showPayTable, setShowPayTable] = useState(true);
  const { user, profile } = useAuth();
  const [realStats, setRealStats] = useState<{
    avgRating: number | null;
    totalReviews: number;
    monthEarnings: number;
    completedShifts: number;
    totalPoints: number;
  } | null>(null);
  const [realHistory, setRealHistory] = useState<{ id: string; label: string; points: number; date: string; type: 'earned' | 'spent' | 'bonus' }[]>([]);
  // Documenti reali del dipendente (sostituisce la lista 'Corsi' mock).
  const [realDocs, setRealDocs] = useState<Array<{
    id: string; type: string; verified: boolean; expires_at: string | null; uploaded_at: string
  }>>([]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const monthStart = new Date(); monthStart.setDate(1);
      const monthStartStr = monthStart.toISOString().slice(0, 10);
      const [
        { data: rating },
        { data: monthCompleted },
        { data: pointsRow },
        { data: ptsHistory },
        { data: docs },
      ] = await Promise.all([
        supabase.from('employee_rating_summary').select('avg_rating, total_reviews').eq('employee_id', user.id).maybeSingle(),
        supabase.from('shifts').select('hourly_rate, estimated_hours, check_in_at, check_out_at, time_start, time_end')
          .eq('employee_id', user.id).eq('status', 'completed').gte('shift_date', monthStartStr),
        supabase.from('employee_total_points').select('total_points, level').eq('employee_id', user.id).maybeSingle(),
        supabase.from('employee_points').select('id, source_type, points, reason, created_at').eq('employee_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('documents').select('id, type, verified, expires_at, uploaded_at').eq('employee_id', user.id).order('uploaded_at', { ascending: false }),
      ]);
      if (cancelled) return;
      let earnings = 0;
      for (const s of (monthCompleted ?? [])) {
        const rate = Number(s.hourly_rate);
        let hours = Number(s.estimated_hours ?? 0);
        if (!hours && s.check_in_at && s.check_out_at) {
          hours = (new Date(s.check_out_at).getTime() - new Date(s.check_in_at).getTime()) / 3_600_000;
        }
        if (!hours) {
          const [h1, m1] = s.time_start.split(':').map(Number);
          const [h2, m2] = s.time_end.split(':').map(Number);
          let mins = (h2 * 60 + m2) - (h1 * 60 + m1);
          if (mins < 0) mins += 24 * 60;
          hours = mins / 60;
        }
        earnings += rate * hours;
      }
      setRealStats({
        avgRating: rating?.avg_rating != null ? Number(rating.avg_rating) : null,
        totalReviews: rating?.total_reviews ?? 0,
        monthEarnings: Math.round(earnings * 100) / 100,
        completedShifts: (monthCompleted ?? []).length,
        totalPoints: pointsRow?.total_points ?? 0,
      });
      setRealHistory((ptsHistory ?? []).map((p) => ({
        id: p.id,
        label: p.reason ?? p.source_type,
        points: p.points,
        date: new Date(p.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
        type: p.points > 0 ? (['review_5stars','review_4stars'].includes(p.source_type) ? 'bonus' : 'earned') : 'spent',
      })));
      setRealDocs(docs ?? []);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const displayName = profile?.full_name || 'Tu';

  // Calcolo livello reale + progresso a partire dai punti.
  const currentPoints = realStats?.totalPoints ?? 0;
  const currentLevelIdx = levelIdxFromPoints(currentPoints);
  const nextLevelIdx = Math.min(currentLevelIdx + 1, rankLevels.length - 1);
  const nextLevel = rankLevels[nextLevelIdx];
  const prevLevel = rankLevels[currentLevelIdx];
  const pointsToNext = Math.max(nextLevel.minPoints - currentPoints, 0);
  const progressPercent = currentLevelIdx === rankLevels.length - 1
    ? 100
    : Math.min(100, Math.max(0, ((currentPoints - prevLevel.minPoints) / (nextLevel.minPoints - prevLevel.minPoints)) * 100));

  return (
    <div className="min-h-[100dvh] bg-[#06101E] pb-24">
      {/* Glass Header */}
      <header
        className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.06)]"
        style={{
          background: 'rgba(6,16,30,0.9)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Rank & Paga</h1>
          <GlassTooltip
            content={
              <div className="text-sm">
                <p className="font-semibold mb-1">Sistema di ranking ATS</p>
                <p className="text-[#94A3B8]">Completa turni, corsi e ottieni recensioni per salire di livello. Ogni livello sblocca bonus e accesso a turni premium.</p>
              </div>
            }
            position="bottom"
          >
            <HelpCircle className="w-5 h-5 text-[#5E7A95] cursor-help" />
          </GlassTooltip>
        </div>
      </header>

      <div className="max-w-[430px] lg:max-w-3xl mx-auto">
        {/* Rank Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cn(
            'mx-4 mt-4 rounded-[24px] p-6 border backdrop-blur-[20px]',
            'bg-[rgba(13,30,52,0.72)] border-[rgba(58,163,232,0.2)]',
            'shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]'
          )}
          style={{
            boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 60px ${rankLevels[currentLevelIdx].glow}`,
          }}
        >
          <div className="flex items-center gap-4 mb-5">
            <motion.div
              animate={{ boxShadow: [`0 0 0px ${rankLevels[currentLevelIdx].glow}`, `0 0 20px ${rankLevels[currentLevelIdx].glow}`, `0 0 0px ${rankLevels[currentLevelIdx].glow}`] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="rounded-full"
            >
              <Avatar
                src={profile?.avatar_url ?? undefined}
                alt={displayName}
                size={64}
                borderColor={rankLevels[currentLevelIdx].color}
              />
            </motion.div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded tracking-wider"
                  style={{
                    color: rankLevels[currentLevelIdx].color,
                    backgroundColor: rankLevels[currentLevelIdx].color + '15',
                    border: `1px solid ${rankLevels[currentLevelIdx].color}30`,
                  }}
                >
                  {rankLevels[currentLevelIdx].name.toUpperCase()}
                </span>
                <div className="flex gap-0.5">
                  {[1,2,3].map((i) => (
                    <Star
                      key={i}
                      className="w-3 h-3"
                      fill={i <= currentLevelIdx ? rankLevels[currentLevelIdx].color : 'transparent'}
                      color={i <= currentLevelIdx ? rankLevels[currentLevelIdx].color : '#5E7A95'}
                    />
                  ))}
                </div>
              </div>
              <h2 className="text-lg font-semibold text-white">{displayName}</h2>
              <p className="text-xs text-[#94A3B8]">Cameriere · Senior dal 15 Gen 2025</p>
            </div>
          </div>

          {/* Current points */}
          <div className="text-center mb-5">
            <div className="flex items-baseline justify-center gap-1">
              <PayCounter
                amount={currentPoints}
                duration={1.2}
                suffix=""
                decimals={0}
                className="text-[32px] font-bold text-white"
              />
              <span className="text-lg font-bold text-white">punti</span>
            </div>
            <p className="text-xs text-[#94A3B8]">Totale accumulato</p>
          </div>

          {/* Progress to next */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[#94A3B8]">
                {currentPoints.toLocaleString('it-IT')} / {nextLevel.minPoints.toLocaleString('it-IT')} punti
              </span>
              <span className="text-xs font-medium" style={{ color: nextLevel.color }}>
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="h-2.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${rankLevels[currentLevelIdx].color} 0%, ${nextLevel.color} 100%)`,
                  boxShadow: `0 0 12px ${nextLevel.color}40`,
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[10px] text-[#5E7A95]">
                {prevLevel.name} → {nextLevel.name}
              </span>
              <span className="text-[10px] text-[#5E7A95]">
                ~{pointsToNext} punti rimanenti
              </span>
            </div>
          </div>
        </motion.div>

        {/* Statistiche reali del mese */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="px-4 mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <div className="rounded-2xl p-4 bg-[rgba(13,30,52,0.7)] border border-[rgba(91,184,245,0.15)]">
            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Paga mese</p>
            <p className="text-2xl font-bold font-mono text-[#1EC99A]">
              € {realStats?.monthEarnings.toFixed(2) ?? '—'}
            </p>
            <p className="text-[10px] text-text-muted mt-0.5">
              {realStats?.completedShifts ?? 0} turn{(realStats?.completedShifts ?? 0) === 1 ? 'o' : 'i'} completat{(realStats?.completedShifts ?? 0) === 1 ? 'o' : 'i'}
            </p>
          </div>
          <div className="rounded-2xl p-4 bg-[rgba(13,30,52,0.7)] border border-[rgba(245,184,0,0.15)]">
            <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Rating ricevuto</p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold text-white">
                {realStats?.avgRating != null ? realStats.avgRating.toFixed(1) : '—'}
              </p>
              {realStats?.avgRating != null && <Star className="w-4 h-4 fill-[#F5B800] text-[#F5B800]" />}
            </div>
            <p className="text-[10px] text-text-muted mt-0.5">
              {realStats?.totalReviews ?? 0} recension{(realStats?.totalReviews ?? 0) === 1 ? 'e' : 'i'}
            </p>
          </div>
        </motion.div>

        {/* Points History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="px-4 mt-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-white">Storico punti</h3>
            <span className="text-[11px] text-[#5E7A95]">Ultimi 30 giorni</span>
          </div>
          <div
            className={cn(
              'rounded-[20px] border backdrop-blur-[16px] overflow-hidden',
              'bg-[rgba(13,30,52,0.7)] border-[rgba(91,184,245,0.12)]',
              'shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
            )}
          >
            {realHistory.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.04, duration: 0.35 }}
                className={cn(
                  'flex items-center gap-3 px-4 py-3',
                  i !== realHistory.length - 1 && 'border-b border-[rgba(255,255,255,0.04)]'
                )}
              >
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
                    entry.type === 'earned' && 'bg-[rgba(30,201,154,0.1)]',
                    entry.type === 'bonus' && 'bg-[rgba(245,184,0,0.1)]',
                    entry.type === 'spent' && 'bg-[rgba(240,69,69,0.1)]'
                  )}
                >
                  {entry.type === 'earned' && <TrendingUp className="w-4 h-4 text-[#1EC99A]" />}
                  {entry.type === 'bonus' && <Star className="w-4 h-4 text-[#F5B800]" />}
                  {entry.type === 'spent' && <TrendingDown className="w-4 h-4 text-[#F04545]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{entry.label}</p>
                  <p className="text-[11px] text-[#5E7A95]">{entry.date}</p>
                </div>
                <span
                  className="text-sm font-semibold flex-shrink-0"
                  style={{
                    color: entry.points > 0 ? '#1EC99A' : '#F04545',
                  }}
                >
                  {entry.points > 0 ? '+' : ''}{entry.points}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Rank Ladder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="px-4 mt-6"
        >
          <h3 className="text-base font-semibold text-white mb-3">Scala dei livelli</h3>
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-7 top-8 bottom-8 w-[2px] bg-[rgba(255,255,255,0.06)]" />

            <div className="space-y-3">
              {rankLevels.map((level, i) => {
                const isCurrent = i === currentLevelIdx;
                const isPast = i < currentLevelIdx;
                const isFuture = i > currentLevelIdx;

                return (
                  <motion.div
                    key={level.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.08, duration: 0.4 }}
                    className={cn(
                      'relative flex items-start gap-3 p-3 rounded-xl border backdrop-blur-sm',
                      'bg-[rgba(13,30,52,0.6)]',
                      isCurrent && 'border-[rgba(58,163,232,0.3)] shadow-[0_0_20px_rgba(58,163,232,0.1)]',
                      !isCurrent && 'border-[rgba(255,255,255,0.06)]'
                    )}
                    style={isCurrent ? { borderColor: level.color + '40' } : undefined}
                  >
                    {/* Icon */}
                    <div
                      className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 border-2"
                      style={{
                        backgroundColor: isCurrent ? level.color + '15' : isPast ? level.color + '10' : 'rgba(255,255,255,0.03)',
                        borderColor: isCurrent ? level.color : isPast ? level.color + '40' : 'rgba(255,255,255,0.08)',
                        boxShadow: isCurrent ? `0 0 16px ${level.glow}` : undefined,
                      }}
                    >
                      {i === 0 && <Star className="w-5 h-5" style={{ color: isCurrent || isPast ? level.color : '#5E7A95' }} />}
                      {i === 1 && <Award className="w-5 h-5" style={{ color: isCurrent || isPast ? level.color : '#5E7A95' }} />}
                      {i === 2 && <Star className="w-5 h-5 fill-current" style={{ color: isCurrent || isPast ? level.color : '#5E7A95' }} />}
                      {i === 3 && <TrendingUp className="w-5 h-5" style={{ color: isCurrent || isPast ? level.color : '#5E7A95' }} />}
                      {i === 4 && <Award className="w-5 h-5" style={{ color: isCurrent || isPast ? level.color : '#5E7A95' }} />}
                      {isCurrent && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#1EC99A] border-2 border-[#06101E]"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <CheckCircle className="w-3 h-3 text-[#06101E] absolute inset-0 m-auto" />
                        </motion.div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: isCurrent || isPast ? level.color : '#5E7A95' }}
                        >
                          {level.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(30,201,154,0.15)] text-[#1EC99A] border border-[rgba(30,201,154,0.25)] font-medium">
                            ATTUALE
                          </span>
                        )}
                        {isFuture && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.04)] text-[#5E7A95] border border-[rgba(255,255,255,0.06)]">
                            {level.minPoints} pts
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#94A3B8] mb-1">
                        {level.benefits.join(' · ')}
                      </p>
                      {isCurrent && (
                        <div className="h-1 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${progressPercent}%`,
                              background: level.color,
                              boxShadow: `0 0 8px ${level.glow}`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Pay Breakdown Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="px-4 mt-6"
        >
          <button
            onClick={() => setShowPayTable(!showPayTable)}
            className="flex items-center justify-between w-full mb-3"
          >
            <h3 className="text-base font-semibold text-white">Tabella paga per zona</h3>
            <ChevronRight
              className={cn(
                'w-4 h-4 text-[#5E7A95] transition-transform duration-200',
                showPayTable && 'rotate-90'
              )}
            />
          </button>

          <AnimatePresence>
            {showPayTable && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div
                  className={cn(
                    'rounded-[20px] border backdrop-blur-[16px] overflow-hidden',
                    'bg-[rgba(13,30,52,0.7)] border-[rgba(91,184,245,0.12)]',
                    'shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                  )}
                >
                  {/* Header */}
                  <div className="grid grid-cols-[1fr_1fr_1fr_1.2fr] gap-2 px-4 py-3 bg-[rgba(13,30,52,0.9)] border-b border-[rgba(255,255,255,0.05)]">
                    <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider">Zona</span>
                    <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider text-right">Base</span>
                    <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider text-right">Bonus</span>
                    <span className="text-[10px] font-semibold text-[#94A3B8] uppercase tracking-wider text-right">Totale</span>
                  </div>

                  {/* Rows */}
                  {payBreakdown.map((row, i) => (
                    <motion.div
                      key={row.zone}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i, duration: 0.3 }}
                      className={cn(
                        'grid grid-cols-[1fr_1fr_1fr_1.2fr] gap-2 px-4 py-3 items-center',
                        i !== payBreakdown.length - 1 && 'border-b border-[rgba(255,255,255,0.04)]',
                        i % 2 === 1 && 'bg-[rgba(13,30,52,0.4)]'
                      )}
                    >
                      <div>
                        <span className="text-xs text-white font-medium">{row.zone}</span>
                        <p className="text-[9px] text-[#F5B800]">{row.premiumDays}</p>
                      </div>
                      <span className="text-xs text-[#94A3B8] text-right font-mono">{row.base}</span>
                      <span className="text-xs text-[#1EC99A] text-right font-mono">{row.rankBonus}</span>
                      <span className="text-sm font-semibold text-[#5BB8F5] text-right font-mono">{row.total}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Hourly Rate Badge (Personal) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="px-4 mt-4"
        >
          <div
            className={cn(
              'rounded-xl p-4 border backdrop-blur-[16px] flex items-center justify-between',
              'bg-[rgba(91,184,245,0.06)] border-[rgba(91,184,245,0.15)]',
              'shadow-[0_0_20px_rgba(91,184,245,0.08)]'
            )}
          >
            <div>
              <p className="text-xs text-[#94A3B8] mb-0.5">La tua tariffa personale</p>
              <div className="flex items-baseline gap-1">
                <span
                  className="text-2xl font-bold text-[#5BB8F5]"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                >
                  €19,00/h
                </span>
                <span className="text-xs text-[#5E7A95]">(Centro + Senior)</span>
              </div>
            </div>
            <GlassTooltip
              content={
                <div>
                  <p className="font-semibold">Calcolo tariffa</p>
                  <p className="text-[#94A3B8] mt-1">Base zona Centro: €18,00/h</p>
                  <p className="text-[#94A3B8]">Bonus rank Senior: +€1,00/h</p>
                  <p className="text-[#5BB8F5] font-semibold mt-1">Totale: €19,00/h</p>
                </div>
              }
              position="left"
            >
              <HelpCircle className="w-5 h-5 text-[#5E7A95] cursor-help" />
            </GlassTooltip>
          </div>
        </motion.div>

        {/* Documenti & certificazioni — dati reali da public.documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="px-4 mt-6 mb-8"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-white">I tuoi documenti</h3>
            <button
              onClick={() => navigate('/employee/documents')}
              className="text-xs text-[#5BB8F5] hover:underline flex items-center gap-1"
            >
              Gestisci <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {realDocs.length === 0 ? (
            <div className="rounded-xl p-5 border border-dashed border-[rgba(245,184,0,0.25)] bg-[rgba(245,184,0,0.04)] text-center">
              <Upload className="w-8 h-8 mx-auto mb-2 text-[#F5B800] opacity-70" />
              <p className="text-sm text-white mb-1">Nessun documento caricato</p>
              <p className="text-xs text-[#94A3B8] mb-3">
                HACCP, idoneità sanitaria e altri documenti ti aiutano a ricevere più turni.
              </p>
              <button
                onClick={() => navigate('/employee/documents')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#06101E] gradient-sky rounded-lg hover:brightness-110 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                Carica documenti
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {realDocs.map((doc, i) => {
                const expDays = doc.expires_at
                  ? Math.floor((new Date(doc.expires_at).getTime() - Date.now()) / 86400000)
                  : null
                const expired = expDays !== null && expDays < 0
                const expiringSoon = expDays !== null && expDays >= 0 && expDays < 30
                const statusColor = expired ? '#F04545' : doc.verified ? '#1EC99A' : expiringSoon ? '#F5B800' : '#5BB8F5'
                const statusIcon = expired ? AlertCircle : doc.verified ? CheckCircle : expiringSoon ? Clock : FileText
                const Icon = statusIcon
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.04, duration: 0.3 }}
                    className="rounded-xl p-3 border bg-[rgba(13,30,52,0.6)] border-[rgba(255,255,255,0.06)] flex items-center gap-3"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${statusColor}18`, border: `1px solid ${statusColor}30` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: statusColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {DOC_TYPE_LABEL[doc.type] ?? doc.type}
                      </p>
                      <p className="text-[11px] text-[#94A3B8]">
                        {expired
                          ? `Scaduto ${Math.abs(expDays!)}g fa — rinnova`
                          : expiringSoon
                          ? `Scade tra ${expDays}g`
                          : doc.verified
                          ? 'Verificato dall\'admin'
                          : 'In attesa di verifica'}
                      </p>
                    </div>
                    {doc.expires_at && (
                      <span className="text-[10px] text-[#5E7A95] font-mono flex-shrink-0">
                        {new Date(doc.expires_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>

      <GlassBottomNav />
    </div>
  );
}
