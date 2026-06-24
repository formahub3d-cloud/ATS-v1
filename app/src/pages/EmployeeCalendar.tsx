import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Flag, Info, X, Check } from 'lucide-react';
import GlassBottomNav from '@/components/employee/GlassBottomNav';
import { useToast } from '@/components/ui/ToastSystem';
import CoverPhoto from '@/components/CoverPhoto';
import { LoadingState, ErrorState } from '@/components/states';
import { useAsync } from '@/hooks/useAsync';
import { getCalendarMonths, type CalendarPageDay, type CalendarPageMonth } from '@/services/employeeService';
import { cn } from '@/lib/utils';

// ---- Types (presentazione) ----
type DayStatus = 'available' | 'unavailable' | 'none' | 'assigned';

type CalendarDay = CalendarPageDay;
type CalendarMonth = CalendarPageMonth;

const dayHeaders = ['LUN','MAR','MER','GIO','VEN','SAB','DOM'];

// ---- Day Detail Bottom Sheet ----
function DaySheet({
  day, month, onClose, onToggle,
}: {
  day: CalendarDay;
  month: string;
  onClose: () => void;
  onToggle: () => void;
}) {
  const [isAvailable, setIsAvailable] = useState(day.status === 'available');
  const dateLabel = `${day.day} ${month}`;

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-[rgba(6,16,30,0.88)] backdrop-blur-[12px]" onClick={onClose} />
      <motion.div
        className={cn(
          'relative rounded-t-[24px] max-h-[70vh] overflow-auto border-t border-[rgba(91,184,245,0.15)]',
          'bg-[rgba(13,30,52,0.95)] backdrop-blur-[24px]',
          'shadow-[0_32px_80px_rgba(0,0,0,0.6),0_0_60px_rgba(91,184,245,0.05)]'
        )}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-[#5E7A95] rounded-full" />
        </div>

        <div className="px-6 pb-8">
          <h3 className="text-xl font-semibold text-white mb-4">{dateLabel}</h3>

          {day.hasShift ? (
            <div className="mb-4">
              <div className={cn(
                'flex items-center gap-3 p-3 rounded-xl border backdrop-blur-sm',
                'bg-[rgba(91,184,245,0.06)] border-[rgba(91,184,245,0.15)]'
              )}>
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                  <CoverPhoto src={`/structure-${day.day === 12 ? '1' : '2'}.jpg`} alt="struttura" className="w-full h-full" />
                </div>
                <div>
                  <span className="text-xs text-[#5BB8F5] font-mono bg-[rgba(91,184,245,0.08)] px-1.5 py-0.5 rounded">
                    {day.shiftCode}
                  </span>
                  <p className="text-sm text-white font-medium mt-1">Turno assegnato</p>
                  <p className="text-xs text-[#94A3B8]">Non puoi modificare la disponibilità</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Toggle */}
              <div className="flex items-center justify-between mb-4 p-1 bg-[rgba(255,255,255,0.04)] rounded-xl">
                <button
                  onClick={() => setIsAvailable(true)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-medium transition-all',
                    isAvailable
                      ? 'bg-[#1EC99A] text-[#06101E]'
                      : 'text-[#94A3B8] hover:text-white'
                  )}
                >
                  <Check className="w-4 h-4" />
                  Disponibile
                </button>
                <button
                  onClick={() => setIsAvailable(false)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 h-11 rounded-lg text-sm font-medium transition-all',
                    !isAvailable
                      ? 'bg-[#F04545] text-white'
                      : 'text-[#94A3B8] hover:text-white'
                  )}
                >
                  <X className="w-4 h-4" />
                  Non disponibile
                </button>
              </div>

              {isAvailable && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3"
                >
                  {day.isHoliday && (
                    <div className={cn(
                      'flex items-center gap-2 text-xs text-[#F5B800] p-3 rounded-xl border',
                      'bg-[rgba(245,184,0,0.06)] border-[rgba(245,184,0,0.15)]'
                    )}>
                      <Flag className="w-4 h-4" />
                      <span>Festivo nazionale · +{day.holidayPremium}% su paga base</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                    <Info className="w-4 h-4" />
                    <span>Domanda stimata: Media per Cameriere</span>
                  </div>
                  <p className="text-xs text-[#5BB8F5]">
                    €12,00/h invece di €8,00/h durante i festivi
                  </p>
                </motion.div>
              )}

              {!isAvailable && (
                <p className="text-sm text-[#94A3B8]">
                  Nessun turno ti sarà proposto questo giorno.
                </p>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { onToggle(); onClose(); }}
                  className="flex-1 h-12 text-sm font-medium text-white gradient-sky rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  Conferma
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 h-12 text-sm font-medium text-[#94A3B8] hover:text-white transition-colors"
                >
                  Annulla
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function EmployeeCalendar() {
  const { addToast } = useToast();
  const [currentMonthIdx, setCurrentMonthIdx] = useState(1);
  const [direction, setDirection] = useState(0);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [months, setMonths] = useState<CalendarMonth[]>([]);

  // Dati dal service layer (oggi mock async, domani API): stato uniforme loading/error/data.
  const calendar = useAsync(getCalendarMonths, []);
  useEffect(() => {
    if (calendar.data) setMonths(calendar.data);
  }, [calendar.data]);

  const currentMonth = months[currentMonthIdx];

  const goPrev = () => {
    if (currentMonthIdx > 0) {
      setDirection(-1);
      setCurrentMonthIdx((i) => i - 1);
    }
  };

  const goNext = () => {
    if (currentMonthIdx < months.length - 1) {
      setDirection(1);
      setCurrentMonthIdx((i) => i + 1);
    }
  };

  const toggleDay = (weekIdx: number, dayIdx: number) => {
    setMonths((prev) => {
      const copy = prev.map((m) => ({
        ...m,
        days: m.days.map((w) => w.map((d) => ({ ...d }))),
      }));
      const day = copy[currentMonthIdx].days[weekIdx][dayIdx];
      if (day.hasShift || day.day === 0) return prev;
      day.status = day.status === 'available' ? 'unavailable' : 'available';
      return copy;
    });
    setSelectedDay(null);
    addToast({
      type: 'success',
      title: 'Disponibilità aggiornata',
      message: 'Le tue preferenze sono state salvate.',
    });
  };

  const handleBulkAction = (action: string) => {
    setMonths((prev) => {
      const copy = prev.map((m) => ({
        ...m,
        days: m.days.map((w) => w.map((d) => ({ ...d }))),
      }));
      const month = copy[currentMonthIdx];
      month.days.forEach((week) =>
        week.forEach((day) => {
          if (day.hasShift || day.day === 0) return;
          if (action === 'weekend') {
            if (day.isWeekend) day.status = 'available';
          } else if (action === 'clear') {
            day.status = 'none';
          }
        })
      );
      return copy;
    });
    addToast({ type: 'info', title: 'Azione bulk', message: 'Disponibilità aggiornata per gruppo di giorni.' });
  };

  const stats = useMemo(() => {
    let available = 0;
    let unavailable = 0;
    let holidays = 0;
    let assigned = 0;
    currentMonth?.days.forEach((w) =>
      w.forEach((d) => {
        if (d.status === 'available') available++;
        if (d.status === 'unavailable') unavailable++;
        if (d.isHoliday && d.status === 'available') holidays++;
        if (d.hasShift) assigned++;
      })
    );
    return { available, unavailable, holidays, assigned, estimatedPay: available * 32 };
  }, [currentMonth]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  if (calendar.error) {
    return (
      <div className="min-h-[100dvh] bg-[#06101E] pb-24">
        <div className="max-w-[430px] mx-auto px-4 pt-10">
          <ErrorState onRetry={() => window.location.reload()} />
        </div>
        <GlassBottomNav />
      </div>
    );
  }

  if (calendar.loading || months.length === 0 || !currentMonth) {
    return (
      <div className="min-h-[100dvh] bg-[#06101E] pb-24">
        <div className="max-w-[430px] mx-auto px-4 pt-10">
          <LoadingState />
        </div>
        <GlassBottomNav />
      </div>
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
        <div className="max-w-[430px] mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={goPrev}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] active:scale-90 transition-transform"
            >
              <ChevronLeft className="w-5 h-5 text-[#94A3B8]" />
            </button>
            <h1
              className="text-[22px] font-bold text-white"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              {currentMonth.name}
            </h1>
            <button
              onClick={goNext}
              className="w-11 h-11 rounded-full flex items-center justify-center bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] active:scale-90 transition-transform"
            >
              <ChevronRight className="w-5 h-5 text-[#94A3B8]" />
            </button>
          </div>

          {/* Stats row */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {[
              { label: 'Disponibili', value: stats.available, color: '#1EC99A' },
              { label: 'Indisponibili', value: stats.unavailable, color: '#F04545' },
              { label: 'Festivi', value: stats.holidays, color: '#F5B800' },
              { label: 'Turni', value: stats.assigned, color: '#5BB8F5' },
            ].map((stat) => (
              <div
                key={stat.label}
                className={cn(
                  'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border',
                  'bg-[rgba(13,30,52,0.6)] backdrop-blur-sm'
                )}
                style={{ color: stat.color, borderColor: stat.color + '25' }}
              >
                <span className="font-semibold">{stat.value}</span>
                <span className="opacity-80">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-[430px] mx-auto">
        {/* Calendar Grid Glass Card */}
        <div className={cn(
          'mx-4 mt-4 rounded-[20px] p-4 border backdrop-blur-[16px]',
          'bg-[rgba(13,30,52,0.7)] border-[rgba(91,184,245,0.12)]',
          'shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
        )}>
          {/* Day headers */}
          <div className="grid grid-cols-7 pb-2">
            {dayHeaders.map((h) => (
              <div key={h} className="text-center text-[10px] font-medium text-[#5E7A95] py-2">
                {h}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentMonthIdx}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {currentMonth.days.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7">
                  {week.map((day, di) => {
                    const isEmpty = day.day === 0;
                    const baseClasses =
                      'm-[2px] rounded-xl min-h-[68px] p-1.5 flex flex-col items-center justify-center cursor-pointer select-none transition-all active:scale-90';
                    const statusClasses: Record<DayStatus, string> = {
                      available: 'bg-[rgba(30,201,154,0.12)] text-[#1EC99A] shadow-[0_2px_8px_rgba(30,201,154,0.15)]',
                      unavailable: 'bg-[rgba(240,69,69,0.08)] text-[#F04545]',
                      none: 'bg-[rgba(255,255,255,0.02)] text-[#94A3B8] border border-[rgba(255,255,255,0.04)]',
                      assigned: 'bg-[rgba(91,184,245,0.08)] text-[#5BB8F5] border border-[rgba(91,184,245,0.15)] shadow-[0_0_8px_rgba(91,184,245,0.15)]',
                    };
                    return (
                      <motion.div
                        key={di}
                        className={cn(baseClasses, !isEmpty && statusClasses[day.status])}
                        style={
                          day.isToday
                            ? {
                                border: '2px solid #5BB8F5',
                                boxShadow: 'inset 0 0 8px rgba(91,184,245,0.2), 0 0 12px rgba(91,184,245,0.15)',
                              }
                            : undefined
                        }
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: wi * 0.015 + di * 0.015, duration: 0.2 }}
                        onClick={() => {
                          if (!isEmpty) setSelectedDay(day);
                        }}
                      >
                        {!isEmpty && (
                          <>
                            <span className="text-sm font-semibold">{day.day}</span>
                            {day.isHoliday && (
                              <span className="text-[8px] font-bold mt-0.5 px-1 py-0.5 rounded bg-[rgba(245,184,0,0.2)] text-[#F5B800]">
                                +{day.holidayPremium}%
                              </span>
                            )}
                            {day.hasShift && (
                              <div className="w-2 h-2 rounded-full bg-[#5BB8F5] mt-1 shadow-[0_0_4px_rgba(91,184,245,0.5)]" />
                            )}
                            {day.status === 'available' && !day.isHoliday && !day.hasShift && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#1EC99A] mt-1 opacity-60" />
                            )}
                            {day.status === 'unavailable' && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#F04545] mt-1 opacity-60" />
                            )}
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bulk actions */}
        <div className="flex gap-2 px-4 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { label: 'Weekend disponibili', action: 'weekend' },
            { label: 'Ripeti settimana', action: 'repeat' },
            { label: 'Copia da scorsa', action: 'copy' },
            { label: 'Azzera tutto', action: 'clear' },
          ].map((chip) => (
            <button
              key={chip.action}
              onClick={() => handleBulkAction(chip.action)}
              className={cn(
                'flex-shrink-0 px-4 py-2 text-xs font-medium rounded-full border transition-all active:scale-95 backdrop-blur-sm',
                chip.action === 'clear'
                  ? 'text-[#F04545] border-[rgba(240,69,69,0.3)] bg-[rgba(240,69,69,0.06)] hover:bg-[rgba(240,69,69,0.1)]'
                  : 'text-[#94A3B8] border-[rgba(255,255,255,0.1)] bg-[rgba(13,30,52,0.6)] hover:border-[#5BB8F5] hover:text-[#5BB8F5]'
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-4 mt-4">
          {[
            { color: '#1EC99A', label: 'Disponibile' },
            { color: '#F04545', label: 'Non disponibile' },
            { color: '#5BB8F5', label: 'Turno assegnato' },
            { color: '#F5B800', label: 'Festivo (+premium)' },
            { color: '#5E7A95', label: 'Nessuna selezione' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_4px_currentColor]" style={{ backgroundColor: item.color, color: item.color }} />
              <span className="text-[10px] text-[#94A3B8]">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Availability Summary */}
        <div className={cn(
          'mx-4 mt-4 rounded-xl p-5 border backdrop-blur-[16px] mb-4',
          'bg-[rgba(13,30,52,0.7)] border-[rgba(91,184,245,0.12)]',
          'shadow-[0_8px_32px_rgba(0,0,0,0.2)]'
        )}>
          <h3 className="text-sm font-semibold text-white mb-3">Riepilogo disponibilità</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#94A3B8]">Giorni disponibili</span>
              <span className="text-white font-medium">{stats.available}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#94A3B8]">Giorni non disponibili</span>
              <span className="text-white font-medium">{stats.unavailable}</span>
            </div>
            {stats.holidays > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#F5B800]">Festivi disponibili</span>
                <span className="text-[#F5B800] font-medium">{stats.holidays} (premio garantito)</span>
              </div>
            )}
            <div className="pt-2 border-t border-[rgba(255,255,255,0.04)] flex justify-between">
              <span className="text-sm text-[#94A3B8]">Stima paga mensile</span>
              <span className="text-sm font-semibold text-[#5BB8F5]">€{stats.estimatedPay},00</span>
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="px-4 pb-6">
          <button
            onClick={() => addToast({ type: 'success', title: 'Disponibilità salvata', message: 'Le tue preferenze sono state aggiornate.' })}
            className="w-full h-12 text-sm font-medium text-white gradient-sky rounded-xl hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(91,184,245,0.15)]"
          >
            Salva disponibilità
          </button>
        </div>
      </div>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {selectedDay && (
          <DaySheet
            day={selectedDay}
            month={currentMonth.name}
            onClose={() => setSelectedDay(null)}
            onToggle={() => {
              for (let wi = 0; wi < currentMonth.days.length; wi++) {
                for (let di = 0; di < currentMonth.days[wi].length; di++) {
                  if (currentMonth.days[wi][di].day === selectedDay.day) {
                    toggleDay(wi, di);
                    return;
                  }
                }
              }
            }}
          />
        )}
      </AnimatePresence>

      <GlassBottomNav />
    </div>
  );
}
