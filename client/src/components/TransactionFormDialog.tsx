import { useEffect, useRef, useState } from "react";

import type { TransactionInput, TransactionType } from "../types/transaction";

interface TransactionFormDialogProps {
  title: string;
  submitLabel: string;
  isOpen: boolean;
  initialValue: TransactionInput;
  onClose: () => void;
  onSubmit: (transaction: TransactionInput) => Promise<void>;
}

export function TransactionFormDialog({
  title,
  submitLabel,
  isOpen,
  initialValue,
  onClose,
  onSubmit,
}: TransactionFormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [transaction, setTransaction] =
    useState<TransactionInput>(initialValue);
  const [amountInput, setAmountInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTransaction(initialValue);
      setAmountInput(initialValue.amount ? initialValue.amount.toFixed(2) : "");
    }
  }, [initialValue, isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (isOpen && dialog && !dialog.open) {
      dialog.showModal();
    }
  }, [isOpen]);

  const hasValidAmount =
    /^\d+(?:\.\d{1,2})?$/.test(amountInput) && Number(amountInput) > 0;
  const hasAllRequiredFields =
    Boolean(transaction.date) &&
    Boolean(transaction.description.trim()) &&
    Boolean(transaction.category.trim()) &&
    Boolean(amountInput);
  const canSubmit = hasAllRequiredFields && hasValidAmount;

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...transaction,
        description: transaction.description.trim(),
        category: transaction.category.trim(),
        amount: Number(amountInput),
      });
      dialogRef.current?.close();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="transaction-dialog"
      aria-labelledby="transaction-form-dialog-title"
      onClose={onClose}
    >
      <form onSubmit={submitForm}>
        <h2 id="transaction-form-dialog-title">{title}</h2>
        {!hasAllRequiredFields && (
          <p className="form-error" role="alert">
            All fields are required.
          </p>
        )}
        <label>
          <span>Date</span>
          <input
            aria-label="Date"
            type="date"
            value={transaction.date}
            onChange={(event) =>
              setTransaction((current) => ({
                ...current,
                date: event.target.value,
              }))
            }
            aria-invalid={!transaction.date}
            required
          />
        </label>
        <label>
          <span>Description</span>
          <input
            aria-label="Description"
            type="text"
            value={transaction.description}
            onChange={(event) =>
              setTransaction((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            aria-invalid={!transaction.description.trim()}
            required
          />
        </label>
        <label>
          <span>Amount (USD)</span>
          <input
            aria-label="Amount (USD)"
            type="text"
            inputMode="decimal"
            value={amountInput}
            onChange={(event) => setAmountInput(event.target.value)}
            aria-describedby="transaction-amount-help"
            aria-invalid={Boolean(amountInput) && !hasValidAmount}
            placeholder="0.00"
            required
          />
          <small id="transaction-amount-help">
            Enter a positive U.S. dollar amount with up to two decimal places.
          </small>
          {amountInput && !hasValidAmount && (
            <span className="form-error" role="alert">
              Use a positive amount such as 234.43.
            </span>
          )}
        </label>
        <label>
          <span>Type</span>
          <select
            aria-label="Type"
            value={transaction.type}
            onChange={(event) =>
              setTransaction((current) => ({
                ...current,
                type: event.target.value as TransactionType,
              }))
            }
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>
        <label>
          <span>Category</span>
          <input
            aria-label="Category"
            type="text"
            value={transaction.category}
            onChange={(event) =>
              setTransaction((current) => ({
                ...current,
                category: event.target.value,
              }))
            }
            aria-invalid={!transaction.category.trim()}
            required
          />
        </label>
        <div className="transaction-dialog__actions">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button type="submit" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </dialog>
  );
}
