import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Search, QrCode, Trophy, Euro, Heart, FileText,
  Hourglass, AlertCircle, HelpCircle, Truck, ChevronRight,
} from 'lucide-react';
import Avatar from '@/components/Avatar';
import GlassBottomNav from '@/components/employee/GlassBottomNav';
import PayCounter from '@/components/employee/PayCounter';
import GlassTooltip from '@/components/ui/GlassTooltip';
import { SkeletonCard, SkeletonAvatar } from '@/components/ui/skeleton';
import StatusScreen from '@/components/structure/StatusScreen';
import NotificationsBell from '@/components/notifications/NotificationsBell';
import PrivacySettings from '@/components/PrivacySettings';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/lib/database.types';
import { cn } from '@/lib/utils';

type EmployeeRow = Database['public']['Tables']['employees']['Row'];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0, 0, 0.2, 1] as [number, number, number, number] } },
};

// (NotificationItem mock rimosso: ora le notifiche vivono nel NotificationsBell
// dropdown reale alimentato da Supabase Realtime.)

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { user, profile, status: authStatus } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<EmployeeRow | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  // Dati aggregati reali
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [monthlyShifts, setMonthlyShifts] = useState(0);
  const [nextShift, setNextShift] = useState<{ shift_date: string; time_start: string; structure_name: string | null; role: string } | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buongiorno');
    else if (hour < 18) setGreeting('Buon pomeriggio');
    else setGreeting('Buonasera');
  }, []);

  useEffect(() => {
    if (authStatus === 'loading') return;
    if (authStatus === 'anonymous' || !user) {
      navigate('/auth');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        // Fetch in parallelo: profilo employee + turni del mese + prossimo turno.
        const todayStr = new Date().toISOString().slice(0, 10);
        const monthStart = new Date();
        monthStart.setDate(1);
        const monthStartStr = monthStart.toISOString().slice(0, 10);

        const [
          { data: empRow, error: empErr },
          { data: monthShifts, error: msErr },
          { data: upcoming, error: upErr },
        ] = await Promise.all([
          supabase.from('employees').select('*').eq('id', user.id).maybeSingle(),
          supabase.from('shifts').select('hourly_rate, estimated_hours, check_in_at, check_out_at, time_start, time_end')
            .eq('employee_id', user.id).eq('status', 'completed')
            .gte('shift_date', monthStartStr),
          supabase.from('shifts').select('shift_date, time_start, role, structure_id, status')
            .eq('employee_id', user.id).in('status', ['assigned', 'in_progress'])
            .gte('shift_date', todayStr).order('shift_date', { ascending: true })
            .order('time_start', { ascending: true }).limit(1),
        ]);

        if (cancelled) return;
        if (empErr) throw empErr;
        if (msErr) throw msErr;
        if (upErr) throw upErr;

        setEmployee(empRow);

        // Calcola paga del mese.
        let earnings = 0;
        for (const s of (monthShifts ?? [])) {
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
        setMonthlyEarnings(Math.round(earnings * 100) / 100);
        setMonthlyShifts((monthShifts ?? []).length);

        // Recupera nome struttura per il prossimo turno.
        const upRow = (upcoming ?? [])[0];
        if (upRow) {
          const { data: structRow } = await supabase
            .from('structures').select('ragione_sociale').eq('id', upRow.structure_id).maybeSingle();
          if (cancelled) return;
          setNextShift({
            shift_date: upRow.shift_date,
            time_start: upRow.time_start,
            structure_name: structRow?.ragione_sociale ?? null,
            role: upRow.role,
          });
        } else {
          setNextShift(null);
        }
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Errore caricamento profilo';
        console.error('[EmployeeDashboard] fetch error', err);
        setFetchError(message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [authStatus, user, navigate]);

  // Mese corrente in italiano
  const monthLabel = useMemo(() => new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }), []);

  // Display values: nome reale dal profile, code = primi 8 caratteri dell'id.
  const displayName = profile?.full_name?.split(' ')[0] || 'collega';
  const displayCode = user ? `ATS-D-${user.id.slice(0, 8).toUpperCase()}` : '—';

  const quickActions = [
    { icon: Calendar, label: 'Calendario', path: '/employee/calendar' },
    { icon: Search, label: 'Cerca turni', path: '/employee/matching' },
    { icon: Heart, label: 'I miei match', path: '/employee/matching' },
    { icon: QrCode, label: 'Check-in', path: '/employee/checkin' },
    { icon: Trophy, label: 'Rank', path: '/employee/rank' },
    { icon: Euro, label: 'Paghe', path: '/employee/rank' },
  ];

  // handleAcceptShift rimosso: la "Shift Proposal" mock non esiste più,
  // l'accettazione turni avviene via like in /employee/matching.

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#06101E] pb-24">
        <div className="max-w-[430px] mx-auto px-4 pt-4 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <SkeletonAvatar size={40} />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32" />
              <div className="h-3 w-20" />
            </div>
          </div>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <GlassBottomNav />
      </div>
    );
  }

  // Errore di fetch.
  if (fetchError) {
    return (
      <>
        <StatusScreen
          icon={AlertCircle}
          iconColor="#F04545"
          title="Impossibile caricare il profilo"
          description={fetchError}
          primaryAction={{ label: 'Riprova', onClick: () => window.location.reload() }}
        />
        <GlassBottomNav />
      </>
    );
  }

  // Nessuna riga `employees` per questo utente: profilo non completato.
  if (!employee) {
    return (
      <>
        <StatusScreen
          icon={Hourglass}
          iconColor="#5BB8F5"
          title="Profilo non completato"
          description="Sembra che tu abbia un account ma non hai completato l'onboarding di registrazione. Completa la registrazione per iniziare a ricevere turni."
          primaryAction={{ label: 'Completa registrazione', onClick: () => navigate('/auth') }}
        />
        <GlassBottomNav />
      </>
    );
  }

  // Account disattivato dall'admin.
  if (!employee.active) {
    return (
      <>
        <StatusScreen
          icon={AlertCircle}
          iconColor="#F5B800"
          title="Account in pausa"
          description="Il tuo profilo è momentaneamente disattivato. Contatta il supporto ATS per maggiori informazioni."
        />
        <GlassBottomNav />
      </>
    );
  }

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
        <div className="flex items-center justify-between h-16 px-4 max-w-[430px] mx-auto">
          <div className="flex items-center gap-3">
            <motion.div
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
            >
              <Avatar
                src="/avatar-employee-2.jpg"
                alt="Marco R."
                size={40}
                borderColor="#3AA3E8"
              />
            </motion.div>
            <div>
              <span className="font-mono text-[11px] text-[#5BB8F5] tracking-wider bg-[rgba(91,184,245,0.08)] px-1.5 py-0.5 rounded">
                {displayCode}
              </span>
              <span className="ml-2 text-[10px] font-semibold text-[#3AA3E8] bg-[rgba(58,163,232,0.12)] px-1.5 py-0.5 rounded border border-[rgba(58,163,232,0.2)]">
                SENIOR
              </span>
            </div>
          </div>
          <NotificationsBell variant="minimal" />
        </div>
      </header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-[430px] mx-auto"
      >
        {/* Greeting */}
        <motion.div variants={itemVariants} className="px-4 pt-4 pb-2">
          <motion.h1
            className="text-xl font-semibold text-white"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {greeting}, {displayName}
          </motion.h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">Ecco il tuo riepilogo</p>
        </motion.div>

        {/* Earnings & Rank Hero Card (Glass) */}
        <motion.div
          variants={itemVariants}
          className={cn(
            'mx-4 mt-3 rounded-[24px] p-6 border backdrop-blur-[20px]',
            'bg-[rgba(13,30,52,0.72)] border-[rgba(91,184,245,0.12)]',
            'shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]'
          )}
        >
          {/* Top row: label + month */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#5E7A95] font-medium tracking-wide">Paga maturata</span>
            <span className="text-[11px] text-[#94A3B8] bg-[rgba(255,255,255,0.05)] px-2.5 py-1 rounded-full border border-[rgba(255,255,255,0.08)] capitalize">
              {monthLabel}
            </span>
          </div>

          {/* Main amount */}
          <div className="mb-1">
            <div className="flex items-baseline gap-1">
              <PayCounter
                amount={Math.floor(monthlyEarnings)}
                duration={1.4}
                prefix="€"
                suffix=""
                decimals={0}
                className="text-[40px] font-bold text-white"
              />
              <span className="text-xl font-bold text-white">
                ,{String(Math.round((monthlyEarnings - Math.floor(monthlyEarnings)) * 100)).padStart(2, '0')}
              </span>
            </div>
            <p className="text-xs text-[#94A3B8]">
              {monthlyShifts === 0
                ? 'Nessun turno completato questo mese'
                : `${monthlyShifts} turn${monthlyShifts === 1 ? 'o' : 'i'} completat${monthlyShifts === 1 ? 'o' : 'i'} questo mese`}
            </p>
          </div>

          {/* Hourly rate badge */}
          <div className="flex items-center gap-2 mt-3 mb-4">
            <GlassTooltip
              content={
                <div>
                  <p className="font-semibold">Tariffa oraria per zona Centro</p>
                  <p className="text-[#94A3B8] mt-1">Base zona: €18,00/h</p>
                  <p className="text-[#1EC99A]">Bonus Senior: +€1,00/h</p>
                  <p className="text-[#5BB8F5] font-semibold mt-1">Totale: €19,00/h</p>
                </div>
              }
              position="bottom"
            >
              <span className="inline-flex items-center gap-1.5 text-[13px] font-mono font-medium px-3 py-1.5 rounded-lg bg-[rgba(91,184,245,0.12)] text-[#5BB8F5] border border-[rgba(91,184,245,0.25)] shadow-[0_0_8px_rgba(91,184,245,0.1)] cursor-help">
                <Euro className="w-3.5 h-3.5" />
                €18/h
                <HelpCircle className="w-3 h-3 opacity-60" />
              </span>
            </GlassTooltip>
            <span className="text-[11px] text-[#5E7A95]">Centro</span>
          </div>

          {/* Rank progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[#94A3B8]">
                1.240 / 2.000 punti al prossimo livello
              </span>
              <span className="text-xs text-[#5BB8F5] font-medium">62%</span>
            </div>
            <div className="h-2 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #5BB8F5 0%, #3AA3E8 50%, #1A56A0 100%)',
                  boxShadow: '0 0 10px rgba(91,184,245,0.3)',
                }}
                initial={{ width: 0 }}
                animate={{ width: '62%' }}
                transition={{ duration: 0.9, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-[#5E7A95]">Senior → Elite</span>
              <span className="text-[10px] text-[#5E7A95]">~760 punti rimanenti</span>
            </div>
          </div>

          {/* Mini pills */}
          <div className="flex gap-2 pt-3 border-t border-[rgba(255,255,255,0.04)]">
            {[
              { label: 'Ore', value: '192h' },
              { label: 'Maggiorazioni', value: '+€48', color: '#5BB8F5' },
              { label: 'Navette', value: '+€24', color: '#1EC99A' },
            ].map((pill, i) => (
              <motion.div
                key={pill.label}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.08, duration: 0.3 }}
                className="flex-1 text-center py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]"
              >
                <p
                  className="text-xs font-semibold"
                  style={{ color: pill.color || '#FFFFFF' }}
                >
                  {pill.value}
                </p>
                <p className="text-[10px] text-[#5E7A95]">{pill.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Prossimo turno reale (assigned/in_progress più imminente) */}
        <motion.div variants={itemVariants} className="px-4 mt-4">
          {nextShift ? (
            <button
              type="button"
              onClick={() => navigate('/employee/checkin')}
              className="w-full text-left rounded-2xl border border-[rgba(91,184,245,0.25)] bg-[rgba(91,184,245,0.06)] backdrop-blur-md p-5 hover:bg-[rgba(91,184,245,0.1)] transition-all"
            >
              <p className="text-[10px] uppercase tracking-wider text-sky-primary font-semibold mb-1">Prossimo turno</p>
              <p className="text-base font-semibold text-white">{nextShift.role}</p>
              {nextShift.structure_name && (
                <p className="text-xs text-text-muted truncate">{nextShift.structure_name}</p>
              )}
              <div className="flex items-center gap-2 mt-2 text-xs text-white">
                <span className="font-mono">
                  {new Date(nextShift.shift_date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                </span>
                <span className="font-mono text-text-muted">·</span>
                <span className="font-mono">{nextShift.time_start.slice(0, 5)}</span>
              </div>
              <p className="text-[11px] text-sky-primary mt-3 font-medium">Vai al check-in →</p>
            </button>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-center">
              <p className="text-sm text-text-muted">Nessun turno in programma.</p>
              <button
                type="button"
                onClick={() => navigate('/employee/matching')}
                className="mt-2 text-xs text-sky-primary hover:underline"
              >
                Cerca nel feed →
              </button>
            </div>
          )}
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div variants={itemVariants} className="px-4 mt-4 mb-6">
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.06, duration: 0.3 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => action.path !== '#' && navigate(action.path)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 aspect-square',
                    'rounded-2xl p-5 border backdrop-blur-[16px]',
                    'bg-[rgba(13,30,52,0.6)] border-[rgba(255,255,255,0.06)]',
                    'shadow-[0_4px_24px_rgba(0,0,0,0.2)]',
                    'hover:border-[rgba(91,184,245,0.2)] hover:bg-[rgba(91,184,245,0.08)]',
                    'active:scale-95 transition-all duration-200'
                  )}
                >
                  <Icon className="w-7 h-7 text-[#5BB8F5]" />
                  <span className="text-[11px] text-[#94A3B8] font-medium">{action.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* CTA "vai al feed turni" — sostituisce la Shift Proposal mock */}
        <motion.div variants={itemVariants} className="px-4 mb-6">
          <button
            type="button"
            onClick={() => navigate('/employee/matching')}
            className="w-full rounded-2xl p-5 border border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all text-left"
          >
            <p className="text-[11px] uppercase tracking-wider text-text-muted font-semibold mb-1">Cerca turni</p>
            <p className="text-sm text-white">Sfoglia tutti i turni open compatibili con il tuo profilo.</p>
            <p className="text-xs text-sky-primary mt-1">Vai al feed →</p>
          </button>
        </motion.div>

        {/* Navetta Confirmation Card */}
        <motion.div
          variants={itemVariants}
          className={cn(
            'mx-4 mb-8 rounded-2xl p-5 border backdrop-blur-[16px]',
            'bg-[rgba(13,30,52,0.7)] border-[rgba(91,184,245,0.12)]',
            'shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
          )}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-[rgba(91,184,245,0.1)] flex items-center justify-center">
              <Truck className="w-4 h-4 text-[#5BB8F5]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Navetta confermata</h3>
              <p className="text-xs text-[#94A3B8]">RIST-BN-0012 · Domani</p>
            </div>
            <span className="ml-auto text-[10px] text-[#5BB8F5] bg-[rgba(91,184,245,0.08)] px-2 py-0.5 rounded border border-[rgba(91,184,245,0.15)]">
              Partenza 07:30
            </span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(255,255,255,0.04)]">
            <div>
              <p className="text-xs text-[#94A3B8]">Punto di ritrovo</p>
              <p className="text-sm font-medium text-white">Stazione Centrale</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#94A3B8]">Costo</p>
              <p className="text-sm font-medium text-white">€2,50</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#5E7A95]" />
          </div>
        </motion.div>
      </motion.div>

      {/* Sezione privacy GDPR — in fondo alla dashboard, sopra il bottom nav. */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="px-4 mt-8 mb-8"
      >
        <div className="rounded-2xl p-5 backdrop-blur-md bg-[rgba(13,30,52,0.6)] border border-[rgba(255,255,255,0.06)]">
          <PrivacySettings />
        </div>
      </motion.section>

      <GlassBottomNav />
    </div>
  );
}
