import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Video, Square, RefreshCw, Check, Mic, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GlassVideoRecorderProps {
  onRecordComplete: (blob: Blob | null) => void
  instructions?: string
}

export default function GlassVideoRecorder({
  onRecordComplete,
  instructions = 'Registra un breve video — guarda in camera, dicendo nome, ruolo e data. Attesta di aver letto e accettato il contratto di servizio.',
}: GlassVideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordTime, setRecordTime] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const maxRecordTime = 30 // seconds

  const startRecording = useCallback(async () => {
    try {
      setError('')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true,
      })
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }

      const mediaRecorder = new MediaRecorder(mediaStream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setRecordedBlob(blob)
        setIsRecording(false)
        if (videoRef.current) {
          videoRef.current.srcObject = null
          videoRef.current.src = URL.createObjectURL(blob)
          videoRef.current.controls = true
        }
        mediaStream.getTracks().forEach((track) => track.stop())
        setStream(null)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordTime(0)

      timerRef.current = setInterval(() => {
        setRecordTime((prev) => {
          if (prev >= maxRecordTime - 1) {
            mediaRecorder.stop()
            if (timerRef.current) clearInterval(timerRef.current)
            return maxRecordTime
          }
          return prev + 1
        })
      }, 1000)
    } catch {
      setError('Impossibile accedere alla fotocamera. Verifica i permessi del browser.')
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [isRecording])

  const retake = useCallback(() => {
    setRecordedBlob(null)
    setRecordTime(0)
    if (videoRef.current) {
      videoRef.current.src = ''
      videoRef.current.controls = false
    }
    onRecordComplete(null)
  }, [onRecordComplete])

  const confirm = useCallback(() => {
    onRecordComplete(recordedBlob)
  }, [recordedBlob, onRecordComplete])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (stream) stream.getTracks().forEach((track) => track.stop())
    }
  }, [stream])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full">
      {/* Glass info panel */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(91,184,245,0.08)] border border-[rgba(91,184,245,0.15)] mb-4 backdrop-blur-md">
        <Mic className="w-5 h-5 text-sky-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-text-secondary leading-relaxed">{instructions}</p>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 rounded-xl bg-[rgba(240,69,69,0.1)] border border-[rgba(240,69,69,0.2)] text-error text-sm mb-4 backdrop-blur-md"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video preview area with glass overlay */}
      <div className="relative w-full aspect-video rounded-[20px] overflow-hidden border-2 border-dashed border-[rgba(91,184,245,0.2)] mb-5 bg-[rgba(6,16,30,0.5)] backdrop-blur-sm"
        style={{
          boxShadow: 'inset 0 0 60px rgba(91,184,245,0.03)',
        }}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted={isRecording}
          playsInline
        />

        {/* Placeholder when no stream */}
        {!stream && !recordedBlob && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[rgba(91,184,245,0.1)] border border-[rgba(91,184,245,0.15)] flex items-center justify-center backdrop-blur-md">
              <Video className="w-8 h-8 text-sky-primary/50" />
            </div>
            <p className="text-sm text-text-muted">Clicca Registra per avviare la fotocamera</p>
          </div>
        )}

        {/* Recording indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(240,69,69,0.9)] backdrop-blur-md"
            >
              <motion.div
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-2.5 h-2.5 rounded-full bg-white"
              />
              <span className="text-xs font-semibold text-white">REC {formatTime(recordTime)}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camera overlay hint */}
        {isRecording && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-32 h-32 rounded-lg border-2 border-dashed border-[rgba(255,255,255,0.2)] flex items-center justify-center backdrop-blur-sm bg-[rgba(6,16,30,0.3)]">
              <Eye className="w-6 h-6 text-[rgba(255,255,255,0.4)]" />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <AnimatePresence mode="wait">
          {!isRecording && !recordedBlob && (
            <motion.button
              key="record"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startRecording}
              className="flex items-center gap-3 px-8 py-4 text-sm font-semibold text-white bg-error rounded-full hover:bg-[#D93A3A] active:scale-[0.98] transition-all duration-200 shadow-[0_0_20px_rgba(240,69,69,0.3)]"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-3 h-3 rounded-full bg-white"
              />
              Registra video
            </motion.button>
          )}

          {isRecording && (
            <motion.button
              key="stop"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopRecording}
              className="flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white bg-error rounded-full hover:bg-[#D93A3A] active:scale-[0.98] transition-all duration-200"
            >
              <Square className="w-4 h-4" />
              Ferma ({maxRecordTime - recordTime}s)
            </motion.button>
          )}

          {recordedBlob && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={retake}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-text-secondary bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl hover:bg-[rgba(255,255,255,0.08)] hover:text-text-primary transition-all backdrop-blur-md"
              >
                <RefreshCw className="w-4 h-4" />
                Reregistra
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={confirm}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-text-inverse gradient-sky rounded-xl hover:brightness-110 transition-all shadow-[0_4px_16px_rgba(91,184,245,0.25)]"
              >
                <Check className="w-4 h-4" />
                Conferma
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
