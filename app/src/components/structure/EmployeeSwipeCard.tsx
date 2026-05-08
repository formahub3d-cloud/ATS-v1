import { useState, useCallback } from 'react'
import type { PanInfo } from 'framer-motion'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { MapPin, Star, Heart, X, Award, Briefcase } from 'lucide-react'

export interface EmployeeProfile {
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
}

interface EmployeeSwipeCardProps {
  employee: EmployeeProfile
  onLike: (employee: EmployeeProfile) => void
  onDislike: (employee: EmployeeProfile) => void
  onMatch?: (employee: EmployeeProfile) => void
  isTop?: boolean
  nextEmployee?: EmployeeProfile | null
}

const rankColors: Record<string, string> = {
  Rookie: '#94A3B8',
  Affidabile: '#5BB8F5',
  Senior: '#3AA3E8',
  Elite: '#1EC99A',
  Ambassador: '#F5B800',
}

export default function EmployeeSwipeCard({
  employee,
  onLike,
  onDislike,
  isTop = true,
}: EmployeeSwipeCardProps) {
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

  return (
    <div className="relative w-full max-w-[420px] mx-auto">
      {/* Card */}
      <motion.div
        style={{ x, rotate, opacity, scale }}
        drag={isTop ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={handleDragEnd}
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
        className="relative aspect-[3/4] rounded-[20px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)] bg-[#0D1E34] select-none"
      >
        {/* Photo area with gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(6,16,30,0.95)] z-10" />
          <div className="w-full h-[65%] bg-gradient-to-br from-[#0D1E34] via-[#142B4A] to-[#0D1E34] flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-[rgba(91,184,245,0.1)] border-2 border-[rgba(91,184,245,0.2)] flex items-center justify-center">
              <span className="font-playfair text-4xl font-bold text-[#5BB8F5]">
                {employee.firstName.charAt(0)}
              </span>
            </div>
          </div>
        </div>

        {/* Swipe overlays */}
        <motion.div
          style={{ opacity: overlayLeftOpacity }}
          className="absolute inset-0 z-30 flex items-center justify-center bg-[rgba(240,69,69,0.3)] pointer-events-none"
        >
          <span className="text-5xl font-playfair font-bold text-[#F04545] border-4 border-[#F04545] px-6 py-2 rounded-xl rotate-[-15deg]">
            NO
          </span>
        </motion.div>

        <motion.div
          style={{ opacity: overlayRightOpacity }}
          className="absolute inset-0 z-30 flex items-center justify-center bg-[rgba(30,201,154,0.3)] pointer-events-none"
        >
          <span className="text-4xl font-playfair font-bold text-[#1EC99A] border-4 border-[#1EC99A] px-6 py-2 rounded-xl rotate-[15deg]">
            MI INTERESSA
          </span>
        </motion.div>

        {/* Info area */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
          {/* Code badge */}
          <div className="flex items-center justify-center mb-3">
            <span className="font-mono text-lg font-medium text-[#5BB8F5] bg-[rgba(91,184,245,0.08)] border border-[rgba(91,184,245,0.15)] px-3 py-1 rounded tracking-wider">
              {employee.code}
            </span>
          </div>

          {/* Role */}
          <h3 className="text-2xl font-playfair font-bold text-white text-center mb-2">
            {employee.role}
          </h3>

          {/* Match score */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-24 h-1.5 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${employee.matchScore}%` }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-full rounded-full gradient-sky"
              />
            </div>
            <span className="text-sm font-medium text-[#5BB8F5]">{employee.matchScore}% compatibilita</span>
          </div>

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
              }}
            >
              <Award className="w-3 h-3" />
              {employee.rank}
            </span>
          </div>

          {/* Experience */}
          <p className="text-center text-sm text-[#94A3B8] mb-3">
            {employee.experience} anni esperienza &middot; {employee.venues.join(', ')}
          </p>

          {/* Rating & pay */}
          <div className="flex items-center justify-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-[#F5B800]">
              <Star className="w-3 h-3 fill-current" />
              {employee.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1 text-[#1EC99A]">
              <Briefcase className="w-3 h-3" />
              €{employee.payRate}/h
            </span>
          </div>
        </div>
      </motion.div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-8 mt-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleDislike}
          className="w-14 h-14 rounded-full border-2 border-[#F04545] text-[#F04545] flex items-center justify-center hover:bg-[rgba(240,69,69,0.1)] transition-colors"
        >
          <X className="w-6 h-6" />
        </motion.button>

        <span className="text-xs text-[#5E7A95]">Swipe per scegliere</span>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLike}
          className="w-14 h-14 rounded-full border-2 border-[#5BB8F5] text-[#5BB8F5] flex items-center justify-center hover:bg-[rgba(91,184,245,0.1)] transition-colors"
        >
          <Heart className="w-6 h-6" />
        </motion.button>
      </div>
    </div>
  )
}
