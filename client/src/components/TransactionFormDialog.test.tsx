import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TransactionFormDialog } from "./TransactionFormDialog";

const emptyTransaction = {
  date: "",
  description: "",
  amount: 0,
  type: "expense" as const,
  category: "",
};

describe("TransactionFormDialog", () => {
  it("requires all fields and validates USD amounts", async () => {
    const user = userEvent.setup();

    render(
      <TransactionFormDialog
        title="Add transaction"
        submitLabel="Add transaction"
        isOpen
        initialValue={emptyTransaction}
        onClose={vi.fn()}
        onSubmit={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "All fields are required.",
    );
    expect(
      screen.getByRole("button", { name: "Add transaction" }),
    ).toBeDisabled();

    await user.type(screen.getByLabelText("Amount (USD)"), "234.432");
    expect(
      screen.getByText("Use a positive amount such as 234.43."),
    ).toBeInTheDocument();
  });

  it("submits a valid transaction", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <TransactionFormDialog
        title="Add transaction"
        submitLabel="Add transaction"
        isOpen
        initialValue={emptyTransaction}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText("Date"), {
      target: { value: "2026-08-14" },
    });
    await user.type(screen.getByLabelText("Description"), "Groceries");
    await user.type(screen.getByLabelText("Amount (USD)"), "86.42");
    await user.type(screen.getByLabelText("Category"), "Food");
    await user.click(screen.getByRole("button", { name: "Add transaction" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        date: "2026-08-14",
        description: "Groceries",
        amount: 86.42,
        type: "expense",
        category: "Food",
      });
    });
  });
});
