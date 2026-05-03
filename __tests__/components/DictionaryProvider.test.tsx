import { describe, it, expect } from 'vitest'
import { render, screen, renderHook } from '@testing-library/react'
import React from 'react'
import {
  DictionaryProvider,
  useDictionary,
} from '@/components/DictionaryProvider'
import dict from '@/dictionaries/en.json'

describe('DictionaryProvider', () => {
  it('provides dictionary values to children', () => {
    render(
      <DictionaryProvider dictionary={dict}>
        <TestConsumer />
      </DictionaryProvider>
    )

    expect(screen.getByText(dict.app.title)).toBeInTheDocument()
  })

  it('useDictionary returns the full dictionary object', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <DictionaryProvider dictionary={dict}>{children}</DictionaryProvider>
    )

    const { result } = renderHook(() => useDictionary(), { wrapper })

    expect(result.current).toEqual(dict)
    expect(result.current.app.title).toBe('Larder & Leaf')
    expect(result.current.dashboard.title).toBe('Inventory Dashboard')
  })

  it('throws when useDictionary is used outside DictionaryProvider', () => {
    // Suppress React error boundary noise in test output
    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    expect(() => {
      renderHook(() => useDictionary())
    }).toThrow('useDictionary must be used within a DictionaryProvider')

    consoleSpy.mockRestore()
  })
})

/**
 * Simple consumer component to verify context is accessible in the tree.
 */
function TestConsumer() {
  const dict = useDictionary()
  return <span>{dict.app.title}</span>
}
