import { DataTable, type TableColumn } from "./DataTable";
import type { Summary } from "../types/transaction";

interface BudgetSummaryProps {
  summary: Summary;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const summaryColumns: TableColumn<Summary>[] = [
  {
    header: "Total income",
    cell: (summary) => currencyFormatter.format(summary.totalIncome),
  },
  {
    header: "Total expenses",
    cell: (summary) => currencyFormatter.format(summary.totalExpense),
  },
  {
    header: "Net balance",
    cell: (summary) => currencyFormatter.format(summary.netBalance),
  },
];

export function BudgetSummary({ summary }: BudgetSummaryProps) {
  return (
    <section className="summary-section" aria-labelledby="summary-heading">
      <h2 id="summary-heading">Summary</h2>
      <DataTable
        columns={summaryColumns}
        rows={[summary]}
        getRowId={() => "budget-summary"}
        pagination={false}
      />
    </section>
  );
}
