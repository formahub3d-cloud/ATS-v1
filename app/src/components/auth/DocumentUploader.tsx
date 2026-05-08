import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, FileText, Image, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
}

interface DocumentUploaderProps {
  onFilesChange: (files: UploadedFile[]) => void
  acceptedTypes?: string
  maxFiles?: number
  label?: string
  description?: string
  multiple?: boolean
  existingFiles?: UploadedFile[]
}

export default function DocumentUploader({
  onFilesChange,
  acceptedTypes = 'image/*,application/pdf',
  maxFiles = 10,
  label = 'Carica documento',
  description = 'Trascina i file qui o clicca per selezionare',
  multiple = true,
  existingFiles = [],
}: DocumentUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles)
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const generateId = () => Math.random().toString(36).substring(2, 9)

  const processFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return
      const newFiles: UploadedFile[] = []
      const remainingSlots = maxFiles - files.length

      Array.from(fileList).slice(0, remainingSlots).forEach((file) => {
        newFiles.push({
          id: generateId(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
        })
      })

      const updated = [...files, ...newFiles]
      setFiles(updated)
      onFilesChange(updated)
    },
    [files, maxFiles, onFilesChange]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      processFiles(e.dataTransfer.files)
    },
    [processFiles]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files)
      e.target.value = ''
    },
    [processFiles]
  )

  const removeFile = useCallback(
    (id: string) => {
      const updated = files.filter((f) => f.id !== id)
      setFiles(updated)
      onFilesChange(updated)
    },
    [files, onFilesChange]
  )

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const isImage = (type: string) => type.startsWith('image/')

  return (
    <div className="w-full">
      {(label || description) && (
        <div className="mb-3">
          {label && <label className="text-sm font-medium text-text-primary block mb-1">{label}</label>}
          {description && <p className="text-xs text-text-muted">{description}</p>}
        </div>
      )}

      {/* Drop zone */}
      {files.length < maxFiles && (
        <motion.div
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.995 }}
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300',
            isDragOver
              ? 'border-sky-primary bg-[rgba(91,184,245,0.08)]'
              : 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(91,184,245,0.3)] hover:bg-[rgba(91,184,245,0.04)]'
          )}
        >
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300',
              isDragOver ? 'bg-[rgba(91,184,245,0.15)]' : 'bg-[rgba(255,255,255,0.04)]'
            )}
          >
            <Upload className={cn('w-6 h-6 transition-colors', isDragOver ? 'text-sky-primary' : 'text-text-muted')} />
          </div>
          <div className="text-center">
            <p className="text-sm text-text-secondary">{isDragOver ? 'Rilascia qui i file' : 'Clicca o trascina i file'}</p>
            <p className="text-xs text-text-muted mt-1">Max {maxFiles} file</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={acceptedTypes}
            multiple={multiple}
            onChange={handleInputChange}
            className="hidden"
          />
        </motion.div>
      )}

      {/* File list / preview */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4"
          >
            {files.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="relative group rounded-lg overflow-hidden border border-[rgba(255,255,255,0.06)] bg-card-bg"
              >
                {isImage(file.type) ? (
                  <div className="aspect-square">
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="aspect-square flex flex-col items-center justify-center gap-2 p-4">
                    <FileText className="w-8 h-8 text-sky-primary/60" />
                    <p className="text-xs text-text-secondary text-center truncate w-full">{file.name}</p>
                  </div>
                )}

                {/* Overlay info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-[10px] text-white/80 truncate">{file.name}</p>
                  <p className="text-[10px] text-white/50">{formatSize(file.size)}</p>
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(file.id)
                  }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-error/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-error"
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Checkmark for confirmed */}
                <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-success flex items-center justify-center">
                  <Check className="w-3 h-3 text-text-inverse" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
