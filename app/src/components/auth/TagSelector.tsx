import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface Tag {
  id: string
  label: string
}

interface TagSelectorProps {
  tags: Tag[]
  selectedIds: string[]
  onChange: (selectedIds: string[]) => void
  maxSelectable?: number
  allowCustom?: boolean
  customPlaceholder?: string
}

export default function TagSelector({
  tags,
  selectedIds,
  onChange,
  maxSelectable,
  allowCustom = false,
  customPlaceholder = 'Aggiungi altro...',
}: TagSelectorProps) {
  const [customTag, setCustomTag] = useState('')
  const [customTags, setCustomTags] = useState<Tag[]>([])

  const allTags = [...tags, ...customTags]

  const toggleTag = useCallback(
    (id: string) => {
      if (selectedIds.includes(id)) {
        onChange(selectedIds.filter((sid) => sid !== id))
      } else {
        if (maxSelectable && selectedIds.length >= maxSelectable) return
        onChange([...selectedIds, id])
      }
    },
    [selectedIds, onChange, maxSelectable]
  )

  const addCustomTag = useCallback(() => {
    const trimmed = customTag.trim()
    if (!trimmed) return
    const newTag: Tag = {
      id: `custom-${Date.now()}`,
      label: trimmed,
    }
    setCustomTags((prev) => [...prev, newTag])
    onChange([...selectedIds, newTag.id])
    setCustomTag('')
  }, [customTag, selectedIds, onChange])

  return (
    <div className="w-full">
      {maxSelectable && (
        <p className="text-xs text-text-muted mb-3">
          Seleziona fino a {maxSelectable} tag{selectedIds.length > 0 && ` (${selectedIds.length}/${maxSelectable})`}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const isSelected = selectedIds.includes(tag.id)
          const atMax = maxSelectable !== undefined && selectedIds.length >= maxSelectable && !isSelected

          return (
            <motion.button
              key={tag.id}
              whileHover={{ scale: atMax ? 1 : 1.05 }}
              whileTap={{ scale: atMax ? 1 : 0.95 }}
              onClick={() => !atMax && toggleTag(tag.id)}
              disabled={atMax}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200',
                isSelected
                  ? 'bg-[rgba(91,184,245,0.12)] border-sky-primary text-sky-primary'
                  : atMax
                    ? 'bg-transparent border-[rgba(255,255,255,0.04)] text-text-muted cursor-not-allowed opacity-50'
                    : 'bg-transparent border-[rgba(255,255,255,0.08)] text-text-secondary hover:border-[rgba(91,184,245,0.3)] hover:text-text-primary'
              )}
            >
              {tag.label}
            </motion.button>
          )
        })}
      </div>

      {allowCustom && (
        <div className="flex items-center gap-2 mt-4">
          <input
            type="text"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addCustomTag()
              }
            }}
            placeholder={customPlaceholder}
            className="flex-1 min-w-0 px-4 py-2 text-sm bg-card-bg border border-[rgba(255,255,255,0.1)] rounded-lg text-text-primary placeholder:text-text-muted focus:border-sky-primary focus:shadow-[0_0_0_3px_rgba(91,184,245,0.15)] outline-none transition-all"
          />
          <button
            onClick={addCustomTag}
            disabled={!customTag.trim()}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-all',
              customTag.trim()
                ? 'text-text-inverse bg-gradient-to-r from-sky-primary to-sky-blue hover:brightness-110'
                : 'bg-[rgba(255,255,255,0.04)] text-text-muted cursor-not-allowed'
            )}
          >
            Aggiungi
          </button>
        </div>
      )}
    </div>
  )
}
