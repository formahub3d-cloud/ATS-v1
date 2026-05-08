import { motion } from 'framer-motion';
import { Clock, MapPin, Truck } from 'lucide-react';
interface ShiftCardProps {
  code: string;
  role: string;
  time: string;
  date: string;
  status: 'confirmed' | 'pending' | 'completed' | 'urgent';
  addressHint?: string;
  showNavetta?: boolean;
  index?: number;
}

const statusConfig = {
  confirmed: { label: 'Confermato', color: '#1EC99A', bg: 'rgba(30,201,154,0.15)' },
  pending: { label: 'In attesa', color: '#F5B800', bg: 'rgba(245,184,0,0.15)' },
  completed: { label: 'Completato', color: '#94A3B8', bg: 'rgba(148,163,184,0.15)' },
  urgent: { label: 'Urgente', color: '#F04545', bg: 'rgba(240,69,69,0.15)' },
};

export default function ShiftCard({
  code,
  role,
  time,
  date,
  status,
  addressHint,
  showNavetta = false,
  index = 0,
}: ShiftCardProps) {
  const cfg = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
      className="bg-[#0D1E34] rounded-2xl p-4 border border-[rgba(255,255,255,0.06)] mx-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-xs font-medium px-2.5 py-1 rounded-md"
          style={{ color: cfg.color, backgroundColor: cfg.bg }}
        >
          {cfg.label}
        </span>
        <span className="font-mono text-xs text-[#5BB8F5] tracking-wider bg-[rgba(91,184,245,0.08)] px-2 py-0.5 rounded">
          {code}
        </span>
      </div>

      {/* Role */}
      <h3 className="text-lg font-semibold text-white mb-1">{role}</h3>

      {/* Time & Date */}
      <div className="flex items-center gap-2 text-[#94A3B8] mb-2">
        <Clock className="w-4 h-4" />
        <span className="font-mono text-sm">{time}</span>
      </div>
      <p className="text-sm text-[#94A3B8] mb-3">{date}</p>

      {/* Address hint */}
      {addressHint && (
        <div className="flex items-center gap-1.5 text-xs text-[#5E7A95] mb-3 bg-[rgba(255,255,255,0.03)] rounded-lg px-3 py-2">
          <MapPin className="w-3.5 h-3.5" />
          <span>{addressHint}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex-1 h-10 text-sm font-medium text-[#5BB8F5] border border-[#5BB8F5] rounded-lg hover:bg-[rgba(91,184,245,0.1)] active:scale-[0.98] transition-all">
          Vedi dettagli
        </button>
        {showNavetta && (
          <button className="flex items-center gap-2 px-4 h-10 text-sm text-[#94A3B8] hover:text-white hover:bg-[rgba(255,255,255,0.05)] rounded-lg active:scale-[0.98] transition-all">
            <Truck className="w-4 h-4" />
            <span className="text-xs">Navetta</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
