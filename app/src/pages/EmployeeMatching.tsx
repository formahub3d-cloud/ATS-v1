import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, Star, Heart, X, MapPin, Sliders } from 'lucide-react';
import GlassSwipeCard, { type SwipeCardData } from '@/components/employee/GlassSwipeCard';
import GlassBottomNav from '@/components/employee/GlassBottomNav';
import { useToast } from '@/components/ui/ToastSystem';
import { cn } from '@/lib/utils';

// ---- Confetti ----
import confetti from 'canvas-confetti';

function launchConfetti() {
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 500,
  };
  confetti({
    ...defaults,
    particleCount: 40,
    spread: 60,
    startVelocity: 60,
    colors: ['#5BB8F5', '#3AA3E8', '#1EC99A', '#F5B800'],
  });
  setTimeout(() => {
    confetti({
      ...defaults,
      particleCount: 25,
      spread: 40,
      startVelocity: 50,
      colors: ['#5BB8F5', '#1EC99A'],
    });
  }, 150);
}

// ---- Mock Data with structure photos ----
const rawCards: SwipeCardData[] = [
  {
    id: '1', code: 'RIST-BN-0047', type: 'Ristorante', zone: 'Centro', role: 'Cameriere',
    schedule: 'Mar-Ven 18:00-23:30', pay: '€12,00/h', matchScore: 95,
    requirements: ['Attestato HACCP', 'Esperienza ristorazione'],
    tags: ['Paga veloce', 'Team giovane'], hasNavetta: true, photo: '/structure-1.jpg',
  },
  {
    id: '2', code: 'HOTEL-BN-0003', type: 'Hotel 4*', zone: 'Centro', role: 'Receptionist',
    schedule: 'Sab-Dom 08:00-16:00', pay: '€12,50/h', matchScore: 88,
    requirements: ['Inglese B2', 'Esperienza alberghiera'],
    tags: ['Lavoro continuativo', 'Inserimento rapido'], hasNavetta: false, photo: '/structure-2.jpg',
  },
  {
    id: '3', code: 'BAR-BN-0011', type: 'Bar', zone: 'Periferia', role: 'Barista',
    schedule: 'Ven-Sab 22:00-04:00', pay: '€14,00/h', matchScore: 75,
    requirements: ['Latte art', 'Resistenza ritmi notturni'],
    tags: ['Notturno', 'Mance elevate'], hasNavetta: true, photo: '/structure-3.jpg',
  },
  {
    id: '4', code: 'EVEN-BN-0020', type: 'Location Eventi', zone: 'Eventi', role: 'Event Staff',
    schedule: 'Dom 14:00-22:00', pay: '€15,00/h', matchScore: 82,
    requirements: ['Resistenza ritmi intensi', 'Vestito nero'],
    tags: ['Paga elevata', 'Occasionale'], hasNavetta: false, photo: '/structure-4.jpg',
  },
  {
    id: '5', code: 'SPAS-BN-0008', type: 'SPA & Wellness', zone: 'Resort', role: 'SPA Staff',
    schedule: 'Mer-Ven 10:00-18:00', pay: '€11,50/h', matchScore: 70,
    requirements: ['Attestato massaggio'],
    tags: ['Ambiente rilassante', 'Sconti benessere'], hasNavetta: true, photo: '/structure-5.jpg',
  },
  {
    id: '6', code: 'CLOC-BN-0013', type: 'Circolo Sportivo', zone: 'Periferia', role: 'Aiuto Cucina',
    schedule: 'Mar-Sab 17:00-23:00', pay: '€10,50/h', matchScore: 65,
    requirements: ['Velocità e resistenza'],
    tags: ['Cucina a vista', 'Sportivo'], hasNavetta: false, photo: '/structure-6.jpg',
  },
  {
    id: '7', code: 'BOUT-BN-0025', type: 'Boutique Hotel', zone: 'Centro Storico', role: 'Concierge',
    schedule: 'Lun-Ven 15:00-23:00', pay: '€13,00/h', matchScore: 90,
    requirements: ['Inglese fluente', 'Conoscenza città'],
    tags: ['Lusso', 'Propina elevata'], hasNavetta: true, photo: '/structure-7.jpg',
  },
  {
    id: '8', code: 'RIST-BN-0052', type: 'Trattoria', zone: 'Industriale', role: 'Aiuto Sala',
    schedule: 'Lun-Sab 11:30-15:00', pay: '€9,50/h', matchScore: 60,
    requirements: ['Disponibilità immediata'],
    tags: ['Orario pranzo', 'Fuori orario'], hasNavetta: false, photo: '/structure-8.jpg',
  },
];

