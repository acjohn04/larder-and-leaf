import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen } from '../test-utils'
import MobileNav from '@/components/MobileNav'
import dict from '@/dictionaries/en.json'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

// Mock next/link to render as a plain anchor
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('MobileNav', () => {
  it('renders all navigation items', () => {
    renderWithProviders(<MobileNav />)

    expect(screen.getByText(dict.nav.dashboard)).toBeInTheDocument()
    expect(screen.getByText(dict.nav.scanner)).toBeInTheDocument()
    expect(screen.getByText(dict.nav.recipes)).toBeInTheDocument()
  })

  it('renders navigation links with correct hrefs', () => {
    renderWithProviders(<MobileNav />)

    const links = screen.getAllByRole('link')
    const hrefs = links.map((link) => link.getAttribute('href'))

    expect(hrefs).toContain('/')
    expect(hrefs).toContain('/intake')
    expect(hrefs).toContain('/generator')
  })

  it('renders material icons for each nav item', () => {
    renderWithProviders(<MobileNav />)

    expect(screen.getByText('dashboard')).toBeInTheDocument()
    expect(screen.getByText('receipt_long')).toBeInTheDocument()
    expect(screen.getByText('restaurant_menu')).toBeInTheDocument()
  })

  it('applies active styling to the current route', () => {
    renderWithProviders(<MobileNav />)

    // The dashboard link (/) should have active styling since pathname is '/'
    const dashboardLink = screen.getByText(dict.nav.dashboard).closest('a')
    expect(dashboardLink?.className).toContain('text-primary')
  })

  it('renders inside a nav element', () => {
    renderWithProviders(<MobileNav />)

    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})
