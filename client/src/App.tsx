import { useEffect, useState } from "react";

import {
  createTransaction,
  deleteTransaction,
  getSummary,
  getTransactions,
  updateTransaction,
} from "./api/transactions";
import {
  DataTable,
  type TableColumn,
  type TableFilter,
} from "./components/DataTable";
import { BudgetSummary } from "./components/BudgetSummary";
import { CategoryAllocation } from "./components/CategoryAllocation";
import { ConfirmDeleteDialog } from "./components/ConfirmDeleteDialog";
import { TransactionFormDialog } from "./components/TransactionFormDialog";
import type { Transaction, TransactionInput } from "./types/transaction";
import "./App.css";

const emptyTransactionForm: TransactionInput = {
  date: "",
  description: "",
  amount: 0,
  type: "expense",
  category: "",
};

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Awaited<
    ReturnType<typeof getSummary>
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);
  const [transactionToEdit, setTransactionToEdit] =
    useState<Transaction | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const categories = Array.from(
    new Map(
      transactions.map((transaction) => [
        transaction.category.toLocaleLowerCase(),
        transaction.category,
      ]),
    ).values(),
  ).sort((first, second) => first.localeCompare(second));
  const dates = Array.from(
    new Set(transactions.map((transaction) => transaction.date)),
  ).sort((first, second) => second.localeCompare(first));
  const transactionFilters: TableFilter<Transaction>[] = [
    {
      label: "Type",
      options: ["income", "expense"],
      matches: (transaction, value) => transaction.type === value,
    },
    {
      label: "Category",
      options: categories,
      matches: (transaction, value) =>
        transaction.category.toLocaleLowerCase() === value.toLocaleLowerCase(),
    },
    {
      label: "Date",
      options: dates,
      matches: (transaction, value) => transaction.date === value,
    },
  ];
  const transactionColumns: TableColumn<Transaction>[] = [
    { header: "Date", cell: (transaction) => transaction.date },
    { header: "Description", cell: (transaction) => transaction.description },
    {
      header: "Amount",
      cell: (transaction) =>
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(transaction.amount),
    },
    { header: "Type", cell: (transaction) => transaction.type },
    { header: "Category", cell: (transaction) => transaction.category },
    {
      header: "Actions",
      cell: (transaction) => (
        <div className="transaction-row-actions">
          <button
            className="transaction-edit-button"
            type="button"
            onClick={() => setTransactionToEdit(transaction)}
          >
            Edit
          </button>
          <button
            className="transaction-delete-button"
            type="button"
            onClick={() => setTransactionToDelete(transaction)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    async function loadInitialData() {
      try {
        setError(null);
        const [transactions, summary] = await Promise.all([
          getTransactions(),
          getSummary(),
        ]);
        setTransactions(transactions);
        setSummary(summary);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load transactions.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadInitialData();
  }, []);

  async function refreshSummary() {
    setSummary(await getSummary());
  }

  async function confirmDelete(transaction: Transaction) {
    try {
      setError(null);
      await deleteTransaction(transaction.id);
      setTransactions((current) =>
        current.filter(
          (currentTransaction) => currentTransaction.id !== transaction.id,
        ),
      );
      await refreshSummary();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete transaction.",
      );
      throw error;
    }
  }

  async function addTransaction(transaction: TransactionInput) {
    try {
      setError(null);
      const createdTransaction = await createTransaction(transaction);
      setTransactions((current) => [...current, createdTransaction]);
      await refreshSummary();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to add transaction.",
      );
      throw error;
    }
  }

  async function editTransaction(transaction: TransactionInput) {
    if (!transactionToEdit) {
      return;
    }

    try {
      setError(null);
      const updatedTransaction = await updateTransaction(
        transactionToEdit.id,
        transaction,
      );
      setTransactions((current) =>
        current.map((transaction) =>
          transaction.id === updatedTransaction.id
            ? updatedTransaction
            : transaction,
        ),
      );
      await refreshSummary();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update transaction.",
      );
      throw error;
    }
  }

  return (
    <>
      <h1>Budget Tracker</h1>
      {isLoading && <p>Loading transactions...</p>}
      {error && <p role="alert">{error}</p>}
      {!isLoading && (
        <DataTable
          columns={transactionColumns}
          rows={transactions}
          getRowId={(transaction) => transaction.id}
          footerAction={
            <button
              className="add-transaction-button"
              type="button"
              onClick={() => setIsAddDialogOpen(true)}
            >
              Add transaction
            </button>
          }
          filters={transactionFilters}
          search={(transaction, query) =>
            [
              transaction.id,
              transaction.date,
              transaction.description,
              transaction.amount.toFixed(2),
              transaction.type,
              transaction.category,
            ].some((value) => value.toLocaleLowerCase().includes(query))
          }
          searchPlaceholder="Search all transaction fields"
          pageSize={5}
          emptyMessage="No transactions match your filters."
        />
      )}
      {!isLoading && summary && <BudgetSummary summary={summary} />}
      {!isLoading && <CategoryAllocation transactions={transactions} />}
      <TransactionFormDialog
        title="Add transaction"
        submitLabel="Add transaction"
        isOpen={isAddDialogOpen}
        initialValue={emptyTransactionForm}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={addTransaction}
      />
      <TransactionFormDialog
        title="Edit transaction"
        submitLabel="Save changes"
        isOpen={Boolean(transactionToEdit)}
        initialValue={transactionToEdit ?? emptyTransactionForm}
        onClose={() => setTransactionToEdit(null)}
        onSubmit={editTransaction}
      />
      <ConfirmDeleteDialog
        transaction={transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}

export default App;
