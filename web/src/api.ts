const BASE = "http://localhost:3001/api";

export interface Task {
  id: number;
  title: string;
  status: "open" | "done";
  assigned_to: number | null;
  assignee_name: string | null;
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export async function fetchTasks(filters: {
  status?: string;
  search?: string;
  assignee?: string;
  signal?: AbortSignal;
}): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.assignee) params.set("assignee", filters.assignee);
  const res = await fetch(`${BASE}/tasks?${params.toString()}`, { signal: filters.signal });
  return res.json();
}

export async function createTask(title: string, assigned_to: number | null = null): Promise<Task> {
  const res = await fetch(`${BASE}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, assigned_to }),
  });
  return res.json();
}

export async function setTaskStatus(
  id: number,
  status: "open" | "done"
): Promise<Task> {
  const res = await fetch(`${BASE}/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${BASE}/users`);
  return res.json();
}
