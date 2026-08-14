import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { after, beforeEach, describe, it } from "node:test";

import request from "supertest";

import app from "../src/app.js";

const dataFilePath = new URL("../data/transactions.json", import.meta.url);
const originalData = await readFile(dataFilePath, "utf8");

const fixture = [
  {
    id: "income-1",
    date: "2026-08-13",
    description: "Monthly salary",
    amount: 12.14,
    type: "income",
    category: "Salary",
  },
  {
    id: "expense-1",
    date: "2026-08-12",
    description: "Electric bill",
    amount: 10.09,
    type: "expense",
    category: "Bills",
  },
];

beforeEach(async () => {
  await writeFile(dataFilePath, `${JSON.stringify(fixture, null, 2)}\n`);
});

after(async () => {
  await writeFile(dataFilePath, originalData);
});

describe("health endpoint", () => {
  it("reports a healthy server", async () => {
    const response = await request(app).get("/health");

    assert.equal(response.status, 200);
    assert.equal(response.body.status, "ok");
  });
});

describe("transactions API", () => {
  it("filters by type, category, description, date, and amount", async () => {
    const response = await request(app).get("/api/transactions").query({
      type: "income",
      category: "salary",
      search: "salary",
      date: "2026-08-13",
      amount: 12.14,
    });

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, [fixture[0]]);
  });

  it("rejects invalid query parameters", async () => {
    const response = await request(app)
      .get("/api/transactions")
      .query({ date: "not-a-date", amount: -5 });

    assert.equal(response.status, 400);
    assert.match(response.body.error, /date must be a valid/);
  });

  it("creates a transaction with an auto-generated id", async () => {
    const response = await request(app).post("/api/transactions").send({
      date: "2026-08-11",
      description: "Freelance work",
      amount: 50,
      type: "income",
      category: "Work",
    });

    assert.equal(response.status, 201);
    assert.match(response.body.id, /^[0-9a-f-]{36}$/);
    assert.equal(response.body.description, "Freelance work");

    const persisted = JSON.parse(
      await readFile(dataFilePath, "utf8"),
    ) as typeof fixture;
    assert.equal(persisted.length, 3);
  });

  it("updates and deletes a transaction", async () => {
    const updateResponse = await request(app)
      .put("/api/transactions/expense-1")
      .send({ amount: 11.25, category: "Utilities" });

    assert.equal(updateResponse.status, 200);
    assert.equal(updateResponse.body.amount, 11.25);
    assert.equal(updateResponse.body.category, "Utilities");

    const deleteResponse = await request(app).delete(
      "/api/transactions/income-1",
    );

    assert.equal(deleteResponse.status, 204);

    const listResponse = await request(app).get("/api/transactions");
    assert.deepEqual(
      listResponse.body.map(({ id }: { id: string }) => id),
      ["expense-1"],
    );
  });

  it("calculates summary values using cents", async () => {
    const response = await request(app).get("/api/summary");

    assert.deepEqual(response.body, {
      totalIncome: 12.14,
      totalExpense: 10.09,
      netBalance: 2.05,
    });
  });

  it("rejects incomplete or invalid transaction bodies", async () => {
    const response = await request(app).post("/api/transactions").send({
      date: "2026-08-13",
      description: "Invalid amount",
      amount: 0,
      type: "income",
      category: "Testing",
    });

    assert.equal(response.status, 400);
    assert.deepEqual(response.body.errors, [
      "amount must be a positive number.",
    ]);
  });
});
