---
"@auaust/engrenage": patch
---

- Place an environment on each directory a glob in `environments.<name>.dirs` matches
- Exclude from an environment tsconfig the directories other environments are placed on below its own, keeping its own placements below those
- Include in a root environment tsconfig only its placements outside workspaces
