import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CategoryAllocation } from "./CategoryAllocation";

describe("CategoryAllocation", () => {
  it("shows expense categories as a share of income and appends net balance", () => {
    render(
      <CategoryAllocation
        transactions={[
          {
            id: "income",
            date: "2026-08-01",
            description: "Salary",
            amount: 1000,
            type: "income",
            category: "Salary",
          },
          {
            id: "food",
            date: "2026-08-02",
            description: "Groceries",
            amount: 250,
            type: "expense",
            category: "Food",
          },
          {
            id: "rent",
            date: "2026-08-03",
            description: "Rent",
            amount: 500,
            type: "expense",
            category: "Housing",
          },
        ]}
      />,
    );

    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Housing")).toBeInTheDocument();
    expect(screen.queryByText("Salary")).not.toBeInTheDocument();
    expect(screen.getByText("-25.0%")).toBeInTheDocument();
    expect(screen.getByText("-50.0%")).toBeInTheDocument();
    expect(screen.getByText("Net balance")).toBeInTheDocument();
    expect(screen.getByText("+25.0%")).toBeInTheDocument();
  });

  it("explains when no income is available", () => {
    render(<CategoryAllocation transactions={[]} />);

    expect(screen.getByText(/Add income transactions/)).toBeInTheDocument();
  });
});
