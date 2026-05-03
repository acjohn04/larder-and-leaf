import React from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { DictionaryProvider } from '@/components/DictionaryProvider'
import dict from '@/dictionaries/en.json'

/**
 * Wraps a component in all required providers for testing.
 * Currently: DictionaryProvider with the English dictionary.
 */
function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <DictionaryProvider dictionary={dict}>
      {children}
    </DictionaryProvider>
  )
}

/**
 * Custom render that wraps components in all app providers.
 * Use this instead of `@testing-library/react` render for components
 * that consume context (useDictionary, etc.).
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options })
}

// Re-export everything from testing-library for convenience
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
