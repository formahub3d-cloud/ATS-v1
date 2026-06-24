import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, ShieldCheck, MapPin, Clock, LogOut } from 'lucide-react';
import CoverPhoto from '@/components/CoverPhoto';
import GlassBottomNav from '@/components/employee/GlassBottomNav';
import { useToast } from '@/components/ui/ToastSystem';
import { cn } from '@/lib/utils';

// ---- Animated checkmark component ----
function AnimatedCheckmark() {
  return (
    <svg viewBox="0 0 52 52" className="w-16 h-16">
      <motion.circle
        cx="26" cy="26" r="25"
        fill="none"
        stroke="#1EC99A"
        strokeWidth="3"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
      <motion.path
        d="M14 27 L22 35 L38 19"
        fill="none"
        stroke="#1EC99A"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.3, ease: 'easeInOut' }}
      />
    </svg>
  );
}

// ---- Active shift timer ----
function ShiftTimer({ startTime }: { startTime: Date }) {
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const diff = Math.floor((now - startTime.getTime()) / 1000);
      setElapsed(diff);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [startTime]);

  const hours = Math.floor(elapsed / 3600);
  const minutes = Math.floor((elapsed % 3600) / 60);
  const seconds = elapsed % 60;
  const fmt = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="flex items-center gap-1 font-mono text-2xl font-bold text-[#5BB8F5] tracking-wider">
      {fmt(hours)}<span className="text-[#5E7A95]">:</span>{fmt(minutes)}<span className="text-[#5E7A95]">:</span>{fmt(seconds)}
    </div>
  );
}

