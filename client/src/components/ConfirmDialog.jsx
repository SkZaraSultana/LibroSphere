import React from 'react'
import Modal from './Modal'
import PrimaryButton from './auth/PrimaryButton'

export default function ConfirmDialog({ open, title, message, onConfirm, onClose, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="space-y-5">
        <p className="text-sm leading-7 text-[var(--color-text-2)]">{message}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-5 py-3 text-sm text-[var(--color-text)] transition hover:bg-[var(--color-card)]">
            Cancel
          </button>
          <PrimaryButton loading={loading} type="button" onClick={onConfirm}>
            Confirm delete
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  )
}
