---
"@auaust/engrenage": minor
---

- Lint each workspace's files with its own config: its traits, dependencies, TypeScript options, environments and structure select and configure its conventions, recommended rules, import presets and role rules
- Lint workspaces declared only by `.workspace.json`
- Remove the `files.workspaces` ESLint scope reference: a convention's `files.code` covers each scope's own code
