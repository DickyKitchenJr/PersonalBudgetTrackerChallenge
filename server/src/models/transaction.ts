export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
}

export type NewTransaction = Omit<Transaction, "id">;
export type TransactionUpdate = Partial<NewTransaction>;
