import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithProviders, screen, userEvent, waitFor } from '../test-utils'
import DeleteButton from '@/components/DeleteButton'
import dict from '@/dictionaries/en.json'

// Mock the server action
const mockDeleteInventoryItem = vi.fn().mockResolvedValue(undefined)

vi.mock('@/app/actions/inventory', () => ({
  deleteInventoryItem: (...args: unknown[]) => mockDeleteInventoryItem(...args),
}))

describe('DeleteButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockDeleteInventoryItem.mockResolvedValue(undefined)
  })

  it('renders the delete icon button', () => {
    renderWithProviders(<DeleteButton id="item-1" name="Organic Milk" />)

    // The button contains a material icon span with text "delete"
    expect(screen.getByText('delete')).toBeInTheDocument()
  })

  it('opens the confirm modal when clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DeleteButton id="item-1" name="Organic Milk" />)

    await user.click(screen.getByText('delete'))

    // The confirm modal should now be visible
    expect(screen.getByText(dict.deleteModal.title)).toBeInTheDocument()
    expect(
      screen.getByText(
        dict.deleteModal.description.replace('{itemName}', 'Organic Milk')
      )
    ).toBeInTheDocument()
  })

  it('calls deleteInventoryItem with correct id when confirmed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DeleteButton id="item-42" name="Bananas" />)

    // Open the modal
    await user.click(screen.getByText('delete'))

    // Click confirm
    await user.click(screen.getByText(dict.deleteModal.confirm))

    await waitFor(() => {
      expect(mockDeleteInventoryItem).toHaveBeenCalledWith('item-42')
    })
  })

  it('closes the modal when cancel is clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<DeleteButton id="item-1" name="Organic Milk" />)

    // Open the modal
    await user.click(screen.getByText('delete'))
    expect(screen.getByText(dict.deleteModal.title)).toBeInTheDocument()

    // Click cancel
    await user.click(screen.getByText(dict.deleteModal.cancel))

    // Modal should be gone
    expect(screen.queryByText(dict.deleteModal.title)).not.toBeInTheDocument()
  })
})
