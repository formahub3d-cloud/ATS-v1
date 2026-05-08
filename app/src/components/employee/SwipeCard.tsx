import { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { X, Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  photos: string[];
}

interface SwipeCardProps {
  data: SwipeCardData;
  onLike: (id: string) => void;
  onPass: (id: string) => void;
  onSuperLike?: (id: string) => void;
  index: number;
  isTop: boolean;
}

export default function SwipeCard({ data, onLike, onPass, onSuperLike, index, isTop }: SwipeCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
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

  const handleButtonLike = () => {
    onLike(data.id);
  };

  const handleButtonPass = () => {
    onPass(data.id);
  };

  const nextPhoto = () => setPhotoIndex((p) => Math.min(p + 1, data.photos.length - 1));
  const prevPhoto = () => setPhotoIndex((p) => Math.max(p - 1, 0));

  return (
    <motion.div
      className={cn('absolute inset-x-4 top-0 bottom-[120px]', !isTop && 'pointer-events-none')}
      initial={{ scale: 0.85, opacity: 0, y: 30 }}
      animate={{ scale: 1 - index * 0.03, opacity: 1 - index * 0.15, y: index * 8 }}
      exit={{ x: direction === 'right' ? 400 : -400, opacity: 0, rotate: direction === 'right' ? 25 : -25 }}
      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
      style={{ x, rotate, zIndex: 10 - index }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full h-full bg-[#0D1E34] rounded-[20px] overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.4)] flex flex-col">
        {/* Photo area - 55% */}
        <div className="relative h-[55%] overflow-hidden">
          <div
            className="w-full h-full bg-gradient-to-b from-[#0D1E34] to-[#06101E] flex items-center justify-center"
            onTouchStart={(e) => {
              const touch = e.touches[0];
              const rect = e.currentTarget.getBoundingClientRect();
              const x = touch.clientX - rect.left;
              if (x < rect.width / 2) prevPhoto();
              else nextPhoto();
            }}
          >
            {/* Placeholder photo area with gradient */}
            <div className="w-full h-full bg-gradient-to-br from-[#142B4A] to-[#06101E] flex items-center justify-center">
              <span className="text-[#5E7A95] text-sm">{data.photos[photoIndex] || 'Foto struttura'}</span>
            </div>
          </div>

          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0D1E34] to-transparent" />

          {/* Photo counter */}
          <div className="absolute top-3 right-3 bg-[rgba(0,0,0,0.4)] text-white text-xs px-2.5 py-1 rounded-xl backdrop-blur-sm">
            {photoIndex + 1}/{data.photos.length}
          </div>

          {/* Match score */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <div className="relative w-12 h-12">
              <svg viewBox="0 0 48 48" className="w-full h-full -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" />
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

          {/* Swipe overlays */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-[rgba(30,201,154,0.4)] rounded-t-[20px]"
            style={{ opacity: opacityRight }}
          >
            <span className="text-3xl font-bold text-[#1EC99A] border-4 border-[#1EC99A] px-6 py-2 rounded-xl rotate-[15deg]">
              MI INTERESSA
            </span>
          </motion.div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-[rgba(240,69,69,0.4)] rounded-t-[20px]"
            style={{ opacity: opacityLeft }}
          >
            <span className="text-3xl font-bold text-[#F04545] border-4 border-[#F04545] px-6 py-2 rounded-xl rotate-[-15deg]">
              PASSA
            </span>
          </motion.div>
        </div>

        {/* Info area - 45% */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Code + type */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm text-[#5BB8F5] tracking-wider bg-[rgba(91,184,245,0.08)] px-2 py-0.5 rounded">
              {data.code}
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mb-2">
            {data.type} &middot; {data.zone} {data.hasNavetta && ' &middot; Navetta'}
          </p>

          {/* Role */}
          <h3 className="text-xl font-semibold text-white mb-1">{data.role}</h3>

          {/* Schedule */}
          <p className="font-mono text-sm text-[#94A3B8] mb-2">{data.schedule}</p>

          {/* Pay */}
          <p className="text-2xl font-bold text-[#1EC99A] mb-3" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            {data.pay}
          </p>

          {/* Requirements */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {data.requirements.map((r) => (
              <span key={r} className="text-xs px-2 py-0.5 rounded-md bg-[rgba(30,201,154,0.1)] text-[#1EC99A] border border-[rgba(30,201,154,0.2)]">
                {r}
              </span>
            ))}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-auto">
            {data.tags.map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full border border-[rgba(255,255,255,0.1)] text-[#94A3B8]">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom action bar */}
      {isTop && (
        <div className="absolute -bottom-[80px] left-0 right-0 flex items-center justify-center gap-5">
          <motion.button
            whileTap={{ scale: 1.15 }}
            onClick={handleButtonPass}
            className="w-14 h-14 rounded-full flex items-center justify-center border border-[rgba(240,69,69,0.3)] text-[#F04545] hover:bg-[rgba(240,69,69,0.1)] active:scale-95 transition-all"
          >
            <X className="w-6 h-6" />
          </motion.button>
          {onSuperLike && (
            <motion.button
              whileTap={{ scale: 1.15 }}
              onClick={() => onSuperLike(data.id)}
              className="w-12 h-12 rounded-full flex items-center justify-center border border-[rgba(245,184,0,0.3)] text-[#F5B800] hover:bg-[rgba(245,184,0,0.1)] active:scale-95 transition-all"
            >
              <Star className="w-5 h-5" />
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 1.15 }}
            onClick={handleButtonLike}
            className="w-14 h-14 rounded-full flex items-center justify-center border border-[rgba(91,184,245,0.3)] text-[#5BB8F5] hover:bg-[rgba(91,184,245,0.1)] active:scale-95 transition-all"
          >
            <Heart className="w-6 h-6" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
