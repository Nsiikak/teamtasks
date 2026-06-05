import { Router } from "express";
import { db, type Task } from "../db.js";

export const tasksRouter = Router();

const SELECT_TASK = `
  SELECT t.id, t.title, t.status, t.assigned_to, u.name AS assignee_name, t.created_at
  FROM tasks t
  LEFT JOIN users u ON u.id = t.assigned_to
`;

// GET /api/tasks?status=open&search=foo&assignee=1
tasksRouter.get("/", (req, res) => {
  const { status, search, assignee } = req.query;

  let sql = `${SELECT_TASK} WHERE 1 = 1`;
  const params: unknown[] = [];

  if (typeof status === "string" && status) {
    sql += " AND t.status = ?";
    params.push(status);
  }

  if (typeof search === "string" && search) {
    sql += " AND lower(t.title) LIKE ?";
    params.push(`%${search.toLowerCase()}%`);
  }

  if (typeof assignee === "string" && assignee) {
    sql += " AND t.assigned_to = ?";
    params.push(Number(assignee));
  }

  sql += " ORDER BY t.created_at DESC, t.id DESC";

  const rows = db.prepare(sql).all(...params) as (Task & { assignee_name: string | null })[];
  res.json(rows);
});

// POST /api/tasks  { title, assigned_to? }
tasksRouter.post("/", (req, res) => {
  const title = (req.body?.title ?? "").trim();
  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }
  const assigned_to = req.body?.assigned_to ?? null;

  const result = db
    .prepare("INSERT INTO tasks (title, status, assigned_to) VALUES (?, 'open', ?)")
    .run(title, assigned_to);

  const created = db
    .prepare(`${SELECT_TASK} WHERE t.id = ?`)
    .get(result.lastInsertRowid) as Task & { assignee_name: string | null };

  res.status(201).json(created);
});

// PATCH /api/tasks/:id  { status?, assigned_to? }
tasksRouter.patch("/:id", (req, res) => {
  const id = Number(req.params.id);
  const { status, assigned_to } = req.body ?? {};

  if (status !== undefined && status !== "open" && status !== "done") {
    return res.status(400).json({ error: "status must be 'open' or 'done'" });
  }

  if (status === undefined && assigned_to === undefined) {
    return res.status(400).json({ error: "nothing to update" });
  }

  const sets: string[] = [];
  const params: unknown[] = [];
  if (status !== undefined) { sets.push("status = ?"); params.push(status); }
  if (assigned_to !== undefined) { sets.push("assigned_to = ?"); params.push(assigned_to); }
  params.push(id);

  const result = db
    .prepare(`UPDATE tasks SET ${sets.join(", ")} WHERE id = ?`)
    .run(...params);

  if (result.changes === 0) {
    return res.status(404).json({ error: "task not found" });
  }

  const updated = db
    .prepare(`${SELECT_TASK} WHERE t.id = ?`)
    .get(id) as Task & { assignee_name: string | null };

  res.json(updated);
});
