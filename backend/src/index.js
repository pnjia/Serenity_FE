import app from "./app.js";
import { config } from "./config.js";

const server = app.listen(config.port, "0.0.0.0", () => {
  console.log(`🚀 Serenity Auth API listening on port ${config.port}`);
  console.log(`📱 Access from mobile: http://10.147.58.162:${config.port}`);
});

const gracefulShutdown = () => {
  console.log("\nShutting down server...");
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
