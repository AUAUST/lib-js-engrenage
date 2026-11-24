---
"@auaust/engrenage": minor
---

- Write one tsconfig per TypeScript environment placed in a workspace, at its tsconfig `path` resolved against the workspace, referenced by the base tsconfig
- Remove `workspaces.<glob>.tsconfig`, and the per-workspace `tsconfig.json` sync wrote from it; set the options on `environments.<name>.tsconfig` instead
- Fail when two tsconfigs resolve to one file
