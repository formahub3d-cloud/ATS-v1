import { motion } from 'framer-motion'
import { MapPin, Euro, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import GlassTooltip from '@/components/ui/GlassTooltip'

export interface ZoneOption {
  id: string
  name: string
  description: string
  rate: number
  icon?: React.ElementType
}

export const ZONES: ZoneOption[] = [
  {
    id: 'centro',
    name: 'Centro',
    description: 'Zona centrale città',
    rate: 18,
    icon: MapPin,
  },
  {
    id: 'periferia',
    name: 'Periferia',
    description: 'Zone periferiche',
    rate: 15,
    icon: MapPin,
  },
  {
    id: 'industriale',
    name: 'Industriale',
    description: 'Zone industriali',
    rate: 16,
    icon: MapPin,
  },
  {
    id: 'eventi',
    name: 'Eventi',
    description: 'Location eventi',
    rate: 22,
    icon: MapPin,
  },
  {
    id: 'resort',
    name: 'Resort',
    description: 'Resort e SPA',
    rate: 20,
    icon: MapPin,
  },
]

interface ZoneSelectorProps {
  selectedId: string
  onChange: (zoneId: string) => void
  label?: string
  description?: string
}

export default function ZoneSelector({
  selectedId,
  onChange,
  label = 'Zona Tariffa',
  description = 'Seleziona la zona di lavoro — la tariffa oraria si adatta automaticamente',
}: ZoneSelectorProps) {
  return (
    <div className="w-full">
      <div className="mb-3">
        <label className="text-sm font-medium text-text-primary block mb-1">{label}</label>
        <p className="text-xs text-text-muted">{description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {ZONES.map((zone, index) => {
          const isSelected = selectedId === zone.id
          const Icon = zone.icon || MapPin

          return (
            <motion.button
              key={zone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(zone.id)}
              className={cn(
                'relative flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-300 text-left backdrop-blur-md',
                isSelected
                  ? 'border-sky-primary bg-[rgba(91,184,245,0.1)] shadow-[0_8px_24px_rgba(91,184,245,0.12)]'
                  : 'border-[rgba(255,255,255,0.06)] bg-[rgba(13,30,52,0.5)] hover:border-[rgba(91,184,245,0.2)] hover:bg-[rgba(13,30,52,0.7)]'
              )}
            >
              <div className="flex items-center gap-3 w-full mb-2">
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                  isSelected ? 'bg-[rgba(91,184,245,0.2)]' : 'bg-[rgba(255,255,255,0.04)]'
                )}>
                  <Icon className={cn('w-4 h-4', isSelected ? 'text-sky-primary' : 'text-text-muted')} />
                </div>
                <div className="flex-1">
                  <span className={cn('text-sm font-semibold', isSelected ? 'text-sky-primary' : 'text-text-primary')}>
                    {zone.name}
                  </span>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-sky-primary flex items-center justify-center"
                  >
                    <Check className="w-3 h-3 text-text-inverse" />
                  </motion.div>
                )}
              </div>

              <p className="text-xs text-text-muted mb-2">{zone.description}</p>

              <div className="mt-auto flex items-center gap-1.5">
                <GlassTooltip
                  content={`Tariffa oraria base per zona ${zone.name}. Può variare in base al ruolo e all'esperienza.`}
                  position="bottom"
                >
                  <div className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold border',
                    isSelected
                      ? 'bg-[rgba(91,184,245,0.15)] border-[rgba(91,184,245,0.25)] text-sky-primary'
                      : 'bg-[rgba(91,184,245,0.08)] border-[rgba(91,184,245,0.15)] text-sky-primary/80'
                  )}>
                    <Euro className="w-3 h-3" />
                    {zone.rate}/h
                  </div>
                </GlassTooltip>
              </div>

              {/* Glow effect for selected */}
              {isSelected && (
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    boxShadow: 'inset 0 0 0 1px rgba(91,184,245,0.2), 0 0 24px rgba(91,184,245,0.06)',
                  }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
