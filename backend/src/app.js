import cors from "cors";
import express from "express";
import morgan from "morgan";

import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.json({
    name: "Serenity Auth API",
    version: "1.0.0",
    status: "ok",
  });
});

app.use("/auth", authRoutes);

app.use(errorHandler);

export default app;
