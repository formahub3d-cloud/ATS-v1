import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Calendar, Search, QrCode, Trophy, Euro, Heart,
  MessageCircle, Clock, Truck, CheckCircle, CreditCard,
  AlertTriangle, ChevronRight, Star, HelpCircle,
} from 'lucide-react';
import Avatar from '@/components/Avatar';
import GlassBottomNav from '@/components/employee/GlassBottomNav';
import PayCounter from '@/components/employee/PayCounter';
import GlassShiftCard from '@/components/employee/GlassShiftCard';
import GlassTooltip from '@/components/ui/GlassTooltip';
import { useToast } from '@/components/ui/ToastSystem';
import { SkeletonCard, SkeletonAvatar } from '@/components/ui/skeleton';
import {
  dashboardData,
  upcomingShift,
  notifications,
  shiftProposal,
  EMPLOYEE_NAME,
  EMPLOYEE_CODE,
} from '@/components/employee/mockData';
import type { Notification } from '@/components/employee/mockData';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0, 0, 0.2, 1] as [number, number, number, number] } },
};

const notificationIcons: Record<string, React.FC<{ className?: string }>> = {
  bell: Bell,
  truck: Truck,
  'check-circle': CheckCircle,
  'credit-card': CreditCard,
  'alert-triangle': AlertTriangle,
};

