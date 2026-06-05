# DECISIONS.md

> Keep this short. Bullets are fine. Be specific and honest. We read every word.

## The feature: assignees + filtering

**What I built**
- Tasks can be assigned to a user on creation via a dropdown in the form. The task list shows the assignee name inline and can be filtered by assignee using a select alongside the existing status and search filters.

**Decisions I made on the ambiguous parts**
- How I handled tasks with no assignee: nullable `assigned_to` FK — unassigned is a valid permanent state, not a gap to fill. The filter dropdown defaults to "All assignees" so unassigned tasks are always visible unless you explicitly pick someone.
- Single-select vs multi-select filter, and why: single-select. The use case is "show me Ada's tasks" not "show me Ada's and Bayo's tasks." Multi-select adds UI complexity for a case that's better served by just removing the filter.
- How the assignee filter interacts with the existing status/search filter: purely additive — all three filters are ANDed server-side. Picking an assignee narrows within whatever status/search is already set.
- Where the filter state lives (URL, local state, etc.) and why: React local state. URL params would be better for shareability and back-button support, but that's scope creep for a take-home. Noted under "if I had more time."

**Anything I assumed instead of asking**
- Reassigning a task after creation is supported at the API level (PATCH accepts `assigned_to`) but there's no UI for it — adding an inline edit felt out of scope given the time budget.
- Users are read-only (no create/delete user flow needed).

## The bug

- What the bug was: race condition on the task list. Every keystroke in the search box fires a `fetchTasks` call. If an earlier request (shorter query) resolves after a later one, `setTasks` is called with stale data, overwriting the correct result.
- How I found it: typed quickly into the search box and watched the list flicker back to a previous result. The "impatient user" hint pointed straight at it.
- Why my fix is correct (and not just "it stopped happening"): each `load()` call now creates a new `AbortController` and cancels the previous one before firing. The cancelled request's `.then(setTasks)` never runs because the fetch rejects with an `AbortError`, which is explicitly caught and swallowed. Only the most recent request can ever update state.
- Anything similar I noticed but didn't fix: `NewTaskForm` has no submit guard — double-clicking "Add" quickly can create duplicate tasks. Same class of problem, smaller blast radius.

## Tradeoffs

- What I deliberately did NOT do, and why:
  - No URL-based filter state — adds routing complexity that wasn't in the existing app.
  - No inline reassign UI — the API supports it but the form-based flow covers the core ask.
  - No loading/error states on fetches — the existing app had none; adding them selectively would look inconsistent.
- Where I leaned on AI, and what I changed or rejected from what it gave me: used Claude Code throughout. It suggested using a shared `SELECT_TASK` fragment for the LEFT JOIN query — kept that. It initially wrote all commits at once; I pushed back to keep them small and reviewable. Reviewed every line before committing.

## If I had more time

- Next thing I'd do: move filter state into the URL (`?status=open&assignee=1`) so links are shareable and the browser back button works.
- Where this design breaks at 10x or 100x the data: the assignee dropdown fetches all users with no pagination — fine at 4, bad at 400. The task list also fetches everything on every filter change with no pagination or virtual scrolling.
- One thing about the existing codebase I'd want to refactor and why: `db.ts` mixes schema definition, migration logic, and type exports in one file. At even modest scale that becomes hard to navigate — schema and migrations should live separately.

## Time spent

- Roughly: 1 hour

## Deployment (optional)

- Live URL (if deployed):
- How I hosted it:
- What I'd harden before real production:
