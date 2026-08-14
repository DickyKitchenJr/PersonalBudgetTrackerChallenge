import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

import type {
  NewTransaction,
  Transaction,
  TransactionUpdate,
} from "./transaction.js";

const dataFilePath = fileURLToPath(
  new URL("../../data/transactions.json", import.meta.url),
);

async function readTransactions(): Promise<Transaction[]> {
  const fileContents = await readFile(dataFilePath, "utf8");
  return JSON.parse(fileContents) as Transaction[];
}

async function writeTransactions(transactions: Transaction[]): Promise<void> {
  await writeFile(dataFilePath, `${JSON.stringify(transactions, null, 2)}\n`);
}

export async function listTransactions(): Promise<Transaction[]> {
  return readTransactions();
}

export async function createTransaction(
  transaction: NewTransaction,
): Promise<Transaction> {
  const transactions = await readTransactions();
  const newTransaction: Transaction = {
    id: randomUUID(),
    ...transaction,
  };

  transactions.push(newTransaction);
  await writeTransactions(transactions);

  return newTransaction;
}

export async function updateTransaction(
  id: string,
  update: TransactionUpdate,
): Promise<Transaction | undefined> {
  const transactions = await readTransactions();
  const transactionIndex = transactions.findIndex(
    (transaction) => transaction.id === id,
  );

  if (transactionIndex === -1) {
    return undefined;
  }

  const existingTransaction = transactions[transactionIndex];

  if (!existingTransaction) {
    return undefined;
  }

  const updatedTransaction: Transaction = {
    ...existingTransaction,
    ...update,
  };

  transactions[transactionIndex] = updatedTransaction;
  await writeTransactions(transactions);

  return updatedTransaction;
}

export async function deleteTransaction(id: string): Promise<boolean> {
  const transactions = await readTransactions();
  const remainingTransactions = transactions.filter(
    (transaction) => transaction.id !== id,
  );

  if (remainingTransactions.length === transactions.length) {
    return false;
  }

  await writeTransactions(remainingTransactions);
  return true;
}
