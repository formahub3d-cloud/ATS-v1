import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Heart, ScanLine, MessageCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

// 5 voci max per leggibilità mobile. Rank/Calendario sono raggiungibili dalla Home.
const tabs = [
  { label: 'Home', icon: Home, path: '/employee' },
  { label: 'Matching', icon: Heart, path: '/employee/matching' },
  { label: 'Check-in', icon: ScanLine, path: '/employee/checkin' },
  { label: 'Documenti', icon: FileText, path: '/employee/documents' },
  { label: 'Chat', icon: MessageCircle, path: '/employee/chat' },
];

export default function GlassBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] flex items-center"
      style={{
        height: '72px',
        background: 'rgba(13,30,52,0.95)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;
        return (
          <motion.button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-200',
              isActive ? 'text-[#5BB8F5]' : 'text-[#5E7A95]'
            )}
            whileTap={{ scale: 0.9 }}
          >
            {isActive && (
              <motion.div
                layoutId="glassNavIndicator"
                className="w-12 h-1 bg-[rgba(91,184,245,0.15)] rounded-full mb-0.5"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.25, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
              />
            )}
            <motion.div
              animate={isActive ? { y: -2 } : { y: 0 }}
              transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
            >
              <Icon className="w-[22px] h-[22px]" />
            </motion.div>
            <span className="text-[11px] font-medium">{tab.label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}
