---
"@auaust/engrenage": minor
---

- Write one tsconfig per TypeScript environment placed in a workspace, at its tsconfig `path` resolved against the workspace, referenced by the base tsconfig
- Remove `workspaces.<glob>.tsconfig`; set its options on `environments.<name>.tsconfig` instead
- Stop writing each workspace's `tsconfig.json`, which sync leaves on disk: delete it by hand, moving its options to `environments.<name>.tsconfig`
- Remove a workspace's instance tsconfig once its instance goes inactive
- Fail when two tsconfigs resolve to one file
