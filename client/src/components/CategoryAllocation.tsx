import type { Transaction } from "../types/transaction";

import "./CategoryAllocation.css";

interface CategoryAllocationProps {
  transactions: readonly Transaction[];
}

interface CategoryTotal {
  category: string;
  amount: number;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function CategoryAllocation({ transactions }: CategoryAllocationProps) {
  const totals = new Map<string, CategoryTotal>();
  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);
  const totalExpense = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  for (const transaction of transactions) {
    if (transaction.type !== "expense") {
      continue;
    }

    const key = transaction.category.toLocaleLowerCase();
    const existingTotal = totals.get(key);

    totals.set(key, {
      category: existingTotal?.category ?? transaction.category,
      amount: (existingTotal?.amount ?? 0) + transaction.amount,
    });
  }

  const categoryTotals = Array.from(totals.values()).sort(
    (first, second) => second.amount - first.amount,
  );
  const netBalance = totalIncome - totalExpense;
  const netBalancePercentage =
    totalIncome === 0 ? 0 : (netBalance / totalIncome) * 100;

  return (
    <section
      className="category-allocation"
      aria-labelledby="category-allocation-heading"
    >
      <div>
        <h2 id="category-allocation-heading">Spending Habits</h2>
        <p>Expense categories as a percentage of total income.</p>
      </div>
      {totalIncome === 0 ? (
        <p>Add income transactions to calculate spending allocation.</p>
      ) : (
        <ul className="category-allocation__list">
          {categoryTotals.map(({ category, amount }) => {
            const percentage =
              totalIncome === 0 ? 0 : (amount / totalIncome) * 100;

            return (
              <li key={category.toLocaleLowerCase()}>
                <div className="category-allocation__details">
                  <span className="category-allocation__category">
                    {category}
                  </span>
                  <span className="category-allocation__type">Expense</span>
                </div>
                <span>{`-${currencyFormatter.format(amount)}`}</span>
                <span className="category-allocation__percentage category-allocation__percentage--expense">
                  -{percentage.toFixed(1)}%
                </span>
              </li>
            );
          })}
          <li className="category-allocation__balance">
            <div className="category-allocation__details">
              <span className="category-allocation__category">Net balance</span>
              <span className="category-allocation__type">
                Income remaining
              </span>
            </div>
            <span>{currencyFormatter.format(netBalance)}</span>
            <span
              className={`category-allocation__percentage category-allocation__percentage--${netBalance < 0 ? "expense" : "income"}`}
            >
              {netBalance < 0 ? "-" : "+"}
              {Math.abs(netBalancePercentage).toFixed(1)}%
            </span>
          </li>
        </ul>
      )}
    </section>
  );
}
