import { db } from "./db.js";
import { fileURLToPath } from "node:url";

const users = [
  { name: "Mr. Sheyman", email: "sheyman@example.com" },
  { name: "Mr. Segun", email: "segun@example.com" },
  { name: "Mr. Nsikak", email: "nsikak@example.com" },
  { name: "Mr. Success", email: "success@example.com" },
];

const tasks = [
  { title: "Set up CI pipeline", status: "open", assigned_to: 1 },
  { title: "Write onboarding docs", status: "done", assigned_to: 2 },
  { title: "Fix flaky login test", status: "open", assigned_to: 1 },
  { title: "Review Q3 roadmap", status: "open", assigned_to: 3 },
  { title: "Upgrade Node to LTS", status: "done", assigned_to: null },
  { title: "Plan team offsite", status: "open", assigned_to: 4 },
];

function runSeed() {
  db.exec("DELETE FROM tasks;");
  db.exec("DELETE FROM users;");
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('tasks','users');");

  const insertUser = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
  for (const u of users) insertUser.run(u.name, u.email);

  const insertTask = db.prepare("INSERT INTO tasks (title, status, assigned_to) VALUES (?, ?, ?)");
  for (const t of tasks) insertTask.run(t.title, t.status, t.assigned_to);

  console.log(`Seeded ${users.length} users and ${tasks.length} tasks.`);
}

// Called on server boot — only seeds if the database is empty.
export function seedIfEmpty() {
  const { n } = db.prepare("SELECT COUNT(*) as n FROM users").get() as { n: number };
  if (n > 0) return;
  runSeed();
}

// Called via `npm run seed` — always wipes and reseeds.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSeed();
}
