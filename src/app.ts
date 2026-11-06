import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import routes from "./routes/routes";
import { logger } from "./utils/logger";
import { AppError } from "./utils/error";

const app = express();

app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.use(pinoHttp({ logger })); // logs every request with status and response time

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", routes);

app.use((_req, res) => res.status(404).json({ message: "Route not found" }));

// Central error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }
  const status = err?.status ?? err?.statusCode; // e.g. malformed JSON body -> 400
  if (typeof status === "number" && status >= 400 && status < 500) {
    return res.status(status).json({ message: err.message });
  }
  req.log.error({ err }, "Unhandled error");
  res.status(500).json({ message: "Internal server error" });
});

export default app;