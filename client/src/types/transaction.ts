export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
}

export type TransactionInput = Omit<Transaction, "id">;
export type TransactionUpdate = Partial<TransactionInput>;

export interface TransactionFilters {
  type?: TransactionType;
  category?: string;
  search?: string;
  date?: string;
  amount?: number;
}

export interface Summary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}
