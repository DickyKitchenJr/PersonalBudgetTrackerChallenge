import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { DataTable, type TableColumn, type TableFilter } from "./DataTable";

interface Row {
  id: string;
  name: string;
  type: "income" | "expense";
}

const rows: Row[] = [
  { id: "1", name: "Salary", type: "income" },
  { id: "2", name: "Groceries", type: "expense" },
  { id: "3", name: "Utilities", type: "expense" },
];

const columns: TableColumn<Row>[] = [
  { header: "Name", cell: (row) => row.name },
  { header: "Type", cell: (row) => row.type },
];

const filters: TableFilter<Row>[] = [
  {
    label: "Type",
    options: ["income", "expense"],
    matches: (row, value) => row.type === value,
  },
];

describe("DataTable", () => {
  it("searches, filters, and paginates rows", async () => {
    const user = userEvent.setup();

    render(
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        filters={filters}
        search={(row, query) => row.name.toLocaleLowerCase().includes(query)}
        pageSize={1}
      />,
    );

    expect(screen.getByText("Salary")).toBeInTheDocument();
    expect(screen.queryByText("Groceries")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Groceries")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Type"), "income");
    expect(screen.getByText("Salary")).toBeInTheDocument();
    expect(screen.queryByText("Groceries")).not.toBeInTheDocument();

    await user.clear(screen.getByRole("searchbox"));
    await user.type(screen.getByRole("searchbox"), "salary");
    expect(screen.getByText("Salary")).toBeInTheDocument();
  });

  it("omits pagination when disabled", () => {
    render(
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        pagination={false}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Next" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Utilities")).toBeInTheDocument();
  });
});
