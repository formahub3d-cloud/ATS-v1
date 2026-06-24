import { useState, useCallback } from 'react'
import type { PanInfo } from 'framer-motion'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { MapPin, Star, Heart, X, Award, Briefcase, RotateCcw } from 'lucide-react'
import Avatar from '@/components/Avatar'
import GlassTooltip from '@/components/ui/GlassTooltip'

export interface GlassEmployeeProfile {
  id: string
  code: string
  firstName: string
  role: string
  matchScore: number
  tags: string[]
  distance: number
  rank: 'Rookie' | 'Affidabile' | 'Senior' | 'Elite' | 'Ambassador'
  experience: string
  venues: string[]
  rating: number
  payRate: number
  avatar?: string
}

interface GlassSwipeCardProps {
  employee: GlassEmployeeProfile
  onLike: (employee: GlassEmployeeProfile) => void
  onDislike: (employee: GlassEmployeeProfile) => void
  onRewind?: () => void
  isTop?: boolean
  stackIndex?: number
}

const rankColors: Record<string, string> = {
  Rookie: '#94A3B8',
  Affidabile: '#5BB8F5',
  Senior: '#3AA3E8',
  Elite: '#1EC99A',
  Ambassador: '#F5B800',
}

const rankGlow: Record<string, string> = {
  Rookie: 'rgba(148,163,184,0.2)',
  Affidabile: 'rgba(91,184,245,0.3)',
  Senior: 'rgba(58,163,232,0.3)',
  Elite: 'rgba(30,201,154,0.3)',
  Ambassador: 'rgba(245,184,0,0.3)',
}

