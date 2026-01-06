import cors from "cors";
import express from "express";
import morgan from "morgan";

import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import gameRoutes from "./routes/gameRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import questRoutes from "./routes/questRoutes.js";

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

app.get("/auth/google/callback", (req, res) => {
  const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  res.set("Content-Type", "text/html");
  res.send(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Google Auth Redirect</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 2rem; text-align: center; }
    </style>
  </head>
  <body>
    <p>Menutup jendela autentikasi...</p>
    <script>
      (function() {
        const redirectUrl = ${JSON.stringify(fullUrl)};
        const message = { type: "expo-auth-session", url: redirectUrl };
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(message, "*");
          window.close();
        } else if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify(message));
        } else {
          document.body.innerHTML = '<p>Silakan kembali ke aplikasi.</p>';
        }
      })();
    </script>
  </body>
</html>`);
});

app.use("/auth", authRoutes);
app.use("/game", gameRoutes);
app.use("/progress", progressRoutes);
app.use("/quests", questRoutes);

app.use(errorHandler);

export default app;
