import app from "./app.js";
import { config } from "./config.js";

const server = app.listen(config.port, () => {
  console.log(`🚀 Serenity Auth API listening on port ${config.port}`);
});

const gracefulShutdown = () => {
  console.log("\nShutting down server...");
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
