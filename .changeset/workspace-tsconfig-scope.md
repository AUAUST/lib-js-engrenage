---
"@auaust/engrenage": minor
---

- Exclude a workspace's own test fixtures from its tests tsconfig, and treat every workspace's fixtures as fixtures in ESLint, jscpd and Vitest
- Include a workspace's own source declarations file in its tsconfigs instead of the root's; set `execution.globals` on a workspace environment that relied on the root's ambient types
