import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrFrame } from '@/components/icons/QrFrame';
import { Camera, CameraOff } from 'lucide-react';

interface QScannerProps {
  onScan: () => void;
  onCancel: () => void;
}

export default function QScanner({ onScan, onCancel }: QScannerProps) {
  const [permission, setPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [scanning, setScanning] = useState(true);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scanning && permission !== 'denied') {
        setScanned(true);
        setScanning(false);
        setTimeout(() => onScan(), 800);
      }
    }, 3500);
    return () => clearTimeout(timer);
  }, [scanning, permission, onScan]);

  const handleRequestPermission = useCallback(() => {
    setPermission('granted');
    setScanning(true);
  }, []);

  if (permission === 'denied') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8">
        <CameraOff className="w-12 h-12 text-[#5E7A95] mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Accesso alla camera negato</h3>
        <p className="text-sm text-[#94A3B8] text-center mb-6">
          Vai nelle impostazioni del browser e abilita la fotocamera.
        </p>
        <button
          onClick={() => setPermission('prompt')}
          className="px-6 py-3 text-sm font-medium text-[#5BB8F5] border border-[#5BB8F5] rounded-lg hover:bg-[rgba(91,184,245,0.1)] transition-all"
        >
          Riprova
        </button>
      </div>
    );
  }

  if (permission === 'prompt') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-8">
        <Camera className="w-12 h-12 text-[#5BB8F5] mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Abilita la fotocamera</h3>
        <p className="text-sm text-[#94A3B8] text-center mb-6">
          ATS ha bisogno dell&apos;accesso alla fotocamera per scansionare il QR code.
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleRequestPermission}
            className="px-6 py-3 text-sm font-medium text-white gradient-sky rounded-lg hover:brightness-110 active:scale-[0.98] transition-all"
          >
            Consenti
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 text-sm font-medium text-[#94A3B8] hover:text-white transition-colors"
          >
            Annulla
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <AnimatePresence>
        {!scanned ? (
          <motion.div
            key="scanner"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            className="relative"
          >
            {/* QR Frame with animated corners */}
            <div className="relative w-[250px] h-[250px] mx-auto">
              <QrFrame className="w-full h-full" />

              {/* Animated corner glow */}
              <motion.div
                className="absolute inset-0"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <svg viewBox="0 0 250 250" fill="none" className="w-full h-full">
                  <rect x="10" y="10" width="230" height="230" rx="0" stroke="#5BB8F5" strokeWidth="1" strokeDasharray="40 170" fill="none" opacity="0.3" />
                </svg>
              </motion.div>

              {/* Scan line */}
              <motion.div
                className="absolute left-[10%] right-[10%] h-[2px] bg-[#5BB8F5] shadow-[0_0_8px_#5BB8F5]"
                animate={{ top: ['10%', '90%', '10%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
              />

              {/* Corner dots for emphasis */}
              <motion.div
                className="absolute top-0 left-0 w-3 h-3 border-t-[3px] border-l-[3px] border-[#5BB8F5] rounded-tl-sm"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="absolute top-0 right-0 w-3 h-3 border-t-[3px] border-r-[3px] border-[#5BB8F5] rounded-tr-sm"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
              <motion.div
                className="absolute bottom-0 left-0 w-3 h-3 border-b-[3px] border-l-[3px] border-[#5BB8F5] rounded-bl-sm"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              />
              <motion.div
                className="absolute bottom-0 right-0 w-3 h-3 border-b-[3px] border-r-[3px] border-[#5BB8F5] rounded-br-sm"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.9 }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-[250px] h-[250px] mx-auto flex items-center justify-center"
          >
            <svg viewBox="0 0 100 100" className="w-24 h-24">
              <motion.circle
                cx="50" cy="50" r="40"
                stroke="#1EC99A"
                strokeWidth="3"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
              <motion.path
                d="M30 52 L45 67 L70 38"
                stroke="#1EC99A"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 text-center">
        {scanned ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[#1EC99A] font-semibold text-lg">QR code rilevato!</p>
          </motion.div>
        ) : (
          <>
            <p className="text-white text-base mb-1">Inquadra il QR code all&apos;ingresso</p>
            <p className="text-[#5E7A95] text-sm">Assicurati che tutto il codice sia visibile</p>
          </>
        )}
      </div>

      {!scanned && (
        <button
          onClick={onCancel}
          className="mt-8 text-sm text-[#94A3B8] hover:text-white transition-colors"
        >
          Annulla
        </button>
      )}
    </div>
  );
}
