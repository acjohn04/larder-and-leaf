import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '../test-utils'
import TopNav from '@/components/TopNav'
import dict from '@/dictionaries/en.json'

// Mock next-auth/react to avoid SessionProvider requirement
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { name: 'Test User', email: 'test@example.com' } } }),
  signOut: vi.fn(),
}))

// Mock next/image to render as a plain img
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))
describe('TopNav', () => {
  it('renders the brand name', () => {
    renderWithProviders(<TopNav />)

    expect(screen.getByText(dict.topNav.brand)).toBeInTheDocument()
  })

  it('renders inside a header element', () => {
    renderWithProviders(<TopNav />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
  })

  it('hides brand text on small screens via responsive class', () => {
    renderWithProviders(<TopNav />)

    const brandSpan = screen.getByText(dict.topNav.brand)
    expect(brandSpan.className).toContain('hidden')
    expect(brandSpan.className).toContain('sm:inline')
  })
})
