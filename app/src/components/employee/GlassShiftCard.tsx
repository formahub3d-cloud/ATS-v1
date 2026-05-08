import { motion } from 'framer-motion';
import { Clock, MapPin, Truck, ChevronRight } from 'lucide-react';
import CoverPhoto from '@/components/CoverPhoto';
import { cn } from '@/lib/utils';

interface GlassShiftCardProps {
  code: string;
  role: string;
  time: string;
  date: string;
  status: 'confirmed' | 'pending' | 'completed' | 'urgent';
  addressHint?: string;
  showNavetta?: boolean;
  photo?: string;
  index?: number;
  onCheckIn?: () => void;
  onDetails?: () => void;
}

const statusConfig = {
  confirmed: { label: 'Confermato', color: '#1EC99A', bg: 'rgba(30,201,154,0.15)' },
  pending: { label: 'In attesa', color: '#F5B800', bg: 'rgba(245,184,0,0.15)' },
  completed: { label: 'Completato', color: '#94A3B8', bg: 'rgba(148,163,184,0.15)' },
  urgent: { label: 'Urgente', color: '#F04545', bg: 'rgba(240,69,69,0.15)' },
};

export default function GlassShiftCard({
  code,
  role,
  time,
  date,
  status,
  addressHint,
  showNavetta = false,
  photo,
  index = 0,
  onCheckIn,
  onDetails,
}: GlassShiftCardProps) {
  const cfg = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.45, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
      className={cn(
        'rounded-[20px] p-5 border backdrop-blur-[16px]',
        'bg-[rgba(13,30,52,0.7)] border-[rgba(91,184,245,0.12)]',
        'shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-md border"
          style={{
            color: cfg.color,
            backgroundColor: cfg.bg,
            borderColor: cfg.color + '30',
          }}
        >
          {cfg.label}
        </span>
        <span className="font-mono text-xs text-[#5BB8F5] tracking-wider bg-[rgba(91,184,245,0.08)] px-2 py-0.5 rounded border border-[rgba(91,184,245,0.15)]">
          {code}
        </span>
      </div>

      {/* Photo + info row */}
      <div className="flex gap-3 mb-3">
        {photo && (
          <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden">
            <CoverPhoto src={photo} alt={code} className="w-full h-full" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-1">{role}</h3>
          <div className="flex items-center gap-2 text-sm text-[#94A3B8] mb-1">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{time}</span>
          </div>
          <p className="text-xs text-[#94A3B8]">{date}</p>
        </div>
      </div>

      {/* Address hint */}
      {addressHint && (
        <div className="flex items-center gap-1.5 text-xs text-[#5E7A95] mb-3 bg-[rgba(255,255,255,0.03)] rounded-lg px-3 py-2 border border-[rgba(255,255,255,0.04)]">
          <MapPin className="w-3.5 h-3.5" />
          <span>{addressHint}</span>
        </div>
      )}

      {/* Navetta */}
      {showNavetta && (
        <div className="flex items-center gap-2 mb-3 text-xs text-[#5BB8F5] bg-[rgba(91,184,245,0.06)] rounded-lg px-3 py-2 border border-[rgba(91,184,245,0.12)]">
          <Truck className="w-3.5 h-3.5" />
          <span>Navetta confermata · Partenza 07:30</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {onCheckIn && (
          <button
            onClick={onCheckIn}
            className={cn(
              'flex-1 h-11 text-sm font-medium text-white rounded-xl',
              'gradient-sky hover:brightness-110 active:scale-[0.98] transition-all',
              'shadow-[0_0_20px_rgba(91,184,245,0.15)] animate-pulse-glow'
            )}
          >
            Check-in QR
          </button>
        )}
        {onDetails && (
          <button
            onClick={onDetails}
            className={cn(
              'flex items-center gap-2 px-4 h-11 text-sm font-medium text-[#5BB8F5]',
              'border border-[rgba(91,184,245,0.2)] rounded-xl',
              'hover:bg-[rgba(91,184,245,0.1)] active:scale-[0.98] transition-all'
            )}
          >
            Dettagli
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        {!onCheckIn && !onDetails && (
          <button className="flex-1 h-10 text-sm font-medium text-[#5BB8F5] border border-[#5BB8F5] rounded-lg hover:bg-[rgba(91,184,245,0.1)] active:scale-[0.98] transition-all">
            Vedi dettagli
          </button>
        )}
        {showNavetta && !onCheckIn && (
          <button className="flex items-center gap-2 px-4 h-10 text-sm text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg active:scale-[0.98] transition-all">
            <Truck className="w-4 h-4" />
            <span className="text-xs">Navetta</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