export default function EmployeeCheckin() {
  const { addToast } = useToast();
  const [phase, setPhase] = useState<'scanning' | 'success' | 'active' | 'checkout' | 'summary'>('scanning');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [checkoutTime, setCheckoutTime] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Simulate QR scan
  useEffect(() => {
    if (phase === 'scanning') {
      timerRef.current = setTimeout(() => {
        setPhase('success');
        addToast({ type: 'success', title: 'Check-in riuscito', message: 'GPS verificato · Turno attivo' });
      }, 3000);
    }
    return () => clearTimeout(timerRef.current ?? undefined);
  }, [phase, addToast]);

  // Auto-advance from success to active
  useEffect(() => {
    if (phase === 'success') {
      const t = setTimeout(() => {
        setPhase('active');
        setStartTime(new Date());
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const handleCheckOut = useCallback(() => {
    setCheckoutTime(new Date());
    setPhase('checkout');
  }, []);

  const handleConfirmCheckout = useCallback(() => {
    setPhase('summary');
    addToast({ type: 'success', title: 'Check-out completato', message: 'Turno archiviato · Paga calcolata' });
  }, [addToast]);

  const handleReset = useCallback(() => {
    setPhase('scanning');
    setStartTime(null);
    setCheckoutTime(null);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-[#06101E] pb-24 flex flex-col">
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.06)]"
        style={{
          background: 'rgba(6,16,30,0.9)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="max-w-[430px] mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Check-in</h1>
          {phase !== 'scanning' && phase !== 'success' && (
            <button
              onClick={handleReset}
              className="text-xs text-[#94A3B8] hover:text-[#F04545] transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-[430px] mx-auto w-full flex flex-col">
        {/* SCANNING PHASE */}
        {phase === 'scanning' && (
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            {/* Viewfinder area */}
            <div className="relative w-[280px] h-[280px] mb-8">
              {/* Glass background */}
              <div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: 'rgba(13,30,52,0.6)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(91,184,245,0.12)',
                }}
              />

              {/* Corner brackets animation */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 280 280">
                {/* Top-left */}
                <motion.path
                  d="M20,50 L20,20 L50,20"
                  fill="none"
                  stroke="#5BB8F5"
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
                />
                {/* Top-right */}
                <motion.path
                  d="M230,20 L260,20 L260,50"
                  fill="none"
                  stroke="#5BB8F5"
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.15, repeat: Infinity, repeatDelay: 1 }}
                />
                {/* Bottom-right */}
                <motion.path
                  d="M260,230 L260,260 L230,260"
                  fill="none"
                  stroke="#5BB8F5"
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.3, repeat: Infinity, repeatDelay: 1 }}
                />
                {/* Bottom-left */}
                <motion.path
                  d="M50,260 L20,260 L20,230"
                  fill="none"
                  stroke="#5BB8F5"
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.45, repeat: Infinity, repeatDelay: 1 }}
                />
              </svg>

              {/* Scanning laser */}
              <motion.div
                className="absolute left-4 right-4 h-[2px] bg-[#5BB8F5]"
                initial={{ top: '20%', opacity: 0.3 }}
                animate={{ top: ['20%', '80%', '20%'], opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ boxShadow: '0 0 8px rgba(91,184,245,0.5)' }}
              />

              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <ScanLine className="w-12 h-12 text-[#5BB8F5]" />
                </motion.div>
              </div>
            </div>

            {/* Instructions */}
            <div
              className={cn(
                'text-center px-6 py-5 rounded-2xl border backdrop-blur-[16px]',
                'bg-[rgba(13,30,52,0.7)] border-[rgba(91,184,245,0.12)]',
                'shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
              )}
            >
              <h2 className="text-lg font-semibold text-white mb-1">
                Avvicina il QR alla telecamera
              </h2>
              <p className="text-sm text-[#94A3B8] mb-2">
                Posiziona il codice QR entro la cornice
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-[#5E7A95]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1EC99A]" />
                  GPS attivo
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#5BB8F5]" />
                  Distanza: 12m
                </span>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS PHASE */}
        <AnimatePresence>
          {phase === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-4"
            >
              <motion.div
                className="mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
              >
                <AnimatedCheckmark />
              </motion.div>

              <motion.h2
                className="text-2xl font-bold text-white mb-2"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Check-in confermato!
              </motion.h2>

              <motion.p
                className="text-sm text-[#94A3B8] mb-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Turno attivo · GPS verificato
              </motion.p>

              <motion.div
                className={cn(
                  'mt-6 px-5 py-3 rounded-xl border backdrop-blur-sm',
                  'bg-[rgba(30,201,154,0.06)] border-[rgba(30,201,154,0.2)]',
                  'flex items-center gap-2'
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <ShieldCheck className="w-4 h-4 text-[#1EC99A]" />
                <span className="text-xs text-[#1EC99A] font-medium">
                  GPS verificato · Posizione corretta
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACTIVE PHASE */}
        <AnimatePresence>
          {phase === 'active' && startTime && (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col px-4 pt-4"
            >
              {/* Structure photo card */}
              <div
                className={cn(
                  'rounded-2xl overflow-hidden border backdrop-blur-[16px] mb-4',
                  'bg-[rgba(13,30,52,0.7)] border-[rgba(91,184,245,0.12)]',
                  'shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                )}
              >
                <div className="relative h-44">
                  <CoverPhoto src="/structure-1.jpg" alt="Ristorante Il Torchio" className="w-full h-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1E34] via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="font-mono text-xs text-[#5BB8F5] bg-[rgba(13,30,52,0.85)] backdrop-blur-sm px-2 py-0.5 rounded border border-[rgba(91,184,245,0.2)]">
                      RIST-BN-0012
                    </span>
                    <h3 className="text-lg font-semibold text-white mt-1">Ristorante Il Torchio</h3>
                    <p className="text-xs text-[#94A3B8]">Cameriere · Domani, 12 Maggio</p>
                  </div>
                </div>
              </div>

              {/* Timer glass card */}
              <div
                className={cn(
                  'rounded-2xl p-6 border backdrop-blur-[16px] mb-4 text-center',
                  'bg-[rgba(13,30,52,0.7)] border-[rgba(91,184,245,0.12)]',
                  'shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                )}
              >
                <p className="text-xs text-[#94A3B8] mb-3 flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Turno in corso
                </p>
                <ShiftTimer startTime={startTime} />
                <p className="text-xs text-[#5E7A95] mt-2">
                  Check-in alle {startTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* GPS badge */}
              <div
                className={cn(
                  'flex items-center gap-2 px-4 py-3 rounded-xl border backdrop-blur-sm mb-4',
                  'bg-[rgba(30,201,154,0.06)] border-[rgba(30,201,154,0.2)]'
                )}
              >
                <ShieldCheck className="w-4 h-4 text-[#1EC99A]" />
                <span className="text-xs text-[#1EC99A] font-medium">GPS verificato · Posizione struttura confermata</span>
              </div>

              {/* Check-out button */}
              <div className="mt-auto pb-4">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCheckOut}
                  className={cn(
                    'w-full h-14 text-sm font-medium text-white rounded-xl',
                    'border border-[rgba(240,69,69,0.3)] bg-[rgba(240,69,69,0.08)]',
                    'hover:bg-[rgba(240,69,69,0.12)] active:scale-[0.98] transition-all'
                  )}
                >
                  <div className="flex items-center justify-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Check-out
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CHECKOUT PHASE */}
        <AnimatePresence>
          {phase === 'checkout' && checkoutTime && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col px-4 pt-6"
            >
              <h2 className="text-xl font-semibold text-white mb-1">Conferma check-out</h2>
              <p className="text-sm text-[#94A3B8] mb-6">
                Verifica i dati prima di confermare
              </p>

              <div
                className={cn(
                  'rounded-2xl p-5 border backdrop-blur-[16px] mb-6',
                  'bg-[rgba(13,30,52,0.7)] border-[rgba(91,184,245,0.12)]',
                  'shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden">
                    <CoverPhoto src="/structure-1.jpg" alt="struttura" className="w-full h-full" />
                  </div>
                  <div>
                    <span className="font-mono text-xs text-[#5BB8F5]">RIST-BN-0012</span>
                    <p className="text-sm font-medium text-white">Cameriere</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#94A3B8]">Check-in</span>
                    <span className="font-mono text-white">
                      {startTime?.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#94A3B8]">Check-out</span>
                    <span className="font-mono text-white">
                      {checkoutTime.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#94A3B8]">Durata stimata</span>
                    <span className="font-mono text-white">
                      {startTime ? `${Math.floor((checkoutTime.getTime() - startTime.getTime()) / 3600000)}h ${Math.floor(((checkoutTime.getTime() - startTime.getTime()) % 3600000) / 60000)}m` : '0h 0m'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#94A3B8]">Paga stimata</span>
                    <span className="font-semibold text-[#5BB8F5]">
                      {startTime
                        ? `€${(((checkoutTime.getTime() - startTime.getTime()) / 3600000) * 12).toFixed(2)}`
                        : '€0.00'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-[rgba(255,255,255,0.04)] flex items-center gap-2 text-xs text-[#1EC99A]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    GPS verificato durante tutto il turno
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmCheckout}
                  className={cn(
                    'flex-1 h-12 text-sm font-medium text-white rounded-xl',
                    'gradient-sky hover:brightness-110 active:scale-[0.98] transition-all'
                  )}
                >
                  Conferma check-out
                </button>
                <button
                  onClick={() => setPhase('active')}
                  className={cn(
                    'flex-1 h-12 text-sm font-medium text-[#94A3B8] rounded-xl',
                    'border border-[rgba(255,255,255,0.08)] hover:text-white hover:bg-[rgba(255,255,255,0.04)]'
                  )}
                >
                  Annulla
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SUMMARY PHASE */}
        <AnimatePresence>
          {phase === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col px-4 pt-6"
            >
              <motion.div
                className="text-center mb-6"
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
              >
                <AnimatedCheckmark />
                <h2
                  className="text-2xl font-bold text-white mt-4 mb-1"
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                >
                  Turno completato!
                </h2>
                <p className="text-sm text-[#94A3B8]">
                  Check-out alle {checkoutTime?.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </motion.div>

              <div
                className={cn(
                  'rounded-2xl p-5 border backdrop-blur-[16px] mb-6',
                  'bg-[rgba(13,30,52,0.7)] border-[rgba(91,184,245,0.12)]',
                  'shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
                )}
              >
                <h3 className="text-sm font-semibold text-white mb-4">Riepilogo turno</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Struttura', value: 'Ristorante Il Torchio', code: 'RIST-BN-0012' },
                    { label: 'Data', value: '13 Maggio 2025' },
                    { label: 'Orario', value: '09:30 — 17:45 · 8h 15m' },
                    { label: 'Tariffa oraria', value: '€12,00/h' },
                    { label: 'Totale paga', value: '€99,00', highlight: true },
                    { label: 'Punti rank', value: '+120 punti', color: '#1EC99A' },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-sm">
                      <span className="text-[#94A3B8]">{row.label}</span>
                      <div className="text-right">
                        <span
                          className="font-medium"
                          style={{
                            color: row.highlight ? '#5BB8F5' : row.color || '#FFFFFF',
                            fontFamily: row.highlight ? 'Playfair Display, Georgia, serif' : undefined,
                            fontWeight: row.highlight ? 700 : 500,
                          }}
                        >
                          {row.value}
                        </span>
                        {row.code && (
                          <p className="text-[10px] text-[#5BB8F5] font-mono mt-0.5">{row.code}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-auto pb-4">
                <button
                  onClick={handleReset}
                  className={cn(
                    'flex-1 h-12 text-sm font-medium text-white rounded-xl',
                    'gradient-sky hover:brightness-110 active:scale-[0.98] transition-all'
                  )}
                >
                  Nuovo check-in
                </button>
                <button className="flex-1 h-12 text-sm font-medium text-[#94A3B8] rounded-xl border border-[rgba(255,255,255,0.08)] hover:text-white hover:bg-[rgba(255,255,255,0.04)]">
                  Segnala problema
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <GlassBottomNav />
    </div>
  );
}
