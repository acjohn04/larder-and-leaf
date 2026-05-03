import { describe, it, expect } from 'vitest'
import { renderWithProviders, screen } from '../test-utils'
import TopNav from '@/components/TopNav'
import dict from '@/dictionaries/en.json'

describe('TopNav', () => {
  it('renders the brand name', () => {
    renderWithProviders(<TopNav />)

    expect(screen.getByText(dict.topNav.brand)).toBeInTheDocument()
  })

  it('renders inside a header element', () => {
    renderWithProviders(<TopNav />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
  })
})

