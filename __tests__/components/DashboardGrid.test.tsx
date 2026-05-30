import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '../test-utils'
import DashboardGrid from '@/components/DashboardGrid'
import dict from '@/dictionaries/en.json'
import type { InventoryItem } from '@prisma/client'

// Mock next/link to render as a plain anchor
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

// Mock the server actions used by DeleteButton and EditItemModal
vi.mock('@/app/actions/inventory', () => ({
  deleteInventoryItem: vi.fn().mockResolvedValue(undefined),
  updateInventoryItem: vi.fn().mockResolvedValue(undefined),
}))

const now = new Date('2026-05-30T12:00:00Z')

const makeItem = (overrides: Partial<InventoryItem> = {}): InventoryItem => ({
  id: 'item-1',
  name: 'Fresh Basil',
  category: 'produce',
  quantity: 3,
  unit: 'bunches',
  confidenceScore: 0.95,
  expiresAt: null,
  minThreshold: 0,
  addedAt: new Date('2026-05-28'),
  userId: 'user-1',
  ...overrides,
})

describe('DashboardGrid', () => {
  it('renders inventory cards', () => {
    const items = [makeItem(), makeItem({ id: 'item-2', name: 'Organic Milk', category: 'dairy_eggs' })]
    renderWithProviders(<DashboardGrid items={items} now={now.toISOString()} />)

    expect(screen.getByText('Fresh Basil')).toBeInTheDocument()
    expect(screen.getByText('Organic Milk')).toBeInTheDocument()
  })

  it('shows "Expiring" badge for items expiring within 3 days', () => {
    const expiringItem = makeItem({
      expiresAt: new Date('2026-06-01T12:00:00Z'), // 2 days from now
    })
    renderWithProviders(<DashboardGrid items={[expiringItem]} now={now.toISOString()} />)

    expect(screen.getByText(dict.dashboard.expiring)).toBeInTheDocument()
  })

  it('does NOT show "Expiring" badge for already-expired items', () => {
    const expiredItem = makeItem({
      expiresAt: new Date('2026-05-28T12:00:00Z'), // 2 days ago
    })
    renderWithProviders(<DashboardGrid items={[expiredItem]} now={now.toISOString()} />)

    expect(screen.queryByText(dict.dashboard.expiring)).not.toBeInTheDocument()
  })

  it('does NOT show "Expiring" badge for items expiring beyond 3 days', () => {
    const farFutureItem = makeItem({
      expiresAt: new Date('2026-06-15T12:00:00Z'), // 16 days from now
    })
    renderWithProviders(<DashboardGrid items={[farFutureItem]} now={now.toISOString()} />)

    expect(screen.queryByText(dict.dashboard.expiring)).not.toBeInTheDocument()
  })

  it('opens EditItemModal when a card is clicked', async () => {
    const user = userEvent.setup()
    const items = [makeItem()]

    renderWithProviders(<DashboardGrid items={items} now={now.toISOString()} />)

    // Modal should not be visible initially
    expect(screen.queryByText(dict.editItemModal.title)).not.toBeInTheDocument()

    // Click the card
    await user.click(screen.getByText('Fresh Basil'))

    // Modal should now be visible
    expect(screen.getByText(dict.editItemModal.title)).toBeInTheDocument()
  })

  it('does NOT open edit modal when delete button is clicked', async () => {
    const user = userEvent.setup()
    const items = [makeItem()]

    renderWithProviders(<DashboardGrid items={items} now={now.toISOString()} />)

    // Click the delete button (material icon text "delete")
    const deleteButton = screen.getByLabelText('Delete Fresh Basil')
    await user.click(deleteButton)

    // Edit modal should NOT have opened
    expect(screen.queryByText(dict.editItemModal.title)).not.toBeInTheDocument()
  })

  it('shows low stock styling when quantity is at or below threshold', () => {
    const lowStockItem = makeItem({ quantity: 1, minThreshold: 2 })
    renderWithProviders(<DashboardGrid items={[lowStockItem]} now={now.toISOString()} />)

    // The quantity text should have the error/red class
    const quantityEl = screen.getByText('1')
    expect(quantityEl.className).toContain('text-error')
  })
})
