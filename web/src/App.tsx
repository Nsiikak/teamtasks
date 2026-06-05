import { useCallback, useEffect, useRef, useState } from "react";
import { fetchTasks, setTaskStatus, type Task } from "./api.js";
import { TaskList } from "./components/TaskList.js";
import { NewTaskForm } from "./components/NewTaskForm.js";

export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    fetchTasks({ status, search, signal: controller.signal })
      .then(setTasks)
      .catch((err) => { if (err.name !== "AbortError") throw err; });
  }, [status, search]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggle(task: Task) {
    await setTaskStatus(task.id, task.status === "done" ? "open" : "done");
    load();
  }

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", fontFamily: "system-ui, sans-serif", padding: "0 16px" }}>
      <h1>TeamTasks</h1>

      <NewTaskForm onCreated={load} />

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          style={{ flex: 1, padding: 8 }}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: 8 }}>
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="done">Done</option>
        </select>
      </div>

      <TaskList tasks={tasks} onToggle={handleToggle} />
    </div>
  );
}
