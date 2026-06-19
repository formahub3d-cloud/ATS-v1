import { QRCodeSVG } from 'qrcode.react'
import { motion } from 'framer-motion'
import { QrCode } from 'lucide-react'

interface ShiftQRDisplayProps {
  /** Token del turno (shifts.qr_token). Quando l'utente lo scansiona, finisce
   *  in shift_check_in(). */
  token: string
  /** Etichetta sopra il QR (es. nome struttura, ruolo turno). */
  caption?: string
  size?: number
}

/**
 * Mostra il QR code di un turno assegnato. Pensato per essere visualizzato
 * sia dalla struttura (mostra al dipendente il QR da scansionare) sia dal
 * dipendente (può mostrarlo a un device della struttura con scanner).
 *
 * Tema dark, riquadro glass, contrasto alto: il QR viene reso bianco su
 * sfondo scuro per leggibilità mobile.
 */
export default function ShiftQRDisplay({ token, caption, size = 240 }: ShiftQRDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="inline-flex flex-col items-center gap-3 p-5 rounded-2xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
    >
      <QRCodeSVG
        value={token}
        size={size}
        level="H"           // alto error-correction per QR letti su mobile
        marginSize={2}
        bgColor="#FFFFFF"
        fgColor="#06101E"
      />
      {caption && (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-[#06101E] uppercase tracking-wider">
          <QrCode className="w-3.5 h-3.5" />
          {caption}
        </p>
      )}
    </motion.div>
  )
}
