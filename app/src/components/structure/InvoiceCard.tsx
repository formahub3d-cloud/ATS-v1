import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Calendar, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Invoice {
  id: string
  number: string
  period: string
  amount: number
  hours: number
  status: 'paid' | 'pending' | 'overdue'
  dueDate: string
  issueDate: string
  turns: TurnLineItem[]
}

export interface TurnLineItem {
  date: string
  employeeCode: string
  role: string
  hours: number
  amount: number
}

interface InvoiceCardProps {
  invoice: Invoice
  index?: number
  onDownload?: (invoice: Invoice) => void
}

const statusConfig = {
  paid: {
    label: 'Pagata',
    icon: CheckCircle,
    className: 'bg-[rgba(30,201,154,0.15)] text-[#1EC99A] border-[rgba(30,201,154,0.3)]',
    iconColor: '#1EC99A',
  },
  pending: {
    label: 'In attesa',
    icon: Clock,
    className: 'bg-[rgba(245,184,0,0.15)] text-[#F5B800] border-[rgba(245,184,0,0.3)]',
    iconColor: '#F5B800',
  },
  overdue: {
    label: 'Scaduta',
    icon: AlertCircle,
    className: 'bg-[rgba(240,69,69,0.15)] text-[#F04545] border-[rgba(240,69,69,0.3)]',
    iconColor: '#F04545',
  },
}

export default function InvoiceCard({ invoice, index = 0, onDownload }: InvoiceCardProps) {
  const [expanded, setExpanded] = useState(false)
  const status = statusConfig[invoice.status]
  const StatusIcon = status.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: [0, 0, 0.2, 1] as [number, number, number, number] }}
      className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0D1E34] overflow-hidden hover:border-[rgba(91,184,245,0.2)] transition-colors duration-300"
    >
      {/* Main row */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[rgba(91,184,245,0.08)] border border-[rgba(91,184,245,0.15)] flex items-center justify-center">
          <FileText className="w-5 h-5 text-[#5BB8F5]" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-mono text-sm font-medium text-white">{invoice.number}</h4>
            <span className="text-xs text-[#5E7A95]">{invoice.period}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-[#5E7A95]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Scad: {invoice.dueDate}
            </span>
            <span>{invoice.hours}h incluse</span>
          </div>
        </div>

        {/* Amount */}
        <div className="flex-shrink-0 text-right">
          <p className="font-playfair text-lg font-bold text-white">
            €{invoice.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* Status */}
        <div className="flex-shrink-0 flex items-center gap-2">
          <span className={cn('flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border', status.className)}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-[#5E7A95]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#5E7A95]" />
          )}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
          className="border-t border-[rgba(255,255,255,0.06)]"
        >
          <div className="p-4 space-y-2">
            <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider mb-2">Dettaglio turni</p>
            {invoice.turns.map((turn, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 px-3 rounded-lg bg-[rgba(255,255,255,0.02)]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#5E7A95]">{turn.date}</span>
                  <span className="font-mono text-xs text-[#5BB8F5]">{turn.employeeCode}</span>
                  <span className="text-xs text-[#94A3B8]">{turn.role}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#5E7A95]">{turn.hours}h</span>
                  <span className="text-sm font-medium text-white">
                    €{turn.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.06)]">
              <span className="text-sm font-medium text-[#94A3B8]">Totale</span>
              <span className="font-playfair text-lg font-bold text-white">
                €{invoice.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDownload?.(invoice)
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#5BB8F5] border border-[#5BB8F5] rounded-lg hover:bg-[rgba(91,184,245,0.1)] transition-colors"
              >
                <Download className="w-4 h-4" />
                Scarica PDF
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
