import { useCallback, useEffect, useRef, useState } from "react";
import { fetchTasks, fetchUsers, setTaskStatus, type Task, type User } from "./api.js";
import { TaskList } from "./components/TaskList.js";
import { NewTaskForm } from "./components/NewTaskForm.js";

export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [assignee, setAssignee] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    fetchUsers().then(setUsers);
  }, []);

  const load = useCallback(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    fetchTasks({ status, search, assignee, signal: controller.signal })
      .then(setTasks)
      .catch((err) => { if (err.name !== "AbortError") throw err; });
  }, [status, search, assignee]);

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

      <NewTaskForm users={users} onCreated={load} />

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks..."
          style={{ flex: 1, padding: 8 }}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: 8 }}>
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="done">Done</option>
        </select>
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)} style={{ padding: 8 }}>
          <option value="">All assignees</option>
          {users.map((u) => (
            <option key={u.id} value={String(u.id)}>{u.name}</option>
          ))}
        </select>
      </div>

      <TaskList tasks={tasks} onToggle={handleToggle} />
    </div>
  );
}
