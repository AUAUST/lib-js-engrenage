---
"@auaust/engrenage": minor
---

- Fail the load when a scope places an environment on a directory inside a nested workspace, naming the workspace's `.workspace.json` to register it in
- Keep each scope's `dirs` and `files` globs from matching inside nested workspaces
