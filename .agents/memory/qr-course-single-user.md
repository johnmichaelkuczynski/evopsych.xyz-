---
name: qr-course single-user backend
description: The EvoPsych course is intentionally public and globally scoped, with no login or user accounts.
---

The EvoPsych course is **public and single-user/global by design**.

There is no account system, login UI, auth middleware, owner role, or anonymous AI quota. All course features and diagnostics tools are available without authentication, and course progress is globally shared rather than scoped to a person.

**Why:** The owner explicitly required all login and login gates to be removed. The app was already globally scoped, so retaining partial authentication would misrepresent its data model.

**How to apply:** Do not add sign-in prompts, auth checks, owner-only controls, or AI login quotas unless the user explicitly reverses this decision. If asked for per-user data isolation, scope it as an app-wide schema and route change rather than patching one feature.
