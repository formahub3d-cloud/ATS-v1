import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Video, Square, RefreshCw, Check, Mic, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VideoRecorderProps {
  onRecordComplete: (blob: Blob | null) => void
  instructions?: string
}

export default function VideoRecorder({
  onRecordComplete,
  instructions = 'Registra un breve video — guarda in camera, dicendo nome, ruolo e data. Attesta di aver letto e accettato il contratto di servizio.',
}: VideoRecorderProps) {
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
      {/* Instructions */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-[rgba(91,184,245,0.08)] border border-[rgba(91,184,245,0.15)] mb-4">
        <Mic className="w-5 h-5 text-sky-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-text-secondary">{instructions}</p>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3 rounded-lg bg-[rgba(240,69,69,0.1)] border border-[rgba(240,69,69,0.2)] text-error text-sm mb-4"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video preview area */}
      <div className="relative w-full aspect-video bg-[#0a1929] rounded-xl overflow-hidden border border-[rgba(255,255,255,0.08)] mb-4">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted={isRecording}
          playsInline
        />

        {/* Placeholder when no stream */}
        {!stream && !recordedBlob && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[rgba(91,184,245,0.1)] flex items-center justify-center">
              <Video className="w-8 h-8 text-sky-primary/50" />
            </div>
            <p className="text-sm text-text-muted">Clicca Registra per avviare la fotocamera</p>
          </div>
        )}

        {/* Recording indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(240,69,69,0.9)]"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-medium text-white">REC {formatTime(recordTime)}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Camera overlay hint */}
        {isRecording && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-32 h-32 rounded-lg border-2 border-dashed border-[rgba(255,255,255,0.2)] flex items-center justify-center">
              <Eye className="w-6 h-6 text-[rgba(255,255,255,0.3)]" />
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
              onClick={startRecording}
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-error rounded-full hover:bg-[#D93A3A] active:scale-[0.98] transition-all duration-200"
            >
              <div className="w-3 h-3 rounded-full bg-white" />
              Registra video
            </motion.button>
          )}

          {isRecording && (
            <motion.button
              key="stop"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={stopRecording}
              className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-error rounded-full hover:bg-[#D93A3A] active:scale-[0.98] transition-all duration-200"
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
              <button
                onClick={retake}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-text-secondary bg-[rgba(255,255,255,0.04)] rounded-lg hover:bg-[rgba(255,255,255,0.08)] hover:text-text-primary transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Reregistra
              </button>
              <button
                onClick={confirm}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-text-inverse bg-gradient-to-r from-sky-primary to-sky-blue rounded-lg hover:brightness-110 transition-all"
              >
                <Check className="w-4 h-4" />
                Conferma
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