export default function GlassSwipeCard({
  employee,
  onLike,
  onDislike,
  onRewind,
  isTop = true,
  stackIndex = 0,
}: GlassSwipeCardProps) {
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-8, 8])
  const opacity = useTransform(x, [-300, -100, 0, 100, 300], [0, 1, 1, 1, 0])
  const overlayLeftOpacity = useTransform(x, [-150, -60, 0], [1, 0.5, 0])
  const overlayRightOpacity = useTransform(x, [0, 60, 150], [0, 0.5, 1])
  const scale = useTransform(x, [-300, 0, 300], [0.9, 1, 0.9])

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      if (info.offset.x > 100) {
        setExitDirection('right')
        setTimeout(() => onLike(employee), 300)
      } else if (info.offset.x < -100) {
        setExitDirection('left')
        setTimeout(() => onDislike(employee), 300)
      }
    },
    [employee, onLike, onDislike]
  )

  const handleLike = useCallback(() => {
    setExitDirection('right')
    setTimeout(() => onLike(employee), 300)
  }, [employee, onLike])

  const handleDislike = useCallback(() => {
    setExitDirection('left')
    setTimeout(() => onDislike(employee), 300)
  }, [employee, onDislike])

  if (exitDirection) {
    return (
      <motion.div
        initial={{ x: 0, opacity: 1, rotate: 0 }}
        animate={{
          x: exitDirection === 'right' ? 500 : -500,
          opacity: 0,
          rotate: exitDirection === 'right' ? 20 : -20,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 1, 1] as [number, number, number, number] }}
        className="absolute inset-0"
      />
    )
  }

  const stackScale = 1 - stackIndex * 0.08
  const stackY = stackIndex * 16
  const stackOpacity = 1 - stackIndex * 0.3

  return (
    <div className="relative w-full max-w-[420px] mx-auto">
      {/* Card stack depth layers behind */}
      {stackIndex === 0 && (
        <>
          <div
            className="absolute inset-0 rounded-[24px] bg-[#0D1E34] border border-[rgba(255,255,255,0.06)]"
            style={{ transform: `translateY(16px) scale(0.92)`, opacity: 0.7, zIndex: 1 }}
          />
          <div
            className="absolute inset-0 rounded-[24px] bg-[#0D1E34] border border-[rgba(255,255,255,0.06)]"
            style={{ transform: `translateY(32px) scale(0.84)`, opacity: 0.4, zIndex: 0 }}
          />
        </>
      )}

      {/* Main card */}
      <motion.div
        style={{ x: isTop ? x : 0, rotate: isTop ? rotate : 0, opacity: isTop ? opacity : stackOpacity, scale: isTop ? scale : stackScale }}
        drag={isTop ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
        initial={{ scale: 0.85, opacity: 0, y: 40 }}
        animate={{ scale: stackScale, opacity: stackOpacity, y: stackY }}
        transition={{ duration: 0.55, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
        className="relative aspect-[3/4] rounded-[24px] overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.5)] bg-[#0D1E34] select-none z-10"
      >
        {/* Photo area */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(6,16,30,0.95)] z-10" />
          <div className="absolute top-0 left-0 right-0 h-[65%]">
            {employee.avatar ? (
              <img
                src={employee.avatar}
                alt={employee.firstName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#0D1E34] via-[#142B4A] to-[#0D1E34] flex items-center justify-center">
                <Avatar
                  src={undefined}
                  alt={employee.firstName}
                  initials={employee.firstName}
                  size={128}
                  borderColor={rankColors[employee.rank] || '#1A56A0'}
                />
              </div>
            )}
          </div>
        </div>

        {/* ATS code badge - top left */}
        <div className="absolute top-4 left-4 z-20">
          <div className="px-3 py-1.5 rounded-lg bg-[rgba(13,30,52,0.72)] backdrop-blur-md border border-[rgba(91,184,245,0.15)]">
            <span className="font-mono text-sm font-medium text-[#5BB8F5] tracking-wider">{employee.code}</span>
          </div>
        </div>

        {/* Match score badge - top right */}
        <div className="absolute top-4 right-4 z-20">
          <div className="px-3 py-1.5 rounded-lg bg-[rgba(13,30,52,0.72)] backdrop-blur-md border border-[rgba(91,184,245,0.25)] shadow-[0_0_12px_rgba(91,184,245,0.15)]">
            <span className="text-sm font-medium text-[#5BB8F5]">{employee.matchScore}% compatibilita</span>
          </div>
        </div>

        {/* Swipe overlays */}
        <motion.div
          style={{ opacity: overlayLeftOpacity }}
          className="absolute inset-0 z-30 flex items-center justify-center bg-[rgba(240,69,69,0.25)] backdrop-blur-sm pointer-events-none"
        >
          <span className="text-6xl font-playfair font-bold text-[#F04545] border-4 border-[#F04545] px-8 py-3 rounded-2xl rotate-[-15deg] backdrop-blur-md">
            NO
          </span>
        </motion.div>

        <motion.div
          style={{ opacity: overlayRightOpacity }}
          className="absolute inset-0 z-30 flex items-center justify-center bg-[rgba(30,201,154,0.25)] backdrop-blur-sm pointer-events-none"
        >
          <span className="text-4xl font-playfair font-bold text-[#1EC99A] border-4 border-[#1EC99A] px-8 py-3 rounded-2xl rotate-[15deg] backdrop-blur-md">
            MI INTERESSA
          </span>
        </motion.div>

        {/* Info area */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
          {/* Role */}
          <h3 className="text-2xl font-playfair font-bold text-white text-center mb-2">
            {employee.role}
          </h3>

          {/* Experience */}
          <p className="text-center text-sm text-[#94A3B8] mb-3">
            {employee.experience} anni esperienza &middot; {employee.venues.join(', ')}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-1.5 mb-3">
            {employee.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[rgba(91,184,245,0.08)] text-[#94A3B8] border border-[rgba(255,255,255,0.06)]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Distance & rank row */}
          <div className="flex items-center justify-center gap-4 mb-2 text-xs text-[#5E7A95]">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {employee.distance}km dal tuo locale
            </span>
            <span
              className="flex items-center gap-1 px-2 py-0.5 rounded-md border"
              style={{
                color: rankColors[employee.rank],
                borderColor: `${rankColors[employee.rank]}40`,
                backgroundColor: `${rankColors[employee.rank]}15`,
                boxShadow: `0 0 8px ${rankGlow[employee.rank]}`,
              }}
            >
              <Award className="w-3 h-3" />
              {employee.rank}
            </span>
          </div>

          {/* Rating & pay */}
          <div className="flex items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-[#F5B800]">
              <Star className="w-3 h-3 fill-current" />
              {employee.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1 text-[#1EC99A]">
              <Briefcase className="w-3 h-3" />
              €{employee.payRate.toFixed(2)}/h
            </span>
          </div>
        </div>
      </motion.div>

      {/* Action buttons */}
      {isTop && (
        <div className="flex items-center justify-center gap-6 mt-8">
          <GlassTooltip content="Torna indietro">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={onRewind}
              className="w-16 h-16 rounded-full border border-[rgba(255,255,255,0.1)] text-[#94A3B8] flex items-center justify-center hover:bg-[rgba(255,255,255,0.05)] hover:text-white transition-all backdrop-blur-md bg-white/5"
            >
              <RotateCcw className="w-6 h-6" />
            </motion.button>
          </GlassTooltip>

          <GlassTooltip content="Scarta profilo">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleDislike}
              className="w-16 h-16 rounded-full border-2 border-[#F04545] text-[#F04545] flex items-center justify-center hover:bg-[rgba(240,69,69,0.15)] hover:shadow-[0_0_30px_rgba(240,69,69,0.2)] transition-all"
            >
              <X className="w-7 h-7" />
            </motion.button>
          </GlassTooltip>

          <GlassTooltip content="Mi interessa!">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLike}
              className="w-[72px] h-[72px] rounded-full gradient-sky text-white flex items-center justify-center hover:shadow-[0_0_40px_rgba(91,184,245,0.3)] hover:scale-105 transition-all"
            >
              <Heart className="w-8 h-8 fill-white" />
            </motion.button>
          </GlassTooltip>
        </div>
      )}
    </div>
  )
}
