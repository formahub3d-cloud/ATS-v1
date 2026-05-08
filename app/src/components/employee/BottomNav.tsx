import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Calendar, Search, QrCode, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Home', icon: Home, path: '/employee' },
  { label: 'Calendario', icon: Calendar, path: '/employee/calendar' },
  { label: 'Cerca', icon: Search, path: '/employee/matching' },
  { label: 'Check-in', icon: QrCode, path: '/employee/checkin' },
  { label: 'Rank', icon: Trophy, path: '/employee/rank' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const idx = tabs.findIndex((t) => t.path === location.pathname);
    if (idx >= 0) setActiveIndex(idx);
  }, [location.pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] h-16 bg-[#0D1E34] border-t border-[rgba(255,255,255,0.06)] safe-area-pb">
      <div className="flex items-center justify-around h-full max-w-[430px] mx-auto">
        {tabs.map((tab, i) => {
          const isActive = i === activeIndex;
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.path}
              onClick={() => {
                setActiveIndex(i);
                navigate(tab.path);
              }}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={isActive ? { y: -2 } : { y: 0 }}
                transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 transition-colors duration-200',
                    isActive ? 'text-[#5BB8F5]' : 'text-[#5E7A95]'
                  )}
                />
              </motion.div>
              <span
                className={cn(
                  'text-[10px] mt-0.5 transition-colors duration-200 font-medium',
                  isActive ? 'text-[#5BB8F5]' : 'text-[#5E7A95]'
                )}
              >
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#5BB8F5]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
