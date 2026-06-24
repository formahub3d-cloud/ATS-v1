import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { MapPin } from 'lucide-react';
import CoverPhoto from '@/components/CoverPhoto';

export interface SwipeCardData {
  id: string;
  code: string;
  type: string;
  zone: string;
  role: string;
  schedule: string;
  pay: string;
  matchScore: number;
  requirements: string[];
  tags: string[];
  hasNavetta?: boolean;
  photo: string;
}

interface GlassSwipeCardProps {
  data: SwipeCardData;
  onLike: (id: string) => void;
  onPass: (id: string) => void;
  onSuperLike?: (id: string) => void;
  index: number;
  isTop: boolean;
}

export default function GlassSwipeCard({
  data,
  onLike,
  onPass,
  index,
  isTop,
}: GlassSwipeCardProps) {
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const opacityLeft = useTransform(x, [-200, -60, 0], [1, 0.8, 0]);
  const opacityRight = useTransform(x, [0, 60, 200], [0, 0.8, 1]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 100) {
      onLike(data.id);
    } else if (info.offset.x < -100) {
      onPass(data.id);
    }
  };

  const handleDrag = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 60) setDirection('right');
    else if (info.offset.x < -60) setDirection('left');
    else setDirection(null);
  };

  return (
    <motion.div
      className="absolute inset-x-3 top-2 bottom-[100px]"
      style={{ zIndex: 20 - index, x: isTop ? x : 0, rotate: isTop ? rotate : 0 }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.85, opacity: 0, y: 30 }}
      animate={{
        scale: isTop ? 1 : 1 - index * 0.04,
        opacity: isTop ? 1 : 1 - index * 0.25,
        y: isTop ? 0 : index * 10,
      }}
      exit={{
        x: direction === 'right' ? 500 : -500,
        opacity: 0,
        rotate: direction === 'right' ? 25 : -25,
        transition: { duration: 0.3 },
      }}
    >
      <div className="w-full h-full rounded-[24px] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.5)] flex flex-col bg-[#0D1E34]">
        {/* Photo area - 55% */}
        <div className="relative h-[55%] overflow-hidden">
          <CoverPhoto src={data.photo} alt={data.code} className="w-full h-full" />

          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0D1E34] to-transparent" />

          {/* Structure code badge */}
          <div className="absolute top-4 left-4">
            <span className="font-mono text-xs text-[#5BB8F5] tracking-wider bg-[rgba(13,30,52,0.85)] backdrop-blur-sm px-3 py-1.5 rounded-lg border border-[rgba(91,184,245,0.2)]">
              {data.code}
            </span>
          </div>

          {/* Match score */}
          <div className="absolute top-4 right-4">
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.15)" strokeWidth="3" fill="none" />
                <circle
                  cx="24" cy="24" r="20"
                  stroke="#5BB8F5"
                  strokeWidth="3"
                  fill="none"
                  strokeDasharray={`${data.matchScore * 1.26} 126`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#5BB8F5]">
                {data.matchScore}%
              </span>
            </div>
          </div>

          {/* Zone badge */}
          <div className="absolute bottom-4 left-4">
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-[rgba(245,184,0,0.12)] text-[#F5B800] border border-[rgba(245,184,0,0.25)]">
              <MapPin className="w-3 h-3" />
              {data.zone}
            </span>
          </div>

          {/* Swipe overlays */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-[rgba(30,201,154,0.35)] pointer-events-none"
            style={{ opacity: opacityRight }}
          >
            <span className="text-2xl font-bold text-[#1EC99A] border-[3px] border-[#1EC99A] px-5 py-2 rounded-xl rotate-[12deg] tracking-wide backdrop-blur-sm">
              MI INTERESSA
            </span>
          </motion.div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-[rgba(240,69,69,0.35)] pointer-events-none"
            style={{ opacity: opacityLeft }}
          >
            <span className="text-2xl font-bold text-[#F04545] border-[3px] border-[#F04545] px-5 py-2 rounded-xl rotate-[-12deg] tracking-wide backdrop-blur-sm">
              PASSA
            </span>
          </motion.div>
        </div>

        {/* Info area - 45% */}
        <div className="flex-1 p-5 flex flex-col">
          {/* Role */}
          <h3 className="text-xl font-semibold text-white mb-1">{data.role}</h3>
          <p className="text-xs text-[#94A3B8] mb-2">
            {data.type} {data.hasNavetta ? ' · Navetta disponibile' : ''}
          </p>

          {/* Schedule */}
          <p className="font-mono text-sm text-[#94A3B8] mb-2">{data.schedule}</p>

          {/* Pay */}
          <p
            className="text-2xl font-bold text-[#1EC99A] mb-3"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            {data.pay}
          </p>

          {/* Requirements */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {data.requirements.map((r) => (
              <span
                key={r}
                className="text-[10px] px-2 py-0.5 rounded bg-[rgba(30,201,154,0.1)] text-[#1EC99A] border border-[rgba(30,201,154,0.2)]"
              >
                {r}
              </span>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {data.tags.map((t) => (
              <span
                key={t}
                className="text-[10px] px-2 py-0.5 rounded-full border border-[rgba(255,255,255,0.1)] text-[#94A3B8] bg-[rgba(255,255,255,0.03)]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
