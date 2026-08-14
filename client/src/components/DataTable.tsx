import { useEffect, useState, type ReactNode } from "react";

import "./DataTable.css";

export interface TableColumn<Row> {
  header: ReactNode;
  cell: (row: Row) => ReactNode;
}

export interface TableFilter<Row> {
  label: string;
  options: readonly string[];
  matches: (row: Row, value: string) => boolean;
}

interface DataTableProps<Row> {
  columns: readonly TableColumn<Row>[];
  rows: readonly Row[];
  getRowId: (row: Row) => string;
  footerAction?: ReactNode;
  filters?: readonly TableFilter<Row>[];
  search?: (row: Row, query: string) => boolean;
  searchPlaceholder?: string;
  pagination?: boolean;
  pageSize?: number;
  emptyMessage?: string;
}

export function DataTable<Row>({
  columns,
  rows,
  getRowId,
  footerAction,
  filters = [],
  search,
  searchPlaceholder = "Search",
  pagination = true,
  pageSize = 10,
  emptyMessage = "No records found.",
}: DataTableProps<Row>) {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<string[]>(() =>
    filters.map(() => ""),
  );
  const [page, setPage] = useState(1);

  const filteredRows = rows.filter((row) => {
    const matchesSearch =
      !query.trim() || search?.(row, query.trim().toLocaleLowerCase()) === true;
    const matchesFilters = filters.every(
      (filter, index) =>
        !filterValues[index] || filter.matches(row, filterValues[index]),
    );

    return matchesSearch && matchesFilters;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const visibleRows = pagination
    ? filteredRows.slice(startIndex, startIndex + pageSize)
    : filteredRows;

  useEffect(() => {
    if (pagination) {
      setPage(1);
    }
  }, [pagination, query, filterValues]);

  useEffect(() => {
    if (pagination && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, pagination, totalPages]);

  function updateFilter(index: number, value: string) {
    setFilterValues((current) =>
      current.map((filterValue, filterIndex) =>
        filterIndex === index ? value : filterValue,
      ),
    );
  }

  return (
    <section className="data-table" aria-label="Data table">
      <div className="data-table__controls">
        {search && (
          <label className="data-table__search">
            <span>Search</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
            />
          </label>
        )}

        {filters.map((filter, index) => (
          <label className="data-table__filter" key={filter.label}>
            <span>{filter.label}</span>
            <select
              value={filterValues[index] ?? ""}
              onChange={(event) => updateFilter(index, event.target.value)}
            >
              <option value="">All</option>
              {filter.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div
        className="data-table__scroll"
        tabIndex={0}
        aria-label="Scrollable table"
      >
        <table>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index} scope="col">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={getRowId(row)}>
                {columns.map((column, index) => (
                  <td key={index}>{column.cell(row)}</td>
                ))}
              </tr>
            ))}
            {visibleRows.length === 0 && (
              <tr>
                <td colSpan={columns.length}>{emptyMessage}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(pagination || footerAction) && (
        <footer className="data-table__pagination">
          {pagination && (
            <>
              <span>
                {filteredRows.length === 0
                  ? "0 results"
                  : `${startIndex + 1}-${Math.min(startIndex + pageSize, filteredRows.length)} of ${filteredRows.length}`}
              </span>
              <div>
                <button
                  type="button"
                  onClick={() => setPage((current) => current - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            </>
          )}
          {footerAction}
        </footer>
      )}
    </section>
  );
}
