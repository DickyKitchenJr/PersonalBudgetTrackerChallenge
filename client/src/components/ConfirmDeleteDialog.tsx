import { useEffect, useRef, useState } from "react";

import type { Transaction } from "../types/transaction";

interface ConfirmDeleteDialogProps {
  transaction: Transaction | null;
  onClose: () => void;
  onConfirm: (transaction: Transaction) => Promise<void>;
}

export function ConfirmDeleteDialog({
  transaction,
  onClose,
  onConfirm,
}: ConfirmDeleteDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (transaction && dialog && !dialog.open) {
      dialog.showModal();
    }
  }, [transaction]);

  async function confirmDeletion() {
    if (!transaction) {
      return;
    }

    try {
      setIsConfirming(true);
      await onConfirm(transaction);
      dialogRef.current?.close();
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="delete-dialog"
      aria-labelledby="delete-dialog-title"
      onClose={onClose}
    >
      {transaction && (
        <form method="dialog">
          <h2 id="delete-dialog-title">Delete transaction?</h2>
          <p>
            Delete {transaction.description} for {transaction.amount.toFixed(2)}
            ? This cannot be undone.
          </p>
          <div className="delete-dialog__actions">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              disabled={isConfirming}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDeletion}
              disabled={isConfirming}
            >
              {isConfirming ? "Deleting..." : "Delete"}
            </button>
          </div>
        </form>
      )}
    </dialog>
  );
}
