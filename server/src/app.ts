import express, { type Express, type Request, type Response } from "express";

import transactionRouter from "./routes/transactionRoutes.js";

const app: Express = express();

app.use(express.json());
app.use("/api", transactionRouter);

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Personal Budget Tracker API is running",
  });
});

export default app;
