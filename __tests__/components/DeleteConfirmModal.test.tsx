import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, screen, userEvent } from '../test-utils'
import DeleteConfirmModal from '@/components/DeleteConfirmModal'
import dict from '@/dictionaries/en.json'

describe('DeleteConfirmModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    itemName: 'Organic Milk',
  }

  it('does not render when isOpen is false', () => {
    const { container } = renderWithProviders(
      <DeleteConfirmModal {...defaultProps} isOpen={false} />
    )

    expect(container.innerHTML).toBe('')
  })

  it('renders the modal title', () => {
    renderWithProviders(<DeleteConfirmModal {...defaultProps} />)

    expect(screen.getByText(dict.deleteModal.title)).toBeInTheDocument()
  })

  it('renders the description with the interpolated item name', () => {
    renderWithProviders(<DeleteConfirmModal {...defaultProps} />)

    const expectedText = dict.deleteModal.description.replace(
      '{itemName}',
      'Organic Milk'
    )
    expect(screen.getByText(expectedText)).toBeInTheDocument()
  })

  it('uses fallback name when itemName is not provided', () => {
    renderWithProviders(
      <DeleteConfirmModal
        isOpen={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    )

    const expectedText = dict.deleteModal.description.replace(
      '{itemName}',
      dict.deleteModal.fallbackName
    )
    expect(screen.getByText(expectedText)).toBeInTheDocument()
  })

  it('renders confirm and cancel buttons', () => {
    renderWithProviders(<DeleteConfirmModal {...defaultProps} />)

    expect(screen.getByText(dict.deleteModal.confirm)).toBeInTheDocument()
    expect(screen.getByText(dict.deleteModal.cancel)).toBeInTheDocument()
  })

  it('calls onConfirm when delete button is clicked', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(
      <DeleteConfirmModal {...defaultProps} onConfirm={onConfirm} />
    )

    await user.click(screen.getByText(dict.deleteModal.confirm))

    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when cancel button is clicked', async () => {
    const onClose = vi.fn()
    const user = userEvent.setup()

    renderWithProviders(
      <DeleteConfirmModal {...defaultProps} onClose={onClose} />
    )

    await user.click(screen.getByText(dict.deleteModal.cancel))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
