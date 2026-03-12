import express from "express";
import cors from "cors";
import { contentTypeRoutes } from "./routes/contentTypes.js";
import { entryRoutes } from "./routes/entries.js";
import { authRoutes } from "./routes/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { initStorage } from "./storage/index.js";

const app = express();
const PORT = process.env.PORT ?? 4000;

// ─── Middleware ───────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173" }));
app.use(express.json());

// ─── Routes ──────────────────────────────────────────────────────
app.use("/api/content-types", contentTypeRoutes);
app.use("/api/entries", entryRoutes);
app.use("/api/auth", authRoutes);

// ─── Health check ────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ─── Error handler (must be last) ────────────────────────────────
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────────
async function start() {
  await initStorage();

  app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("[server] failed to start:", err);
  process.exit(1);
});

export default app;
