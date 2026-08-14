import { Router, type Request, type Response } from "express";

import type {
  NewTransaction,
  Transaction,
  TransactionType,
  TransactionUpdate,
} from "../models/transaction.js";
import {
  createTransaction,
  deleteTransaction,
  listTransactions,
  updateTransaction,
} from "../models/transactionStore.js";

const transactionRouter = Router();

type TransactionInput = NewTransaction | TransactionUpdate;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTransactionType(value: unknown): value is TransactionType {
  return value === "income" || value === "expense";
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function validateTransactionInput(
  body: unknown,
  requireAllFields: boolean,
): { data?: TransactionInput; errors: string[] } {
  if (!isRecord(body)) {
    return { errors: ["Request body must be a JSON object."] };
  }

  const errors: string[] = [];
  const data: TransactionUpdate = {};
  const fields: (keyof NewTransaction)[] = [
    "date",
    "description",
    "amount",
    "type",
    "category",
  ];

  for (const field of fields) {
    if (requireAllFields && !(field in body)) {
      errors.push(`${field} is required.`);
    }
  }

  if ("date" in body) {
    if (typeof body.date !== "string" || !isValidDate(body.date)) {
      errors.push("date must be a valid YYYY-MM-DD date.");
    } else {
      data.date = body.date;
    }
  }

  if ("description" in body) {
    if (typeof body.description !== "string" || !body.description.trim()) {
      errors.push("description must be a non-empty string.");
    } else {
      data.description = body.description.trim();
    }
  }

  if ("amount" in body) {
    if (
      typeof body.amount !== "number" ||
      !Number.isFinite(body.amount) ||
      body.amount <= 0
    ) {
      errors.push("amount must be a positive number.");
    } else {
      data.amount = body.amount;
    }
  }

  if ("type" in body) {
    if (!isTransactionType(body.type)) {
      errors.push("type must be either income or expense.");
    } else {
      data.type = body.type;
    }
  }

  if ("category" in body) {
    if (typeof body.category !== "string" || !body.category.trim()) {
      errors.push("category must be a non-empty string.");
    } else {
      data.category = body.category.trim();
    }
  }

  if (
    !requireAllFields &&
    Object.keys(data).length === 0 &&
    errors.length === 0
  ) {
    errors.push("Provide at least one transaction field to update.");
  }

  return errors.length > 0 ? { errors } : { data, errors: [] };
}

function getQueryString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function toCents(amount: number): number {
  return Math.round(amount * 100);
}

transactionRouter.get("/transactions", async (req: Request, res: Response) => {
  const type = getQueryString(req.query.type);
  const category = getQueryString(req.query.category)?.toLocaleLowerCase();
  const search = getQueryString(req.query.search)?.toLocaleLowerCase();
  const date = getQueryString(req.query.date);
  const amountQuery = getQueryString(req.query.amount);
  const amount = amountQuery === undefined ? undefined : Number(amountQuery);

  if (type !== undefined && !isTransactionType(type)) {
    res.status(400).json({ error: "type must be either income or expense." });
    return;
  }

  if (date !== undefined && !isValidDate(date)) {
    res.status(400).json({ error: "date must be a valid YYYY-MM-DD date." });
    return;
  }

  if (
    amountQuery !== undefined &&
    (amount === undefined || !Number.isFinite(amount) || amount <= 0)
  ) {
    res.status(400).json({ error: "amount must be a positive number." });
    return;
  }

  const transactions = await listTransactions();
  const filteredTransactions = transactions.filter((transaction) => {
    return (
      (type === undefined || transaction.type === type) &&
      (category === undefined ||
        transaction.category.toLocaleLowerCase() === category) &&
      (search === undefined ||
        transaction.description.toLocaleLowerCase().includes(search)) &&
      (date === undefined || transaction.date === date) &&
      (amount === undefined || toCents(transaction.amount) === toCents(amount))
    );
  });

  res.status(200).json(filteredTransactions);
});

transactionRouter.post("/transactions", async (req: Request, res: Response) => {
  const { data, errors } = validateTransactionInput(req.body, true);

  if (!data || errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  const transaction = await createTransaction(data as NewTransaction);
  res.status(201).json(transaction);
});

transactionRouter.put(
  "/transactions/:id",
  async (req: Request, res: Response) => {
    const { data, errors } = validateTransactionInput(req.body, false);
    const id = getQueryString(req.params.id);

    if (!data || errors.length > 0) {
      res.status(400).json({ errors });
      return;
    }

    if (!id) {
      res.status(400).json({ error: "Transaction id is required." });
      return;
    }

    const transaction = await updateTransaction(id, data);

    if (!transaction) {
      res.status(404).json({ error: "Transaction not found." });
      return;
    }

    res.status(200).json(transaction);
  },
);

transactionRouter.delete(
  "/transactions/:id",
  async (req: Request, res: Response) => {
    const id = getQueryString(req.params.id);

    if (!id) {
      res.status(400).json({ error: "Transaction id is required." });
      return;
    }

    const wasDeleted = await deleteTransaction(id);

    if (!wasDeleted) {
      res.status(404).json({ error: "Transaction not found." });
      return;
    }

    res.status(204).send();
  },
);

transactionRouter.get("/summary", async (_req: Request, res: Response) => {
  const transactions = await listTransactions();
  const totalIncomeInCents = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + toCents(transaction.amount), 0);
  const totalExpenseInCents = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + toCents(transaction.amount), 0);

  res.status(200).json({
    totalIncome: totalIncomeInCents / 100,
    totalExpense: totalExpenseInCents / 100,
    netBalance: (totalIncomeInCents - totalExpenseInCents) / 100,
  });
});

export default transactionRouter;
