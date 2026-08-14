# Budget Tracker

## Prerequisites

Node.js v24.14.1
npm v11.13.0

## Setup

### Install dependencies

- cd server && npm install
- cd ../client && npm install

### Run the app

- Terminal 1 (backend): cd server && npm run dev
- Terminal 2 (frontend): cd client && npm run dev

- Open http://localhost:5173

## Running tests (optional)

- tests have been established for both the front and backend and can be run with npm run test in the terminal from the proper folder (server for backend, client for frontend)

## Environment variables

- no environment variables used as this is only for demo purposes and meant to be run locally
- some small code segments left in showing how environment variables would have been used but intentionally left with OR value meant to be used for demo purposes

## Starting with data (optional)

- the app starts intentionally with no data loaded, however if you would like to start with data you can cut and paste the following into /server/data/transactions.json :

  {
  "id": "de0faac6-3d40-4c4f-a76a-a9eacba45233",
  "date": "2026-08-13",
  "description": "test input one",
  "amount": 12.14,
  "type": "income",
  "category": "gift"
  },
  {
  "id": "885b49c4-8131-4ca5-be7e-885a60d94ae3",
  "date": "2026-08-12",
  "description": "test input two",
  "amount": 10.09,
  "type": "expense",
  "category": "bill"
  },
  {
  "id": "70e9fd19-553c-40bd-b093-2358f02feeff",
  "date": "2026-10-07",
  "description": "test input three",
  "amount": 1.07,
  "type": "income",
  "category": "refund"
  },
  {
  "id": "b6af8e3d-6f9e-4a4d-b32b-312006833e9c",
  "date": "2025-10-07",
  "description": "test input four",
  "amount": 10.07,
  "type": "income",
  "category": "refund"
  },
  {
  "id": "adbcf790-98f8-4a9f-ad3b-3249b72570e4",
  "date": "2025-10-07",
  "description": "test input five",
  "amount": 100,
  "type": "income",
  "category": "pay"
  },
  {
  "id": "9d2f40f2-2e36-4460-9d3b-93d0c004a679",
  "date": "2026-09-07",
  "description": "test input six",
  "amount": 50,
  "type": "expense",
  "category": "dinner"
  }

## Notes

Light mode, dark mode, and accessibility including ability to tab through sections and use arrow keys to scroll the tables are included should you want to try them.
