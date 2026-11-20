---
"@auaust/engrenage": patch
---

- Add an optional **Leads** section to Problems, exclusive with **Steps**, with **Tests** required only alongside **Steps**
- Deny a worker a Problem without **Steps** and a debugger one with them
- Name each ready issue's agent in `planning walk check`
- Write both **Steps** and **Leads** with guiding comments in a fresh Problem draft, which `check` ignores
