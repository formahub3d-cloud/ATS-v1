import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface PayCounterProps {
  amount: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export default function PayCounter({
  amount,
  duration = 1.4,
  className = '',
  prefix = '',
  suffix = '',
  decimals = 0,
}: PayCounterProps) {
  const [display, setDisplay] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;
    setHasAnimated(true);
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * amount);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [amount, duration, hasAnimated]);

  const formatted = display.toLocaleString('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <motion.span
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={className}
      style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
    >
      {prefix}{formatted}{suffix}
    </motion.span>
  );
}
