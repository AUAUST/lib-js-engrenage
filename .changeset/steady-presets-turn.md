---
"@auaust/engrenage": minor
---

- Add the `tests.json`, `node/24.json` and `baseline/2026-10.json` tsconfig presets, and extend `tests.json` from `library.dist.json`
- Remove `target` from `base.json`, and set `types: []` and `exactOptionalPropertyTypes` in `library.json`
- Extend the newest baseline snapshot in the tsconfig of new libraries
- Pin `typescript` to an exact version in new projects
- Typecheck every referenced project when the tsconfig has references
- Declare the namespace of empty module entries in bundled declarations
- Add `cache.dir` and `config.cacheFor(packageName)` to place every tool cache under one root, removing the eslint `defaultCacheLocation` constant
- Require a blank line before a `throw` that follows other statements
- Ignore `AGENTS.override.md` in the project block of the synced `.prettierignore` when Codex is a preferred agent
- Require Node 24 to install engrenage
- Define the precedence of scoped rules, task references and tool configuration in the shared instructions
- Remove the migration of `.claude/backlog.md`
