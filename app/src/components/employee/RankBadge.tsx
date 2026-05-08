import { motion } from 'framer-motion';
import { RankRookie, RankAffidabile, RankSenior, RankElite, RankAmbassador } from '@/components/icons/RankIcons';
import { cn } from '@/lib/utils';

export type RankLevel = 'Rookie' | 'Affidabile' | 'Senior' | 'Elite' | 'Ambassador';

interface RankBadgeProps {
  rank: RankLevel;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  className?: string;
}

const rankConfig: Record<RankLevel, { color: string; Icon: React.FC<{ className?: string }> }> = {
  Rookie: { color: '#94A3B8', Icon: RankRookie },
  Affidabile: { color: '#5BB8F5', Icon: RankAffidabile },
  Senior: { color: '#3AA3E8', Icon: RankSenior },
  Elite: { color: '#1EC99A', Icon: RankElite },
  Ambassador: { color: '#F5B800', Icon: RankAmbassador },
};

const sizeMap = {
  sm: { icon: 'w-5 h-5', label: 'text-[10px]' },
  md: { icon: 'w-8 h-8', label: 'text-xs' },
  lg: { icon: 'w-14 h-14', label: 'text-sm' },
  xl: { icon: 'w-20 h-20', label: 'text-lg' },
};

export default function RankBadge({ rank, size = 'md', showLabel = true, className }: RankBadgeProps) {
  const cfg = rankConfig[rank];
  const { Icon } = cfg;
  const sizes = sizeMap[size];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
      className={cn('flex items-center gap-2', className)}
    >
      <div
        className="relative"
        style={size === 'lg' || size === 'xl' ? { filter: `drop-shadow(0 0 12px ${cfg.color}40)` } : undefined}
      >
        <Icon className={sizes.icon} />
      </div>
      {showLabel && (
        <span
          className={cn('font-semibold', sizes.label)}
          style={{ color: cfg.color }}
        >
          {rank}
        </span>
      )}
    </motion.div>
  );
}

export { rankConfig };