// ---- Match success overlay ----
function MatchOverlay({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[rgba(6,16,30,0.9)]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="text-center"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          className="w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #1EC99A 0%, #5BB8F5 100%)',
            boxShadow: '0 0 40px rgba(30,201,154,0.4)',
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.6 }}
        >
          <Heart className="w-10 h-10 text-white fill-white" />
        </motion.div>
        <h2
          className="text-3xl font-bold text-white mb-2"
          style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
        >
          È un match!
        </h2>
        <p className="text-sm text-[#94A3B8] mb-1">
          La struttura ti ricontatterà
        </p>
        <p className="text-sm text-[#94A3B8] mb-6">
          per confermare il turno.
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className={cn(
            'px-8 h-12 text-sm font-medium text-[#06101E] rounded-xl',
            'gradient-sky hover:brightness-110 shadow-[0_0_20px_rgba(91,184,245,0.3)]'
          )}
        >
          Continua a esplorare
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default function EmployeeMatching() {
  const { addToast } = useToast();
  const [cards, setCards] = useState<SwipeCardData[]>(rawCards);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [passedIds, setPassedIds] = useState<string[]>([]);
  const [showMatch, setShowMatch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handlePass = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    setPassedIds((prev) => [...prev, id]);
    addToast({ type: 'info', title: 'Turno saltato', message: 'Non ti proporranno più questa offerta.' });
  }, [addToast]);

  const handleLike = useCallback((id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    setMatchedIds((prev) => [...prev, id]);
    launchConfetti();
    setShowMatch(true);
    addToast({ type: 'success', title: 'Interesse inviato', message: 'La struttura ti ricontatterà presto.' });
  }, [addToast]);

  const handleRewind = () => {
    if (passedIds.length > 0) {
      const lastId = passedIds[passedIds.length - 1];
      const card = rawCards.find((c) => c.id === lastId);
      if (card) {
        setCards((prev) => [card, ...prev]);
        setPassedIds((prev) => prev.slice(0, -1));
        addToast({ type: 'info', title: 'Ripristinato', message: 'Il turno è tornato in coda.' });
      }
    }
  };

  const topCard = cards[0] || null;
  const total = rawCards.length;
  const matchedCount = matchedIds.length;
  const passedCount = passedIds.length;

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
        <div className="max-w-[430px] mx-auto px-4 pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-white">Scopri turni</h1>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] active:scale-90 transition-transform"
            >
              <Sliders className="w-4 h-4 text-[#94A3B8]" />
            </button>
          </div>
          {/* Stats */}
          <div className="flex gap-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(30,201,154,0.1)] text-[#1EC99A] border border-[rgba(30,201,154,0.2)]">
              {matchedCount} match
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(148,163,184,0.1)] text-[#94A3B8] border border-[rgba(148,163,184,0.2)]">
              {passedCount} saltati
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(91,184,245,0.1)] text-[#5BB8F5] border border-[rgba(91,184,245,0.2)]">
              {cards.length} rimanenti
            </span>
          </div>
        </div>
      </header>

      {/* Filter bar */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-b border-[rgba(255,255,255,0.06)]"
          >
            <div className="max-w-[430px] mx-auto px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
              {['Centro', 'Periferia', 'Eventi', 'Resort', 'Industriale'].map((zone) => (
                <button
                  key={zone}
                  className={cn(
                    'flex-shrink-0 px-3 py-1.5 text-[11px] font-medium rounded-full border backdrop-blur-sm transition-all',
                    zone === 'Centro'
                      ? 'text-[#5BB8F5] border-[rgba(91,184,245,0.3)] bg-[rgba(91,184,245,0.08)]'
                      : 'text-[#94A3B8] border-[rgba(255,255,255,0.08)] bg-[rgba(13,30,52,0.4)] hover:border-[#5BB8F5] hover:text-[#5BB8F5]'
                  )}
                >
                  {zone}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swipe area */}
      <div className="flex-1 relative max-w-[430px] mx-auto w-full">
        <AnimatePresence mode="popLayout">
          {cards.length > 0 ? (
            cards.map((card, i) => (
              <GlassSwipeCard
                key={card.id}
                data={card}
                index={i}
                isTop={i === 0}
                onLike={handleLike}
                onPass={handlePass}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-[rgba(91,184,245,0.08)] flex items-center justify-center mb-4 border border-[rgba(91,184,245,0.15)]">
                <Search className="w-8 h-8 text-[#5BB8F5]" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">
                Nessun nuovo turno
              </h3>
              <p className="text-sm text-[#94A3B8] mb-6">
                Ti avviseremo appena arrivano nuove proposte!
              </p>
              <div className="flex gap-2 text-sm text-[#94A3B8] mb-4">
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[rgba(30,201,154,0.06)] border border-[rgba(30,201,154,0.15)] text-[#1EC99A]">
                  <Heart className="w-4 h-4" /> {matchedCount}
                </div>
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[rgba(148,163,184,0.06)] border border-[rgba(148,163,184,0.15)] text-[#94A3B8]">
                  <X className="w-4 h-4" /> {passedCount}
                </div>
              </div>
              <div className="text-xs text-[#5E7A95] mb-6">
                Proposte totali: {total}
              </div>
              <button
                onClick={() => {
                  setCards(rawCards);
                  setMatchedIds([]);
                  setPassedIds([]);
                }}
                className={cn(
                  'px-6 h-11 text-sm font-medium text-white rounded-xl',
                  'gradient-sky hover:brightness-110 active:scale-[0.98] transition-all'
                )}
              >
                Ricarica
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      {cards.length > 0 && (
        <div className="flex items-center justify-center gap-4 py-4 z-10">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => topCard && handlePass(topCard.id)}
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center',
              'bg-[rgba(240,69,69,0.08)] border border-[rgba(240,69,69,0.3)]',
              'hover:bg-[rgba(240,69,69,0.15)] active:scale-90 transition-all',
              'shadow-[0_4px_16px_rgba(240,69,69,0.2)]'
            )}
          >
            <X className="w-6 h-6 text-[#F04545]" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={handleRewind}
            disabled={passedIds.length === 0}
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center',
              'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)]',
              passedIds.length === 0 ? 'opacity-30' : 'hover:bg-[rgba(255,255,255,0.08)] active:scale-90',
              'transition-all'
            )}
          >
            <Sliders className="w-5 h-5 text-[#94A3B8]" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => topCard && handleLike(topCard.id)}
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center',
              'bg-[rgba(30,201,154,0.08)] border border-[rgba(30,201,154,0.3)]',
              'hover:bg-[rgba(30,201,154,0.15)] active:scale-90 transition-all',
              'shadow-[0_4px_16px_rgba(30,201,154,0.2)]'
            )}
          >
            <Heart className="w-6 h-6 text-[#1EC99A]" />
          </motion.button>
        </div>
      )}

      <GlassBottomNav />

      {/* Match overlay */}
      <AnimatePresence>
        {showMatch && <MatchOverlay onClose={() => setShowMatch(false)} />}
      </AnimatePresence>
    </div>
  );
}


