import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Regole sperimentali del React Compiler (eslint-plugin-react-hooks v7): utili come
      // segnalazione ma troppo aggressive per il codice legacy esistente (pagine molto grandi,
      // pattern di effetto legittimi). Le teniamo come "warn" per adozione incrementale, non
      // bloccano CI. Vanno indirizzate progressivamente (vedi docs/04-TASK-MIGLIORAMENTI-WEBAPP.md).
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/static-components': 'warn',
      // Ottimizzazione solo per il fast-refresh in dev: zero impatto a runtime.
      'react-refresh/only-export-components': 'warn',
    },
  },
  {
    // Componenti generati da shadcn/ui (vendored): non li modifichiamo per le regole di stile/RC.
    files: ['src/components/ui/**'],
    rules: {
      'react-hooks/purity': 'off',
    },
  },
])
