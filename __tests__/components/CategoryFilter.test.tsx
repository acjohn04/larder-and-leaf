import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, userEvent } from '../test-utils'
import CategoryFilter from '@/components/CategoryFilter'
import dict from '@/dictionaries/en.json'

// Mock next/navigation
const mockReplace = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/',
}))

describe('CategoryFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset search params to empty
    for (const key of [...mockSearchParams.keys()]) {
      mockSearchParams.delete(key)
    }
  })

  it('renders all filter buttons', () => {
    renderWithProviders(<CategoryFilter />)
 
    expect(screen.getByText(dict.dashboard.filterAll)).toBeInTheDocument()
    expect(screen.getByText(dict.dashboard.filterProduce)).toBeInTheDocument()
    expect(screen.getByText(dict.dashboard.filterDairy)).toBeInTheDocument()
    expect(screen.getByText(dict.dashboard.filterPantry)).toBeInTheDocument()
    expect(screen.getByText(dict.dashboard.filterMeat)).toBeInTheDocument()
    expect(screen.getByText(dict.dashboard.filterBakery)).toBeInTheDocument()
    expect(screen.getByText(dict.dashboard.filterFrozen)).toBeInTheDocument()
  })

  it('renders the search input with placeholder', () => {
    renderWithProviders(<CategoryFilter />)

    const input = screen.getByPlaceholderText(dict.dashboard.searchPlaceholder)
    expect(input).toBeInTheDocument()
  })

  it('initializes search input from URL params', () => {
    mockSearchParams.set('q', 'bananas')

    renderWithProviders(<CategoryFilter />)

    const input = screen.getByPlaceholderText(dict.dashboard.searchPlaceholder)
    expect(input).toHaveValue('bananas')
  })

  it('updates search input value on typing', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CategoryFilter />)

    const input = screen.getByPlaceholderText(dict.dashboard.searchPlaceholder)
    await user.type(input, 'milk')

    expect(input).toHaveValue('milk')
  })

  it('highlights "All Items" as active by default', () => {
    renderWithProviders(<CategoryFilter />)

    const allButton = screen.getByText(dict.dashboard.filterAll)
    expect(allButton.className).toContain('bg-primary')
  })

  it('navigates with category param when a filter is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CategoryFilter />)

    await user.click(screen.getByText(dict.dashboard.filterProduce))

    expect(mockReplace).toHaveBeenCalledWith('/?category=produce')
  })

  it('removes category param when "All Items" is clicked', async () => {
    mockSearchParams.set('category', 'Produce')

    const user = userEvent.setup()
    renderWithProviders(<CategoryFilter />)

    await user.click(screen.getByText(dict.dashboard.filterAll))

    expect(mockReplace).toHaveBeenCalledWith('/?')
  })

  it('preserves existing q param when toggling category', async () => {
    mockSearchParams.set('q', 'milk')

    const user = userEvent.setup()
    renderWithProviders(<CategoryFilter />)

    await user.click(screen.getByText(dict.dashboard.filterDairy))

    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('q=milk')
    )
    expect(mockReplace).toHaveBeenCalledWith(
      expect.stringContaining('category=dairy_eggs')
    )
  })

  it('shows the correct active state for a pre-selected category', () => {
    mockSearchParams.set('category', 'pantry')

    renderWithProviders(<CategoryFilter />)

    const pantryButton = screen.getByText(dict.dashboard.filterPantry)
    const allButton = screen.getByText(dict.dashboard.filterAll)

    expect(pantryButton.className).toContain('bg-primary')
    expect(allButton.className).not.toContain('bg-primary')
  })

  it('renders buttons inside a nav element for accessibility', () => {
    renderWithProviders(<CategoryFilter />)

    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(7) // 6 categories + 1 All Items
  })
})

