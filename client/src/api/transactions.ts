import type {
  Summary,
  Transaction,
  TransactionFilters,
  TransactionInput,
  TransactionUpdate,
} from "../types/transaction";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as {
      error?: string;
      errors?: string[];
    } | null;
    const message = errorBody?.error ?? errorBody?.errors?.join(" ");

    throw new Error(message ?? "Unable to complete the request.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getTransactions(
  filters: TransactionFilters = {},
): Promise<Transaction[]> {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined) {
      query.set(key, String(value));
    }
  }

  const queryString = query.toString();
  const path = queryString
    ? `/api/transactions?${queryString}`
    : "/api/transactions";

  return request<Transaction[]>(path);
}

export function createTransaction(
  transaction: TransactionInput,
): Promise<Transaction> {
  return request<Transaction>("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
  });
}

export function updateTransaction(
  id: string,
  transaction: TransactionUpdate,
): Promise<Transaction> {
  return request<Transaction>(`/api/transactions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
  });
}

export function deleteTransaction(id: string): Promise<void> {
  return request<void>(`/api/transactions/${id}`, { method: "DELETE" });
}

export function getSummary(): Promise<Summary> {
  return request<Summary>("/api/summary");
}