function NotificationItem({ notif, index }: { notif: Notification; index: number }) {
  const Icon = notificationIcons[notif.icon] || Bell;
  return (
    <motion.div
      variants={itemVariants}
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.06, duration: 0.4 }}
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl backdrop-blur-[16px]',
        'bg-[rgba(13,30,52,0.7)] border border-[rgba(91,184,245,0.12)]',
        'shadow-[0_4px_24px_rgba(0,0,0,0.2)]',
        notif.unread && 'border-l-[3px] border-l-[#5BB8F5]'
      )}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: `${notif.iconColor}15` }}
      >
        <div style={{ color: notif.iconColor }}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{notif.title}</p>
        <p className="text-xs text-[#94A3B8] mt-0.5">{notif.description}</p>
      </div>
      <span className="text-xs text-[#5E7A95] flex-shrink-0">{notif.time}</span>
    </motion.div>
  );
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [greeting, setGreeting] = useState('');
  const [showProposal, setShowProposal] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buongiorno');
    else if (hour < 18) setGreeting('Buon pomeriggio');
    else setGreeting('Buonasera');

    // Simulated loading
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const quickActions = [
    { icon: Calendar, label: 'Calendario', path: '/employee/calendar' },
    { icon: Search, label: 'Cerca turni', path: '/employee/matching' },
    { icon: Heart, label: 'I miei match', path: '/employee/matching' },
    { icon: QrCode, label: 'Check-in', path: '/employee/checkin' },
    { icon: Trophy, label: 'Rank', path: '/employee/rank' },
    { icon: Euro, label: 'Paghe', path: '/employee/rank' },
  ];

  const handleAcceptShift = () => {
    setShowProposal(false);
    addToast({
      type: 'success',
      title: 'Turno accettato!',
      message: 'RIST-BN-0047 · Chef de Partie · Sab-Dom',
    });
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#06101E] pb-24">
        <div className="max-w-[430px] mx-auto px-4 pt-4 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <SkeletonAvatar size={40} />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32" />
              <div className="h-3 w-20" />
            </div>
          </div>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <GlassBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#06101E] pb-24">
      {/* Glass Header */}
      <header
        className="sticky top-0 z-50 border-b border-[rgba(255,255,255,0.06)]"
        style={{
          background: 'rgba(6,16,30,0.9)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center justify-between h-16 px-4 max-w-[430px] mx-auto">
          <div className="flex items-center gap-3">
            <motion.div
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
            >
              <Avatar
                src="/avatar-employee-2.jpg"
                alt="Marco R."
                size={40}
                borderColor="#3AA3E8"
              />
            </motion.div>
            <div>
              <span className="font-mono text-[11px] text-[#5BB8F5] tracking-wider bg-[rgba(91,184,245,0.08)] px-1.5 py-0.5 rounded">
                {EMPLOYEE_CODE}
              </span>
              <span className="ml-2 text-[10px] font-semibold text-[#3AA3E8] bg-[rgba(58,163,232,0.12)] px-1.5 py-0.5 rounded border border-[rgba(58,163,232,0.2)]">
                SENIOR
              </span>
            </div>
          </div>
          <button className="relative p-2">
            <Bell className="w-6 h-6 text-[#94A3B8]" />
            {dashboardData.unreadNotifications > 0 && (
              <motion.span
                className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#F04545] rounded-full"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </button>
        </div>
      </header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-[430px] mx-auto"
      >
        {/* Greeting */}
        <motion.div variants={itemVariants} className="px-4 pt-4 pb-2">
          <motion.h1
            className="text-xl font-semibold text-white"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {greeting}, {EMPLOYEE_NAME}
          </motion.h1>
          <p className="text-sm text-[#94A3B8] mt-0.5">Ecco il tuo riepilogo</p>
        </motion.div>

        {/* Earnings & Rank Hero Card (Glass) */}
        <motion.div
          variants={itemVariants}
          className={cn(
            'mx-4 mt-3 rounded-[24px] p-6 border backdrop-blur-[20px]',
            'bg-[rgba(13,30,52,0.72)] border-[rgba(91,184,245,0.12)]',
            'shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]'
          )}
        >
          {/* Top row: label + month */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-[#5E7A95] font-medium tracking-wide">Paga maturata</span>
            <span className="text-[11px] text-[#94A3B8] bg-[rgba(255,255,255,0.05)] px-2.5 py-1 rounded-full border border-[rgba(255,255,255,0.08)]">
              Maggio 2025
            </span>
          </div>

          {/* Main amount */}
          <div className="mb-1">
            <div className="flex items-baseline gap-1">
              <PayCounter
                amount={384}
                duration={1.4}
                prefix="€"
                suffix=""
                decimals={0}
                className="text-[40px] font-bold text-white"
              />
              <span className="text-xl font-bold text-white">,00</span>
            </div>
            <p className="text-xs text-[#94A3B8]">24 turni completati questo mese</p>
          </div>

          {/* Hourly rate badge */}
          <div className="flex items-center gap-2 mt-3 mb-4">
            <GlassTooltip
              content={
                <div>
                  <p className="font-semibold">Tariffa oraria per zona Centro</p>
                  <p className="text-[#94A3B8] mt-1">Base zona: €18,00/h</p>
                  <p className="text-[#1EC99A]">Bonus Senior: +€1,00/h</p>
                  <p className="text-[#5BB8F5] font-semibold mt-1">Totale: €19,00/h</p>
                </div>
              }
              position="bottom"
            >
              <span className="inline-flex items-center gap-1.5 text-[13px] font-mono font-medium px-3 py-1.5 rounded-lg bg-[rgba(91,184,245,0.12)] text-[#5BB8F5] border border-[rgba(91,184,245,0.25)] shadow-[0_0_8px_rgba(91,184,245,0.1)] cursor-help">
                <Euro className="w-3.5 h-3.5" />
                €18/h
                <HelpCircle className="w-3 h-3 opacity-60" />
              </span>
            </GlassTooltip>
            <span className="text-[11px] text-[#5E7A95]">Centro</span>
          </div>

          {/* Rank progress */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-[#94A3B8]">
                1.240 / 2.000 punti al prossimo livello
              </span>
              <span className="text-xs text-[#5BB8F5] font-medium">62%</span>
            </div>
            <div className="h-2 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #5BB8F5 0%, #3AA3E8 50%, #1A56A0 100%)',
                  boxShadow: '0 0 10px rgba(91,184,245,0.3)',
                }}
                initial={{ width: 0 }}
                animate={{ width: '62%' }}
                transition={{ duration: 0.9, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-[10px] text-[#5E7A95]">Senior → Elite</span>
              <span className="text-[10px] text-[#5E7A95]">~760 punti rimanenti</span>
            </div>
          </div>

          {/* Mini pills */}
          <div className="flex gap-2 pt-3 border-t border-[rgba(255,255,255,0.04)]">
            {[
              { label: 'Ore', value: '192h' },
              { label: 'Maggiorazioni', value: '+€48', color: '#5BB8F5' },
              { label: 'Navette', value: '+€24', color: '#1EC99A' },
            ].map((pill, i) => (
              <motion.div
                key={pill.label}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.08, duration: 0.3 }}
                className="flex-1 text-center py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]"
              >
                <p
                  className="text-xs font-semibold"
                  style={{ color: pill.color || '#FFFFFF' }}
                >
                  {pill.value}
                </p>
                <p className="text-[10px] text-[#5E7A95]">{pill.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Shift Card */}
        <motion.div variants={itemVariants} className="px-4 mt-4">
          <GlassShiftCard
            code={upcomingShift.code}
            role={upcomingShift.role}
            time={upcomingShift.time}
            date={upcomingShift.date}
            status="confirmed"
            addressHint={upcomingShift.addressHint}
            showNavetta={upcomingShift.navettaAvailable}
            photo="/structure-1.jpg"
            onCheckIn={() => navigate('/employee/checkin')}
            onDetails={() => {}}
          />
        </motion.div>

        {/* Notifications Feed */}
        <motion.div variants={itemVariants} className="px-4 mt-4 mb-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-white">Notifiche</h3>
            <span className="text-[11px] text-[#F5B800] bg-[rgba(245,184,0,0.12)] px-2 py-0.5 rounded-full border border-[rgba(245,184,0,0.2)]">
              3 non lette
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {notifications.map((n, i) => (
              <NotificationItem key={n.id} notif={n} index={i} />
            ))}
          </div>
          <button className="mt-2 w-full py-2 text-xs text-[#94A3B8] hover:text-[#5BB8F5] transition-colors">
            Segna tutte lette
          </button>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div variants={itemVariants} className="px-4 mt-4 mb-6">
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.06, duration: 0.3 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => action.path !== '#' && navigate(action.path)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 aspect-square',
                    'rounded-2xl p-5 border backdrop-blur-[16px]',
                    'bg-[rgba(13,30,52,0.6)] border-[rgba(255,255,255,0.06)]',
                    'shadow-[0_4px_24px_rgba(0,0,0,0.2)]',
                    'hover:border-[rgba(91,184,245,0.2)] hover:bg-[rgba(91,184,245,0.08)]',
                    'active:scale-95 transition-all duration-200'
                  )}
                >
                  <Icon className="w-7 h-7 text-[#5BB8F5]" />
                  <span className="text-[11px] text-[#94A3B8] font-medium">{action.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Shift Proposal Card */}
        {showProposal && (
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'mx-4 mb-6 rounded-2xl p-5 border backdrop-blur-[16px]',
              'bg-[rgba(245,184,0,0.05)] border-[rgba(245,184,0,0.25)]',
              'shadow-[0_8px_32px_rgba(0,0,0,0.2)]',
              'border-l-[3px] border-l-[#F5B800]'
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-[#F5B800]" />
              <h3 className="text-base font-semibold text-[#F5B800]">Nuovo turno proposto</h3>
              <motion.span
                className="ml-auto text-[10px] text-[#F04545] font-medium bg-[rgba(240,69,69,0.08)] px-2 py-0.5 rounded"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Rispondi entro {shiftProposal.responseDeadline}
              </motion.span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm text-[#5BB8F5] bg-[rgba(91,184,245,0.08)] px-2 py-0.5 rounded border border-[rgba(91,184,245,0.15)]">
                {shiftProposal.code}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[rgba(30,201,154,0.1)] text-[#1EC99A] border border-[rgba(30,201,154,0.2)]">
                +50% festivo
              </span>
            </div>
            <p className="text-sm text-white font-medium mb-1">{shiftProposal.role}</p>
            <p className="text-xs text-[#94A3B8] mb-1">
              {shiftProposal.date} · {shiftProposal.time}
            </p>
            <p className="text-sm text-[#1EC99A] font-semibold mb-3">{shiftProposal.pay}</p>

            <div className="flex gap-3">
              <button
                onClick={handleAcceptShift}
                className={cn(
                  'flex-1 h-11 text-sm font-medium text-[#06101E] rounded-xl',
                  'bg-[#1EC99A] hover:brightness-110 active:scale-[0.98] transition-all',
                  'shadow-[0_0_20px_rgba(30,201,154,0.2)]'
                )}
              >
                Accetta
              </button>
              <button
                onClick={() => setShowProposal(false)}
                className="flex-1 h-11 text-sm font-medium text-[#F04545] border border-[rgba(240,69,69,0.3)] rounded-xl hover:bg-[rgba(240,69,69,0.08)] active:scale-[0.98] transition-all"
              >
                Rifiuta
              </button>
            </div>
            <button className="w-full mt-2 text-xs text-[#5BB8F5] hover:underline">
              Richiedi modifica
            </button>
          </motion.div>
        )}

        {/* Navetta Confirmation Card */}
        <motion.div
          variants={itemVariants}
          className={cn(
            'mx-4 mb-8 rounded-2xl p-5 border backdrop-blur-[16px]',
            'bg-[rgba(13,30,52,0.7)] border-[rgba(91,184,245,0.12)]',
            'shadow-[0_8px_32px_rgba(0,0,0,0.3)]'
          )}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-[rgba(91,184,245,0.1)] flex items-center justify-center">
              <Truck className="w-4 h-4 text-[#5BB8F5]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Navetta confermata</h3>
              <p className="text-xs text-[#94A3B8]">RIST-BN-0012 · Domani</p>
            </div>
            <span className="ml-auto text-[10px] text-[#5BB8F5] bg-[rgba(91,184,245,0.08)] px-2 py-0.5 rounded border border-[rgba(91,184,245,0.15)]">
              Partenza 07:30
            </span>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-[rgba(255,255,255,0.04)]">
            <div>
              <p className="text-xs text-[#94A3B8]">Punto di ritrovo</p>
              <p className="text-sm font-medium text-white">Stazione Centrale</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#94A3B8]">Costo</p>
              <p className="text-sm font-medium text-white">€2,50</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#5E7A95]" />
          </div>
        </motion.div>
      </motion.div>

      <GlassBottomNav />
    </div>
  );
}
