'use client'

import { createContext, useContext } from 'react'
import type { Dictionary } from '@/dictionaries'

const DictionaryContext = createContext<Dictionary | null>(null)

export function DictionaryProvider({
  dictionary,
  children,
}: {
  dictionary: Dictionary
  children: React.ReactNode
}) {
  return (
    <DictionaryContext value={dictionary}>
      {children}
    </DictionaryContext>
  )
}

export function useDictionary(): Dictionary {
  const dict = useContext(DictionaryContext)
  if (!dict) {
    throw new Error('useDictionary must be used within a DictionaryProvider')
  }
  return dict
}
