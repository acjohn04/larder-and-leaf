import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '../test-utils'
import Sidebar from '@/components/Sidebar'
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

// Mock the server action used by AddItemModal (rendered inside Sidebar)
vi.mock('@/app/actions/inventory', () => ({
  addInventoryItems: vi.fn().mockResolvedValue(undefined),
}))

describe('Sidebar', () => {
  it('renders the heading and subheading', () => {
    renderWithProviders(<Sidebar />)

    expect(screen.getByText(dict.sidebar.heading)).toBeInTheDocument()
    expect(screen.getByText(dict.sidebar.subheading)).toBeInTheDocument()
  })

  it('renders all navigation links', () => {
    renderWithProviders(<Sidebar />)

    expect(screen.getByText(dict.nav.dashboard)).toBeInTheDocument()
    expect(screen.getByText(dict.nav.scanner)).toBeInTheDocument()
    expect(screen.getByText(dict.nav.recipes)).toBeInTheDocument()
  })

  it('renders navigation links with correct hrefs', () => {
    renderWithProviders(<Sidebar />)

    const links = screen.getAllByRole('link')
    const hrefs = links.map((link) => link.getAttribute('href'))

    expect(hrefs).toContain('/')
    expect(hrefs).toContain('/intake')
    expect(hrefs).toContain('/generator')
  })

  it('applies active styling to the current route', () => {
    renderWithProviders(<Sidebar />)

    const dashboardLink = screen.getByText(dict.nav.dashboard).closest('a')
    expect(dashboardLink?.className).toContain('text-primary')
  })

  it('renders the "Add Item" button', () => {
    renderWithProviders(<Sidebar />)

    expect(screen.getByText(dict.sidebar.addItem)).toBeInTheDocument()
  })

  it('opens the AddItemModal when "Add Item" is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Sidebar />)

    // Modal should not be visible initially
    expect(screen.queryByText(dict.addItemModal.title)).not.toBeInTheDocument()

    // Click the Add Item button
    await user.click(screen.getByText(dict.sidebar.addItem))

    // Modal should now be visible
    expect(screen.getByText(dict.addItemModal.title)).toBeInTheDocument()
  })
})
