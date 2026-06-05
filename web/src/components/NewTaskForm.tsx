import { useState } from "react";
import { createTask, type User } from "../api.js";

export function NewTaskForm({ users, onCreated }: { users: User[]; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await createTask(title.trim(), assignedTo ? Number(assignedTo) : null);
    setTitle("");
    setAssignedTo("");
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="New task..."
        style={{ flex: 1, padding: 8 }}
      />
      <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} style={{ padding: 8 }}>
        <option value="">Unassigned</option>
        {users.map((u) => (
          <option key={u.id} value={String(u.id)}>{u.name}</option>
        ))}
      </select>
      <button type="submit" style={{ padding: "8px 16px" }}>
        Add
      </button>
    </form>
  );
}
