'use client'

import { useState } from 'react'
import { deleteInventoryItem } from '@/app/actions/inventory'
import DeleteConfirmModal from './DeleteConfirmModal'

export default function DeleteButton({ id, name }: { id: string, name: string }) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleDelete = async () => {
        await deleteInventoryItem(id);
        setIsModalOpen(false);
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="cursor-pointer text-on-surface-variant hover:text-error transition-colors p-1"
                aria-label={`Delete ${name}`}
            >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">delete</span>
            </button>

            <DeleteConfirmModal
                isOpen={isModalOpen}
                itemName={name}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
            />
        </>
    );
}
