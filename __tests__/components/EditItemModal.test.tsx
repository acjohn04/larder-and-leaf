import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, userEvent, waitFor } from '../test-utils'
import EditItemModal from '@/components/EditItemModal'
import dict from '@/dictionaries/en.json'
import type { InventoryItem } from '@prisma/client'

// Mock the server action
const mockUpdateInventoryItem = vi.fn().mockResolvedValue(undefined)

vi.mock('@/app/actions/inventory', () => ({
  updateInventoryItem: (...args: unknown[]) => mockUpdateInventoryItem(...args),
}))

const mockItem: InventoryItem = {
  id: 'test-id-1',
  name: 'Fresh Basil',
  category: 'produce',
  quantity: 3,
  unit: 'bunches',
  confidenceScore: 0.95,
  expiresAt: new Date('2026-06-01'),
  minThreshold: 1,
  addedAt: new Date('2026-05-28'),
  userId: 'user-1',
}

describe('EditItemModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    item: mockItem,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdateInventoryItem.mockResolvedValue(undefined)
  })

  it('does not render when isOpen is false', () => {
    const { container } = renderWithProviders(
      <EditItemModal isOpen={false} onClose={vi.fn()} item={mockItem} />
    )

    expect(container.innerHTML).toBe('')
  })

  it('renders the modal title', () => {
    renderWithProviders(<EditItemModal {...defaultProps} />)

    expect(screen.getByText(dict.editItemModal.title)).toBeInTheDocument()
  })

  it('renders form fields pre-filled with item data', () => {
    renderWithProviders(<EditItemModal {...defaultProps} />)

    expect(screen.getByDisplayValue('Fresh Basil')).toBeInTheDocument()
    expect(screen.getByDisplayValue('3')).toBeInTheDocument()
    expect(screen.getByDisplayValue('bunches')).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    renderWithProviders(<EditItemModal {...defaultProps} />)

    expect(screen.getByText(dict.editItemModal.submit)).toBeInTheDocument()
  })

  it('submits form with correct payload', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(<EditItemModal isOpen={true} onClose={onClose} item={mockItem} />)

    // Change the name field
    const nameInput = screen.getByDisplayValue('Fresh Basil')
    await user.clear(nameInput)
    await user.type(nameInput, 'Dried Basil')

    // Submit the form
    await user.click(screen.getByText(dict.editItemModal.submit))

    await waitFor(() => {
      expect(mockUpdateInventoryItem).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-id-1',
          name: 'Dried Basil',
          category: 'produce',
          quantity: 3,
          unit: 'bunches',
          minThreshold: 1,
        })
      )
    })
  })

  it('calls onClose after successful submission', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(<EditItemModal isOpen={true} onClose={onClose} item={mockItem} />)

    await user.click(screen.getByText(dict.editItemModal.submit))

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  it('closes the modal when the close button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(<EditItemModal isOpen={true} onClose={onClose} item={mockItem} />)

    const closeButton = screen.getByText('close')
    await user.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('renders category dropdown with all options', () => {
    renderWithProviders(<EditItemModal {...defaultProps} />)

    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()

    expect(screen.getByText(dict.categories.produce)).toBeInTheDocument()
    expect(screen.getByText(dict.categories.pantry)).toBeInTheDocument()
    expect(screen.getByText(dict.categories.dairy_eggs)).toBeInTheDocument()
    expect(screen.getByText(dict.categories.meat_seafood)).toBeInTheDocument()
    expect(screen.getByText(dict.categories.bakery)).toBeInTheDocument()
    expect(screen.getByText(dict.categories.frozen)).toBeInTheDocument()
  })

  it('renders the expiration date field', () => {
    renderWithProviders(<EditItemModal {...defaultProps} />)

    expect(screen.getByText(dict.editItemModal.labelExpiry)).toBeInTheDocument()
    // The date input should have the formatted date value
    expect(screen.getByDisplayValue('2026-06-01')).toBeInTheDocument()
  })
})
