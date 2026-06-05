import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tasksRouter } from "./routes/tasks.js";
import { usersRouter } from "./routes/users.js";
import { seedIfEmpty } from "./seed.js";

const app = express();
const PORT = process.env.PORT ?? 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

seedIfEmpty();

app.use(cors());
app.use(express.json());

app.use("/api/tasks", tasksRouter);
app.use("/api/users", usersRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

if (process.env.NODE_ENV === "production") {
  const webDist = path.join(__dirname, "..", "..", "web", "dist");
  app.use(express.static(webDist));
  app.get("*", (_req, res) => res.sendFile(path.join(webDist, "index.html")));
}

app.listen(PORT, () => {
  console.log(`TeamTasks API running on http://localhost:${PORT}`);
});
